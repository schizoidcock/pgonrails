// functions/on-storage-upload/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  try {
    const payload = await req.json();

    // Solo procesar si es un evento de creación de objeto en Storage
    if (payload.type === "OBJECT_CREATED") {
      const fileName = payload.record.name;
      const bucket = payload.record.bucket_id;

      // (Opcional) Solo actuar sobre PDFs
      if (!fileName.toLowerCase().endsWith(".pdf")) {
        return new Response("Ignorado: no es PDF", { status: 200 });
      }

      // Construir URL pública (ajustar si el bucket es privado y necesitas Signed URL)
      const fullUrl = `https://kong.up.railway.app/storage/v1/object/public/${bucket}/${fileName}`;

      // POST a n8n
      await fetch("https://platanoia-n8n.up.railway.app/webhook-test/new-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket,
          file_name: fileName,
          full_url: fullUrl
        })
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Error procesando evento:", err);
    return new Response("Error interno", { status: 500 });
  }
});