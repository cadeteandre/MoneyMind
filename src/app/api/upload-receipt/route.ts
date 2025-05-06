import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Configurações para ambiente de produção no Vercel
export const runtime = "nodejs"; // Alterado de "edge" para "nodejs" para melhor compatibilidade
export const maxDuration = 60;
export const bodyParser = false; // Desativa o parser automático de corpo para lidar manualmente com FormData

// Configuração de CORS para solicitações cross-origin
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Cliente com permissões de administrador (apenas para uso no servidor)
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export async function POST(req: Request) {
  // Headers de CORS para permitir solicitações cross-origin
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  try {
    console.log("=== UPLOAD REQUEST DEBUG (PRODUCTION) ===");
    
    // Verificar se as variáveis de ambiente estão definidas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ 
        error: "Server configuration error", 
        details: "Missing Supabase environment variables"
      }, { status: 500, headers });
    }
    
    console.log("Content-Type:", req.headers.get("content-type"));
    
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (formError) {
      console.error("FormData parsing error:", formError);
      return NextResponse.json({ 
        error: "Failed to parse form data", 
        details: formError instanceof Error ? formError.message : "Unknown form parsing error"
      }, { status: 400, headers });
    }
    
    // Log das entradas do FormData para diagnóstico
    const entries = Array.from(formData.entries());
    console.log("FormData keys:", entries.map(([key]) => key));
    
    // Extrair arquivo e ID do usuário
    const file = formData.get("file");
    const userId = formData.get("userId");
    
    console.log("File present:", !!file);
    console.log("UserId present:", !!userId);
    
    // Validações de parâmetros com mensagens detalhadas
    if (!file && !userId) {
      return NextResponse.json({ 
        error: "Missing required parameters", 
        details: "Both file and userId are missing"
      }, { status: 400, headers });
    }
    
    if (!file) {
      return NextResponse.json({ 
        error: "Missing required parameters", 
        details: "File is missing" 
      }, { status: 400, headers });
    }
    
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ 
        error: "Missing required parameters", 
        details: "UserId is missing or invalid" 
      }, { status: 400, headers });
    }
    
    // Verificar se file é realmente um File ou Blob
    if (!(file instanceof Blob)) {
      console.error("File is not a Blob instance:", typeof file, file);
      return NextResponse.json({ 
        error: "Invalid file format", 
        details: `Expected Blob or File, got ${typeof file}`
      }, { status: 400, headers });
    }
    
    // Log detalhado do arquivo
    try {
      console.log("File details:", {
        type: file.type,
        size: file.size,
        name: 'name' in file ? (file as File).name : 'unnamed',
      });
    } catch (logError) {
      console.error("Error logging file details:", logError);
    }
    
    // Verificar tamanho do arquivo
    const maxSize = 4 * 1024 * 1024; // 4MB é um limite seguro para APIs serverless
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large", 
        details: `Maximum file size is ${maxSize / (1024 * 1024)}MB` 
      }, { status: 400, headers });
    }
    
    if (file.size < 100) {
      return NextResponse.json({ 
        error: "File too small", 
        details: "File seems to be corrupted or empty" 
      }, { status: 400, headers });
    }
    
    // Definir nome do arquivo e caminho de armazenamento
    const timestamp = Date.now();
    const fileName = 'name' in file ? (file as File).name : `file-${timestamp}`;
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `receipts/${userId}/${timestamp}-${sanitizedFileName}`;
    
    console.log("Upload path:", filePath);
    
    // Upload com tratamento de erro detalhado
    let uploadResult;
    try {
      uploadResult = await adminSupabase.storage
        .from("receipts")
        .upload(filePath, file, {
          contentType: file.type || 'image/jpeg',
          upsert: true
        });
    } catch (uploadError) {
      console.error("Supabase upload exception:", uploadError);
      return NextResponse.json({ 
        error: "Upload failed", 
        details: uploadError instanceof Error ? uploadError.message : "Unknown upload error"
      }, { status: 500, headers });
    }
    
    // Verificar erro retornado pelo Supabase
    if (uploadResult.error) {
      console.error("Supabase upload error:", uploadResult.error);
      return NextResponse.json({ 
        error: "Upload failed", 
        details: uploadResult.error.message
      }, { status: 500, headers });
    }
    
    console.log("Upload successful:", uploadResult.data);
    
    // Obter URL pública
    const urlResult = adminSupabase.storage
      .from("receipts")
      .getPublicUrl(filePath);
    
    if (!urlResult.data?.publicUrl) {
      console.error("Failed to generate public URL");
      return NextResponse.json({ 
        error: "Failed to generate public URL" 
      }, { status: 500, headers });
    }
    
    const publicUrl = urlResult.data.publicUrl;
    console.log("Generated URL:", publicUrl);
    
    // Sucesso - retornar informações do arquivo
    return NextResponse.json({
      success: true,
      url: publicUrl,
      downloadUrl: publicUrl,
      fileName: sanitizedFileName,
      fileType: file.type,
      size: file.size
    }, { headers });
    
  } catch (error) {
    // Tratamento de erros não capturados
    console.error("Unexpected server error:", error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500, headers });
  }
} 