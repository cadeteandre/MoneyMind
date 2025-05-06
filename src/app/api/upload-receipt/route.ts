import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const maxDuration = 60; // Aumenta o tempo máximo de execução para 60 segundos

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");

    if (!file || typeof userId !== "string" || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    // Verifica se o arquivo é uma imagem
    const fileType = (file as File).type;
    if (!fileType.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Inicializa o cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Gera um nome de arquivo único baseado no timestamp e ID do usuário
    const timestamp = Date.now();
    // Extrai a extensão do arquivo e converte para minúsculas
    const originalExt = (file as File).name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Use extensões confiáveis (jpg, png) para melhor compatibilidade
    const safeName = `receipt-${timestamp}.${originalExt}`;
    const filePath = `receipts/${userId}/${safeName}`;

    // Faz o upload com configurações adicionais
    const { error } = await supabase.storage
      .from("receipts")
      .upload(filePath, file, {
        cacheControl: "public, max-age=31536000", // Cache por 1 ano
        upsert: false,
        contentType: fileType, // Define explicitamente o tipo de conteúdo
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Obter URL pública com o método correto para garantir acesso direto
    const { data: publicUrlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(filePath, {
        download: false, // Não força download, abrir no navegador
        transform: {
          width: 800, // Define uma largura máxima para melhor compatibilidade
          quality: 80, // Define qualidade para jpeg
        },
      });

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json({ error: "Failed to generate public URL" }, { status: 500 });
    }

    // Garantir que a URL seja acessível diretamente
    const publicUrl = publicUrlData.publicUrl;
    
    // Como fallback, também gerar uma URL direta de download caso necessário
    const { data: downloadUrlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(filePath, { download: true });
    
    return NextResponse.json({ 
      url: publicUrl,
      downloadUrl: downloadUrlData?.publicUrl || publicUrl,
      fileType: fileType,
      fileName: safeName
    });
  } catch (err) {
    console.error("Error uploading receipt:", err);
    return NextResponse.json({ error: "Failed to upload receipt" }, { status: 500 });
  }
} 