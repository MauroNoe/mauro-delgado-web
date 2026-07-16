// TERMÓMETRO DE IMPACTO DIRECTIVO — lógica de la herramienta
// 12 afirmaciones, escala 1-5, 4 dimensiones (3 preguntas cada una)
// Dimensiones: control->delegación, autoproteccion->relaciones, urgencia->vision, complacencia->autenticidad
// Todas las afirmaciones están redactadas en la dirección "creativa" (a mayor puntuación, más patrón creativo/sostenible).
// Bilingüe ES/EN: el idioma se lee de document.documentElement.lang (gestionado por main.js).

function lang() {
  return document.documentElement.getAttribute("lang") === "en" ? "en" : "es";
}

const PREGUNTAS = [
  { dim: "delegacion", es: "Cuando delego una tarea importante, confío en el resultado sin necesitar revisarlo constantemente.", en: "When I delegate an important task, I trust the outcome without needing to check on it constantly." },
  { dim: "delegacion", es: "Prefiero que mi equipo tome decisiones sin necesitar mi aprobación en cada paso.", en: "I prefer my team to make decisions without needing my approval at every step." },
  { dim: "delegacion", es: "Cuando algo sale mal en un proyecto delegado, mi primera reacción es entender qué pasó, no tomar el control de vuelta.", en: "When something goes wrong on a delegated project, my first reaction is to understand what happened, not take back control." },
  { dim: "relaciones", es: "Tengo conversaciones difíciles con mi equipo o mis pares en cuanto anticipo una tensión, no cuando ya es inevitable.", en: "I have difficult conversations with my team or peers as soon as I sense tension, not once it becomes unavoidable." },
  { dim: "relaciones", es: "Pido feedback honesto a mis colaboradores sobre mi propio liderazgo, con regularidad.", en: "I regularly ask my colleagues for honest feedback on my own leadership." },
  { dim: "relaciones", es: "Cuando alguien me contradice en una reunión, mi primer impulso es entender su punto antes de defender el mío.", en: "When someone contradicts me in a meeting, my first instinct is to understand their point before defending mine." },
  { dim: "vision", es: "Dedico tiempo cada semana a pensar en el futuro del negocio, no solo en resolver el presente.", en: "I dedicate time every week to thinking about the future of the business, not just solving the present." },
  { dim: "vision", es: "Tengo claro cuál es mi prioridad número uno este trimestre, y actúo en consecuencia.", en: "I&rsquo;m clear on my number-one priority this quarter, and I act accordingly." },
  { dim: "vision", es: "Cuando surge una urgencia, soy capaz de evaluar si de verdad lo es antes de dejar todo lo demás.", en: "When something urgent comes up, I&rsquo;m able to evaluate whether it truly is before dropping everything else." },
  { dim: "autenticidad", es: "Digo lo que realmente pienso en una reunión, incluso si no es lo que se espera de mí.", en: "I say what I really think in a meeting, even if it&rsquo;s not what&rsquo;s expected of me." },
  { dim: "autenticidad", es: "Tomo decisiones incómodas cuando sé que son las correctas, aunque no sean populares.", en: "I make uncomfortable decisions when I know they&rsquo;re right, even if they&rsquo;re unpopular." },
  { dim: "autenticidad", es: "Mi comportamiento es consistente delante de mi jefe, mis pares y mi equipo — no cambio según quién me observa.", en: "My behavior is consistent in front of my boss, my peers and my team — I don&rsquo;t change depending on who&rsquo;s watching." },
];

const ESCALA = [
  { v: 1, es: "Nunca", en: "Never" },
  { v: 2, es: "Rara vez", en: "Rarely" },
  { v: 3, es: "A veces", en: "Sometimes" },
  { v: 4, es: "Con frecuencia", en: "Often" },
  { v: 5, es: "Siempre", en: "Always" },
];

const DIMENSIONES = {
  delegacion: { es: "Foco en resultados vs. control", en: "Focus on results vs. control" },
  relaciones: { es: "Relaciones vs. autoprotección", en: "Relationships vs. self-protection" },
  vision: { es: "Visión vs. urgencia", en: "Vision vs. urgency" },
  autenticidad: { es: "Autenticidad vs. complacencia", en: "Authenticity vs. complacency" },
};

let respuestas = {};
let paso = 0;
let leadCapturado = null;

function render() {
  const app = document.getElementById("termometro-app");
  if (!app) return;
  if (paso < PREGUNTAS.length) {
    renderPregunta(app, paso);
  } else if (paso === PREGUNTAS.length) {
    renderCaptura(app);
  } else {
    renderResultado(app);
  }
}

function renderPregunta(app, idx) {
  const p = PREGUNTAS[idx];
  const L = lang();
  const pct = Math.round((idx / PREGUNTAS.length) * 100);
  const preguntaLabel = L === "en" ? `Question ${idx + 1} of ${PREGUNTAS.length}` : `Pregunta ${idx + 1} de ${PREGUNTAS.length}`;
  app.innerHTML = `
    <div class="term-progress"><div class="term-progress-bar" style="width:${pct}%"></div></div>
    <p class="small-caps">${preguntaLabel}</p>
    <h3 class="term-question">${p[L]}</h3>
    <div class="term-scale">
      ${ESCALA.map(o => `<button class="term-opt" data-v="${o.v}">${o[L]}</button>`).join("")}
    </div>
  `;
  app.querySelectorAll(".term-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      respuestas[idx] = { dim: p.dim, valor: parseInt(btn.dataset.v, 10) };
      paso++;
      render();
    });
  });
}

function encodeForm(data) {
  return Object.keys(data)
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");
}

function renderCaptura(app) {
  const L = lang();
  const t = L === "en" ? {
    h3: "Almost there. Where should we send your result?",
    p: "We&rsquo;ll show your result right here on this page.",
    nombre: "Name",
    email: "Email",
    btn: "See my result",
    sending: "Sending…",
    error: "Something went wrong. Please try again.",
  } : {
    h3: "Ya casi está. ¿A dónde enviamos tu resultado?",
    p: "Te mostramos el resultado aquí mismo, en esta página.",
    nombre: "Nombre",
    email: "Email",
    btn: "Ver mi resultado",
    sending: "Enviando…",
    error: "Algo ha fallado. Inténtalo de nuevo.",
  };
  app.innerHTML = `
    <h3>${t.h3}</h3>
    <p style="color:var(--gray);">${t.p}</p>
    <form id="term-form" style="max-width:420px;">
      <input required type="text" placeholder="${t.nombre}" id="term-nombre" style="width:100%; padding:12px; margin-bottom:12px; border:1px solid var(--border); border-radius:4px; font-family:var(--sans);">
      <input required type="email" placeholder="${t.email}" id="term-email" style="width:100%; padding:12px; margin-bottom:18px; border:1px solid var(--border); border-radius:4px; font-family:var(--sans);">
      <button type="submit" class="btn btn-gold" style="width:100%;">${t.btn}</button>
      <p id="term-form-error" style="color:#b91c1c; font-size:0.85rem; margin-top:10px; display:none;">${t.error}</p>
    </form>
  `;
  document.getElementById("term-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("term-nombre").value;
    const email = document.getElementById("term-email").value;
    const btn = e.target.querySelector("button[type=submit]");
    const errorEl = document.getElementById("term-form-error");
    btn.disabled = true;
    btn.textContent = t.sending;

    fetch(window.location.pathname, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm({ "form-name": "termometro", nombre: nombre, email: email, "bot-field": "" }),
    })
      .then(function (res) {
        if (!res.ok) { throw new Error("Netlify form submission failed: " + res.status); }
        leadCapturado = { nombre: nombre, email: email };
        paso++;
        render();
      })
      .catch(function (err) {
        console.error(err);
        btn.disabled = false;
        btn.textContent = t.btn;
        errorEl.style.display = "block";
      });
  });
}

const PERFILES = {
  ejecutor: {
    nombre: { es: "Ejecutor bajo presión", en: "Executor under pressure" },
    posicion: {
      es: "Tu patrón dominante prioriza el control y la urgencia — decides rápido y avanzas, especialmente cuando la presión sube.",
      en: "Your dominant pattern prioritizes control and urgency — you decide fast and move, especially when pressure rises.",
    },
    luz: {
      es: "Tu urgencia produce algo que muchos líderes con más años de experiencia no logran: decisiones rápidas y ejecución real cuando la situación lo exige. En contextos de crisis o de arranque, esa capacidad de tomar el control y avanzar es un activo genuino — no todos los perfiles la tienen.",
      en: "Your urgency produces something many more experienced leaders never quite master: fast decisions and real execution when the situation demands it. In crisis or turnaround contexts, that capacity to take control and move is a genuine asset — not every leadership profile has it.",
    },
    sombra: {
      es: "El coste de ese mismo patrón aparece con el tiempo, no de inmediato: cuando el control y la urgencia se convierten en el modo por defecto, el equipo aprende a esperar instrucciones en lugar de pensar por sí mismo. La erosión de la confianza y de la iniciativa suele ser silenciosa — se nota primero en la calidad de las ideas que dejan de llegarte, no en una queja explícita.",
      en: "The cost of this same pattern shows up over time, not immediately: when control and urgency become the default mode, the team learns to wait for instructions instead of thinking for itself. The erosion of trust and initiative tends to be quiet — you notice it first in the quality of ideas that stop reaching you, not in an explicit complaint.",
    },
  },
  estratega: {
    nombre: { es: "Estratega en construcción", en: "Strategist in progress" },
    posicion: {
      es: "Tu patrón varía según la situación — te mueves entre control y delegación, entre urgencia y visión, sin un eje claramente dominante.",
      en: "Your pattern shifts depending on the situation — you move between control and delegation, urgency and vision, without one clearly dominant axis.",
    },
    luz: {
      es: "Tienes algo que no se enseña fácilmente: la capacidad de moverte entre control y delegación, entre urgencia y visión, según lo que la situación realmente necesita. Esa flexibilidad — no la perfección en una sola dimensión — es en sí misma una señal de madurez de liderazgo.",
      en: "You have something that&rsquo;s hard to teach: the ability to move between control and delegation, between urgency and vision, depending on what the situation actually needs. That flexibility — not perfection in a single dimension — is itself a sign of leadership maturity.",
    },
    sombra: {
      es: "El riesgo está precisamente en esa inconsistencia: tu equipo puede no lograr identificar un patrón estable en cómo respondes, lo que genera incertidumbre incluso cuando tus decisiones individuales son buenas. Y bajo presión real — no la de este test, sino la de una crisis genuina — la dimensión donde puntuaste más bajo suele ser la primera en ceder, justo cuando más visible eres.",
      en: "The risk sits precisely in that inconsistency: your team may struggle to read a stable pattern in how you respond, which creates uncertainty even when your individual decisions are good. And under real pressure — not this test&rsquo;s, but a genuine crisis — the dimension where you scored lowest tends to be the first to give way, right when you&rsquo;re most visible.",
    },
  },
  integrador: {
    nombre: { es: "Líder integrador", en: "Integrative leader" },
    posicion: {
      es: "Tu patrón dominante ya combina resultados y relaciones de forma consistente, incluso bajo presión.",
      en: "Your dominant pattern already combines results and relationships consistently, even under pressure.",
    },
    luz: {
      es: "Tu patrón por defecto ya genera algo que se gana con años, no con un solo buen trimestre: confianza sostenida y una reputación de consistencia. A nivel senior, eso vale más que casi cualquier otra competencia — es lo que permite que otros actúen con autonomía real sin necesitar tu validación constante.",
      en: "Your default pattern already produces something earned over years, not a single good quarter: sustained trust and a reputation for consistency. At senior level, that&rsquo;s worth more than almost any other competency — it&rsquo;s what allows others to act with real autonomy without needing your constant validation.",
    },
    sombra: {
      es: "El riesgo típico en este nivel no es el patrón en sí, es la escala y la falsa sensación de trabajo terminado. Lo que funciona con tu equipo directo no está necesariamente probado a la escala de toda la organización, entre culturas o geografías, o en una situación que aún no has enfrentado — una crisis real, una sucesión, una fusión. Una puntuación alta puede reducir precisamente la reflexión que te trajo hasta aquí.",
      en: "The typical risk at this level isn&rsquo;t the pattern itself — it&rsquo;s scale, and a false sense that the work is done. What works with your immediate team isn&rsquo;t necessarily proven at the scale of the full organization, across cultures or geographies, or in a situation you haven&rsquo;t yet faced — a real crisis, a succession, a merger. A high score can reduce the very reflection that got you here.",
    },
  },
};

function calcularResultado() {
  const totales = { delegacion: 0, relaciones: 0, vision: 0, autenticidad: 0 };
  Object.values(respuestas).forEach(r => { totales[r.dim] += r.valor; });
  const mediaGlobal = Object.values(totales).reduce((a, b) => a + b, 0) / 12;

  let dimMasDebil = Object.keys(totales)[0];
  let dimMasFuerte = Object.keys(totales)[0];
  Object.keys(totales).forEach(k => {
    if (totales[k] < totales[dimMasDebil]) dimMasDebil = k;
    if (totales[k] > totales[dimMasFuerte]) dimMasFuerte = k;
  });

  let perfil;
  if (mediaGlobal < 2.8) {
    perfil = PERFILES.ejecutor;
  } else if (mediaGlobal < 4.0) {
    perfil = PERFILES.estratega;
  } else {
    perfil = PERFILES.integrador;
  }

  return { perfil, totales, dimMasDebil, dimMasFuerte };
}

function renderResultado(app) {
  const L = lang();
  const { perfil, dimMasDebil, dimMasFuerte } = calcularResultado();
  const t = L === "en" ? {
    kicker: "Your result",
    hLuz: "What&rsquo;s working",
    hSombra: "The blind spot to watch",
    hPractica: "What this means in practice",
    practica: `In practical terms, this means the people who work with you would likely name your strongest asset as <strong>${DIMENSIONES[dimMasFuerte].en}</strong> — and would notice, even if they don&rsquo;t always say so directly, that <strong>${DIMENSIONES[dimMasDebil].en}</strong> is where your leadership feels most strained once pressure rises.`,
    h3: "A practical recommendation",
    rec: `This week, choose a real situation where your pattern in <strong>${DIMENSIONES[dimMasDebil].en}</strong> will be tested, and decide in advance how you want to respond — before pressure decides for you.`,
    note: `This snapshot is a quick read &mdash; 12 questions, not a full 360&deg; &mdash; inspired by a central distinction in leadership research: the difference between patterns that sustain results and relationships at once, and patterns that favor one at the expense of the other, especially under pressure. The <a href="leadership-circle-profile.html"><strong>Leadership Circle Profile</strong></a>, one of the most widely used 360&deg; assessment instruments at senior executive level internationally, measures this same distinction with the depth and statistical validation a 2-minute exercise can&rsquo;t offer. Mauro is a certified practitioner of this instrument and uses it, together with real data from your environment, in his executive coaching engagements.`,
    cta: "Book a diagnostic session (20 min, no cost)",
  } : {
    kicker: "Tu resultado",
    hLuz: "Lo que ya funciona",
    hSombra: "El punto ciego a vigilar",
    hPractica: "Qué significa esto en la práctica",
    practica: `En términos prácticos, esto significa que las personas que trabajan contigo probablemente nombrarían tu punto más fuerte como <strong>${DIMENSIONES[dimMasFuerte].es}</strong> — y notarían, aunque no siempre te lo digan directamente, que <strong>${DIMENSIONES[dimMasDebil].es}</strong> es donde tu liderazgo se resiente más en cuanto sube la presión.`,
    h3: "Una recomendación práctica",
    rec: `Esta semana, elige una situación real donde tu patrón en <strong>${DIMENSIONES[dimMasDebil].es}</strong> se ponga a prueba, y decide de antemano cómo quieres responder — antes de que la presión decida por ti.`,
    note: `Este termómetro es una fotografía rápida &mdash; 12 preguntas, no un 360&deg; completo &mdash; inspirada en una distinción central de la investigación en liderazgo: la diferencia entre patrones que sostienen resultados y relaciones a la vez, y patrones que priorizan uno a costa del otro, especialmente bajo presión. El <a href="leadership-circle-profile.html"><strong>Leadership Circle Profile</strong></a>, uno de los instrumentos de evaluación 360&deg; más utilizados a nivel directivo a nivel internacional, mide esta misma distinción con la profundidad y la validación estadística que un ejercicio de 2 minutos no puede ofrecer. Mauro es practicante certificado de este instrumento y lo utiliza, junto con datos reales de tu entorno, en sus procesos de coaching ejecutivo.`,
    cta: "Reserva una sesión de diagnóstico (20 min, sin coste)",
  };
  app.innerHTML = `
    <span class="kicker">${t.kicker}</span>
    <h2>${perfil.nombre[L]}</h2>
    <p class="lede">${perfil.posicion[L]}</p>

    <div class="mt-40">
      <h3>${t.hLuz}</h3>
      <p>${perfil.luz[L]}</p>
    </div>
    <div class="mt-40">
      <h3>${t.hSombra}</h3>
      <p>${perfil.sombra[L]}</p>
    </div>
    <div class="mt-40">
      <h3>${t.hPractica}</h3>
      <p>${t.practica}</p>
    </div>

    <div class="divider"></div>
    <h3>${t.h3}</h3>
    <p>${t.rec}</p>
    <div class="mt-40" style="background:var(--cream); border-radius:6px; padding:28px;">
      <p style="margin-bottom:18px;">${t.note}</p>
      <a href="contacto.html" class="btn btn-gold">${t.cta}</a>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("termometro-app")) {
    render();
    // Si el usuario cambia de idioma a mitad de la herramienta, re-renderizamos
    // el paso actual en el nuevo idioma sin perder el progreso.
    var langBtn = document.querySelector(".lang-switch");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        render();
      });
    }
  }
});
