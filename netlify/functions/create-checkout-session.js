// Netlify Function: crea una sesión de Stripe Checkout para la suscripción
// mensual al Nivel 2 de Recursos.
//
// Variables de entorno necesarias (configurar en Netlify, NUNCA en el código):
//   STRIPE_SECRET_KEY  -> clave secreta de Stripe (sk_live_... o sk_test_...)
//   STRIPE_PRICE_ID    -> ID del Precio recurrente creado en el Dashboard de Stripe (price_...)
//   SITE_URL           -> URL pública del sitio, ej. https://mauro-delgado.com

const Stripe = require("stripe");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const siteUrl = process.env.SITE_URL || "https://mauro-delgado.com";
    const body = event.body ? JSON.parse(event.body) : {};
    const email = body.email || undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: email,
      allow_promotion_codes: true,
      success_url: `${siteUrl}/recursos.html?suscripcion=exito`,
      cancel_url: `${siteUrl}/recursos.html?suscripcion=cancelada`,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
