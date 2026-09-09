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

// The No button remains inside its own choice area and gets progressively cuter.
const noButton = $("#no-button"), choiceArea = $("#choice-area"), message = $("#no-message"), face = $(".face");
const noMessages = ["wait... 🥺", "please don't press that", "I made you a whole calendar!", "okay okay you win, but pretty please say yes?"];
let noAttempts = 0;
function dodgeNoButton(event) {
  if (noButton.disabled || reduceMotion) return;
  const area = choiceArea.getBoundingClientRect();
  const button = noButton.getBoundingClientRect();
  const pointerX = event.clientX || (button.left + button.width / 2);
  const pointerY = event.clientY || (button.top + button.height / 2);
  const directionX = pointerX < button.left + button.width / 2 ? 1 : -1;
  const directionY = pointerY < button.top + button.height / 2 ? 1 : -1;
  const maxX = (area.width - button.width) / 2 - 4;
  const maxY = (area.height - button.height) / 2 - 4;
  noButton.style.transform = `translate(${directionX * Math.max(38, maxX)}px, ${directionY * Math.min(18, maxY)}px)`;
}
function noAttempt(event) {
  event.preventDefault();
  if (noButton.disabled) return;
  dodgeNoButton(event);
  noAttempts += 1;
  message.textContent = noMessages[Math.min(noAttempts, 4) - 1];
  face.classList.remove("dramatic", "melting");
  void face.offsetWidth;
  face.classList.add(noAttempts > 2 ? "melting" : "dramatic");
  if (noAttempts >= 4) { noButton.disabled = true; noButton.textContent = "you can't say no to this face"; noButton.style.transform = "none"; }
}
noButton.addEventListener("pointerenter", dodgeNoButton);
noButton.addEventListener("pointerdown", dodgeNoButton);
noButton.addEventListener("click", noAttempt);

$("#yes-button").addEventListener("click", () => { celebrate(48); setTimeout(() => $("#calendar-section").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }), 300); });

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

