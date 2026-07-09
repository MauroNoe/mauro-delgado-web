// Acceso al Nivel 2 (suscripción Stripe) — funciona una vez desplegado en
// Netlify con las Functions configuradas. En local (file://) los botones
// muestran un aviso en vez de fallar en silencio.
// Bilingüe ES/EN: el idioma se lee de document.documentElement.lang (gestionado por main.js).

(function () {
  const FN_CHECKOUT = "/.netlify/functions/create-checkout-session";
  const FN_CHECK = "/.netlify/functions/check-subscriber";
  const STORAGE_KEY = "md_subscriber_email";

  function lang() {
    return document.documentElement.getAttribute("lang") === "en" ? "en" : "es";
  }

  const MSG = {
    unlocked: { es: "Acceso activo. Gracias por suscribirte.", en: "Access active. Thanks for subscribing." },
    checkLocalOnly: { es: "Esta comprobación solo funciona una vez publicada la web (usa Netlify Functions).", en: "This check only works once the site is published (uses Netlify Functions)." },
    checking: { es: "Comprobando...", en: "Checking..." },
    notFound: { es: "No encontramos una suscripción activa con ese email. Si acabas de suscribirte, espera un minuto e inténtalo de nuevo.", en: "We couldn&rsquo;t find an active subscription with that email. If you just subscribed, wait a minute and try again." },
    checkError: { es: "No se pudo comprobar ahora mismo. Inténtalo de nuevo en un momento.", en: "Couldn&rsquo;t check right now. Please try again in a moment." },
    payLocalOnly: { es: "El pago solo funciona una vez publicada la web (usa Netlify Functions + Stripe).", en: "Payment only works once the site is published (uses Netlify Functions + Stripe)." },
    redirecting: { es: "Redirigiendo al pago seguro...", en: "Redirecting to secure checkout..." },
    payError: { es: "No se pudo iniciar el pago. Inténtalo de nuevo.", en: "Couldn&rsquo;t start the payment. Please try again." },
    emailFirst: { es: "Escribe tu email primero.", en: "Enter your email first." },
    subscribeSuccess: { es: "¡Suscripción activada! Escribe tu email en cualquier tema del Nivel 2 para desbloquear el contenido.", en: "Subscription activated! Enter your email on any Level 2 topic to unlock the content." },
    subscribeCancelled: { es: "Pago cancelado. Puedes intentarlo de nuevo cuando quieras.", en: "Payment cancelled. You can try again anytime." },
  };

  function isLocal() {
    return window.location.protocol === "file:";
  }

  function setStatus(box, key, ok) {
    const status = box.querySelector(".member-status");
    if (!status) return;
    status.innerHTML = MSG[key][lang()];
    status.style.display = "block";
    status.style.color = ok ? "#8fd19e" : "#e29a9a";
  }

  function unlock(box) {
    box.classList.add("unlocked");
    const checkRow = box.querySelector(".member-check");
    const actionsRow = box.querySelector(".member-actions");
    if (checkRow) checkRow.style.display = "none";
    if (actionsRow) actionsRow.style.display = "none";
    setStatus(box, "unlocked", true);
  }

  async function checkEmail(box, email) {
    if (isLocal()) {
      setStatus(box, "checkLocalOnly", false);
      return;
    }
    setStatus(box, "checking", true);
    try {
      const res = await fetch(FN_CHECK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.active) {
        localStorage.setItem(STORAGE_KEY, email);
        unlock(box);
      } else {
        setStatus(box, "notFound", false);
      }
    } catch (err) {
      setStatus(box, "checkError", false);
    }
  }

  async function subscribe(box, email) {
    if (isLocal()) {
      setStatus(box, "payLocalOnly", false);
      return;
    }
    setStatus(box, "redirecting", true);
    try {
      const res = await fetch(FN_CHECKOUT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || undefined }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStatus(box, "payError", false);
      }
    } catch (err) {
      setStatus(box, "payError", false);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const boxes = document.querySelectorAll(".level-2-access");
    boxes.forEach(function (box) {
      const emailInput = box.querySelector(".member-email-input");
      const checkBtn = box.querySelector(".member-check-btn");
      const subBtn = box.querySelector(".member-subscribe-btn");

      if (checkBtn) {
        checkBtn.addEventListener("click", function () {
          const email = (emailInput && emailInput.value || "").trim();
          if (!email) { setStatus(box, "emailFirst", false); return; }
          checkEmail(box, email);
        });
      }
      if (subBtn) {
        subBtn.addEventListener("click", function () {
          const email = (emailInput && emailInput.value || "").trim();
          subscribe(box, email);
        });
      }

      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached && !isLocal()) {
        checkEmail(box, cached);
      }
    });

    const params = new URLSearchParams(window.location.search);
    const banner = document.getElementById("suscripcion-banner");
    if (banner && params.get("suscripcion") === "exito") {
      banner.innerHTML = MSG.subscribeSuccess[lang()];
      banner.style.display = "block";
    } else if (banner && params.get("suscripcion") === "cancelada") {
      banner.innerHTML = MSG.subscribeCancelled[lang()];
      banner.style.display = "block";
    }
  });
})();
