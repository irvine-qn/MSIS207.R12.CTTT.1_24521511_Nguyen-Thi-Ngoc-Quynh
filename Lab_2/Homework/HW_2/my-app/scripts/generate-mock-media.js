// Synthesizes royalty-free demo tracks (WAV) and SVG covers.
// Usage: node scripts/generate-mock-media.js public
const fs = require("fs");
const path = require("path");

const publicDir = process.argv[2];
const audioDir = path.join(publicDir, "audio", "mock");
const coverDir = path.join(publicDir, "images", "covers");
fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(coverDir, { recursive: true });

const SAMPLE_RATE = 22050;
const DURATION_S = 30;

const TRACKS = [
  { slug: "neon-pulse", bpm: 124, root: 57, scale: [0, 3, 7, 10], wave: "saw", colors: ["#7c3aed", "#db2777"] },
  { slug: "midnight-drive", bpm: 100, root: 52, scale: [0, 3, 5, 7], wave: "square", colors: ["#1e3a8a", "#0891b2"] },
  { slug: "crystal-echoes", bpm: 90, root: 64, scale: [0, 4, 7, 11], wave: "sine", colors: ["#0f766e", "#a3e635"] },
  { slug: "solar-flare", bpm: 140, root: 55, scale: [0, 2, 7, 9], wave: "saw", colors: ["#b45309", "#ef4444"] },
  { slug: "deep-current", bpm: 84, root: 48, scale: [0, 3, 7, 8], wave: "triangle", colors: ["#312e81", "#4f46e5"] },
  { slug: "city-lights", bpm: 112, root: 60, scale: [0, 4, 5, 9], wave: "square", colors: ["#be185d", "#f59e0b"] },
];

const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

function osc(type, phase) {
  const p = phase - Math.floor(phase);
  switch (type) {
    case "saw": return 2 * p - 1;
    case "square": return p < 0.5 ? 0.6 : -0.6;
    case "triangle": return 4 * Math.abs(p - 0.5) - 1;
    default: return Math.sin(2 * Math.PI * p);
  }
}

// Small deterministic PRNG so every run produces identical files.
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function render(track, seed) {
  const n = SAMPLE_RATE * DURATION_S;
  const out = new Float32Array(n);
  const beat = 60 / track.bpm;
  const step = beat / 2; // eighth notes
  const rand = rng(seed);
  const melody = Array.from({ length: 16 }, () => track.scale[Math.floor(rand() * track.scale.length)] + (rand() < 0.3 ? 12 : 0));
  const chordRoots = [0, 5, 3, 7].map((d) => d % 12);

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const fade = Math.min(1, t / 1.5, (DURATION_S - t) / 2);
    const bar = Math.floor(t / (beat * 4));
    const chord = track.root - 12 + chordRoots[bar % 4];

    // Pad: three detuned voices
    let pad = 0;
    for (const iv of [0, 7, 12]) pad += osc("sine", t * midiToHz(chord + 12 + iv)) / 3;

    // Bass on every beat
    const tb = t % beat;
    const bass = osc(track.wave === "sine" ? "triangle" : "sine", t * midiToHz(chord)) * Math.exp(-tb * 3);

    // Lead arpeggio on eighth notes
    const si = Math.floor(t / step);
    const ts = t % step;
    const note = track.root + melody[si % 16];
    const lead = osc(track.wave, t * midiToHz(note)) * Math.exp(-ts * 6) * 0.5;

    // Kick (pitch-swept sine) on beats, hi-hat noise on off-beats
    const kick = Math.sin(2 * Math.PI * (50 * tb + 120 * (1 - Math.exp(-tb * 30)) / 30)) * Math.exp(-tb * 12);
    const hatT = (t + step) % beat;
    const hat = (rand() * 2 - 1) * Math.exp(-hatT * 60) * 0.25;

    out[i] = fade * (0.18 * pad + 0.3 * bass + 0.22 * lead + 0.45 * kick + hat);
  }
  return out;
}

function toWav(samples) {
  const dataBytes = samples.length * 2;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + dataBytes, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24); buf.writeUInt32LE(SAMPLE_RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return buf;
}

function cover(track, seed) {
  const rand = rng(seed);
  const [a, b] = track.colors;
  const bars = Array.from({ length: 12 }, (_, i) => {
    const h = 30 + Math.round(rand() * 110);
    return `<rect x="${42 + i * 19}" y="${230 - h}" width="11" height="${h}" rx="4" fill="#fff" fill-opacity="0.55"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="300" height="300" fill="url(#g)"/>
  <circle cx="230" cy="70" r="40" fill="#fff" fill-opacity="0.15"/>
  ${bars}
</svg>
`;
}

TRACKS.forEach((track, idx) => {
  fs.writeFileSync(path.join(audioDir, `${track.slug}.wav`), toWav(render(track, idx + 1)));
  fs.writeFileSync(path.join(coverDir, `${track.slug}.svg`), cover(track, idx + 101));
  console.log("wrote", track.slug);
});
