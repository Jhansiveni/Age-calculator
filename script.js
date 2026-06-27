// ============================================================
//  Advanced Age Calculator — script.js
//  Features: 1–40 as specified
// ============================================================

/* ── DOM References ─────────────────────────────────────── */
const dobInput        = document.getElementById('dob');
const calculateBtn    = document.getElementById('calculateBtn');
const resetBtn        = document.getElementById('resetBtn');
const errorEl         = document.getElementById('error');
const birthdayBox     = document.getElementById('birthdayBox');
const resultSection   = document.getElementById('resultSection');
const themeBtn        = document.getElementById('themeBtn');

// Age display
const yearsEl   = document.getElementById('years');
const monthsEl  = document.getElementById('months');
const daysEl    = document.getElementById('days');

// Live timer
const hoursEl   = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

// Stats
const totalMonthsEl  = document.getElementById('totalMonths');
const totalWeeksEl   = document.getElementById('totalWeeks');
const totalDaysEl    = document.getElementById('totalDays');
const totalHoursEl   = document.getElementById('totalHours');
const totalMinutesEl = document.getElementById('totalMinutes');
const totalSecondsEl = document.getElementById('totalSeconds');

// Extra info
const nextBirthdayEl = document.getElementById('nextBirthday');
const zodiacEl       = document.getElementById('zodiac');
const dayBornEl      = document.getElementById('dayBorn');
const leapYearEl     = document.getElementById('leapYear');

/* ── State ──────────────────────────────────────────────── */
let timerInterval     = null;
let confettiInterval  = null;
let savedDOB          = null;

/* ── Init: restrict future dates ────────────────────────── */
(function setMaxDate() {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  dobInput.setAttribute('max', `${yyyy}-${mm}-${dd}`);
})();

/* ══════════════════════════════════════════════════════════
   FEATURE 19 — Dark / Light Theme Toggle
══════════════════════════════════════════════════════════ */
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const icon = themeBtn.querySelector('i');
  if (document.body.classList.contains('dark')) {
    icon.classList.replace('fa-moon', 'fa-sun');
  } else {
    icon.classList.replace('fa-sun', 'fa-moon');
  }
});

/* ══════════════════════════════════════════════════════════
   FEATURE 2 — Calculate Button
══════════════════════════════════════════════════════════ */
calculateBtn.addEventListener('click', calculate);
dobInput.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });

function calculate() {
  clearError();
  const dobValue = dobInput.value;

  /* ── FEATURE 4 / 26 / 27 — Validation ── */
  if (!dobValue) {
    showError('Please select your Date of Birth.');
    return;
  }

  const dob   = new Date(dobValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dob > today) {
    showError('Date of Birth cannot be in the future.');
    return;
  }

  savedDOB = dob;

  /* Stop previous timer */
  clearInterval(timerInterval);

  /* Show results */
  resultSection.style.display = 'block';

  /* Run all calculations */
  displayAge(dob);
  displayStats(dob);
  displayExtra(dob);
  startLiveTimer(dob);
  checkBirthday(dob);
  injectProfessionalExtras(dob);
  animateNumbers();
}

/* ══════════════════════════════════════════════════════════
   FEATURE 5 — Exact Age (Years / Months / Days)
══════════════════════════════════════════════════════════ */
function getExactAge(dob) {
  const now = new Date();
  let years  = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth()    - dob.getMonth();
  let days   = now.getDate()     - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

function displayAge(dob) {
  const { years, months, days } = getExactAge(dob);
  yearsEl.textContent  = years;
  monthsEl.textContent = months;
  daysEl.textContent   = days;
}

/* ══════════════════════════════════════════════════════════
   FEATURES 6 (Live Counter) + 10-12 (Hours / Min / Sec)
══════════════════════════════════════════════════════════ */
function startLiveTimer(dob) {
  function tick() {
    const now        = new Date();
    const diffMs     = now - dob;
    const totalSecs  = Math.floor(diffMs / 1000);
    const totalMins  = Math.floor(diffMs / 60000);
    const totalHrs   = Math.floor(diffMs / 3600000);

    /* Live counter — partial units since last birthday moment */
    const secIntoMin  = totalSecs % 60;
    const minIntoHour = totalMins % 60;
    const hrsIntoDay  = totalHrs  % 24;

    hoursEl.textContent   = hrsIntoDay.toLocaleString();
    minutesEl.textContent = minIntoHour.toLocaleString();
    secondsEl.textContent = secIntoMin.toLocaleString();

    /* Update live stat totals */
    totalHoursEl.textContent   = totalHrs.toLocaleString();
    totalMinutesEl.textContent = totalMins.toLocaleString();
    totalSecondsEl.textContent = totalSecs.toLocaleString();

    /* ── FEATURE 36 — Time Until Next Birthday ── */
    updateNextBirthdayCountdown(dob);
  }

  tick();
  timerInterval = setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════════════════
   FEATURES 7-9 — Total Months / Weeks / Days
══════════════════════════════════════════════════════════ */
function displayStats(dob) {
  const now       = new Date();
  const diffMs    = now - dob;
  const totalDays = Math.floor(diffMs / 86400000);
  const totalWks  = Math.floor(totalDays / 7);

  const years  = now.getFullYear() - dob.getFullYear();
  const months = (now.getMonth() - dob.getMonth()) +
                 (now.getDate() < dob.getDate() ? -1 : 0);
  const totalMonths = years * 12 + months;

  totalMonthsEl.textContent = totalMonths.toLocaleString();
  totalWeeksEl.textContent  = totalWks.toLocaleString();
  totalDaysEl.textContent   = totalDays.toLocaleString();
  /* Hours / Min / Sec updated by live timer */
}

/* ══════════════════════════════════════════════════════════
   FEATURES 15-18 — Extra Info
══════════════════════════════════════════════════════════ */
function displayExtra(dob) {
  /* ── FEATURE 15 / 16 — Next Birthday (days left) ── */
  updateNextBirthdayCountdown(dob);

  /* ── FEATURE 16 — Zodiac Sign ── */
  zodiacEl.textContent = getZodiac(dob.getMonth() + 1, dob.getDate());

  /* ── FEATURE 17 — Born On (day name) ── */
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  dayBornEl.textContent = days[dob.getDay()];

  /* ── FEATURE 18 — Leap Year Check ── */
  const year = dob.getFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  leapYearEl.textContent = isLeap ? 'Yes ✅' : 'No ❌';
}

function updateNextBirthdayCountdown(dob) {
  const now   = new Date();
  let next    = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (next <= now) next.setFullYear(now.getFullYear() + 1);

  const diffMs   = next - now;
  const daysLeft = Math.floor(diffMs / 86400000);
  const hrsLeft  = Math.floor((diffMs % 86400000) / 3600000);
  const minLeft  = Math.floor((diffMs % 3600000)  / 60000);
  const secLeft  = Math.floor((diffMs % 60000)    / 1000);

  if (daysLeft === 0 && hrsLeft === 0) {
    nextBirthdayEl.textContent = '🎂 It\'s Today!';
  } else {
    nextBirthdayEl.textContent =
      `${daysLeft}d ${hrsLeft}h ${minLeft}m ${secLeft}s`;
  }
}

/* ── FEATURE 16 — Zodiac Sign ── */
function getZodiac(month, day) {
  if ((month === 3  && day >= 21) || (month === 4  && day <= 19)) return '♈ Aries';
  if ((month === 4  && day >= 20) || (month === 5  && day <= 20)) return '♉ Taurus';
  if ((month === 5  && day >= 21) || (month === 6  && day <= 20)) return '♊ Gemini';
  if ((month === 6  && day >= 21) || (month === 7  && day <= 22)) return '♋ Cancer';
  if ((month === 7  && day >= 23) || (month === 8  && day <= 22)) return '♌ Leo';
  if ((month === 8  && day >= 23) || (month === 9  && day <= 22)) return '♍ Virgo';
  if ((month === 9  && day >= 23) || (month === 10 && day <= 22)) return '♎ Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '♏ Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '♐ Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1  && day <= 19)) return '♑ Capricorn';
  if ((month === 1  && day >= 20) || (month === 2  && day <= 18)) return '♒ Aquarius';
  return '♓ Pisces';
}

/* ══════════════════════════════════════════════════════════
   FEATURE 13/14 — Birthday Detection + Confetti Animation
══════════════════════════════════════════════════════════ */
function checkBirthday(dob) {
  const now = new Date();
  if (now.getMonth() === dob.getMonth() && now.getDate() === dob.getDate()) {
    birthdayBox.style.display = 'block';
    launchConfetti();
  } else {
    birthdayBox.style.display = 'none';
    stopConfetti();
  }
}

function launchConfetti() {
  stopConfetti();
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6fc8','#a29bfe'];
  confettiInterval = setInterval(() => {
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.classList.add('confetti-piece');
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${6 + Math.random() * 8}px;
        height: ${6 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${2 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }, 300);

  /* Inject keyframes once */
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      .confetti-piece {
        position: fixed;
        top: -20px;
        z-index: 9999;
        animation: confettiFall linear forwards;
      }
      @keyframes confettiFall {
        0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

function stopConfetti() {
  clearInterval(confettiInterval);
}

/* ══════════════════════════════════════════════════════════
   FEATURE 31 — Animated Number Counter
══════════════════════════════════════════════════════════ */
function animateNumbers() {
  const targets = [
    totalMonthsEl, totalWeeksEl, totalDaysEl
  ];
  targets.forEach(el => {
    const end  = parseInt(el.textContent.replace(/,/g, ''), 10) || 0;
    let   start = 0;
    const dur   = 1200;
    const step  = 16;
    const inc   = end / (dur / step);
    const timer = setInterval(() => {
      start += inc;
      if (start >= end) { el.textContent = end.toLocaleString(); clearInterval(timer); }
      else              { el.textContent = Math.floor(start).toLocaleString(); }
    }, step);
  });
}

/* ══════════════════════════════════════════════════════════
   PROFESSIONAL EXTRAS (32-40) — injected into result section
══════════════════════════════════════════════════════════ */
function injectProfessionalExtras(dob) {
  /* Remove previous extras if re-calculating */
  const old = document.getElementById('professionalExtras');
  if (old) old.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'professionalExtras';

  /* ── FEATURE 35 — Age Progress Bar ── */
  const { years } = getExactAge(dob);
  const nextBirthday = new Date(new Date().getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday < new Date()) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  const prevBirthday = new Date(nextBirthday);
  prevBirthday.setFullYear(prevBirthday.getFullYear() - 1);
  const yearProgress = Math.round(((new Date() - prevBirthday) / (nextBirthday - prevBirthday)) * 100);

  /* ── FEATURE 37 — Chinese Zodiac ── */
  const chineseAnimals = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake',
                          'Horse','Goat','Monkey','Rooster','Dog','Pig'];
  const chineseEmojis  = ['🐀','🐂','🐅','🐇','🐉','🐍','🐴','🐐','🐒','🐓','🐕','🐖'];
  const chineseIdx     = (dob.getFullYear() - 1900) % 12;
  const chineseSign    = chineseAnimals[chineseIdx];
  const chineseEmoji   = chineseEmojis[chineseIdx];

  /* ── FEATURE 38 — Season of Birth ── */
  const m = dob.getMonth() + 1;
  let season = '';
  if (m >= 3  && m <= 5)  season = '🌸 Spring';
  else if (m >= 6  && m <= 8)  season = '☀️ Summer';
  else if (m >= 9  && m <= 11) season = '🍂 Autumn';
  else                         season = '❄️ Winter';

  /* ── FEATURE 39 — Birthstone ── */
  const birthstones = [
    'Garnet 💎','Amethyst 💜','Aquamarine 🔵','Diamond 💍',
    'Emerald 💚','Pearl 🤍','Ruby ❤️','Peridot 🍏',
    'Sapphire 🔷','Opal 🌈','Topaz 🟡','Turquoise 🩵'
  ];
  const birthstone = birthstones[dob.getMonth()];

  /* ── FEATURE 40 — Fun Facts ── */
  const now        = new Date();
  const totalSecs  = Math.floor((now - dob) / 1000);
  const totalMins  = Math.floor(totalSecs / 60);
  const totalHrs   = Math.floor(totalMins / 60);
  const totalDaysN = Math.floor(totalHrs  / 24);

  const blinks     = Math.round(totalMins * 15).toLocaleString();       // ~15 blinks/min
  const heartbeats = Math.round(totalSecs * 1.2).toLocaleString();      // ~72 bpm
  const breaths    = Math.round(totalMins * 15).toLocaleString();       // ~15/min
  const steps      = Math.round(totalDaysN * 8000).toLocaleString();    // ~8000/day
  const dreams     = Math.round(totalDaysN * 4).toLocaleString();       // ~4/night

  wrapper.innerHTML = `
    <!-- FEATURE 35: Progress Bar -->
    <h2>Year Progress</h2>
    <div class="progress-section">
      <div class="progress-label">
        <span>Birthday ${years} completed</span>
        <span>${yearProgress}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${yearProgress}%"></div>
      </div>
      <p class="progress-sub">${100 - yearProgress}% of the year remaining until your next birthday</p>
    </div>

    <!-- FEATURES 37-39: Chinese Zodiac / Season / Birthstone -->
    <h2>Birth Profile</h2>
    <div class="extra-grid">
      <div class="extra-card">
        <i class="fa-solid fa-yin-yang"></i>
        <h3>Chinese Zodiac</h3>
        <p>${chineseEmoji} ${chineseSign}</p>
      </div>
      <div class="extra-card">
        <i class="fa-solid fa-seedling"></i>
        <h3>Season of Birth</h3>
        <p>${season}</p>
      </div>
      <div class="extra-card">
        <i class="fa-solid fa-gem"></i>
        <h3>Birthstone</h3>
        <p>${birthstone}</p>
      </div>
    </div>

    <!-- FEATURE 40: Fun Facts -->
    <h2>Fun Facts About You 🎯</h2>
    <div class="facts-grid">
      <div class="fact-card">👁️ You have blinked approximately <strong>${blinks}</strong> times.</div>
      <div class="fact-card">❤️ Your heart has beaten about <strong>${heartbeats}</strong> times.</div>
      <div class="fact-card">🫁 You have taken roughly <strong>${breaths}</strong> breaths.</div>
      <div class="fact-card">👣 You have walked an estimated <strong>${steps}</strong> steps.</div>
      <div class="fact-card">💭 You have had approximately <strong>${dreams}</strong> dreams.</div>
      <div class="fact-card">🌍 You have orbited the Sun <strong>${years}</strong> times!</div>
    </div>

    <!-- FEATURES 32 + 34: Copy & Share -->
    <div class="action-buttons">
      <button class="action-btn copy-btn" id="copyBtn">
        <i class="fa-solid fa-copy"></i> Copy Results
      </button>
      <button class="action-btn share-btn" id="shareBtn">
        <i class="fa-brands fa-whatsapp"></i> Share on WhatsApp
      </button>
    </div>
  `;

  resultSection.appendChild(wrapper);

  /* ── FEATURE 32 — Copy Results ── */
  document.getElementById('copyBtn').addEventListener('click', copyResults);

  /* ── FEATURE 34 — Share via WhatsApp ── */
  document.getElementById('shareBtn').addEventListener('click', shareWhatsApp);

  /* Inject extras CSS if not present */
  if (!document.getElementById('extras-style')) {
    const style = document.createElement('style');
    style.id = 'extras-style';
    style.textContent = `
      /* Progress Bar */
      .progress-section {
        background: rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 20px 24px;
        margin-bottom: 30px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.15);
      }
      .progress-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        margin-bottom: 10px;
        color: var(--text, #333);
        font-weight: 500;
      }
      .progress-track {
        background: rgba(0,0,0,0.12);
        border-radius: 50px;
        height: 14px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        border-radius: 50px;
        background: linear-gradient(90deg, #6c63ff, #ff6584);
        transition: width 1.2s cubic-bezier(.4,0,.2,1);
      }
      .progress-sub {
        font-size: 0.78rem;
        margin-top: 8px;
        opacity: 0.7;
        text-align: center;
      }

      /* Fun Facts */
      .facts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 14px;
        margin-bottom: 30px;
      }
      .fact-card {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 14px;
        padding: 16px 18px;
        font-size: 0.88rem;
        line-height: 1.6;
        backdrop-filter: blur(8px);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .fact-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(108,99,255,0.18);
      }
      .fact-card strong { color: #6c63ff; }

      /* Action Buttons */
      .action-buttons {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        justify-content: center;
        margin: 10px 0 6px;
      }
      .action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 28px;
        border: none;
        border-radius: 50px;
        font-family: 'Poppins', sans-serif;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .copy-btn {
        background: linear-gradient(135deg, #6c63ff, #a29bfe);
        color: #fff;
      }
      .share-btn {
        background: linear-gradient(135deg, #25D366, #128C7E);
        color: #fff;
      }
      .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
      }

      /* Toast notification */
      .toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #333;
        color: #fff;
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 0.88rem;
        font-family: 'Poppins', sans-serif;
        z-index: 9999;
        transition: transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s;
        opacity: 0;
        pointer-events: none;
      }
      .toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
}

/* ══════════════════════════════════════════════════════════
   FEATURE 32 — Copy Results to Clipboard
══════════════════════════════════════════════════════════ */
function copyResults() {
  if (!savedDOB) return;
  const { years, months, days } = getExactAge(savedDOB);
  const text = `🎂 My Age Report\n` +
    `━━━━━━━━━━━━━━━━━\n` +
    `Age      : ${years} Years, ${months} Months, ${days} Days\n` +
    `Months   : ${totalMonthsEl.textContent}\n` +
    `Weeks    : ${totalWeeksEl.textContent}\n` +
    `Days     : ${totalDaysEl.textContent}\n` +
    `Zodiac   : ${zodiacEl.textContent}\n` +
    `Born On  : ${dayBornEl.textContent}\n` +
    `Leap Year: ${leapYearEl.textContent}\n` +
    `━━━━━━━━━━━━━━━━━\n` +
    `Calculated with Advanced Age Calculator`;

  navigator.clipboard.writeText(text).then(() => showToast('✅ Results copied to clipboard!')).catch(() => {
    /* Fallback */
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('✅ Results copied to clipboard!');
  });
}

/* ══════════════════════════════════════════════════════════
   FEATURE 34 — Share on WhatsApp
══════════════════════════════════════════════════════════ */
function shareWhatsApp() {
  if (!savedDOB) return;
  const { years, months, days } = getExactAge(savedDOB);
  const msg = encodeURIComponent(
    `🎂 My Age Report\n` +
    `Age: ${years} Years, ${months} Months, ${days} Days\n` +
    `Total Days: ${totalDaysEl.textContent}\n` +
    `Zodiac: ${zodiacEl.textContent}\n` +
    `Born On: ${dayBornEl.textContent}\n` +
    `Calculated with Advanced Age Calculator 🚀`
  );
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

/* ══════════════════════════════════════════════════════════
   FEATURE 3 — Reset
══════════════════════════════════════════════════════════ */
resetBtn.addEventListener('click', () => {
  dobInput.value           = '';
  clearError();
  resultSection.style.display = 'none';
  birthdayBox.style.display   = 'none';
  clearInterval(timerInterval);
  stopConfetti();
  savedDOB = null;

  const old = document.getElementById('professionalExtras');
  if (old) old.remove();

  /* Reset all display elements */
  [yearsEl, monthsEl, daysEl, hoursEl, minutesEl, secondsEl,
   totalMonthsEl, totalWeeksEl, totalDaysEl,
   totalHoursEl, totalMinutesEl, totalSecondsEl].forEach(el => el.textContent = '0');
  [nextBirthdayEl, zodiacEl, dayBornEl, leapYearEl].forEach(el => el.textContent = '--');
});

/* ══════════════════════════════════════════════════════════
   Helpers — Error / Toast
══════════════════════════════════════════════════════════ */
function showError(msg) {
  errorEl.textContent  = msg;
  errorEl.style.display = 'block';
}

function clearError() {
  errorEl.textContent  = '';
  errorEl.style.display = 'none';
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast    = document.createElement('div');
    toast.id = 'toast';
    toast.classList.add('toast');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}