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

function renderCaptura(app) {
  const L = lang();
  const t = L === "en" ? {
    h3: "Almost there. Where should we send your result?",
    p: "We&rsquo;ll show your result right here, and also send it to you by email as a PDF.",
    nombre: "Name",
    email: "Email",
    btn: "See my result",
  } : {
    h3: "Ya casi está. ¿A dónde enviamos tu resultado?",
    p: "Te mostramos el resultado aquí mismo y también te lo enviamos por email en PDF.",
    nombre: "Nombre",
    email: "Email",
    btn: "Ver mi resultado",
  };
  app.innerHTML = `
    <h3>${t.h3}</h3>
    <p style="color:var(--gray);">${t.p}</p>
    <form id="term-form" style="max-width:420px;">
      <input required type="text" placeholder="${t.nombre}" id="term-nombre" style="width:100%; padding:12px; margin-bottom:12px; border:1px solid var(--border); border-radius:4px; font-family:var(--sans);">
      <input required type="email" placeholder="${t.email}" id="term-email" style="width:100%; padding:12px; margin-bottom:18px; border:1px solid var(--border); border-radius:4px; font-family:var(--sans);">
      <button type="submit" class="btn btn-gold" style="width:100%;">${t.btn}</button>
    </form>
  `;
  document.getElementById("term-form").addEventListener("submit", function (e) {
    e.preventDefault();
    // NOTA TÉCNICA: al desplegar, conectar este formulario a Netlify Forms
    // o al CRM/lista de email para capturar el lead real.
    paso++;
    render();
  });
}

function calcularResultado() {
  const totales = { delegacion: 0, relaciones: 0, vision: 0, autenticidad: 0 };
  Object.values(respuestas).forEach(r => { totales[r.dim] += r.valor; });
  const mediaGlobal = Object.values(totales).reduce((a, b) => a + b, 0) / 12;

  let dimMasDebil = Object.keys(totales)[0];
  Object.keys(totales).forEach(k => {
    if (totales[k] < totales[dimMasDebil]) dimMasDebil = k;
  });

  let perfil;
  if (mediaGlobal < 2.8) {
    perfil = {
      nombre: { es: "Ejecutor bajo presión", en: "Executor under pressure" },
      texto: {
        es: "Tu urgencia genera resultados a corto plazo, pero erosiona confianza y energía del equipo a medio plazo. El patrón reactivo domina cuando la presión sube — es una respuesta comprensible, pero tiene un coste que probablemente ya estás viendo en tu equipo.",
        en: "Your sense of urgency delivers short-term results, but erodes trust and team energy over the medium term. The reactive pattern dominates when pressure rises — an understandable response, but one with a cost you&rsquo;re probably already seeing in your team.",
      },
    };
  } else if (mediaGlobal < 4.0) {
    perfil = {
      nombre: { es: "Estratega en construcción", en: "Strategist in progress" },
      texto: {
        es: "Tienes las bases de un liderazgo creativo y sostenible. El siguiente salto está en tu dimensión más débil: " + DIMENSIONES[dimMasDebil].es + ".",
        en: "You have the foundations of creative, sustainable leadership. Your next leap is in your weakest dimension: " + DIMENSIONES[dimMasDebil].en + ".",
      },
    };
  } else {
    perfil = {
      nombre: { es: "Líder integrador", en: "Integrative leader" },
      texto: {
        es: "Tu patrón dominante ya genera confianza y resultados sostenibles. El reto ahora no es corregir, es escalar tu impacto a más personas y a más partes de la organización.",
        en: "Your dominant pattern already generates trust and sustainable results. The challenge now isn&rsquo;t to correct course — it&rsquo;s to scale your impact to more people and more parts of the organization.",
      },
    };
  }

  return { perfil, totales, dimMasDebil };
}

function renderResultado(app) {
  const L = lang();
  const { perfil, dimMasDebil } = calcularResultado();
  const t = L === "en" ? {
    kicker: "Your result",
    h3: "A practical recommendation",
    rec: `This week, choose a real situation where your pattern in <strong>${DIMENSIONES[dimMasDebil].en}</strong> will be tested, and decide in advance how you want to respond — before pressure decides for you.`,
    note: `This snapshot is a quick read, inspired by the distinction between creative and reactive behaviors in the <strong>Leadership Circle Profile (TLC)</strong> — the full report, with 360&deg; data from your real environment, is a validated instrument Mauro uses in his coaching processes.`,
    cta: "Book a diagnostic session (20 min, no cost)",
  } : {
    kicker: "Tu resultado",
    h3: "Una recomendación práctica",
    rec: `Esta semana, elige una situación real donde tu patrón en <strong>${DIMENSIONES[dimMasDebil].es}</strong> se ponga a prueba, y decide de antemano cómo quieres responder — antes de que la presión decida por ti.`,
    note: `Este termómetro es una fotografía rápida, inspirada en la distinción entre comportamientos creativos y reactivos del <strong>Leadership Circle Profile (TLC)</strong> — el informe completo, con datos de 360º de tu entorno real, es un instrumento validado que Mauro utiliza en sus procesos de coaching.`,
    cta: "Reserva una sesión de diagnóstico (20 min, sin coste)",
  };
  app.innerHTML = `
    <span class="kicker">${t.kicker}</span>
    <h2>${perfil.nombre[L]}</h2>
    <p class="lede">${perfil.texto[L]}</p>
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
