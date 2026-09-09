// ════════════════════════════════════════════════════════════════
// JUJUBI — script.js
// All logic: particles, hero letter split, scroll reveals,
// typewriter, No-button dodge, Yes celebration, mini calendar,
// and mailto sender.
// ════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
// EDIT: Set your email address and confirm location/date copy.
// ──────────────────────────────────────────────────────────────
const YOUR_EMAIL    = "YOUR_EMAIL@example.com"; // ← reply-to address
const DATE_DISPLAY  = "September 14, 2026";     // ← shown in email body
const DATE_LOCATION = "Dharamshala";            // ← venue (also shown in the DOM via #location-name)
// ──────────────────────────────────────────────────────────────

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);


// ════════════════════════════════════════════════════════════════
// 1. BACKGROUND PARTICLE SYSTEM
//    Continuously drifts hearts, sparkles and dots upward.
// ════════════════════════════════════════════════════════════════
(function spawnBgParticles() {
  if (reduceMotion) return;
  const layer  = $("#bg-particles");
  const shapes = ["♥", "♡", "✦", "✧", "·", "✦"];
  const colors = [
    "rgba(217,138,148,.32)",
    "rgba(184,92,104,.24)",
    "rgba(232,184,109,.32)",
    "rgba(245,216,152,.28)",
  ];

  function spawnOne() {
    const el   = document.createElement("span");
    el.className = "bg-p";
    const size = 8 + Math.random() * 14;
    const dur  = 9 + Math.random() * 13;
    el.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    el.style.cssText = [
      `left: ${Math.random() * 100}%`,
      `bottom: -2rem`,
      `color: ${colors[Math.floor(Math.random() * colors.length)]}`,
      `font-size: ${size}px`,
      `animation: bgDrift ${dur}s linear forwards`,
    ].join(";");
    layer.append(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }

  // Staggered initial batch so the page isn't empty at load
  for (let i = 0; i < 10; i++) setTimeout(spawnOne, i * 350);
  // Continuous drip
  setInterval(spawnOne, 750);
})();


// ════════════════════════════════════════════════════════════════
// 2. HERO TITLE — Letter-by-letter float-in
// ════════════════════════════════════════════════════════════════
(function splitHeroTitle() {
  const title    = $("#hero-title");
  const emoji    = title.querySelector(".emoji-gold");
  // Grab text before the emoji span
  const rawText  = "Hey JuJuBi ";

  title.innerHTML = "";          // clear current content

  [...rawText].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.style.animationDelay = `${0.08 + i * 0.06}s`;
    // Preserve spaces as non-breaking so layout is correct
    span.innerHTML = ch === " " ? "&nbsp;" : ch;
    title.append(span);
  });

  // Re-attach emoji with its own staggered delay
  if (emoji) {
    emoji.classList.add("letter");
    emoji.style.animationDelay = `${0.08 + rawText.length * 0.06}s`;
    title.append(emoji);
  }
})();


// ════════════════════════════════════════════════════════════════
// 3. SCROLL REVEAL
//    Sections with .reveal become .visible when they enter view.
// ════════════════════════════════════════════════════════════════
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.14 });
$$(".reveal").forEach((el) => revealObs.observe(el));


// ════════════════════════════════════════════════════════════════
// 4. TYPEWRITER
//    Starts only once the build-up heading enters view.
// ════════════════════════════════════════════════════════════════
const typeTarget = $("[data-typewriter]");
const typeObs = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  const full = typeTarget.dataset.typewriter;
  if (reduceMotion) { typeTarget.textContent = full; return; }
  typeTarget.textContent = "";
  [...full].forEach((ch, i) =>
    setTimeout(() => (typeTarget.textContent += ch), i * 42)
  );
  typeObs.disconnect();
}, { threshold: 0.6 });
typeObs.observe(typeTarget);


// ════════════════════════════════════════════════════════════════
// 5. NO-BUTTON DODGE
//    Smoothly moves away from the cursor using CSS transitions.
// ════════════════════════════════════════════════════════════════
const noBtn      = $("#no-button");
const yesBtn     = $("#yes-button");
const choiceArea = $("#choice-area");
const noMsg      = $("#no-message");
const face       = $("#face");

// Expanding list of pleading lines (cycles as attempts increase)
const noLines = [
  "wait... 🥺",
  "hey, that tickles!",
  "please don't press that",
  "I made this whole thing for you!",
  "the Yes button is looking lovely...",
  "my little heart is panicking 😢",
  "you almost had me!",
  "pretty please choose Yes?",
  "I promise it'll be wonderful",
  "one tiny Yes? 💛",
  "I believe in us!",
  "oops, wrong button 🙈",
  "come on... just Yes 🥹",
];

let noAttempts = 0;
let tx = 0, ty = 0;          // current translate offsets for the No button
let lastDodge = 0;

function dodgeNoButton(event, force = false) {
  if (reduceMotion) return;

  const now = performance.now();
  if (!force && now - lastDodge < 220) return;   // throttle

  const area = choiceArea.getBoundingClientRect();
  const btn  = noBtn.getBoundingClientRect();
  const cx   = btn.left + btn.width  / 2;
  const cy   = btn.top  + btn.height / 2;
  const px   = event?.clientX ?? cx;
  const py   = event?.clientY ?? cy;
  const dist = Math.hypot(px - cx, py - cy);

  if (!force && dist > 120) return;

  lastDodge = now;
  noAttempts++;

  // Direction vector away from pointer
  const rawDx = cx - px || 1;
  const rawDy = cy - py || 1;
  const len   = Math.hypot(rawDx, rawDy) || 1;
  const nx    = rawDx / len;
  const ny    = rawDy / len;

  // How far can the button travel within the choice-area?
  const maxX = Math.max(40, (area.width  - btn.width)  / 2 - 8);
  const maxY = Math.max(14, (area.height - btn.height) / 2 - 8);

  tx = Math.max(-maxX, Math.min(maxX, tx + nx * (48 + Math.random() * 28)));
  ty = Math.max(-maxY, Math.min(maxY, ty + ny * (22 + Math.random() * 16)));

  const scale   = Math.max(.48, 1 - noAttempts * .026);
  const opacity = Math.max(.28, 1 - noAttempts * .042);

  // CSS transition on .no-button makes the movement silky smooth
  noBtn.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  noBtn.style.opacity   = String(opacity);

  // Grow the Yes button as the No button gets smaller
  yesBtn.style.transform = `scale(${Math.min(1.9, 1 + noAttempts * 0.075)})`;

  // Speech bubble message
  noMsg.textContent = noLines[(noAttempts - 1) % noLines.length];

  // Face expression — cycle through states
  face.classList.remove("dramatic", "melting", "excited");
  void face.offsetWidth;   // force reflow so animations restart
  if      (noAttempts % 3 === 0) face.classList.add("melting");
  else if (noAttempts % 2 === 0) face.classList.add("excited");
  else                           face.classList.add("dramatic");

  // Label changes after repeated attempts
  if (noAttempts > 8)  noBtn.textContent = "not today";
  if (noAttempts > 14) noBtn.style.fontSize = ".7rem";
}

choiceArea.addEventListener("pointermove",  (e) => dodgeNoButton(e));
noBtn.addEventListener("pointerenter",      (e) => dodgeNoButton(e, true));
noBtn.addEventListener("pointerdown",       (e) => { e.preventDefault(); dodgeNoButton(e, true); });
noBtn.addEventListener("click",             (e) => { e.preventDefault(); dodgeNoButton(e, true); });


// ════════════════════════════════════════════════════════════════
// 6. YES BUTTON — Celebration overlay then date reveal
// ════════════════════════════════════════════════════════════════
yesBtn.addEventListener("click", () => {
  // Prevent double-trigger
  yesBtn.disabled = true;
  showCelebration();
});

function showCelebration() {
  const overlay = $("#celebrate-overlay");
  overlay.hidden = false;
  burstHearts(90);   // fill screen with floating hearts

  // After ~3.4 s, fade overlay out and slide to date section
  setTimeout(() => {
    overlay.style.transition = "opacity .7s ease";
    overlay.style.opacity    = "0";
    setTimeout(() => {
      overlay.hidden = true;
      overlay.style.cssText  = "";     // clean up inline styles
      revealDateSection();
    }, 720);
  }, 3400);
}

function burstHearts(count) {
  const container = $("#celebrate-hearts");
  const shapes    = ["♥", "♡", "✦", "✧", "💛", "♥", "♥"];
  const colors    = ["#D98A94","#B85C68","#E8B86D","#F5D898","#F4BDAC","#D98A94"];

  for (let i = 0; i < count; i++) {
    const el   = document.createElement("span");
    el.className = "c-heart";
    const spin = -180 + Math.random() * 360;
    el.style.setProperty("--spin", `${spin}deg`);
    el.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    el.style.cssText = [
      `position:absolute`,
      `left:${Math.random() * 100}%`,
      `bottom:${-8 + Math.random() * 25}%`,
      `color:${colors[Math.floor(Math.random() * colors.length)]}`,
      `font-size:${14 + Math.random() * 30}px`,
      `pointer-events:none`,
      `animation:heartRise ${1.6 + Math.random() * 2.2}s ease-out ${Math.random() * .9}s forwards`,
      `--spin:${spin}deg`,
    ].join(";");
    container.append(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
}

function revealDateSection() {
  const section = $("#date-reveal");
  section.hidden = false;

  // Allow one frame for the browser to render the (previously hidden) section
  requestAnimationFrame(() => {
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });

    // Trigger staggered content reveals after scroll starts
    setTimeout(() => {
      section.classList.add("revealed");
      buildMiniCalendar();
    }, 550);
  });
}


// ════════════════════════════════════════════════════════════════
// 7. MINI SEPTEMBER 2026 CALENDAR
//    Highlights day 14 with a glow badge + animated heart stamp.
// ════════════════════════════════════════════════════════════════
function buildMiniCalendar() {
  const grid = $("#mini-cal-grid");
  if (!grid || grid.children.length > 0) return;  // already built

  const year        = 2026;
  const month       = 8;   // 0-indexed: 8 = September
  const specialDay  = 14;

  // Day of week for September 1, 2026 (Tuesday = 2)
  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 30

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Blank leading cells
  for (let i = 0; i < firstDow; i++) {
    const blank = document.createElement("span");
    blank.className = "mini-day";
    grid.append(blank);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const cell     = document.createElement("span");
    cell.className = "mini-day";
    cell.textContent = d;

    const cellDate = new Date(year, month, d);
    if (cellDate < today && d !== specialDay) cell.classList.add("past");
    if (d === specialDay) cell.classList.add("special");

    grid.append(cell);
  }
}


// ════════════════════════════════════════════════════════════════
// 8. SEND BUTTON — build mailto: with date, location, note
// ════════════════════════════════════════════════════════════════
$("#send-button").addEventListener("click", () => {
  const note     = $("#date-note").value.trim();
  // Read location from DOM so any in-HTML edit is picked up automatically
  const location = ($("#location-name")?.textContent || DATE_LOCATION).trim();

  const subject  = encodeURIComponent("I'm excited for our date! 💛");
  const bodyParts = [
    `Date: ${DATE_DISPLAY}`,
    `Location: ${location}`,
    "",
    note ? `Her note: ${note}` : "(no note added — see you there! 💛)",
  ];
  const body = encodeURIComponent(bodyParts.join("\n"));

  window.location.href = `mailto:${YOUR_EMAIL}?subject=${subject}&body=${body}`;

  // Show the closing section after a brief delay
  setTimeout(() => {
    const closing = $("#closing");
    closing.hidden = false;
    closing.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, 850);
});
