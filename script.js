const data = window.BIRTHDAY_PAGE;
const textTargets = document.querySelectorAll("[data-config-text]");
const imageTargets = document.querySelectorAll("[data-config-img]");
const gallery = document.querySelector("[data-gallery]");
const timeline = document.querySelector("[data-timeline]");
const typed = document.querySelector("[data-typed]");
const letterButton = document.querySelector(".open-letter");
const wishButton = document.querySelector(".wish-button");
const wishResult = document.querySelector("[data-wish-result]");
const musicButton = document.querySelector(".music-btn");

let audio;
let audioContext;
let typingStarted = false;

document.title = `${data.name}生日快乐`;

textTargets.forEach((node) => {
  node.textContent = data[node.dataset.configText] || "";
});

imageTargets.forEach((node) => {
  node.src = data[node.dataset.configImg] || "";
});

gallery.innerHTML = data.wishCards
  .map(
    (card) => `
      <article class="wish-card">
        <span>${card.mark}</span>
        <h3>${card.title}</h3>
        <p>${card.text}</p>
      </article>
    `,
  )
  .join("");

timeline.innerHTML = data.timeline
  .map(
    (item) => `
      <article class="moment">
        <strong>${item.time}</strong>
        <p>${item.text}</p>
      </article>
    `,
  )
  .join("");

function typeLetter() {
  if (typingStarted) return;
  typingStarted = true;
  let index = 0;
  const content = data.letterBody;
  const timer = setInterval(() => {
    typed.textContent = content.slice(0, index);
    index += 1;
    if (index > content.length) clearInterval(timer);
  }, 34);
}

function burstSparks(amount = 24) {
  for (let i = 0; i < amount; i += 1) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = `${12 + Math.random() * 76}vw`;
    spark.style.top = `${58 + Math.random() * 32}vh`;
    spark.style.setProperty("--x", `${(Math.random() - 0.5) * 180}px`);
    spark.style.background = i % 3 === 0 ? "#f5c15f" : i % 3 === 1 ? "#ff6f86" : "#75c8ff";
    document.body.appendChild(spark);
    window.setTimeout(() => spark.remove(), 1600);
  }
}

function playTone(frequency, start, duration, gainValue = 0.14) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

async function playGeneratedMusic() {
  audioContext = audioContext || new AudioContext();
  await audioContext.resume();
  const start = audioContext.currentTime + 0.04;
  const notes = [392, 494, 587, 659, 587, 494, 440, 523, 659, 784, 659, 587];

  notes.forEach((note, index) => {
    playTone(note, start + index * 0.22, 0.18, index % 4 === 0 ? 0.18 : 0.12);
  });
}

letterButton.addEventListener("click", () => {
  document.querySelector(".secret-letter").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(typeLetter, 520);
  burstSparks(18);
});

wishButton.addEventListener("click", () => {
  const wish = data.wishes[Math.floor(Math.random() * data.wishes.length)];
  wishResult.textContent = wish;
  burstSparks(32);
});

if (data.musicUrl) {
  audio = new Audio(data.musicUrl);
  audio.loop = true;
}

musicButton.addEventListener("click", async () => {
  musicButton.classList.add("is-playing");
  burstSparks(12);

  if (!audio) {
    await playGeneratedMusic();
    window.setTimeout(() => musicButton.classList.remove("is-playing"), 3100);
    return;
  }

  if (audio.paused) {
    await audio.play();
    musicButton.classList.add("is-playing");
  } else {
    audio.pause();
    musicButton.classList.remove("is-playing");
  }
});

const letterObserver = new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) typeLetter();
  },
  { threshold: 0.45 },
);

letterObserver.observe(document.querySelector(".secret-letter"));
