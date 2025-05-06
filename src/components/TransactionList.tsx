import { Transaction as PrismaTransaction } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import Image from "next/image";
import { MoreVertical, Edit, Trash2, ExternalLink } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TransactionForm } from "./TransactionForm";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

// Extend the Transaction type to include receiptUrl
interface Transaction extends PrismaTransaction {
  receiptUrl: string | null;
  receiptDownloadUrl: string | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionUpdated?: () => void;
}

export default function TransactionList({ transactions, onTransactionUpdated }: TransactionListProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || navigator.vendor : '';
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(userAgent));
    };
    
    checkMobile();
  }, []);

  const handleDelete = async () => {
    if (!deleteTransaction) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/transactions/${deleteTransaction.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      
      toast.success("Transaction deleted successfully");
      setIsDeleteAlertOpen(false);
      if (onTransactionUpdated) onTransactionUpdated();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error("Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-center">No transactions found.</p>;
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="p-4 flex justify-between items-center w-full relative">
          <div>
            <p className="font-medium text-center">{transaction.category}</p>
            {transaction.description ? (
              <p className="text-sm text-muted-foreground">{transaction.description}</p>
            ): null}
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <p
                className={`font-semibold ${
                  transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
                }`}
              >
                {transaction.type === "INCOME" ? "+" : "-"} {formatCurrency(transaction.amount)}
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString("de-DE")}
            </p>
            {transaction.receiptUrl && (
              <Dialog open={openId === transaction.id} onOpenChange={(open) => {
                if (open) {
                  setOpenId(transaction.id);
                  setImgUrl(transaction.receiptDownloadUrl || transaction.receiptUrl);
                  setImgLoaded(false);
                  setImgError(false);
                } else {
                  setOpenId(null);
                  setImgUrl(null);
                }
              }}>
                <DialogTrigger asChild>
                  <button className="cursor-pointer text-blue-600 underline text-xs">View Receipt</button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Receipt</DialogTitle>
                  </DialogHeader>
                  {imgUrl && (
                    <div className="flex flex-col items-center gap-2">
                      <a 
                        href={imgUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 mb-2"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open in browser
                      </a>
                      
                      {isMobile ? (
                        // Para dispositivos móveis, usamos a tag img nativa em vez do componente Image
                        <div className="w-full max-w-md flex justify-center">
                          <img 
                            src={imgUrl} 
                            alt="Receipt"
                            className="max-w-full max-h-[60vh] mx-auto rounded shadow object-contain"
                            onLoad={() => setImgLoaded(true)}
                            onError={() => {
                              console.error("Native img failed to load:", imgUrl);
                              setImgError(true);
                            }}
                          />
                          {!imgLoaded && !imgError && (
                            <p className="text-center text-muted-foreground">Loading receipt...</p>
                          )}
                          {imgError && (
                            <div className="text-center text-red-500">
                              <p>Failed to load image</p>
                              <p className="text-xs mt-2">Please use "Open in browser" instead</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Para desktop, mantemos o componente Image do Next.js
                        <div className="relative w-full max-w-md">
                          <Image 
                            src={imgUrl} 
                            alt="Receipt" 
                            width={400}
                            height={600}
                            loading="eager"
                            priority={true}
                            className="max-w-full max-h-[60vh] mx-auto rounded shadow object-contain"
                            onError={() => {
                              console.error("Failed to load image:", imgUrl);
                              setImgError(true);
                            }}
                          />
                          {imgError && (
                            <div className="text-center text-red-500 mt-2">
                              <p>Failed to load image</p>
                              <p className="text-xs mt-1">Please use "Open in browser" instead</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <DialogClose />
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => {
                    setEditTransaction(transaction);
                    setIsEditModalOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setDeleteTransaction(transaction);
                    setIsDeleteAlertOpen(true);
                  }}
                  className="cursor-pointer text-red-500 focus:text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}

      {/* Edit Transaction Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editTransaction && (
            <TransactionForm 
              transaction={editTransaction}
              onSuccess={() => {
                setIsEditModalOpen(false);
                if (onTransactionUpdated) onTransactionUpdated();
              }}
              onClose={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction
              {deleteTransaction?.receiptUrl && " and its associated receipt"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}