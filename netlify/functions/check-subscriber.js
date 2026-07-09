// Netlify Function: comprueba si un email tiene una suscripción activa en
// Stripe. Se usa para el acceso "Ya soy suscriptor" en Recursos.
//
// AVISO DE SEGURIDAD (v1, sencilla a propósito):
// Esta comprobación es solo por email, sin contraseña ni enlace mágico.
// Es suficiente mientras el Nivel 2 sea contenido descriptivo/no sensible.
// El día que subas vídeos y PDFs reales protegidos, hay que reforzar esto
// con un enlace de acceso único por email (magic link) antes de servir
// los archivos — avísame cuando llegue ese momento y lo endurecemos.
//
// Variables de entorno necesarias:
//   STRIPE_SECRET_KEY -> clave secreta de Stripe

const Stripe = require("stripe");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const body = event.body ? JSON.parse(event.body) : {};
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false, error: "Falta el email" }),
      };
    }

    const customers = await stripe.customers.list({ email, limit: 5 });

    let active = false;
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 10,
      });
      if (subs.data.some((s) => s.status === "active" || s.status === "trialing")) {
        active = true;
        break;
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false, error: err.message }),
    };
  }
};
