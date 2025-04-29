"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { useAuth } from "@clerk/nextjs";

const formSchema = z.object({
  amount: z.number().positive().multipleOf(0.01),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.date(),
  receipt: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export interface TransactionFormProps {
  onSuccess?: () => void;
  transaction?: {
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    description?: string | null;
    date: Date;
    receiptUrl?: string | null;
  };
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, transaction }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: transaction ? {
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || '',
      date: new Date(transaction.date),
    } : {
      date: new Date(),
    },
  });

  const date = watch("date");
  const { userId } = useAuth();
  const isEditing = !!transaction;

  const onSubmit = async (data: FormData) => {
    try {
      let receiptUrl = transaction?.receiptUrl;
      if (data.receipt && data.receipt.length > 0 && userId) {
        const formData = new FormData();
        formData.append("file", data.receipt[0]);
        formData.append("userId", userId);

        const uploadRes = await fetch("/api/upload-receipt", {
          method: "POST", 
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error("Failed to upload receipt");
        }
        
        const uploadJson = await uploadRes.json();
        receiptUrl = uploadJson.url;
      }

      const endpoint = isEditing 
        ? `/api/transactions/${transaction.id}` 
        : '/api/transactions';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, receiptUrl }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'submit'} transaction`);
      }

      reset({
        amount: 0,
        type: undefined,
        category: '',
        description: '',
        date: new Date(),
      });

      toast.success(`Transaction ${isEditing ? 'updated' : 'added'} successfully!`);
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} transaction`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <Input 
        type="number" 
        step="0.01"
        placeholder="Amount" 
        {...register("amount", { valueAsNumber: true })} 
      />
      {errors.amount && <p className="text-sm text-red-500">Enter a valid amount</p>}

      <Select 
        defaultValue={transaction?.type}
        onValueChange={(val) => setValue("type", val as "INCOME" | "EXPENSE")}
        {...register("type")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="INCOME">Income</SelectItem>
          <SelectItem value="EXPENSE">Expense</SelectItem>
        </SelectContent>
      </Select>
      {errors.type && <p className="text-sm text-red-500">Select a type</p>}

      <Input 
        placeholder="Category" 
        {...register("category")} 
      />
      {errors.category && <p className="text-sm text-red-500">Category is required</p>}

      <Textarea 
        placeholder="Description (optional)" 
        {...register("description")} 
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left", !date && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setValue("date", d)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {!isEditing && (
        <Input 
          type="file" 
          accept="image/*"
          {...register("receipt")}
        />
      )}

      {isEditing && transaction.receiptUrl && (
        <div className="text-sm text-muted-foreground">
          This transaction has a receipt attached. Uploading a new one will replace it.
        </div>
      )}

      {isEditing && (
        <Input 
          type="file" 
          accept="image/*"
          {...register("receipt")}
        />
      )}

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : isEditing ? "Update Transaction" : "Add Transaction"}
      </Button>
    </form>
  );
}