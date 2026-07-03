/** Looping order alert using Web Audio (no external sound file). */

let audioCtx: AudioContext | null = null;
let alarmInterval: ReturnType<typeof setInterval> | null = null;
let isPlaying = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playBeep() {
  const ctx = getContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.22, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.35);
}

export function startOrderAlarm() {
  if (isPlaying) return;
  isPlaying = true;
  playBeep();
  alarmInterval = setInterval(playBeep, 900);
}

export function stopOrderAlarm() {
  isPlaying = false;
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

export function isOrderAlarmPlaying() {
  return isPlaying;
}
