import { createClient } from "@supabase/supabase-js";

export async function uploadReceipt(file: File, userId: string, token: string) {
  // Cria um client temporário com o token do Clerk para requests autenticadas
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const filePath = `receipts/${userId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("receipts")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  // Gera a URL pública do recibo
  const { data: urlData } = supabase.storage
    .from("receipts")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
} 