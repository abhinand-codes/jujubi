// ════════════════════════════════════════════════════════════════
// JUJUBI — script.js
// ════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
// EDIT: Set your email address and confirm the date/location.
// ──────────────────────────────────────────────────────────────
const YOUR_EMAIL    = "YOUR_EMAIL@example.com"; // ← reply-to address
const DATE_DISPLAY  = "September 14, 2026";     // ← shown in email body
const DATE_LOCATION = "Dharamshala";            // ← venue
// ──────────────────────────────────────────────────────────────

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

// 20 escalating emotional lines with emojis
const noLines = [
  "wait... 🥺",
  "nooo not that button!! 😭",
  "please please please 🙏",
  "my heart is literally breaking 💔",
  "I worked so hard on this for you 😢",
  "okay but... have you seen the Yes button? 👀",
  "I'll be devastated forever 😩",
  "think of all the fun we'd have!! 🌟",
  "the Yes button is so lonely right now 💛",
  "I made a whole calendar just for us 📅",
  "I promise it'll be magical ✨",
  "I'm literally crying rn 😭💧",
  "one tiny yes? pretty please? 🌸",
  "my soul is leaving my body 😰",
  "are you sure?? like really sure?? 🥹",
  "okay I'll just sit here and cry then 🫂",
  "...this is fine 🙂 (it is NOT fine) 💔",
  "the character is also crying now look 😢👆",
  "last chance... I believe in you!! 🫶",
  "PLEASE just hit Yes I am begging 🙏💛",
];

let noAttempts = 0;
let tx = 0, ty = 0;
let lastDodge = 0;
let lastMsgIdx = -1;

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

function dodgeNoButton(event, force = false) {
  if (reduceMotion) return;

  const now = performance.now();
  if (!force && now - lastDodge < 200) return;

  const btn = noBtn.getBoundingClientRect();
  const cx  = btn.left + btn.width  / 2;
  const cy  = btn.top  + btn.height / 2;
  const px  = event?.clientX ?? cx;
  const py  = event?.clientY ?? cy;
  const dist = Math.hypot(px - cx, py - cy);

  if (!force && dist > 140) return;

  lastDodge = now;
  noAttempts++;

  // Direction away from pointer
  const rawDx = cx - px || 1;
  const rawDy = cy - py || 1;
  const len   = Math.hypot(rawDx, rawDy) || 1;
  const nx    = rawDx / len;
  const ny    = rawDy / len;

  const maxX = 150;
  const maxY = 90;

  tx = Math.max(-maxX, Math.min(maxX, tx + nx * (55 + Math.random() * 35)));
  ty = Math.max(-maxY, Math.min(maxY, ty + ny * (28 + Math.random() * 18)));

  const scale   = Math.max(.4, 1 - noAttempts * .028);
  const opacity = Math.max(.22, 1 - noAttempts * .045);

  // Apply smooth transform via CSS transition
  noBtn.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  noBtn.style.opacity   = String(opacity);

  // Grow the Yes button
  yesBtn.style.transform = `scale(${Math.min(1.85, 1 + noAttempts * .07)})`;

  // Update speech bubble
  const idx = (noAttempts - 1) % noLines.length;
  if (idx !== lastMsgIdx) {
    setBubbleText(noLines[idx]);
    lastMsgIdx = idx;
  }

  // Cycle chibi emotions — escalating sadness/panic
  if (noAttempts % 4 === 0)      setEmotion("excited");  // ironic: excited about Yes!
  else if (noAttempts % 3 === 0) setEmotion("panic");
  else                           setEmotion("sad");

  // Label fades
  if (noAttempts > 8)  noBtn.textContent = "not today";
  if (noAttempts > 14) noBtn.style.fontSize = ".7rem";
}

// Attach listeners to the whole ask section so dodge starts before cursor reaches button
askSection.addEventListener("pointermove",  (e) => dodgeNoButton(e));
noBtn.addEventListener("pointerenter",      (e) => dodgeNoButton(e, true));
noBtn.addEventListener("pointerdown",       (e) => { e.preventDefault(); dodgeNoButton(e, true); });
noBtn.addEventListener("click",             (e) => { e.preventDefault(); dodgeNoButton(e, true); });

// Also trigger on mobile touch
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const t = e.touches[0];
  dodgeNoButton({ clientX: t.clientX, clientY: t.clientY }, true);
}, { passive: false });


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

  // Launch burst: hearts + flowers + rings
  burstParticles(100);
  launchRings();

  setTimeout(() => {
    overlay.style.transition = "opacity .7s ease";
    overlay.style.opacity    = "0";
    setTimeout(() => {
      overlay.hidden = true;
      overlay.style.cssText = "";
      revealDateSection();
    }, 720);
  }, 4000);
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
// 8. SEND BUTTON — mailto with date, location, note
// ════════════════════════════════════════════════════════════════
$("#send-button").addEventListener("click", () => {
  const note     = $("#date-note").value.trim();
  const location = ($("#location-name")?.textContent || DATE_LOCATION).trim();

  const subject = encodeURIComponent("I'm excited for our date! 💛");
  const body    = encodeURIComponent([
    `Date: ${DATE_DISPLAY}`,
    `Location: ${location}`,
    "",
    note ? `Her note: ${note}` : "(no note added — see you there! 💛)",
  ].join("\n"));

  window.location.href = `mailto:${YOUR_EMAIL}?subject=${subject}&body=${body}`;

  setTimeout(() => {
    const closing = $("#closing");
    closing.hidden = false;
    closing.style.display = "";
    closing.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, 850);
});
