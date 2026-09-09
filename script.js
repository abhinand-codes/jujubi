// EDIT: replace this with the email address that should receive her reply.
const YOUR_EMAIL = "abhinandthirteen@gmail.com";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector) => document.querySelector(selector);

// Reveal each section gently as it enters the page.
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
}), { threshold: 0.18 });
reveals.forEach((item) => observer.observe(item));

// Typewriter line only starts once it is in view.
const typeTarget = $("[data-typewriter]");
const typeObserver = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  const fullText = typeTarget.dataset.typewriter;
  if (reduceMotion) { typeTarget.textContent = fullText; return; }
  typeTarget.textContent = "";
  [...fullText].forEach((letter, index) => setTimeout(() => { typeTarget.textContent += letter; }, index * 42));
  typeObserver.disconnect();
}, { threshold: 0.65 });
typeObserver.observe(typeTarget);

function celebrate(amount = 36) {
  if (reduceMotion) return;
  const layer = $("#confetti-layer");
  const shapes = ["♥", "✦", "✧", "•"];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.color = ["#D98A94", "#B85C68", "#E8B86D"][Math.floor(Math.random() * 3)];
    piece.style.fontSize = `${10 + Math.random() * 15}px`;
    piece.style.setProperty("--drift", `${-100 + Math.random() * 200}px`);
    piece.style.animationDelay = `${Math.random() * .5}s`;
    layer.append(piece);
    setTimeout(() => piece.remove(), 3500);
  }
}

// The No button keeps a respectful distance from the cursor, while Yes gets harder to miss.
const noButton = $("#no-button"), choiceArea = $("#choice-area"), message = $("#no-message"), face = $(".face"), yesButton = $("#yes-button");
const noMessages = [
  "wait... 🥺", "hey, that tickles!", "please don't press that", "I made you a whole calendar!",
  "the Yes button is looking extra cute...", "my little heart is panicking", "you almost had me!", "pretty please choose Yes?",
  "I promise it'll be lovely", "No is feeling a bit shy today", "one tiny Yes? 💛", "I believe in us!"
];
let noAttempts = 0, lastDodge = 0;
function dodgeNoButton(event, force = false) {
  if (reduceMotion) return;
  const now = performance.now();
  if (!force && now - lastDodge < 230) return;
  const area = choiceArea.getBoundingClientRect();
  const button = noButton.getBoundingClientRect();
  const pointerX = event.clientX ?? button.left + button.width / 2;
  const pointerY = event.clientY ?? button.top + button.height / 2;
  const distance = Math.hypot(pointerX - (button.left + button.width / 2), pointerY - (button.top + button.height / 2));
  if (!force && distance > 105) return;
  lastDodge = now;
  noAttempts += 1;
  const xDirection = pointerX < button.left + button.width / 2 ? 1 : -1;
  const yDirection = pointerY < button.top + button.height / 2 ? 1 : -1;
  const maxX = Math.max(44, (area.width - button.width) / 2 - 7);
  const maxY = Math.max(16, (area.height - button.height) / 2 - 7);
  const jitterX = 10 + Math.random() * 20;
  const jitterY = 7 + Math.random() * 14;
  noButton.style.transform = `translate(${xDirection * Math.min(maxX, maxX - jitterX)}px, ${yDirection * Math.min(maxY, jitterY)}px) scale(${Math.max(.55, 1 - noAttempts * .022)})`;
  noButton.style.opacity = `${Math.max(.35, 1 - noAttempts * .035)}`;
  yesButton.style.setProperty("--yes-scale", Math.min(2.05, 1 + noAttempts * .075));
  message.textContent = noMessages[(noAttempts - 1) % noMessages.length];
  face.classList.remove("dramatic", "melting", "excited");
  void face.offsetWidth;
  face.classList.add(noAttempts % 3 === 0 ? "melting" : noAttempts % 2 === 0 ? "excited" : "dramatic");
  noButton.textContent = noAttempts > 7 ? "not today" : "No";
}
choiceArea.addEventListener("pointermove", (event) => dodgeNoButton(event));
noButton.addEventListener("pointerenter", (event) => dodgeNoButton(event, true));
noButton.addEventListener("pointerdown", (event) => { event.preventDefault(); dodgeNoButton(event, true); });
noButton.addEventListener("click", (event) => { event.preventDefault(); dodgeNoButton(event, true); });

yesButton.addEventListener("click", () => { celebrate(48); setTimeout(() => $("#calendar-section").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }), 300); });

// Calendar: defaults to the current month and only permits today onward.
const grid = $("#calendar-grid"), monthLabel = $("#month-label"), selection = $("#date-selection"), confirm = $("#confirm-button");
const today = new Date(); today.setHours(0, 0, 0, 0);
let viewDate = new Date(today.getFullYear(), today.getMonth(), 1), selectedDate = null, confirmedDate = null;
const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
function renderCalendar() {
  grid.classList.add("changing");
  setTimeout(() => grid.classList.remove("changing"), 250);
  monthLabel.textContent = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  grid.innerHTML = "";
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  for (let i = 0; i < firstDay; i += 1) grid.append(document.createElement("span"));
  for (let day = 1; day <= days; day += 1) {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const button = document.createElement("button"); button.type = "button"; button.className = "day"; button.textContent = day;
    button.setAttribute("aria-label", dateFormat.format(date));
    if (date < today) button.disabled = true;
    if (selectedDate && date.getTime() === selectedDate.getTime()) button.classList.add("selected");
    if (confirmedDate && date.getTime() === confirmedDate.getTime()) button.classList.add("confirmed");
    button.addEventListener("click", () => { selectedDate = date; selection.textContent = `A lovely choice: ${dateFormat.format(date)} ♡`; confirm.disabled = false; renderCalendar(); });
    grid.append(button);
  }
}
$("#prev-month").addEventListener("click", () => { const prev = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1); if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) { viewDate = prev; renderCalendar(); } });
$("#next-month").addEventListener("click", () => { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1); renderCalendar(); });
confirm.addEventListener("click", () => {
  if (!selectedDate) return;
  confirmedDate = selectedDate; renderCalendar(); celebrate(52);
  const chosen = dateFormat.format(selectedDate), note = $("#date-note").value.trim();
  $("#confirmed-date").textContent = chosen;
  $("#confirmation").hidden = false;
  setTimeout(() => $("#confirmation").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }), 450);
  const body = `JJB said yes! 💛\n\nConfirmed date: ${chosen}${note ? `\n\nHer note: ${note}` : ""}`;
  // This opens the sender's email app. Edit YOUR_EMAIL above before sharing.
  setTimeout(() => { window.location.href = `mailto:${YOUR_EMAIL}?subject=${encodeURIComponent("JJB said yes! 💛")}&body=${encodeURIComponent(body)}`; }, 800);
});
renderCalendar();

