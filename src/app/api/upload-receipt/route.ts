import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const maxDuration = 60;

// Cliente com permissões de administrador (apenas para uso no servidor)
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Log para diagnóstico
    console.log("=== UPLOAD REQUEST DEBUG ===");
    console.log("Request Headers:", JSON.stringify(Object.fromEntries([...req.headers.entries()])));
    console.log("Content-Type:", req.headers.get("content-type"));
    
    // Obter FormData original
    const formData = await req.formData();
    const formDataEntries = Array.from(formData.entries()).map(([key, value]) => {
      if (value instanceof File) {
        return `${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`;
      }
      return `${key}: ${value}`;
    });
    console.log("FormData entries:", formDataEntries);
    
    // Extrair arquivo e ID do usuário
    const file = formData.get("file");
    const userId = formData.get("userId");
    
    console.log("File present:", !!file);
    console.log("UserId present:", !!userId);
    
    if (!file || typeof userId !== "string" || !(file instanceof File)) {
      return NextResponse.json({ 
        error: "Missing required parameters", 
        file: !!file,
        userId: !!userId,
        isFile: file instanceof File
      }, { status: 400 });
    }
    
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    // Tratamento simplificado - evitar qualquer manipulação de tipos
    // Verifica tamanho mínimo
    if (file.size < 100) {
      return NextResponse.json({ error: "File too small or possibly corrupted" }, { status: 400 });
    }
    
    // Usando adminSupabase para ignorar RLS
    
    // Gerar caminho direto com timestamp para evitar conflitos
    // Preservar nome original e extensão
    const timestamp = Date.now();
    const originalFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `receipts/${userId}/${timestamp}-${originalFileName}`;
    
    console.log("Uploading to:", filePath);
    
    // Upload simples - evitar transformações ou manipulações adicionais
    // Usando adminSupabase para ignorar políticas de segurança
    const { error: uploadError, data: uploadData } = await adminSupabase.storage
      .from("receipts")
      .upload(filePath, file, {
        contentType: file.type || 'image/jpeg', // Preservar tipo MIME original
        upsert: true // Substituir se existir
      });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    
    console.log("Upload successful:", uploadData);
    
    // Obter URL pública sem transformações
    const { data: urlData } = adminSupabase.storage
      .from("receipts")
      .getPublicUrl(filePath);
    
    if (!urlData?.publicUrl) {
      return NextResponse.json({ error: "Failed to generate public URL" }, { status: 500 });
    }
    
    const publicUrl = urlData.publicUrl;
    console.log("Generated URL:", publicUrl);
    
    // Retornar URL sem processamento adicional
    return NextResponse.json({
      url: publicUrl,
      downloadUrl: publicUrl,
      fileName: originalFileName,
      fileType: file.type,
      size: file.size
    });
    
  } catch (error) {
    console.error("Unexpected error during upload:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 