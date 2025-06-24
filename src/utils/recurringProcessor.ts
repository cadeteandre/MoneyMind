import { prisma } from "@/lib/prisma";
import { calculateNextDueDate } from "./recurringTransactionUtils";

/**
 * Processa todas as despesas fixas ativas e gera pagamentos pendentes quando necessário
 */
export async function processRecurringTransactions(): Promise<{
  processed: number;
  created: number;
  errors: string[];
}> {
  const results = {
    processed: 0,
    created: 0,
    errors: [] as string[]
  };

  try {
    // Buscar todas as despesas fixas ativas que precisam ser processadas
    const today = new Date();
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        OR: [
          {
            nextDueDate: {
              lte: today
            }
          },
          {
            lastProcessedDate: null
          }
        ]
      },
      orderBy: {
        nextDueDate: 'asc'
      }
    });

    console.log(`Found ${recurringTransactions.length} recurring transactions to process`);

    for (const rt of recurringTransactions) {
      try {
        results.processed++;

        // Verificar se não passou do endDate (se existir)
        if (rt.endDate && today > rt.endDate) {
          // Marcar como inativa se passou do endDate
          await prisma.recurringTransaction.update({
            where: { id: rt.id },
            data: { isActive: false }
          });
          console.log(`Deactivated recurring transaction ${rt.id} (past end date)`);
          continue;
        }

        // Verificar se já existe um pagamento pendente para esta data
        const existingPendingPayment = await prisma.recurringPayment.findFirst({
          where: {
            recurringTransactionId: rt.id,
            dueDate: rt.nextDueDate,
            status: 'PENDING'
          }
        });

        if (existingPendingPayment) {
          console.log(`Pending payment already exists for recurring transaction ${rt.id}`);
          continue;
        }

        // Criar pagamento pendente
        await prisma.recurringPayment.create({
          data: {
            recurringTransactionId: rt.id,
            dueDate: rt.nextDueDate,
            amount: rt.amount,
            status: 'PENDING'
          }
        });

        results.created++;

        // Calcular próxima data de vencimento
        const nextDueDate = calculateNextDueDate(
          rt.nextDueDate,
          rt.frequency,
          rt.dayOfMonth,
          rt.dayOfWeek,
          rt.customDays
        );

        // Atualizar a despesa fixa com a nova data
        await prisma.recurringTransaction.update({
          where: { id: rt.id },
          data: {
            nextDueDate,
            lastProcessedDate: today
          }
        });

        console.log(`Processed recurring transaction ${rt.id}, next due: ${nextDueDate}`);

      } catch (error) {
        const errorMsg = `Error processing recurring transaction ${rt.id}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log(`Processing complete: ${results.processed} processed, ${results.created} created, ${results.errors.length} errors`);
    return results;

  } catch (error) {
    const errorMsg = `Error in processRecurringTransactions: ${error}`;
    console.error(errorMsg);
    results.errors.push(errorMsg);
    return results;
  }
}

/**
 * Atualiza o status de pagamentos em atraso
 */
export async function updateOverduePayments(): Promise<{
  updated: number;
  errors: string[];
}> {
  const results = {
    updated: 0,
    errors: [] as string[]
  };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar pagamentos pendentes que estão em atraso
    const overduePayments = await prisma.recurringPayment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today
        }
      }
    });

    console.log(`Found ${overduePayments.length} overdue payments to update`);

    for (const payment of overduePayments) {
      try {
        await prisma.recurringPayment.update({
          where: { id: payment.id },
          data: { status: 'OVERDUE' }
        });
        results.updated++;
      } catch (error) {
        const errorMsg = `Error updating payment ${payment.id}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log(`Updated ${results.updated} payments to OVERDUE status`);
    return results;

  } catch (error) {
    const errorMsg = `Error in updateOverduePayments: ${error}`;
    console.error(errorMsg);
    results.errors.push(errorMsg);
    return results;
  }
}

/**
 * Função principal que executa todos os processamentos
 */
export async function runRecurringTransactionProcessor(): Promise<{
  recurring: {
    processed: number;
    created: number;
    errors: string[];
  };
  overdue: {
    updated: number;
    errors: string[];
  };
  timestamp: Date;
}> {
  console.log('Starting recurring transaction processor...');
  
  const [recurringResults, overdueResults] = await Promise.all([
    processRecurringTransactions(),
    updateOverduePayments()
  ]);

  const result = {
    recurring: recurringResults,
    overdue: overdueResults,
    timestamp: new Date()
  };

  console.log('Recurring transaction processor completed:', result);
  return result;
}

/**
 * Limpa pagamentos pendentes antigos (mais de 30 dias em atraso)
 * Esta função pode ser executada periodicamente para manter a base limpa
 */
export async function cleanupOldPayments(daysThreshold: number = 30): Promise<{
  deleted: number;
  errors: string[];
}> {
  const results = {
    deleted: 0,
    errors: [] as string[]
  };

  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    const deletedPayments = await prisma.recurringPayment.deleteMany({
      where: {
        status: 'OVERDUE',
        dueDate: {
          lt: thresholdDate
        }
      }
    });

    results.deleted = deletedPayments.count;
    console.log(`Cleaned up ${results.deleted} old overdue payments`);

    return results;

  } catch (error) {
    const errorMsg = `Error in cleanupOldPayments: ${error}`;
    console.error(errorMsg);
    results.errors.push(errorMsg);
    return results;
  }
} 