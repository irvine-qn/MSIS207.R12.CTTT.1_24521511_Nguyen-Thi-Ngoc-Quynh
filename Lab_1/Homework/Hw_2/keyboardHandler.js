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
let isClickListenerRegistered = false;
let boundClickHandler = null;
const visualEffectTimers = new Map();

function playPadSound(soundName, pad) {
  if (!audioEngine.playSound(soundName)) return;

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

function handleKeydown(event) {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;

  const key = event.key.toLowerCase();
  const soundName = KEY_TO_SOUND_MAP[key];

  if (!soundName) return;

  const pad = document.querySelector(
    `.key[data-sound="${soundName}"]`,
  );

  if (!pad) return;

  playPadSound(soundName, pad);
}

function handlePadClick(event) {
  if (!(event.target instanceof Element)) return;

  const pad = event.target.closest(".key[data-sound]");
  if (!pad || !event.currentTarget.contains(pad)) return;

  playPadSound(pad.dataset.sound, pad);
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

export function initPadClickHandler() {
  if (isClickListenerRegistered) {
    console.warn("KeyboardHandler: Click listener is already registered.");
    return;
  }

  boundClickHandler = handlePadClick;
  document.querySelector(".drum-kit")?.addEventListener("click", boundClickHandler);
  isClickListenerRegistered = true;
}

export function removeKeyboardHandler() {
  if (!isListenerRegistered) return;

  window.removeEventListener("keydown", boundKeydownHandler);
  boundKeydownHandler = null;
  isListenerRegistered = false;
}

export function removePadClickHandler() {
  if (!isClickListenerRegistered) return;

  document
    .querySelector(".drum-kit")
    ?.removeEventListener("click", boundClickHandler);
  boundClickHandler = null;
  isClickListenerRegistered = false;
}
