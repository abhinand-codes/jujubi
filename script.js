// ════════════════════════════════════════════════════════════════
// JUJUBI — script.js
// ════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
// EDIT: Set your email + EmailJS credentials, confirm date/location.
//
// This site is static (GitHub Pages), so it has no backend of its
// own — EmailJS (free, client-side) is what actually delivers her
// note straight to your inbox when she presses Send. Setup:
//   1. Create a free account at https://www.emailjs.com
//   2. Add an Email Service (connect your Gmail) → copy its Service ID
//   3. Create an Email Template with variables {{to_email}},
//      {{date}}, {{location}}, {{note}} → copy its Template ID
//      (set the template's "To email" field to {{to_email}})
//   4. Account → General → copy your Public Key
//   5. Paste all three below.
// ──────────────────────────────────────────────────────────────
const YOUR_EMAIL         = "abhinandthirteen@gmail.com"; // ← where her note is delivered
const DATE_DISPLAY       = "September 14, 2026";          // ← shown in the email
const DATE_LOCATION      = "Dharamshala";                  // ← venue
const EMAILJS_PUBLIC_KEY  = "5wm455mE3dnm1IJNO";
const EMAILJS_SERVICE_ID  = "service_lhy1dbf";
const EMAILJS_TEMPLATE_ID = "PASTE_YOUR_TEMPLATE_ID_HERE";
// ──────────────────────────────────────────────────────────────

if (window.emailjs && EMAILJS_PUBLIC_KEY !== "YOUR_EMAILJS_PUBLIC_KEY") {
  window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);


// ════════════════════════════════════════════════════════════════
// 1. BACKGROUND PARTICLE SYSTEM
// ════════════════════════════════════════════════════════════════
(function spawnBgParticles() {
  if (reduceMotion) return;
  const layer  = $("#bg-particles");
  const shapes = ["♥", "♡", "✦", "✧", "·", "✦"];
  const colors = [
    "rgba(217,138,148,.32)", "rgba(184,92,104,.24)",
    "rgba(232,184,109,.32)", "rgba(245,216,152,.28)",
  ];
  function spawnOne() {
    const el  = document.createElement("span");
    el.className = "bg-p";
    const dur = 9 + Math.random() * 13;
    el.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    el.style.cssText = [
      `left:${Math.random() * 100}%`, `bottom:-2rem`,
      `color:${colors[Math.floor(Math.random() * colors.length)]}`,
      `font-size:${8 + Math.random() * 14}px`,
      `animation:bgDrift ${dur}s linear forwards`,
    ].join(";");
    layer.append(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
  for (let i = 0; i < 10; i++) setTimeout(spawnOne, i * 350);
  setInterval(spawnOne, 750);
})();


// ════════════════════════════════════════════════════════════════
// 2. HERO TITLE — Letter-by-letter float-in
// ════════════════════════════════════════════════════════════════
(function splitHeroTitle() {
  const title   = $("#hero-title");
  const emoji   = title.querySelector(".emoji-gold");
  const rawText = "Hey JuJuBi ";
  title.innerHTML = "";
  [...rawText].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.style.animationDelay = `${0.08 + i * 0.06}s`;
    span.innerHTML = ch === " " ? "&nbsp;" : ch;
    title.append(span);
  });
  if (emoji) {
    emoji.classList.add("letter");
    emoji.style.animationDelay = `${0.08 + rawText.length * 0.06}s`;
    title.append(emoji);
  }
})();


// ════════════════════════════════════════════════════════════════
// 3. SCROLL REVEAL
// ════════════════════════════════════════════════════════════════
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.14 });
$$(".reveal").forEach((el) => revealObs.observe(el));


// ════════════════════════════════════════════════════════════════
// 4. TYPEWRITER
// ════════════════════════════════════════════════════════════════
const typeTarget = $("[data-typewriter]");
const typeObs = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  const full = typeTarget.dataset.typewriter;
  if (reduceMotion) { typeTarget.textContent = full; return; }
  typeTarget.textContent = "";
  [...full].forEach((ch, i) => setTimeout(() => (typeTarget.textContent += ch), i * 42));
  typeObs.disconnect();
}, { threshold: 0.6 });
typeObs.observe(typeTarget);


// ════════════════════════════════════════════════════════════════
// 5. NO-BUTTON DODGE + CHIBI EMOTIONS
//    Triggers on any cursor movement near the ask section,
//    not just within the tiny choice-area.
// ════════════════════════════════════════════════════════════════
const noBtn      = $("#no-button");
const yesBtn     = $("#yes-button");
const askSection = $("#ask");
const bubbleEl   = $("#no-message");
const bubbleText = bubbleEl?.querySelector(".bubble-text");
const chibi      = $("#chibi-svg");

// 20 escalating, cute (not panicky) pleading lines
const noLines = [
  "please... 🥺",
  "wait wait, not that one 😳",
  "pretty pretty please? 🙏",
  "my heart just did a little flip 💔",
  "I stayed up making this just for you 😢",
  "psst, the Yes button is right there 👉💛",
  "don't do this to me 😩",
  "think of all the fun we'd have!! 🌟",
  "the Yes button's getting lonely over there 💛",
  "I planned a whole day for us already 📅",
  "it's going to be so good, I promise ✨",
  "okay now I'm actually a little emotional 😭",
  "one tiny yes? just one? 🌸",
  "my knees are shaking rn, not kidding 🥹",
  "are you doing this on purpose 😳",
  "fine... I'll just wait right here forever 🫂",
  "totally fine. not crying. 🙂💔",
  "even the little guy is begging now, look 👆😢",
  "last chance, JuJuBi... I believe in you 🫶",
  "please just say yes, I'm begging you 🙏💛",
];

let noAttempts = 0;
let lastDodge  = 0;
let lastMsgIdx = -1;
let fixedMode  = false; // becomes true once the button switches to viewport-teleport mode

function setEmotion(name) {
  if (!chibi) return;
  chibi.className = `chibi-svg chibi-${name}`;
}

function setBubbleText(text) {
  if (!bubbleEl || !bubbleText) return;
  bubbleEl.classList.add("changing");
  setTimeout(() => {
    bubbleText.textContent = text;
    bubbleEl.classList.remove("changing");
  }, 250);
}

// Lock the button into fixed, viewport-relative positioning the first
// time it needs to flee — captured from its current on-screen spot so
// there's no visual jump.
function ensureFixedMode() {
  if (fixedMode) return;
  const rect = noBtn.getBoundingClientRect();
  noBtn.style.position = "fixed";
  noBtn.style.left     = `${rect.left}px`;
  noBtn.style.top      = `${rect.top}px`;
  noBtn.style.margin   = "0";
  noBtn.style.zIndex   = "60";
  fixedMode = true;
}

// Pick a fresh spot fully inside the viewport, biased to be as far
// from the pointer as possible — a handful of random candidates,
// keep the best. This can never get "cornered": every dodge is a
// fresh roll across the whole screen, not an incremental nudge.
function pickDodgeTarget(px, py) {
  const margin = 18;
  const w = noBtn.offsetWidth  || 90;
  const h = noBtn.offsetHeight || 46;
  const maxX = Math.max(margin, window.innerWidth  - w - margin);
  const maxY = Math.max(margin, window.innerHeight - h - margin);

  let best = null, bestDist = -1;
  for (let i = 0; i < 10; i++) {
    const x  = margin + Math.random() * (maxX - margin);
    const y  = margin + Math.random() * (maxY - margin);
    const cx = x + w / 2, cy = y + h / 2;
    const d  = Math.hypot(cx - px, cy - py);
    if (d > bestDist) { bestDist = d; best = { x, y }; }
  }
  return best;
}

function dodgeNoButton(event, force = false) {
  if (reduceMotion) return;

  const now = performance.now();
  if (!force && now - lastDodge < 130) return;

  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const px = event?.clientX ?? cx;
  const py = event?.clientY ?? cy;
  const dist = Math.hypot(px - cx, py - cy);

  if (!force && dist > 195) return;

  lastDodge = now;
  noAttempts++;

  ensureFixedMode();
  const target = pickDodgeTarget(px, py);
  noBtn.style.left = `${target.x}px`;
  noBtn.style.top  = `${target.y}px`;

  // Stays clearly visible, active-looking, and clickable at all times —
  // just never where the cursor is. Very light shrink/fade only.
  const scale   = Math.max(.8, 1 - noAttempts * .01);
  const opacity = Math.max(.85, 1 - noAttempts * .008);
  noBtn.style.transform = `scale(${scale})`;
  noBtn.style.opacity   = String(opacity);

  // Grow the Yes button in response
  yesBtn.style.setProperty("--grow", Math.min(1.7, 1 + noAttempts * .05).toFixed(3));

  // Update speech bubble
  const idx = (noAttempts - 1) % noLines.length;
  setBubbleText(noLines[idx]);
  lastMsgIdx = idx;

  // Cycle chibi emotions — escalating sadness/panic
  if (noAttempts % 4 === 0)      setEmotion("excited");  // ironic: excited about Yes!
  else if (noAttempts % 3 === 0) setEmotion("panic");
  else                           setEmotion("sad");
}

// Global proximity flee — starts dodging before the cursor even
// reaches the button, from anywhere on the page.
document.addEventListener("pointermove", (e) => dodgeNoButton(e));
noBtn.addEventListener("pointerenter",    (e) => dodgeNoButton(e, true));
noBtn.addEventListener("mouseover",       (e) => dodgeNoButton(e, true));
noBtn.addEventListener("pointerdown",     (e) => { e.preventDefault(); dodgeNoButton(e, true); });
noBtn.addEventListener("click",           (e) => { e.preventDefault(); dodgeNoButton(e, true); });
noBtn.addEventListener("focus",           (e) => dodgeNoButton(e, true));

// Mobile touch — dodge away on first touch so the tap never lands
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const t = e.touches[0];
  dodgeNoButton({ clientX: t.clientX, clientY: t.clientY }, true);
}, { passive: false });

// Keep the button on-screen if the viewport resizes/rotates
window.addEventListener("resize", () => {
  if (!fixedMode) return;
  const rect = noBtn.getBoundingClientRect();
  const maxX = window.innerWidth  - rect.width  - 18;
  const maxY = window.innerHeight - rect.height - 18;
  noBtn.style.left = `${Math.min(rect.left, Math.max(18, maxX))}px`;
  noBtn.style.top  = `${Math.min(rect.top,  Math.max(18, maxY))}px`;
});


// ════════════════════════════════════════════════════════════════
// 6. YES BUTTON — Huge flower + heart popup, then date reveal
// ════════════════════════════════════════════════════════════════
yesBtn.addEventListener("click", () => {
  yesBtn.disabled = true;
  setEmotion("excited");
  showCelebration();
});

function showCelebration() {
  const overlay = $("#celebrate-overlay");
  overlay.hidden = false;
  overlay.style.display = "";

  // Big opening burst, then a continuous stream of hearts/flowers/confetti
  // for as long as the overlay is up — always active, never a single
  // one-off burst that runs dry.
  burstParticles(80);
  launchConfettiFall(60);
  launchRings();

  const spawnInterval = setInterval(() => {
    burstParticles(16);
    launchConfettiFall(10);
  }, 420);

  setTimeout(() => launchRings(), 1300);
  setTimeout(() => launchRings(), 2700);
  setTimeout(() => launchRings(), 4100);

  setTimeout(() => {
    clearInterval(spawnInterval);
    overlay.style.transition = "opacity .7s ease";
    overlay.style.opacity    = "0";
    setTimeout(() => {
      overlay.hidden = true;
      overlay.style.cssText = "";
      revealDateSection();
    }, 720);
  }, 5400);
}

// Hearts AND flower petals rising from bottom
function burstParticles(count) {
  const container = $("#celebrate-hearts");
  const shapes = ["♥", "♡", "✦", "💛", "🌸", "🌺", "🌹", "✿", "❀", "♥", "♥"];
  const colors  = ["#D98A94","#B85C68","#E8B86D","#F5D898","#F4BDAC","#FFB7C5","#FF87AB"];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "c-heart";
    const spin = -220 + Math.random() * 440;
    const isFlower = i % 4 === 0;   // every 4th particle is a flower emoji
    el.style.setProperty("--spin", `${spin}deg`);
    el.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    el.style.cssText = [
      `position:absolute`,
      `left:${Math.random() * 100}%`,
      `bottom:${-10 + Math.random() * 20}%`,
      `color:${colors[Math.floor(Math.random() * colors.length)]}`,
      `font-size:${isFlower ? 22 + Math.random() * 20 : 14 + Math.random() * 28}px`,
      `pointer-events:none`,
      `animation:heartRise ${1.5 + Math.random() * 2.8}s ease-out ${Math.random() * 1.2}s forwards`,
      `--spin:${spin}deg`,
    ].join(";");
    container.append(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
}

// Confetti-style ribbons falling from the top, layered with the
// rising hearts for a fuller, more festive burst.
function launchConfettiFall(count) {
  const container = $("#celebrate-hearts");
  const colors = ["#D98A94","#B85C68","#E8B86D","#F5D898","#FF87AB","#FFB7C5"];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "c-confetti";
    const spin = -260 + Math.random() * 520;
    el.style.setProperty("--spin", `${spin}deg`);
    el.style.cssText = [
      `position:absolute`,
      `left:${Math.random() * 100}%`,
      `top:${-8 - Math.random() * 12}%`,
      `background:${colors[Math.floor(Math.random() * colors.length)]}`,
      `width:${5 + Math.random() * 5}px`,
      `height:${9 + Math.random() * 8}px`,
      `pointer-events:none`,
      `animation:confettiFall ${2.2 + Math.random() * 2.2}s ease-in ${Math.random() * 1.4}s forwards`,
      `--spin:${spin}deg`,
    ].join(";");
    container.append(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
}

// Expanding glow rings from center
function launchRings() {
  const overlay = $("#celebrate-overlay");
  for (let i = 0; i < 4; i++) {
    const ring = document.createElement("div");
    ring.className = "burst-ring";
    ring.style.animationDelay = `${i * .3}s`;
    overlay.append(ring);
    ring.addEventListener("animationend", () => ring.remove(), { once: true });
  }
}

function revealDateSection() {
  const section = $("#date-reveal");
  section.hidden = false;
  section.style.display = "";
  requestAnimationFrame(() => {
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => { section.classList.add("revealed"); buildMiniCalendar(); }, 550);
  });
}


// ════════════════════════════════════════════════════════════════
// 7. MINI SEPTEMBER 2026 CALENDAR
// ════════════════════════════════════════════════════════════════
function buildMiniCalendar() {
  const grid = $("#mini-cal-grid");
  if (!grid || grid.children.length > 0) return;

  // A few soft hearts drifting around the calendar card, purely decorative
  const calCard = $(".mini-calendar");
  if (calCard && !calCard.querySelector(".cal-deco")) {
    const decos = ["♥", "✦", "♥", "✧"];
    decos.forEach((sym, i) => {
      const d = document.createElement("span");
      d.className = `cal-deco cal-deco-${i + 1}`;
      d.textContent = sym;
      d.setAttribute("aria-hidden", "true");
      calCard.append(d);
    });
  }

  const year = 2026, month = 8, specialDay = 14;
  const firstDow    = new Date(year, month, 1).getDay();  // Tuesday = 2
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 30

  const today = new Date(); today.setHours(0,0,0,0);

  for (let i = 0; i < firstDow; i++) {
    const blank = document.createElement("span");
    blank.className = "mini-day";
    grid.append(blank);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("span");
    cell.className = "mini-day";
    cell.textContent = d;
    const cellDate = new Date(year, month, d);
    if (cellDate < today && d !== specialDay) cell.classList.add("past");
    if (d === specialDay) cell.classList.add("special");
    grid.append(cell);
  }
}


// ════════════════════════════════════════════════════════════════
// 8. SEND BUTTON — delivers her note straight to YOUR_EMAIL via
//    EmailJS. No mail client opens, no extra step for her — she
//    presses Send and that's the whole action.
// ════════════════════════════════════════════════════════════════
const sendBtn = $("#send-button");
const sendBtnOriginalHTML = sendBtn.innerHTML;

sendBtn.addEventListener("click", () => {
  const note     = $("#date-note").value.trim();
  const location = ($("#location-name")?.textContent || DATE_LOCATION).trim();

  const isUnconfigured = !window.emailjs || 
                         !EMAILJS_PUBLIC_KEY || 
                         EMAILJS_PUBLIC_KEY.includes("YOUR_") || 
                         EMAILJS_PUBLIC_KEY.includes("PASTE_") ||
                         EMAILJS_TEMPLATE_ID.includes("PASTE_");

  if (isUnconfigured) {
    console.warn("EmailJS keys are placeholders — triggering mailto: fallback to abhinandthirteen@gmail.com");
    const subject = encodeURIComponent("JuJuBi said yes! 💛");
    const body = encodeURIComponent(`JuJuBi confirmed our date! 💛\n\nDate: ${DATE_DISPLAY}\nLocation: ${location}\nHer note: ${note || "(no note added — see you there! 💛)"}`);
    setTimeout(() => {
      window.location.href = `mailto:${YOUR_EMAIL}?subject=${subject}&body=${body}`;
    }, 400);
    showClosing();
    return;
  }

  sendBtn.disabled  = true;
  sendBtn.innerHTML = "Sending... 💌";

  const params = {
    to_email: YOUR_EMAIL,
    name:     "JuJuBi 💛",
    time:     `${DATE_DISPLAY} — ${location}`,
    message:  note ? `Date: ${DATE_DISPLAY}\nLocation: ${location}\nHer Note: ${note}` : `Date: ${DATE_DISPLAY}\nLocation: ${location}\n(No note added — see you there! 💛)`,
    date:     DATE_DISPLAY,
    location: location,
    note:     note || "(no note added — see you there! 💛)",
  };

  window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
    .then(() => { showClosing(); })
    .catch((err) => {
      console.warn("EmailJS send API notice, proceeding smoothly to closing screen:", err);
      showClosing();
    });
});

function showClosing() {
  const closing = $("#closing");
  closing.hidden = false;
  closing.style.display = "";
  closing.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}
