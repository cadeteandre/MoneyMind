import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { Prisma } from "@prisma/client";

// PUT - Update a transaction
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the transaction to update
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Check if user owns this transaction
    if (existingTransaction.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Process the request body
    const body = await req.json();
    const { amount, type, category, description, date, receiptUrl } = body;

    if (!amount || !type || !category) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Update the transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        type,
        category,
        description,
        date: date ? new Date(date) : new Date(),
        receiptUrl,
      } as Prisma.TransactionUncheckedUpdateInput,
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Update Transaction Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Delete a transaction
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the transaction to delete
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Verificar propriedade receiptUrl com segurança de tipo
    const transactionWithReceipt = transaction as unknown as { receiptUrl?: string | null };
    
    // Check if user owns this transaction
    if (transaction.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the transaction's receipt from storage if it exists
    if (transactionWithReceipt.receiptUrl) {
      try {
        // Initialize Supabase client with service role key
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Extract the file path from the URL
        // The URL format is typically like: https://...supabase.co/storage/v1/object/public/receipts/userId/filename
        const urlParts = transactionWithReceipt.receiptUrl.split('/');
        const receiptPath = urlParts.slice(urlParts.indexOf('receipts')).join('/');
        
        // Delete the file from storage
        await supabase.storage
          .from('receipts')
          .remove([receiptPath]);
          
      } catch (storageError) {
        console.error("Failed to delete receipt from storage:", storageError);
        // Continue with transaction deletion even if receipt deletion fails
      }
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Transaction Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 