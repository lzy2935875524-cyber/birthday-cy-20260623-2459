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
const wishLayer = document.querySelector("[data-wish-layer]");

let audio;
let audioContext;
let musicLoopTimer;
let musicStarted = false;
let musicBooting = false;
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

function scheduleMelody() {
  if (!audioContext || audioContext.state !== "running") return;

  const start = audioContext.currentTime + 0.04;
  const notes = [392, 494, 587, 659, 587, 494, 440, 523, 659, 784, 659, 587, 523, 494, 440, 392];

  notes.forEach((note, index) => {
    playTone(note, start + index * 0.24, 0.2, index % 4 === 0 ? 0.12 : 0.085);
  });
}

async function startGeneratedMusic() {
  if (musicBooting || musicStarted) return musicStarted;
  musicBooting = true;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    musicBooting = false;
    return false;
  }

  audioContext = audioContext || new AudioCtor();
  await audioContext.resume();

  if (audioContext.state !== "running") {
    musicBooting = false;
    return false;
  }

  musicStarted = true;
  musicBooting = false;
  musicButton.classList.add("is-playing");
  musicButton.setAttribute("aria-label", "生日音乐播放中");
  scheduleMelody();
  musicLoopTimer = window.setInterval(scheduleMelody, 3900);
  return true;
}

async function startMusic() {
  if (musicStarted) return true;

  if (audio) {
    audio.muted = false;
    audio.volume = 0.55;
    await audio.play();
    musicStarted = true;
    musicButton.classList.add("is-playing");
    musicButton.setAttribute("aria-label", "生日音乐播放中");
    return true;
  }

  return startGeneratedMusic();
}

function armMusicFallback() {
  const unlock = () => {
    startMusic().catch(() => {});
  };

  ["pointerdown", "touchstart", "click", "keydown", "scroll"].forEach((eventName) => {
    window.addEventListener(eventName, unlock, { once: true, passive: true });
  });
}

function autoStartMusic() {
  startMusic().then((started) => {
    if (!started) armMusicFallback();
  }).catch(() => {
    musicBooting = false;
    armMusicFallback();
  });
}

function playWishAnimation() {
  wishLayer.innerHTML = "";
  wishLayer.classList.remove("is-lit");
  void wishLayer.offsetWidth;
  wishLayer.classList.add("is-lit");

  for (let i = 0; i < 72; i += 1) {
    const star = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 310;
    star.className = i % 5 === 0 ? "wish-star is-large" : "wish-star";
    star.style.left = `${50 + (Math.random() - 0.5) * 12}%`;
    star.style.top = `${50 + (Math.random() - 0.5) * 10}%`;
    star.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    star.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    star.style.setProperty("--delay", `${Math.random() * 0.55}s`);
    star.style.setProperty("--duration", `${3.1 + Math.random() * 1.3}s`);
    star.style.background = i % 4 === 0 ? "#f5c15f" : i % 4 === 1 ? "#ff6f86" : i % 4 === 2 ? "#75c8ff" : "#fff6ed";
    wishLayer.appendChild(star);
  }

  window.setTimeout(() => {
    wishLayer.classList.remove("is-lit");
    wishLayer.innerHTML = "";
  }, 4700);
}

letterButton.addEventListener("click", () => {
  document.querySelector(".secret-letter").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(typeLetter, 520);
  burstSparks(18);
});

wishButton.addEventListener("click", () => {
  const wish = data.wishes[Math.floor(Math.random() * data.wishes.length)];
  wishResult.textContent = wish;
  wishResult.classList.remove("is-lit");
  void wishResult.offsetWidth;
  wishResult.classList.add("is-lit");
  playWishAnimation();
  startMusic().catch(() => {});
});

if (data.musicUrl) {
  audio = new Audio(data.musicUrl);
  audio.loop = true;
  audio.preload = "auto";
  audio.autoplay = true;
  audio.playsInline = true;
  audio.volume = 0.55;
}

musicButton.addEventListener("click", async () => {
  if (musicStarted) {
    if (audio && !audio.paused) audio.pause();
    if (audioContext) audioContext.suspend().catch(() => {});
    window.clearInterval(musicLoopTimer);
    musicLoopTimer = undefined;
    musicStarted = false;
    musicButton.classList.remove("is-playing");
    musicButton.setAttribute("aria-label", "生日音乐已暂停");
    return;
  }

  await startMusic();
});

const letterObserver = new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) typeLetter();
  },
  { threshold: 0.45 },
);

letterObserver.observe(document.querySelector(".secret-letter"));

window.addEventListener("pageshow", autoStartMusic);
document.addEventListener("DOMContentLoaded", autoStartMusic);
document.addEventListener("WeixinJSBridgeReady", autoStartMusic);
window.setTimeout(autoStartMusic, 680);
