// functions/on-storage-upload/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  try {
    console.log("=== Webhook recibido ===");
    
    const payload = await req.json();
    console.log("Payload completo:", JSON.stringify(payload, null, 2));

    // Verificar el tipo de evento
    if (payload.type !== "INSERT") {
      console.log(`Evento ignorado: ${payload.type}`);
      return new Response(JSON.stringify({ 
        message: "Evento ignorado", 
        type: payload.type 
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Extraer datos del archivo
    const fileName = payload.record?.name;
    const bucket = payload.record?.bucket_id;

    console.log(`Archivo detectado: ${fileName} en bucket: ${bucket}`);

    if (!fileName || !bucket) {
      console.error("Faltan datos en el payload");
      return new Response("Datos incompletos", { status: 400 });
    }

    // Validar si es PDF
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      console.log("No es PDF, ignorando");
      return new Response("Ignorado: no es PDF", { status: 200 });
    }

    // Construir URL
    const fullUrl = `https://kong.up.railway.app/storage/v1/object/public/${bucket}/${fileName}`;
    console.log("URL construida:", fullUrl);

    // Payload para n8n
    const n8nPayload = {
      bucket,
      file_name: fileName,
      full_url: fullUrl,
      timestamp: new Date().toISOString()
    };

    console.log("Enviando a n8n:", JSON.stringify(n8nPayload, null, 2));

    // POST a n8n con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const n8nResponse = await fetch(
      "https://platanoia-n8n.up.railway.app/webhook-test/new-file",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    console.log("Respuesta de n8n:", n8nResponse.status);
    const responseText = await n8nResponse.text();
    console.log("Body de respuesta:", responseText);

    if (!n8nResponse.ok) {
      throw new Error(`n8n respondió con status ${n8nResponse.status}: ${responseText}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Notificación enviada a n8n" 
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Error procesando evento:");
    console.error(err);
    
    return new Response(JSON.stringify({ 
      error: err.message || "Error interno",
      stack: err.stack 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});