// Netlify Function: envía por email el resultado del Termómetro de Impacto
// Directivo a la persona que acaba de completarlo.
//
// Variables de entorno necesarias (configurar en Netlify, NUNCA en el código):
//   RESEND_API_KEY  -> API key de Resend (re_...)
//   RESEND_FROM     -> remitente verificado, ej. "Mauro Delgado <hola@mauro-delgado.com>"
//                      Mientras el dominio no esté verificado en Resend, se puede
//                      usar "Mauro Delgado <onboarding@resend.dev>" para pruebas.

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { nombre, email, lang, perfilNombre, posicion, luz, sombra, practica } = body;

    if (!email || !nombre || !perfilNombre) {
      return { statusCode: 400, body: JSON.stringify({ error: "Faltan datos obligatorios." }) };
    }

    const L = lang === "en" ? "en" : "es";
    const t = L === "en" ? {
      subject: `Your result: ${perfilNombre}`,
      greeting: `Hi ${nombre},`,
      intro: "Here's your result from the Executive Impact Snapshot:",
      hLuz: "What's working",
      hSombra: "The blind spot to watch",
      hPractica: "What this means in practice",
      cta: "Book a diagnostic session (20 min, no cost)",
      signature: "Mauro Delgado, PCC<br>Executive Coach &amp; Senior Consultant",
    } : {
      subject: `Tu resultado: ${perfilNombre}`,
      greeting: `Hola ${nombre},`,
      intro: "Este es tu resultado del Termómetro de Impacto Directivo:",
      hLuz: "Lo que ya funciona",
      hSombra: "El punto ciego a vigilar",
      hPractica: "Qué significa esto en la práctica",
      cta: "Reserva una sesión de diagnóstico (20 min, sin coste)",
      signature: "Mauro Delgado, PCC<br>Coach Ejecutivo y Consultor Senior",
    };

    const siteUrl = process.env.SITE_URL || "https://mauro-delgado.com";
    const from = process.env.RESEND_FROM || "Mauro Delgado <onboarding@resend.dev>";

    const html = `
      <div style="font-family:Arial,sans-serif; max-width:560px; margin:0 auto; color:#1f2937;">
        <p>${t.greeting}</p>
        <p>${t.intro}</p>
        <h2 style="color:#0B2545; margin-bottom:4px;">${perfilNombre}</h2>
        <p style="color:#4b5563; font-style:italic;">${posicion}</p>
        <h3 style="color:#B08D57; text-transform:uppercase; font-size:13px; letter-spacing:0.04em; margin-top:28px;">${t.hLuz}</h3>
        <p>${luz}</p>
        <h3 style="color:#B08D57; text-transform:uppercase; font-size:13px; letter-spacing:0.04em; margin-top:24px;">${t.hSombra}</h3>
        <p>${sombra}</p>
        <h3 style="color:#B08D57; text-transform:uppercase; font-size:13px; letter-spacing:0.04em; margin-top:24px;">${t.hPractica}</h3>
        <p>${practica}</p>
        <div style="margin-top:32px; padding:20px; background:#F5F3EE; border-radius:6px;">
          <a href="${siteUrl}/contacto" style="display:inline-block; background:#B08D57; color:#0B2545; font-weight:bold; text-decoration:none; padding:12px 22px; border-radius:4px;">${t.cta}</a>
        </div>
        <p style="margin-top:32px; color:#6b7280; font-size:13px;">${t.signature}</p>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from,
        to: [email],
        subject: t.subject,
        html: html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("send-resultado-termometro: Resend error, status =", resendRes.status);
      return { statusCode: 502, body: JSON.stringify({ error: "Resend error: " + errText }) };
    }

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("send-resultado-termometro: exception =", err.message);
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: err.message }) };
  }
};
