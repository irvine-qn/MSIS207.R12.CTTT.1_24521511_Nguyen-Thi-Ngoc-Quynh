import { audioEngine } from "./audioEngine.js";

export const KEY_TO_SOUND_MAP = {
  a: "kick",
  s: "snare",
  d: "hihat",
  f: "clap",
  g: "openhat",
  h: "boom",
  j: "ride",
  k: "tom",
  l: "tink",
};

let isListenerRegistered = false;
let boundKeydownHandler = null;
const visualEffectTimers = new Map();

function handleKeydown(event) {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;

  const key = event.key.toLowerCase();
  const soundName = KEY_TO_SOUND_MAP[key];

  if (!soundName) return;

  if (!audioEngine.playSound(soundName)) return;

  const pad = document.querySelector(
    `.key[data-sound="${soundName}"]`,
  );

  if (!pad) return;

  pad.classList.add("playing");
  window.clearTimeout(visualEffectTimers.get(soundName));
  visualEffectTimers.set(
    soundName,
    window.setTimeout(() => {
      pad.classList.remove("playing");
      visualEffectTimers.delete(soundName);
    }, 120),
  );
}

export function initKeyboardHandler() {
  if (isListenerRegistered) {
    console.warn("KeyboardHandler: Listener is already registered.");
    return;
  }

  boundKeydownHandler = handleKeydown;
  window.addEventListener("keydown", boundKeydownHandler);
  isListenerRegistered = true;
}

export function removeKeyboardHandler() {
  if (!isListenerRegistered) return;

  window.removeEventListener("keydown", boundKeydownHandler);
  boundKeydownHandler = null;
  isListenerRegistered = false;
}
