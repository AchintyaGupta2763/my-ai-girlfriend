console.log("🎬 script.js loaded!");

const BACKEND_URL = "http://localhost:8000";
const micButton     = document.getElementById("mic-button");
const transcriptDiv = document.getElementById("transcript");
const loadingScreen = document.getElementById("loading-screen");
const video1        = document.getElementById("video1");
const video2        = document.getElementById("video2");

let isListening    = false;
let mediaRecorder;
let audioChunks    = [];
let currentAudio   = null;
let activeVideo    = video1;
let inactiveVideo  = video2;

const emotionVideos = {
  happy:   "videos/happy.mp4",
  sad:     "videos/sad.mp4",
  excited: "videos/excited.mp4",
  caring:  "videos/caring.mp4",
  neutral: "videos/neutral.mp4",
  normal:  "videos/normal.mp4",
  default: "videos/default.mp4"
};

window.addEventListener("DOMContentLoaded", () => {
  initializeVideos();
  if (loadingScreen) {
    loadingScreen.style.opacity = 0;
    setTimeout(() => loadingScreen.style.display = "none", 500);
  }
  micButton.addEventListener("click", () => {
    if (isListening) stopRecording();
    else            startRecording();
  });
});

function initializeVideos() {
  // both videos loop by default
  video1.loop = video2.loop = true;
  video1.muted = video2.muted = true;
  video1.style.opacity = 1;
  video2.style.opacity = 0;
  activeVideo   = video1;
  inactiveVideo = video2;
  loadSource(video1, emotionVideos.default);
  video1.play().catch(console.error);
}

// utility to swap in a new <source> for a <video> and .load()
function loadSource(videoEl, src) {
  videoEl.querySelector("source").src = src;
  videoEl.load();
}

// plays the emotion video & TTS audio in perfect sync.
// returns a promise that resolves when the audio ends.
async function playEmotionSequence(emotion, audioUrl) {
  // 1) load emotion video into the hidden video tag
  const vidSrc = emotionVideos[emotion] || emotionVideos.neutral;
  loadSource(inactiveVideo, vidSrc);

  // 2) wait until it can play through
  await new Promise((res, rej) => {
    inactiveVideo.addEventListener("canplaythrough", res, { once: true });
    inactiveVideo.addEventListener("error", rej,         { once: true });
  });

  // 3) prepare the audio element
  const audio = new Audio(`${BACKEND_URL}${audioUrl}`);
  currentAudio = audio;
  await new Promise((res, rej) => {
    audio.addEventListener("loadedmetadata", res, { once: true });
    audio.addEventListener("error",         rej, { once: true });
  });

  // 4) decide if emotion video should loop or not
  inactiveVideo.loop = audio.duration > inactiveVideo.duration;

  // 5) rewind both to 0
  inactiveVideo.currentTime = 0;
  audio.currentTime          = 0;

  // 6) swap which <video> is visible
  activeVideo.style.opacity   = 0;
  inactiveVideo.style.opacity = 1;
  [activeVideo, inactiveVideo] = [inactiveVideo, activeVideo];

  // 7) play them together
  try {
    await Promise.all([ activeVideo.play(), audio.play() ]);
  } catch (e) {
    console.error("⚠️ play error:", e);
  }

  // 8) resolve when audio ends
  return new Promise(res => {
    audio.onended = () => res();
  });
}

// when the TTS ends, switch immediately back to the normal video
async function switchToNormal() {
  // stop & drop any old audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // load normal video into the hidden video tag
  loadSource(inactiveVideo, emotionVideos.normal);

  // wait until it can play
  await new Promise((res, rej) => {
    inactiveVideo.addEventListener("canplaythrough", res, { once: true });
    inactiveVideo.addEventListener("error",         rej, { once: true });
  });

  // ensure normal loops
  inactiveVideo.loop = true;
  inactiveVideo.currentTime = 0;

  // fade back
  activeVideo.style.opacity   = 0;
  inactiveVideo.style.opacity = 1;
  [activeVideo, inactiveVideo] = [inactiveVideo, activeVideo];

  // play normal
  activeVideo.play().catch(console.error);
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    let hasAudioData = false;

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
        hasAudioData = true;
      }
    };

    mediaRecorder.onstop = async () => {
      isListening = false;
      micButton.classList.remove("is-listening");

      if (!hasAudioData) {
        transcriptDiv.textContent = "🎙️ No voice was recorded...";
        return;
      }

      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      transcriptDiv.textContent = "🧠 Thinking...";

      try {
        // 1) STT
        const fd = new FormData();
        fd.append("file", audioBlob, "input.wav");
        const sttRes = await fetch(`${BACKEND_URL}/transcribe`, {
          method: "POST",
          body: fd
        });
        const { text } = await sttRes.json();
        transcriptDiv.textContent = `🧑 You Said: ${text}`;

        // 2) Respond + emotion + TTS
        const rp = await fetch(`${BACKEND_URL}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        const { response, emotion, audio_url } = await rp.json();
        transcriptDiv.innerHTML += `<br/>🤖 ${response}<br/>🧠 Emotion: ${emotion}`;

        // 3) play the synced emotion video & audio
        await playEmotionSequence(emotion, audio_url);

        // 4) when audio ends, switch back to normal
        await switchToNormal();
      } catch (err) {
        console.error("❌ processing error:", err);
        transcriptDiv.textContent = "❌ An Error Occured...";
      }
    };

    mediaRecorder.start();
    isListening = true;
    micButton.classList.add("is-listening");
    transcriptDiv.textContent = "🎙️ please speak something...";
    // optional: remove auto-stop if you prefer manual click to finish
    // setTimeout(stopRecording, 5000);
  } catch (err) {
    console.error("❌ mic error:", err);
    transcriptDiv.textContent = "❌ microphone access not allowed...";
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}
