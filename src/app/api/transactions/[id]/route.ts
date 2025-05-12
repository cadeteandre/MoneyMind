import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { supabase } from "@/lib/supabase/client";

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
    // Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Check if user owns this transaction
    if (transaction.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { amount, type, category, description, date, receiptUrl, receiptDownloadUrl } = body;

    // Update the transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount.toString(),
        type,
        category,
        description,
        date: date ? new Date(date) : undefined,
        receiptUrl,
        receiptDownloadUrl
      } as Prisma.TransactionUncheckedUpdateInput,
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error("API Error:", error);
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
    
    // Check if user owns this transaction
    if (transaction.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the transaction's receipt from storage if it exists
    if (transaction.receiptUrl) {
      try {
        // Extract the file path from the URL
        // The URL format is typically like: https://...supabase.co/storage/v1/object/public/receipts/userId/filename
        const urlParts = transaction.receiptUrl.split('/');
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