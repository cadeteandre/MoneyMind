import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const maxDuration = 60; // Aumenta o tempo máximo de execução para 60 segundos

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as unknown;
    const userId = formData.get("userId") as unknown;

    console.log("File upload debug:");
    console.log("File type:", typeof file);
    
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    
    if (typeof userId !== "string") {
      return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 });
    }

    // Verifica se o arquivo é um Blob ou File (ambos têm as mesmas propriedades que precisamos)
    const isFileOrBlob = 
      typeof file === 'object' && 
      file !== null && 
      'arrayBuffer' in file && 
      'size' in file && 
      'type' in file;
    
    if (!isFileOrBlob) {
      return NextResponse.json({ error: "Invalid file format" }, { status: 400 });
    }

    // Agora podemos fazer um cast seguro para File
    const fileObj = file as File;
    console.log("File content type:", fileObj.type);
    console.log("File size:", fileObj.size, "bytes");

    // Verifica se o arquivo tem um tamanho razoável
    if (fileObj.size < 100) {
      return NextResponse.json({ error: "File seems to be corrupted or too small" }, { status: 400 });
    }

    let fileBuffer: ArrayBuffer;
    try {
      // Converte o arquivo para um ArrayBuffer
      fileBuffer = await fileObj.arrayBuffer();
      console.log("Successfully read file buffer, size:", fileBuffer.byteLength, "bytes");
    } catch (error) {
      console.error("Error reading file:", error);
      return NextResponse.json({ error: "Failed to read file content" }, { status: 500 });
    }

    // Detecta o tipo MIME real do arquivo baseado nos primeiros bytes
    const realFileType = detectMimeType(fileBuffer);
    console.log("Detected MIME type:", realFileType);
    
    if (!realFileType.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Inicializa o cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    // Gera um nome de arquivo único baseado no timestamp e ID do usuário
    const timestamp = Date.now();
    // Determine a extensão correta baseada no tipo MIME real
    const extension = getMimeExtension(realFileType);
    
    // Use extensões confiáveis para melhor compatibilidade
    const safeName = `receipt-${timestamp}.${extension}`;
    const filePath = `receipts/${userId}/${safeName}`;

    console.log("Uploading to path:", filePath);
    console.log("Using extension:", extension);

    // Converte o ArrayBuffer de volta para um Blob com o tipo MIME correto
    const fileBlob = new Blob([fileBuffer], { type: realFileType });

    // Faz o upload com configurações adicionais
    const { error, data } = await supabase.storage
      .from("receipts")
      .upload(filePath, fileBlob, {
        cacheControl: "public, max-age=31536000", // Cache por 1 ano
        upsert: true, // Sobrescreve o arquivo se já existir
        contentType: realFileType, // Define explicitamente o tipo de conteúdo correto
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Upload successful, data:", data);

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json({ error: "Failed to generate public URL" }, { status: 500 });
    }

    // URL pública direta
    const publicUrl = publicUrlData.publicUrl;
    console.log("Generated public URL:", publicUrl);
    
    return NextResponse.json({ 
      url: publicUrl,
      downloadUrl: publicUrl,
      fileType: realFileType,
      fileName: safeName
    });
  } catch (err) {
    console.error("Error uploading receipt:", err);
    return NextResponse.json({ error: "Failed to upload receipt" }, { status: 500 });
  }
}

// Função para detectar o tipo MIME real baseado nos primeiros bytes do arquivo
function detectMimeType(buffer: ArrayBuffer): string {
  const arr = new Uint8Array(buffer.slice(0, 4));
  const header = Array.from(arr).map(byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Assinaturas comuns de arquivos
  if (header.startsWith('89504e47')) return 'image/png';
  if (header.startsWith('ffd8ff')) return 'image/jpeg';
  if (header.startsWith('47494638')) return 'image/gif';
  if (header.startsWith('52494646') && buffer.byteLength > 8) {
    // WEBP começa com RIFF e tem "WEBP" no byte 8
    const webpArr = new Uint8Array(buffer.slice(8, 12));
    const webpHeader = Array.from(webpArr).map(byte => String.fromCharCode(byte)).join('');
    if (webpHeader === 'WEBP') return 'image/webp';
  }
  
  // Se não conseguimos identificar, assumimos um JPEG
  return 'image/jpeg';
}

// Retorna a extensão apropriada para um tipo MIME
function getMimeExtension(mimeType: string): string {
  const mimeExtMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff'
  };
  
  return mimeExtMap[mimeType] || 'jpg'; // Retorna jpg como fallback
} 