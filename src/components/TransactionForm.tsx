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
import React, { useState, useEffect, useRef } from "react";
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
  onClose?: () => void;
  transaction?: {
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    description?: string | null;
    date: Date;
    receiptUrl?: string | null;
    receiptDownloadUrl?: string | null;
  };
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, onClose, transaction }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
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
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(transaction?.receiptUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || navigator.vendor : '';
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(userAgent));
    };
    
    checkMobile();
  }, []);

  // Função separada para upload de arquivo
  const uploadReceipt = async (file: File): Promise<{url: string, downloadUrl: string} | null> => {
    if (!userId || !file) return null;
    
    try {
      // Verifica o arquivo
      console.log("Processing file for upload:", file.name, "Size:", file.size, "Type:", file.type);
      
      if (file.size < 100) {
        throw new Error("O arquivo selecionado parece estar vazio ou muito pequeno.");
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error("Por favor, selecione uma imagem válida (JPG, PNG, etc).");
      }
      
      // Cria um novo FormData
      const formData = new FormData();
      
      // Importante: aqui usamos o nome original para preservar o tipo MIME
      formData.append("file", file, file.name);
      formData.append("userId", userId);
      
      console.log("FormData created with file", file.name);
      
      // Faz a requisição
      const response = await fetch("/api/upload-receipt", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao fazer upload do recibo");
      }
      
      const result = await response.json();
      console.log("Upload success:", result);
      
      return {
        url: result.url,
        downloadUrl: result.downloadUrl || result.url
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsUploading(true);
      
      let receiptUrl = transaction?.receiptUrl;
      let receiptDownloadUrl = transaction?.receiptDownloadUrl || transaction?.receiptUrl;
      
      // Tenta fazer upload do recibo se um arquivo foi selecionado
      const fileList = data.receipt as FileList;
      if (fileList && fileList.length > 0) {
        const file = fileList[0];
        
        toast.loading("Enviando recibo...");
        
        try {
          const uploadResult = await uploadReceipt(file);
          if (uploadResult) {
            receiptUrl = uploadResult.url;
            receiptDownloadUrl = uploadResult.downloadUrl;
            toast.dismiss();
            toast.success("Recibo enviado com sucesso!");
          }
        } catch (error) {
          toast.dismiss();
          toast.error(error instanceof Error ? error.message : "Erro ao enviar recibo");
          // Não interrompe o fluxo se o upload falhar
        }
      }

      // Continua com o envio da transação
      const endpoint = isEditing 
        ? `/api/transactions/${transaction.id}` 
        : '/api/transactions';
      
      const method = isEditing ? 'PUT' : 'POST';

      toast.loading(`${isEditing ? 'Atualizando' : 'Adicionando'} transação...`);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...data, 
          receiptUrl,
          receiptDownloadUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'adicionar'} transação: ${errorData.error || 'Erro desconhecido'}`);
      }

      reset({
        amount: 0,
        type: undefined,
        category: '',
        description: '',
        date: new Date(),
      });

      toast.dismiss();
      toast.success(`Transação ${isEditing ? 'atualizada' : 'adicionada'} com sucesso!`);
      
      // Limpa o campo de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFilePreview(null);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.dismiss();
      toast.error(`${error instanceof Error ? error.message : 'Erro desconhecido ao processar a transação'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Manipula a pré-visualização do arquivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFilePreview(null);
      return;
    }
    
    // Cria uma URL temporária para pré-visualização
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    
    // Registra o arquivo manualmente
    setValue("receipt", event.target.files);
    
    // Limpa a URL ao desmontar o componente
    return () => URL.revokeObjectURL(objectUrl);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md max-h-[90vh] overflow-y-auto">
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
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="INCOME" className="cursor-pointer">Income</SelectItem>
          <SelectItem value="EXPENSE" className="cursor-pointer">Expense</SelectItem>
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

      {isMobile ? (
        <div className="flex flex-col space-y-2">
          <label htmlFor="date-input" className="text-sm font-medium">
            Date
          </label>
          <Input
            id="date-input"
            type="date"
            value={date ? format(date, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const newDate = e.target.value ? new Date(e.target.value) : null;
              if (newDate) {
                setValue("date", newDate);
              }
            }}
          />
        </div>
      ) : (
        <Popover>
          <PopoverTrigger asChild className="cursor-pointer">
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
      )}

      {/* Campo de upload de recibo com pré-visualização */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {isEditing ? "Update receipt" : "Add receipt"} (opcional)
        </label>
        
        <Input 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={isUploading}
          className="cursor-pointer"
        />
        
        {filePreview && (
          <div className="mt-2 relative max-h-[150px] overflow-scroll">
            <img 
              src={filePreview} 
              alt="Receipt Preview" 
              className="w-full h-full object-contain rounded border"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full cursor-pointer"
              onClick={() => {
                setFilePreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                setValue("receipt", null);
              }}
            >
              ×
            </Button>
          </div>
        )}
        
        {transaction?.receiptUrl && !filePreview && (
          <div className="text-sm text-muted-foreground">
            This transaction already has a receipt. Sending a new one will replace the current one.
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            reset();
            if (onClose) onClose();
          }}
          disabled={isUploading}
        >
          Cancelar
        </Button>

        <Button 
          type="submit" 
          className="self-end cursor-pointer"
          disabled={isUploading}
        >
          {isUploading ? "Processing..." : isEditing ? "Update Transaction" : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}