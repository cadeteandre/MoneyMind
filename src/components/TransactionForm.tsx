// src/components/TransactionForm.tsx

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

const formSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.date(),
});

type FormData = z.infer<typeof formSchema>;

export function TransactionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const date = watch("date");

  const onSubmit = (data: FormData) => {
    console.log(data); // Handle form submission here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <Input type="number" placeholder="Amount" {...register("amount", { valueAsNumber: true })} />
      {errors.amount && <p className="text-sm text-red-500">Enter a valid amount</p>}

      <Select onValueChange={(val) => setValue("type", val as "income" | "expense")}>
        <SelectTrigger>
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>
      {errors.type && <p className="text-sm text-red-500">Select a type</p>}

      <Input placeholder="Category" {...register("category")} />
      {errors.category && <p className="text-sm text-red-500">Category is required</p>}

      <Textarea placeholder="Description (optional)" {...register("description")} />

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

      <Button type="submit" className="w-full">Add Transaction</Button>
    </form>
  );
}
