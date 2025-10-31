// functions/on-storage-upload/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Inicializar cliente de Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_PUBLIC_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Faltan variables de entorno");
      return new Response("Error de configuración", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener URL pública permanente (sin expiración)
    const { data: publicUrlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;
    console.log("URL pública generada:", publicUrl);

    // Payload para n8n
    const n8nPayload = {
      bucket,
      file_name: fileName,
      full_url: publicUrl,
      timestamp: new Date().toISOString()
    };

    console.log("Enviando a n8n:", JSON.stringify(n8nPayload, null, 2));

    // ✅ SOLUCIÓN: No esperar respuesta de n8n, enviar y continuar
    // Esto previene el timeout
    fetch(
      "https://platanoia-n8n.up.railway.app/webhook-test/new-file",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload)
      }
    ).then(response => {
      console.log("✅ Respuesta de n8n:", response.status);
      return response.text();
    }).then(text => {
      console.log("Body de respuesta:", text);
    }).catch(err => {
      console.error("⚠️ Error llamando a n8n (no crítico):", err.message);
    });

    // Responder inmediatamente sin esperar a n8n
    return new Response(JSON.stringify({ 
      success: true, 
      message: "PDF recibido y notificación enviada a n8n",
      url_type: "public (no expiration)",
      file: fileName
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