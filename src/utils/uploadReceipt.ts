import { createClient } from "@supabase/supabase-js";

export async function uploadReceipt(file: File, userId: string, token: string) {
  try {
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

    // Gera um nome de arquivo seguro com timestamp
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `receipts/${userId}/${timestamp}-${sanitizedFileName}`;

    console.log(`Attempting to upload file to ${filePath}`);
    
    // Tenta fazer o upload
    const { error } = await supabase.storage
      .from("receipts")
      .upload(filePath, file, {
        contentType: file.type || 'image/jpeg', // Garante que o tipo seja preservado
        cacheControl: "3600",
        upsert: true, // Permite sobreescrever se necessário
      });

    // Verifica erros - com foco em problemas de RLS
    if (error) {
      console.error("Supabase upload error:", error);
      
      // Erro específico de política de segurança
      if (error.message?.includes("row-level security") || error.message?.includes("policy")) {
        throw new Error(
          "Erro de permissão: seu usuário não tem permissão para fazer upload nesse bucket. " +
          "Contate o administrador do sistema."
        );
      }
      
      throw error;
    }

    // Gera a URL pública do recibo
    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Falha ao gerar URL pública para o arquivo");
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error("Upload receipt error:", error);
    throw error; // Re-lança o erro para ser tratado pelo chamador
  }
} 