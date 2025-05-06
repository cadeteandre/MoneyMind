import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const maxDuration = 60; // Aumenta o tempo máximo de execução para 60 segundos

export async function POST(req: Request) {
  try {
    // Recriar o FormData a partir do Request original para preservar os tipos dos arquivos
    const originalFormData = await req.formData();
    const formData = new FormData();
    
    // Iterar sobre todos os campos do FormData original e copiá-los
    for (const [key, value] of originalFormData.entries()) {
      formData.append(key, value);
    }
    
    // Extrair campos específicos
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;
    
    // Log detalhado para diagnóstico
    console.log("=== UPLOAD REQUEST DEBUG ===");
    console.log("Request Content-Type:", req.headers.get("content-type"));
    console.log("FormData keys:", Array.from(formData.keys()));
    console.log("File présent:", !!file);
    console.log("File type:", file ? `${file.type} (${typeof file})` : "N/A");
    console.log("File name:", file ? file.name : "N/A");
    console.log("File size:", file ? file.size : "N/A");
    console.log("UserId present:", !!userId);
    console.log("UserId:", userId);
    
    if (!file || !userId) {
      return NextResponse.json({ 
        error: `Required params missing: ${!file ? "file" : ""} ${!userId ? "userId" : ""}`.trim() 
      }, { status: 400 });
    }
    
    // Verificar se o arquivo é válido
    if (file.size < 100) {
      return NextResponse.json({ error: "File too small, possibly corrupted" }, { status: 400 });
    }
    
    // Obter conteúdo do arquivo como ArrayBuffer para preservar o formato exato
    let fileArrayBuffer: ArrayBuffer;
    try {
      fileArrayBuffer = await file.arrayBuffer();
      console.log("Successfully read file as ArrayBuffer:", fileArrayBuffer.byteLength, "bytes");
    } catch (e) {
      console.error("Error reading file as ArrayBuffer:", e);
      return NextResponse.json({ error: "Failed to read file contents" }, { status: 400 });
    }
    
    // Determinar o tipo de imagem com base nos bytes iniciais
    let fileType = file.type;
    if (!fileType || fileType === "text/plain" || fileType === "application/octet-stream") {
      fileType = detectMimeTypeFromArrayBuffer(fileArrayBuffer);
      console.log("Detected MIME type from bytes:", fileType);
    }
    
    if (!fileType.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }
    
    // Criar blob com o tipo MIME correto
    const fileBlob = new Blob([fileArrayBuffer], { type: fileType });
    console.log("Created Blob with explicit type:", fileType, "Size:", fileBlob.size);
    
    // Inicializar o Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false }
      }
    );
    
    // Gerar nome de arquivo único
    const timestamp = Date.now();
    const extension = getExtensionFromMimeType(fileType);
    const fileName = `receipt-${timestamp}.${extension}`;
    const filePath = `receipts/${userId}/${fileName}`;
    
    console.log("Uploading file to path:", filePath, "with type:", fileType);
    
    // Fazer upload do arquivo
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("receipts")
      .upload(filePath, fileBlob, {
        contentType: fileType,
        cacheControl: "public, max-age=31536000",
        upsert: true // Sobrescrever se já existir
      });
      
    if (uploadError) {
      console.error("Supabase upload error:", JSON.stringify(uploadError));
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    
    console.log("Upload successful! Data:", uploadData);
    
    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(filePath);
      
    if (!urlData?.publicUrl) {
      return NextResponse.json({ error: "Failed to generate public URL" }, { status: 500 });
    }
    
    // Retornar URL ao cliente
    return NextResponse.json({
      url: urlData.publicUrl,
      downloadUrl: urlData.publicUrl,
      fileType,
      fileName,
      size: fileBlob.size,
      path: filePath
    });
    
  } catch (error) {
    console.error("Unexpected error during upload:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error during upload" 
    }, { status: 500 });
  }
}

// Função para detectar o tipo MIME a partir dos bytes iniciais
function detectMimeTypeFromArrayBuffer(buffer: ArrayBuffer): string {
  if (buffer.byteLength < 4) return "image/jpeg"; // Default fallback
  
  const uint8Arr = new Uint8Array(buffer.slice(0, 12));
  const signature = Array.from(uint8Arr.slice(0, 4))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
    
  console.log("File signature (hex):", signature);
  
  // Magic numbers for common image formats
  if (signature.startsWith('89504e47')) return 'image/png';                   // PNG
  if (signature.startsWith('ffd8ff')) return 'image/jpeg';                    // JPEG
  if (signature.startsWith('47494638')) return 'image/gif';                   // GIF
  if (signature.startsWith('52494646')) {                                     // WEBP starts with "RIFF"
    // Check for "WEBP" at position 8
    if (buffer.byteLength >= 12) {
      const webpSignature = String.fromCharCode(...uint8Arr.slice(8, 12));
      if (webpSignature === 'WEBP') return 'image/webp';
    }
  }
  if (signature.startsWith('424d')) return 'image/bmp';                       // BMP
  
  // Default to JPEG if unknown
  return 'image/jpeg';
}

// Função para obter a extensão de arquivo a partir do tipo MIME
function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg',
    'image/tiff': 'tiff'
  };
  
  return extensions[mimeType] || 'jpg';
} 