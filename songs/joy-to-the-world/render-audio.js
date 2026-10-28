// Renders "Joy to the World" (5-Piece Bb Quintet) to a stereo 16-bit PCM WAV file
const fs = require('fs');
const path = require('path');

global.window = {};
require('./song.js');
const S = window.ENSEMBLE_SONG;

const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midi(p) {
  if (!p || p === 'R') return null;
  const letter = p[0];
  const sharp = p.includes('#') ? 1 : 0;
  const flat = p.includes('b') ? 1 : 0;
  const oct = +p.at(-1);
  return 12 * (oct + 1) + SEMI[letter] + sharp - flat;
}
function hz(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

// Instrument harmonic recipes & stereo pan positions
const PROFILES = {
  'soprano-sax': {
    pan: -0.20,
    gain: 0.24,
    vibDepth: 0.0032,
    vibRate: 5.4,
    attack: 0.022,
    release: 0.045,
    harmonics: [1.0, 0.68, 0.42, 0.25, 0.14, 0.08, 0.04]
  },
  'trumpet': {
    pan: 0.24,
    gain: 0.20,
    vibDepth: 0.0018,
    vibRate: 5.0,
    attack: 0.016,
    release: 0.040,
    harmonics: [0.85, 1.0, 0.72, 0.48, 0.28, 0.16, 0.09]
  },
  'clarinet-1': {
    pan: -0.48,
    gain: 0.21,
    vibDepth: 0.0012,
    vibRate: 4.8,
    attack: 0.020,
    release: 0.040,
    // Clarinet: predominantly odd harmonics (1, 3, 5, 7) with warm 2nd
    harmonics: [1.0, 0.18, 0.65, 0.12, 0.36, 0.08, 0.15]
  },
  'clarinet-2': {
    pan: 0.48,
    gain: 0.19,
    vibDepth: 0.0012,
    vibRate: 4.7,
    attack: 0.020,
    release: 0.040,
    harmonics: [1.0, 0.20, 0.62, 0.14, 0.34, 0.07, 0.14]
  },
  'tenor-sax': {
    pan: 0.0,
    gain: 0.28,
    vibDepth: 0.0022,
    vibRate: 5.1,
    attack: 0.026,
    release: 0.055,
    harmonics: [1.0, 0.78, 0.50, 0.30, 0.18, 0.09, 0.04]
  }
};

const SAMPLE_RATE = 32000; // Crisp 16kHz bandwidth, compact ~9MB stereo WAV for easy sharing
const BPM = S.tempo || 92;
const BEAT_SEC = 60 / BPM;
const UNIT_SEC = BEAT_SEC / S.beatUnit;
const TOTAL_BARS = 28;
const LEAD_IN_SEC = 0.35;
const TAIL_SEC = 1.6;
const TOTAL_SEC = LEAD_IN_SEC + TOTAL_BARS * S.unitsPerBar * UNIT_SEC + TAIL_SEC;
const NUM_SAMPLES = Math.ceil(TOTAL_SEC * SAMPLE_RATE);

const leftBuf = new Float32Array(NUM_SAMPLES);
const rightBuf = new Float32Array(NUM_SAMPLES);

// Render all 5 voices across 28 bars
S.voices.forEach(voice => {
  const prof = PROFILES[voice.id] || PROFILES['trumpet'];
  const panAngle = (prof.pan + 1) * (Math.PI / 4);
  const gainL = Math.cos(panAngle) * prof.gain;
  const gainR = Math.sin(panAngle) * prof.gain;

  // Normalize harmonic weights
  const hSum = prof.harmonics.reduce((a, b) => a + b, 0);
  const weights = prof.harmonics.map(h => h / hSum);

  for (let bi = 0; bi < TOTAL_BARS; bi++) {
    const barNum = bi + 1;
    let dyn = 1.0;
    if ((barNum >= 5 && barNum <= 7) || (barNum >= 20 && barNum <= 22)) dyn = 0.72;
    else if (barNum >= 11 && barNum <= 14) dyn = 0.86;
    else if (barNum === 15) dyn = 0.65;
    else if (barNum >= 25) dyn = 1.12;

    const barStartSec = LEAD_IN_SEC + bi * S.unitsPerBar * UNIT_SEC;
    let cursor = 0;

    voice.bars[bi].forEach(([pitch, dur]) => {
      const noteStartSec = barStartSec + cursor * UNIT_SEC;
      const fullDurSec = dur * UNIT_SEC;
      // Add slight breath articulation gap between notes, sustain longer on final bar
      const soundDurSec = (bi === TOTAL_BARS - 1 && cursor + dur === 16)
        ? fullDurSec + 0.65
        : fullDurSec * 0.93;
      cursor += dur;

      if (pitch === 'R') return;

      const concertMidi = midi(pitch) + voice.semitonesToConcert;
      const baseFreq = hz(concertMidi);
      const startSample = Math.floor(noteStartSec * SAMPLE_RATE);
      const endSample = Math.min(NUM_SAMPLES - 1, Math.floor((noteStartSec + soundDurSec) * SAMPLE_RATE));
      const useVib = dur >= 6;

      let phase = 0;
      for (let s = startSample; s <= endSample; s++) {
        const t = (s - startSample) / SAMPLE_RATE;
        // Smooth ADSR envelope
        let env = 1.0;
        if (t < prof.attack) {
          env = t / prof.attack;
        } else if (t > soundDurSec - prof.release) {
          env = Math.max(0, (soundDurSec - t) / prof.release);
        }
        // Subtle decay after initial attack peak
        const sustainShape = 0.85 + 0.15 * Math.exp(-t * 2.5);
        env *= sustainShape * dyn;

        const vib = useVib && t > 0.12
          ? 1 + prof.vibDepth * Math.sin(2 * Math.PI * prof.vibRate * (t - 0.12))
          : 1;
        const instFreq = baseFreq * vib;
        phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

        let sample = 0;
        for (let h = 0; h < weights.length; h++) {
          const hFreq = instFreq * (h + 1);
          if (hFreq < SAMPLE_RATE * 0.45) {
            sample += weights[h] * Math.sin(phase * (h + 1));
          }
        }

        leftBuf[s] += sample * env * gainL;
        rightBuf[s] += sample * env * gainR;
      }
    });
  }
});

// Add warm stereo concert-hall comb/allpass reverb
function applyConcertReverb(L, R) {
  const delaysMs = [37, 53, 79, 113];
  const decays = [0.16, 0.12, 0.09, 0.06];
  delaysMs.forEach((ms, idx) => {
    const dSamples = Math.floor((ms / 1000) * SAMPLE_RATE);
    const g = decays[idx];
    for (let i = dSamples; i < NUM_SAMPLES; i++) {
      // Cross-feed slightly between L and R for stereo width
      if (idx % 2 === 0) {
        L[i] += R[i - dSamples] * g;
        R[i] += L[i - dSamples] * g;
      } else {
        L[i] += L[i - dSamples] * g;
        R[i] += R[i - dSamples] * g;
      }
    }
  });
}

applyConcertReverb(leftBuf, rightBuf);

// Normalize to -1.0 dBFS peak so there is zero clipping
let peak = 0;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const aL = Math.abs(leftBuf[i]);
  const aR = Math.abs(rightBuf[i]);
  if (aL > peak) peak = aL;
  if (aR > peak) peak = aR;
}
const norm = peak > 0 ? 0.89 / peak : 1;

// Encode 16-bit Stereo WAV
const numChannels = 2;
const bytesPerSample = 2;
const dataSize = NUM_SAMPLES * numChannels * bytesPerSample;
const wav = Buffer.alloc(44 + dataSize);

wav.write('RIFF', 0);
wav.writeUInt32LE(36 + dataSize, 4);
wav.write('WAVE', 8);
wav.write('fmt ', 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20); // PCM
wav.writeUInt16LE(numChannels, 22);
wav.writeUInt32LE(SAMPLE_RATE, 24);
wav.writeUInt32LE(SAMPLE_RATE * numChannels * bytesPerSample, 28);
wav.writeUInt16LE(numChannels * bytesPerSample, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(dataSize, 40);

let offset = 44;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const sL = Math.max(-1, Math.min(1, leftBuf[i] * norm));
  const sR = Math.max(-1, Math.min(1, rightBuf[i] * norm));
  wav.writeInt16LE(Math.round(sL * 32767), offset);
  wav.writeInt16LE(Math.round(sR * 32767), offset + 2);
  offset += 4;
}

const outSongDir = path.join(__dirname, 'joy-to-the-world-5-piece-quintet.wav');
const outDownloads = 'C:\\Users\\buzzm\\Downloads\\Joy to the World - 5-Piece Bb Quintet.wav';

fs.writeFileSync(outSongDir, wav);
fs.writeFileSync(outDownloads, wav);
console.log(`Rendered ${ (wav.length / (1024 * 1024)).toFixed(2) } MB stereo WAV (${TOTAL_SEC.toFixed(1)}s) to:`);
console.log('  1.', outSongDir);
console.log('  2.', outDownloads);
