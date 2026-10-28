/**
 * Generates publication-ready printable Vector PDFs and PNG page previews
 * for all 6 views of the "Joy to the World" 5-Piece Bb Quintet arrangement:
 *   - sheets/score.pdf (and sheets/quintet-score.pdf) [2 pages: Bars 1-16, Bars 17-28]
 *   - sheets/soprano-sax.pdf [1 page: Bars 1-28]
 *   - sheets/trumpet.pdf     [1 page: Bars 1-28]
 *   - sheets/clarinet-1.pdf  [1 page: Bars 1-28]
 *   - sheets/clarinet-2.pdf  [1 page: Bars 1-28]
 *   - sheets/tenor-sax.pdf   [1 page: Bars 1-28]
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const SONG_DIR = __dirname;
const SHEETS_DIR = path.join(SONG_DIR, 'sheets');

// Load window.ENSEMBLE_SONG from song.js
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(SONG_DIR, 'song.js'), 'utf8'), sandbox);
const S = sandbox.window.ENSEMBLE_SONG;

const PITCH_INDEX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

const DYNAMICS_BY_BAR = {
  1: 'f',
  5: 'mp',
  8: 'f',
  10: 'mp',
  11: 'mf',
  15: 'p',
  16: 'f',
  20: 'mp',
  23: 'f',
  24: 'ff'
};

function findChrome() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('Could not find Chrome or Edge for headless PDF rendering');
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parsePitch(p) {
  return {
    letter: p[0],
    sharp: p.includes('#'),
    flat: p.includes('b'),
    octave: +p.at(-1)
  };
}

function formatPitch(p) {
  return p.replace('#', '♯').replace('b', '♭');
}

function yFor(p, base, clef = 'treble', staffStepPx = 5) {
  const q = parsePitch(p);
  const step = q.octave * 7 + PITCH_INDEX[q.letter];
  const refStep = clef === 'bass' ? (2 * 7 + PITCH_INDEX.G) : (4 * 7 + PITCH_INDEX.E);
  return base + 4 * staffStepPx - (step - refStep) * staffStepPx;
}

function keySigY(acc, clef, base) {
  const mapTreble = { 'F#': base - 20, 'C#': base - 5, 'G#': base - 25, 'Bb': base, 'Eb': base - 15, 'Ab': base + 5, 'Db': base - 10 };
  const mapBass = { 'F#': base - 10, 'C#': base + 5, 'G#': base - 15, 'Bb': base + 10, 'Eb': base - 5, 'Ab': base + 15, 'Db': base };
  return (clef === 'bass' ? mapBass[acc] : mapTreble[acc]) ?? (base - 10);
}

function renderBarNotesSvg({ bar, start, usable, base, clef, keySig, compact = false, showLabels = true }) {
  let out = '';
  let cursor = 0;
  const barMeta = bar.map(([pitch, dur], ni) => {
    const x = start + (cursor + dur / 2) / S.unitsPerBar * usable;
    const y = pitch === 'R' ? base : yFor(pitch, base, clef);
    const startUnit = cursor;
    cursor += dur;
    return { pitch, dur, x, y, startUnit, ni, beamed: false, up: y >= base };
  });

  const beatSize = S.beatUnit;
  let i = 0;
  while (i < barMeta.length) {
    if (barMeta[i].pitch !== 'R' && barMeta[i].dur <= 3) {
      const beatBucket = Math.floor(barMeta[i].startUnit / beatSize);
      const group = [barMeta[i]];
      let j = i + 1;
      while (
        j < barMeta.length &&
        barMeta[j].pitch !== 'R' &&
        barMeta[j].dur <= 3 &&
        Math.floor(barMeta[j].startUnit / beatSize) === beatBucket
      ) {
        group.push(barMeta[j]);
        j++;
      }
      if (group.length >= 2) {
        const avgY = group.reduce((sum, n) => sum + n.y, 0) / group.length;
        const up = avgY >= base;
        const stemLen = compact ? 23 : 29;
        group.forEach(n => {
          n.beamed = true;
          n.up = up;
          n.stemX = n.x + (up ? (compact ? 4.8 : 5.5) : (compact ? -4.8 : -5.5));
          n.stemEnd = n.y + (up ? -stemLen : stemLen);
        });
        const first = group[0];
        const last = group[group.length - 1];
        group.forEach(n => {
          const t = last.stemX === first.stemX ? 0 : (n.stemX - first.stemX) / (last.stemX - first.stemX);
          n.stemEnd = first.stemEnd + t * (last.stemEnd - first.stemEnd);
        });
        out += `<line x1="${first.stemX.toFixed(1)}" y1="${first.stemEnd.toFixed(1)}" x2="${last.stemX.toFixed(1)}" y2="${last.stemEnd.toFixed(1)}" stroke="#141c18" stroke-width="${compact ? 3.2 : 3.8}" stroke-linecap="round"/>`;
        // Secondary 16th beam for adjacent dur === 1 notes inside the group
        for (let k = 0; k < group.length - 1; k++) {
          if (group[k].dur === 1 && group[k + 1].dur === 1) {
            const dy = up ? 5 : -5;
            out += `<line x1="${group[k].stemX.toFixed(1)}" y1="${(group[k].stemEnd + dy).toFixed(1)}" x2="${group[k + 1].stemX.toFixed(1)}" y2="${(group[k + 1].stemEnd + dy).toFixed(1)}" stroke="#141c18" stroke-width="${compact ? 2.6 : 3.1}" stroke-linecap="round"/>`;
          } else if (group[k + 1].dur === 1 && group[k].dur === 3) {
            // Dotted 8th + 16th partial beam stub on the 16th note
            const dy = up ? 5 : -5;
            const stubX = group[k + 1].stemX - 7;
            const slope = (last.stemEnd - first.stemEnd) / ((last.stemX - first.stemX) || 1);
            const stubY = group[k + 1].stemEnd + dy - slope * 7;
            out += `<line x1="${stubX.toFixed(1)}" y1="${stubY.toFixed(1)}" x2="${group[k + 1].stemX.toFixed(1)}" y2="${(group[k + 1].stemEnd + dy).toFixed(1)}" stroke="#141c18" stroke-width="${compact ? 2.6 : 3.1}" stroke-linecap="round"/>`;
          }
        }
      }
      i = j;
    } else {
      i++;
    }
  }

  barMeta.forEach(meta => {
    const { pitch, dur, x, y } = meta;
    if (pitch === 'R') {
      if (dur >= 16) {
        out += `<rect x="${(x - 6).toFixed(1)}" y="${(base - 10).toFixed(1)}" width="12" height="5" fill="#141c18"/>`;
      } else if (dur >= 8) {
        out += `<rect x="${(x - 6).toFixed(1)}" y="${(base - 5).toFixed(1)}" width="12" height="5" fill="#141c18"/>`;
      } else {
        out += `<text x="${x.toFixed(1)}" y="${(base + 6).toFixed(1)}" font-size="${compact ? 19 : 22}" text-anchor="middle" fill="#141c18">${dur <= 2 ? '𝄾' : '𝄽'}</text>`;
      }
      return;
    }

    const q = parsePitch(pitch);
    // Accidentals relative to key signature (F major has Bb)
    if (q.sharp && !keySig.includes(`${q.letter}#`)) {
      out += `<text x="${(x - 11.5).toFixed(1)}" y="${(y + 4.5).toFixed(1)}" font-size="${compact ? 13 : 15}" fill="#141c18">♯</text>`;
    } else if (q.flat && !keySig.includes(`${q.letter}b`)) {
      out += `<text x="${(x - 11.5).toFixed(1)}" y="${(y + 4.5).toFixed(1)}" font-size="${compact ? 13 : 15}" fill="#141c18">♭</text>`;
    } else if (!q.flat && !q.sharp && keySig.includes(`${q.letter}b`)) {
      out += `<text x="${(x - 11).toFixed(1)}" y="${(y + 4.5).toFixed(1)}" font-size="${compact ? 13 : 15}" fill="#141c18">♮</text>`;
    }

    // Ledger lines above and below staff
    for (let ly = base - 30; ly >= y; ly -= 10) {
      out += `<line x1="${(x - 8.5).toFixed(1)}" y1="${ly}" x2="${(x + 8.5).toFixed(1)}" y2="${ly}" stroke="#141c18" stroke-width="1.2"/>`;
    }
    for (let ly = base + 30; ly <= y; ly += 10) {
      out += `<line x1="${(x - 8.5).toFixed(1)}" y1="${ly}" x2="${(x + 8.5).toFixed(1)}" y2="${ly}" stroke="#141c18" stroke-width="1.2"/>`;
    }

    const openHead = dur >= 8;
    const rx = compact ? 5.6 : 6.4;
    const ry = compact ? 3.9 : 4.5;
    out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(-18 ${x.toFixed(1)} ${y.toFixed(1)})" fill="${openHead ? '#ffffff' : '#141c18'}" stroke="#141c18" stroke-width="${openHead ? 1.8 : 1.1}"/>`;

    if (dur < 16) {
      const up = meta.beamed ? meta.up : (y >= base);
      const stemLen = compact ? 23 : 29;
      const stemX = meta.beamed ? meta.stemX : (x + (up ? (compact ? 4.8 : 5.5) : (compact ? -4.8 : -5.5)));
      const stemEnd = meta.beamed ? meta.stemEnd : (y + (up ? -stemLen : stemLen));
      out += `<line x1="${stemX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${stemX.toFixed(1)}" y2="${stemEnd.toFixed(1)}" stroke="#141c18" stroke-width="1.5"/>`;

      if (dur <= 3 && !meta.beamed) {
        const flagPath = up
          ? `M${stemX.toFixed(1)} ${stemEnd.toFixed(1)} q10 5.5 4.5 14`
          : `M${stemX.toFixed(1)} ${stemEnd.toFixed(1)} q10 -5.5 4.5 -14`;
        out += `<path d="${flagPath}" fill="none" stroke="#141c18" stroke-width="1.8" stroke-linecap="round"/>`;
      }
      if (dur === 1 && !meta.beamed) {
        const flag2Y = stemEnd + (up ? 5.5 : -5.5);
        const flag2Path = up
          ? `M${stemX.toFixed(1)} ${flag2Y.toFixed(1)} q10 5.5 4.5 14`
          : `M${stemX.toFixed(1)} ${flag2Y.toFixed(1)} q10 -5.5 4.5 -14`;
        out += `<path d="${flag2Path}" fill="none" stroke="#141c18" stroke-width="1.8" stroke-linecap="round"/>`;
      }
    }

    if (dur === 12 || dur === 6 || dur === 3) {
      out += `<circle cx="${(x + 9.5).toFixed(1)}" cy="${(y - 1).toFixed(1)}" r="1.8" fill="#141c18"/>`;
    }

    if (showLabels) {
      const labelY = compact ? Math.max(base + 32, y + 11) : Math.max(base + 45, y + 14.5);
      out += `<text x="${x.toFixed(1)}" y="${labelY.toFixed(1)}" font-family="Arial, sans-serif" font-size="${compact ? 7.5 : 8.6}" font-weight="700" fill="#526058" text-anchor="middle">${esc(formatPitch(pitch))}</text>`;
    }
  });

  return out;
}

function buildSinglePartHtml(part) {
  const bars = part.bars;
  const clef = part.clef === 'bass' ? 'bass' : 'treble';
  const keySig = part.keySignature || ['Bb'];
  const systems = Math.ceil(bars.length / 4); // 7 systems
  const systemGap = 138;
  const svgHeight = 34 + systems * systemGap;
  const left = 26;
  const width = 1028;
  const barW = width / 4;

  let svgBody = '';

  bars.forEach((bar, bi) => {
    const sys = Math.floor(bi / 4);
    const slot = bi % 4;
    const top = 16 + sys * systemGap;
    const base = top + 50;
    const bx = left + slot * barW;
    const barsInSys = Math.min(4, bars.length - sys * 4);
    const sysWidth = barsInSys * barW;

    if (slot === 0) {
      for (let l = 0; l < 5; l++) {
        const ly = base - 20 + l * 10;
        svgBody += `<line x1="${left}" y1="${ly}" x2="${left + sysWidth}" y2="${ly}" stroke="#222c27" stroke-width="1.15"/>`;
      }
      const clefGlyph = clef === 'bass' ? '𝄢' : '𝄞';
      const clefY = clef === 'bass' ? base + 10 : base + 15;
      const clefSize = clef === 'bass' ? 38 : 50;
      svgBody += `<text x="${left + 4}" y="${clefY}" font-size="${clefSize}" font-family="Georgia, serif" fill="#141c18">${clefGlyph}</text>`;

      keySig.forEach((acc, i) => {
        svgBody += `<text x="${left + 40 + i * 10}" y="${keySigY(acc, clef, base) + 5}" font-size="16" fill="#141c18">${acc.includes('#') ? '♯' : '♭'}</text>`;
      });

      if (sys === 0) {
        const timeX = left + 52 + keySig.length * 10;
        svgBody += `<text x="${timeX}" y="${base - 2}" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#141c18">${S.time[0]}</text>`;
        svgBody += `<text x="${timeX}" y="${base + 15}" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#141c18">${S.time[1]}</text>`;
      }
    }

    // Measure barline & number
    svgBody += `<line x1="${bx}" y1="${base - 20}" x2="${bx}" y2="${base + 20}" stroke="#141c18" stroke-width="${slot === 0 ? 1.8 : 1.2}"/>`;
    svgBody += `<text x="${bx + (slot === 0 ? 2 : 5)}" y="${base - 27}" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#49564f">${bi + 1}</text>`;

    // Rehearsal mark
    const mark = S.rehearsalMarks[bi + 1];
    if (mark) {
      const label = mark === 'Intro' ? 'Intro (Fanfare)' : mark;
      const w = label.length > 2 ? label.length * 6.8 + 10 : 22;
      const rx = bx + (slot === 0 ? 20 : 22);
      svgBody += `<rect x="${rx}" y="${base - 41}" width="${w}" height="16" rx="3" fill="#141c18" stroke="#141c18"/>`;
      svgBody += `<text x="${rx + w / 2}" y="${base - 29.5}" font-family="Arial, sans-serif" font-size="10.5" font-weight="800" fill="#ffffff" text-anchor="middle">${esc(label)}</text>`;
    }

    // Dynamic marking below staff
    const dyn = DYNAMICS_BY_BAR[bi + 1];
    if (dyn) {
      const dx = bx + (slot === 0 ? 52 : 12);
      svgBody += `<text x="${dx}" y="${base + 58}" font-family="Georgia, serif" font-size="13" font-weight="bold" font-style="italic" fill="#141c18">${dyn}</text>`;
    }

    const lead = slot === 0 ? (58 + keySig.length * 10 + (sys === 0 ? 18 : 0)) : 16;
    const start = bx + lead;
    const usable = barW - lead - 12;

    svgBody += renderBarNotesSvg({
      bar,
      start,
      usable,
      base,
      clef,
      keySig,
      compact: false,
      showLabels: true
    });

    if (bi === bars.length - 1 || slot === barsInSys - 1) {
      svgBody += `<line x1="${bx + barW}" y1="${base - 20}" x2="${bx + barW}" y2="${base + 20}" stroke="#141c18" stroke-width="1.4"/>`;
    }
    if (bi === bars.length - 1) {
      svgBody += `<line x1="${bx + barW - 4.5}" y1="${base - 20}" x2="${bx + barW - 4.5}" y2="${base + 20}" stroke="#141c18" stroke-width="1.2"/>`;
      svgBody += `<line x1="${bx + barW}" y1="${base - 20}" x2="${bx + barW}" y2="${base + 20}" stroke="#141c18" stroke-width="3.6"/>`;
    }
  });

  const concertNote = part.semitonesToConcert === -14
    ? 'Written F Major · Sounds Concert E♭ Major (1 octave + whole step lower)'
    : 'Written F Major (1 Flat: B♭) · Sounds Concert E♭ Major';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(S.title)} - ${esc(part.name)}</title>
<style>
  @page {
    size: letter portrait;
    margin: 0;
  }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #141c18;
    font-family: Georgia, serif;
  }
  .sheet-page {
    width: 8.5in;
    height: 11in;
    padding: 0.36in 0.42in 0.32in;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background: #ffffff;
  }
  .top-header {
    display: grid;
    grid-template-columns: 1.15fr 1.5fr 1fr;
    align-items: start;
    gap: 10px;
    padding-bottom: 8px;
    border-bottom: 2px solid #141c18;
  }
  .part-box {
    display: inline-block;
    border: 2px solid #141c18;
    border-radius: 6px;
    padding: 5px 10px;
    background: #f8f5ec;
  }
  .part-box .instrument {
    font: 800 13.5px Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #141c18;
  }
  .part-box .role {
    font: 700 9.5px Arial, sans-serif;
    color: #8c371e;
    margin-top: 2px;
  }
  .part-box .transp {
    font: 600 8.8px Arial, sans-serif;
    color: #38463f;
    margin-top: 1px;
  }
  .title-block {
    text-align: center;
  }
  .title-block h1 {
    margin: 0;
    font: 700 26px/1.05 Georgia, serif;
    letter-spacing: -0.02em;
  }
  .title-block .sub {
    margin: 3px 0 0;
    font: italic 11.5px Georgia, serif;
    color: #3d4b44;
  }
  .title-block .arr {
    margin: 2px 0 0;
    font: 700 9.5px Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #1f332b;
  }
  .meta-right {
    text-align: right;
    font-family: Arial, sans-serif;
  }
  .meta-right .composer {
    font: 700 11px Georgia, serif;
  }
  .meta-right .arranger {
    font: italic 10px Georgia, serif;
    color: #46544d;
    margin-top: 1px;
  }
  .meta-right .tempo-pill {
    display: inline-block;
    margin-top: 5px;
    padding: 3px 8px;
    border: 1px solid #141c18;
    border-radius: 99px;
    font: 800 10px Arial, sans-serif;
    background: #f8f5ec;
  }
  .svg-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4px 0;
  }
  svg {
    width: 100%;
    height: auto;
    max-height: 9.25in;
    display: block;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 5px;
    border-top: 1px solid #b9b2a0;
    font: 600 8.8px Arial, sans-serif;
    color: #4c5852;
  }
</style>
</head>
<body>
  <div class="sheet-page">
    <header class="top-header">
      <div>
        <div class="part-box">
          <div class="instrument">${esc(part.name)}</div>
          <div class="role">${esc(part.skill)} · ${esc(part.badge.split('·').pop().trim())} (${esc(part.range)})</div>
          <div class="transp">${esc(concertNote)}</div>
        </div>
      </div>
      <div class="title-block">
        <h1>${esc(S.title)}</h1>
        <div class="sub">Freue dich Welt! · Traditional Christmas Carol</div>
        <div class="arr">5-Piece B♭ Quintet Edition (Soprano Sax, Trumpet, 2 Clarinets, Tenor Sax)</div>
      </div>
      <div class="meta-right">
        <div class="composer">G. F. Handel</div>
        <div class="arranger">arr. A. Perebikovski · B♭ Quintet</div>
        <div class="tempo-pill">Moderato · ♩ = ${S.tempo} · 4/4</div>
      </div>
    </header>

    <div class="svg-container">
      <svg viewBox="0 0 1080 ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        ${svgBody}
      </svg>
    </div>

    <footer class="footer">
      <span><strong>${esc(part.name)}</strong> — ${esc(part.detail)}</span>
      <span>Joy to the World · 5-Piece B♭ Quintet · Page 1 of 1</span>
    </footer>
  </div>
</body>
</html>`;
}

function buildScoreSystemsSvg(startSys, endSys) {
  const barsPerSys = 4;
  const totalBars = 28;
  const sysCount = endSys - startSys;
  const voiceGap = 54;
  const systemHeight = S.voices.length * voiceGap + 42;
  const svgHeight = 14 + sysCount * systemHeight;
  const left = 74;
  const width = 988;
  const barW = width / barsPerSys;

  let out = '';

  for (let sys = startSys; sys < endSys; sys++) {
    const localSys = sys - startSys;
    const sysTop = 18 + localSys * systemHeight;
    const firstStaffBase = sysTop + 26;
    const lastStaffBase = firstStaffBase + (S.voices.length - 1) * voiceGap;

    for (let slot = 0; slot < barsPerSys; slot++) {
      const bi = sys * barsPerSys + slot;
      if (bi >= totalBars) break;
      const bx = left + slot * barW;

      // Measure number
      out += `<text x="${bx + 4}" y="${firstStaffBase - 25}" font-family="Arial, sans-serif" font-size="9.5" font-weight="800" fill="#3a4740">Bar ${bi + 1}</text>`;

      // Rehearsal mark
      const mark = S.rehearsalMarks[bi + 1];
      if (mark) {
        const label = mark === 'Intro' ? 'Intro' : mark;
        const w = label.length > 1 ? label.length * 6.8 + 10 : 20;
        out += `<rect x="${bx + 44}" y="${firstStaffBase - 37}" width="${w}" height="15" rx="3" fill="#141c18"/>`;
        out += `<text x="${bx + 44 + w / 2}" y="${firstStaffBase - 26}" font-family="Arial, sans-serif" font-size="9.5" font-weight="800" fill="#ffffff" text-anchor="middle">${esc(label)}</text>`;
      }

      const lead = slot === 0 ? 64 : 13;
      const start = bx + lead;
      const usable = barW - lead - 9;

      S.voices.forEach((voice, vi) => {
        const base = firstStaffBase + vi * voiceGap;
        const keySig = voice.keySignature || ['Bb'];

        if (slot === 0) {
          out += `<text x="${left - 8}" y="${base + 3}" font-family="Arial, sans-serif" font-size="10" font-weight="800" fill="#141c18" text-anchor="end">${esc(voice.short)}</text>`;
          for (let l = 0; l < 5; l++) {
            const ly = base - 16 + l * 8;
            out += `<line x1="${left}" y1="${ly}" x2="${left + width}" y2="${ly}" stroke="#222c27" stroke-width="0.95"/>`;
          }
          out += `<text x="${left + 3}" y="${base + 12}" font-size="38" font-family="Georgia, serif" fill="#141c18">𝄞</text>`;
          keySig.forEach((acc, idx) => {
            out += `<text x="${left + 32 + idx * 8}" y="${base + 4}" font-size="13" fill="#141c18">♭</text>`;
          });
          if (sys === 0) {
            out += `<text x="${left + 44}" y="${base - 1}" font-family="Georgia, serif" font-size="12.5" font-weight="bold" fill="#141c18">4</text>`;
            out += `<text x="${left + 44}" y="${base + 11}" font-family="Georgia, serif" font-size="12.5" font-weight="bold" fill="#141c18">4</text>`;
          }
        }

        // Staff barline
        out += `<line x1="${bx}" y1="${base - 16}" x2="${bx}" y2="${base + 16}" stroke="#141c18" stroke-width="1.1"/>`;

        // Render compact notes scaled to 8px line spacing (step=4px)
        out += renderScoreVoiceBarNotes({
          bar: voice.bars[bi],
          start,
          usable,
          base,
          keySig
        });
      });

      // System left bracket
      if (slot === 0) {
        out += `<line x1="${left}" y1="${firstStaffBase - 16}" x2="${left}" y2="${lastStaffBase + 16}" stroke="#141c18" stroke-width="2.6"/>`;
      }
      // System right barline / final double barline
      if (slot === barsPerSys - 1 || bi === totalBars - 1) {
        out += `<line x1="${bx + barW}" y1="${firstStaffBase - 16}" x2="${bx + barW}" y2="${lastStaffBase + 16}" stroke="#141c18" stroke-width="${bi === totalBars - 1 ? 3.2 : 1.3}"/>`;
        if (bi === totalBars - 1) {
          out += `<line x1="${bx + barW - 4}" y1="${firstStaffBase - 16}" x2="${bx + barW - 4}" y2="${lastStaffBase + 16}" stroke="#141c18" stroke-width="1.1"/>`;
        }
      }
    }
  }

  return { svg: out, height: svgHeight };
}

function renderScoreVoiceBarNotes({ bar, start, usable, base, keySig }) {
  let out = '';
  let cursor = 0;
  const stepPx = 4; // 8px between staff lines
  const barMeta = bar.map(([pitch, dur], ni) => {
    const x = start + (cursor + dur / 2) / S.unitsPerBar * usable;
    const y = pitch === 'R' ? base : yFor(pitch, base, 'treble', stepPx);
    const startUnit = cursor;
    cursor += dur;
    return { pitch, dur, x, y, startUnit, ni, beamed: false, up: y >= base };
  });

  const beatSize = S.beatUnit;
  let i = 0;
  while (i < barMeta.length) {
    if (barMeta[i].pitch !== 'R' && barMeta[i].dur <= 3) {
      const beatBucket = Math.floor(barMeta[i].startUnit / beatSize);
      const group = [barMeta[i]];
      let j = i + 1;
      while (
        j < barMeta.length &&
        barMeta[j].pitch !== 'R' &&
        barMeta[j].dur <= 3 &&
        Math.floor(barMeta[j].startUnit / beatSize) === beatBucket
      ) {
        group.push(barMeta[j]);
        j++;
      }
      if (group.length >= 2) {
        const avgY = group.reduce((sum, n) => sum + n.y, 0) / group.length;
        const up = avgY >= base;
        const stemLen = 19;
        group.forEach(n => {
          n.beamed = true;
          n.up = up;
          n.stemX = n.x + (up ? 4.2 : -4.2);
          n.stemEnd = n.y + (up ? -stemLen : stemLen);
        });
        const first = group[0];
        const last = group[group.length - 1];
        group.forEach(n => {
          const t = last.stemX === first.stemX ? 0 : (n.stemX - first.stemX) / (last.stemX - first.stemX);
          n.stemEnd = first.stemEnd + t * (last.stemEnd - first.stemEnd);
        });
        out += `<line x1="${first.stemX.toFixed(1)}" y1="${first.stemEnd.toFixed(1)}" x2="${last.stemX.toFixed(1)}" y2="${last.stemEnd.toFixed(1)}" stroke="#141c18" stroke-width="2.6" stroke-linecap="round"/>`;
      }
      i = j;
    } else {
      i++;
    }
  }

  barMeta.forEach(meta => {
    const { pitch, dur, x, y } = meta;
    if (pitch === 'R') {
      if (dur >= 16) {
        out += `<rect x="${(x - 5).toFixed(1)}" y="${(base - 8).toFixed(1)}" width="10" height="4" fill="#141c18"/>`;
      } else if (dur >= 8) {
        out += `<rect x="${(x - 5).toFixed(1)}" y="${(base - 4).toFixed(1)}" width="10" height="4" fill="#141c18"/>`;
      } else {
        out += `<text x="${x.toFixed(1)}" y="${(base + 5).toFixed(1)}" font-size="15" text-anchor="middle" fill="#141c18">${dur <= 2 ? '𝄾' : '𝄽'}</text>`;
      }
      return;
    }

    const q = parsePitch(pitch);
    if (q.sharp && !keySig.includes(`${q.letter}#`)) {
      out += `<text x="${(x - 9.5).toFixed(1)}" y="${(y + 3.5).toFixed(1)}" font-size="11" fill="#141c18">♯</text>`;
    } else if (q.flat && !keySig.includes(`${q.letter}b`)) {
      out += `<text x="${(x - 9.5).toFixed(1)}" y="${(y + 3.5).toFixed(1)}" font-size="11" fill="#141c18">♭</text>`;
    } else if (!q.flat && !q.sharp && keySig.includes(`${q.letter}b`)) {
      out += `<text x="${(x - 9).toFixed(1)}" y="${(y + 3.5).toFixed(1)}" font-size="11" fill="#141c18">♮</text>`;
    }

    for (let ly = base - 24; ly >= y; ly -= 8) {
      out += `<line x1="${(x - 7).toFixed(1)}" y1="${ly}" x2="${(x + 7).toFixed(1)}" y2="${ly}" stroke="#141c18" stroke-width="1"/>`;
    }
    for (let ly = base + 24; ly <= y; ly += 8) {
      out += `<line x1="${(x - 7).toFixed(1)}" y1="${ly}" x2="${(x + 7).toFixed(1)}" y2="${ly}" stroke="#141c18" stroke-width="1"/>`;
    }

    const openHead = dur >= 8;
    out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="4.7" ry="3.3" transform="rotate(-18 ${x.toFixed(1)} ${y.toFixed(1)})" fill="${openHead ? '#ffffff' : '#141c18'}" stroke="#141c18" stroke-width="${openHead ? 1.5 : 1}"/>`;

    if (dur < 16) {
      const up = meta.beamed ? meta.up : (y >= base);
      const stemLen = 19;
      const stemX = meta.beamed ? meta.stemX : (x + (up ? 4.2 : -4.2));
      const stemEnd = meta.beamed ? meta.stemEnd : (y + (up ? -stemLen : stemLen));
      out += `<line x1="${stemX.toFixed(1)}" y1="${y.toFixed(1)}" x2="${stemX.toFixed(1)}" y2="${stemEnd.toFixed(1)}" stroke="#141c18" stroke-width="1.25"/>`;

      if (dur <= 3 && !meta.beamed) {
        const flagPath = up
          ? `M${stemX.toFixed(1)} ${stemEnd.toFixed(1)} q8 4.5 3.5 11`
          : `M${stemX.toFixed(1)} ${stemEnd.toFixed(1)} q8 -4.5 3.5 -11`;
        out += `<path d="${flagPath}" fill="none" stroke="#141c18" stroke-width="1.4" stroke-linecap="round"/>`;
      }
    }

    if (dur === 12 || dur === 6 || dur === 3) {
      out += `<circle cx="${(x + 7.8).toFixed(1)}" cy="${(y - 1).toFixed(1)}" r="1.5" fill="#141c18"/>`;
    }
  });

  return out;
}

function buildFullScoreHtml({ singlePageIndex = null } = {}) {
  const page1 = buildScoreSystemsSvg(0, 4); // Bars 1-16
  const page2 = buildScoreSystemsSvg(4, 7); // Bars 17-28

  const page1Html = `
  <div class="sheet-page">
    <header class="top-header">
      <div>
        <div class="part-box">
          <div class="instrument">FULL 5-PART B♭ SCORE</div>
          <div class="role">Soprano Sax · Trumpet · Clarinet 1 &amp; 2 · Tenor Sax</div>
          <div class="transp">All Staves Written F Major (Sounds Concert E♭)</div>
        </div>
      </div>
      <div class="title-block">
        <h1>${esc(S.title)}</h1>
        <div class="sub">Freue dich Welt! · 5-Piece B♭ Quintet Conductor Score</div>
        <div class="arr">Bars 1–16: Opening Fanfare, Echo &amp; [A] Lyrical Duet</div>
      </div>
      <div class="meta-right">
        <div class="composer">G. F. Handel</div>
        <div class="arranger">arr. A. Perebikovski · B♭ Quintet</div>
        <div class="tempo-pill">Moderato · ♩ = ${S.tempo} · 4/4</div>
      </div>
    </header>
    <div class="svg-container">
      <svg viewBox="0 0 1080 ${page1.height}" xmlns="http://www.w3.org/2000/svg">
        ${page1.svg}
      </svg>
    </div>
    <footer class="footer">
      <span><strong>Full 5-Part B♭ Quintet Score</strong> — Soprano Sax (Lead/Solo), Trumpet (Co-Lead/Harm), Clarinet 1 &amp; 2 (Counterlines), Tenor Sax (Bass)</span>
      <span>Joy to the World · Conductor Score · Page 1 of 2 (Bars 1–16)</span>
    </footer>
  </div>`;

  const page2Html = `
  <div class="sheet-page">
    <header class="top-header" style="padding-bottom:6px">
      <div>
        <div class="part-box">
          <div class="instrument">FULL 5-PART B♭ SCORE · PAGE 2</div>
          <div class="role">Bars 17–28 · [B] Tutti Return &amp; Grand Coda</div>
        </div>
      </div>
      <div class="title-block">
        <h1 style="font-size:22px">${esc(S.title)} (cont.)</h1>
        <div class="arr">Bars 17–28: [B] Full Ensemble Return &amp; High A5 Coda Finale</div>
      </div>
      <div class="meta-right">
        <div class="tempo-pill">Moderato · ♩ = ${S.tempo} · 4/4</div>
      </div>
    </header>
    <div class="svg-container" style="align-items:flex-start;padding-top:10px">
      <svg viewBox="0 0 1080 ${page2.height}" xmlns="http://www.w3.org/2000/svg">
        ${page2.svg}
      </svg>
    </div>
    <footer class="footer">
      <span><strong>Rehearsal Notes:</strong> At Coda (Bar 24), Soprano Sax ascends to high A5–G5–F5 while Clarinet 1 climbs D♭5–E♭5–F5 and Tenor Sax anchors low F4.</span>
      <span>Joy to the World · Conductor Score · Page 2 of 2 (Bars 17–28)</span>
    </footer>
  </div>`;

  const bodyPages = singlePageIndex === 1
    ? page1Html
    : singlePageIndex === 2
      ? page2Html
      : (page1Html + '\n' + page2Html);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(S.title)} - Full 5-Part Score</title>
<style>
  @page {
    size: letter portrait;
    margin: 0;
  }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #141c18;
    font-family: Georgia, serif;
  }
  .sheet-page {
    width: 8.5in;
    height: 11in;
    padding: 0.32in 0.38in 0.28in;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background: #ffffff;
    page-break-after: always;
  }
  .sheet-page:last-child {
    page-break-after: auto;
  }
  .top-header {
    display: grid;
    grid-template-columns: 1.15fr 1.5fr 0.95fr;
    align-items: start;
    gap: 8px;
    padding-bottom: 6px;
    border-bottom: 2px solid #141c18;
  }
  .part-box {
    display: inline-block;
    border: 2px solid #141c18;
    border-radius: 6px;
    padding: 4px 9px;
    background: #f8f5ec;
  }
  .part-box .instrument {
    font: 800 12.5px Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .part-box .role {
    font: 700 9px Arial, sans-serif;
    color: #8c371e;
    margin-top: 1px;
  }
  .part-box .transp {
    font: 600 8.5px Arial, sans-serif;
    color: #38463f;
    margin-top: 1px;
  }
  .title-block { text-align: center; }
  .title-block h1 { margin: 0; font: 700 24px/1.05 Georgia, serif; }
  .title-block .sub { margin: 2px 0 0; font: italic 10.5px Georgia, serif; color: #3d4b44; }
  .title-block .arr { margin: 2px 0 0; font: 700 9px Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.07em; color: #1f332b; }
  .meta-right { text-align: right; font-family: Arial, sans-serif; }
  .meta-right .composer { font: 700 10.5px Georgia, serif; }
  .meta-right .arranger { font: italic 9.5px Georgia, serif; color: #46544d; }
  .meta-right .tempo-pill {
    display: inline-block;
    margin-top: 4px;
    padding: 2px 8px;
    border: 1px solid #141c18;
    border-radius: 99px;
    font: 800 9.5px Arial, sans-serif;
    background: #f8f5ec;
  }
  .svg-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2px 0;
  }
  svg {
    width: 100%;
    height: auto;
    max-height: 9.45in;
    display: block;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 4px;
    border-top: 1px solid #b9b2a0;
    font: 600 8.5px Arial, sans-serif;
    color: #4c5852;
  }
</style>
</head>
<body>
${bodyPages}
</body>
</html>`;
}

function renderHtmlToPdf(chromeBin, htmlContent, pdfOutPath) {
  const tmpHtml = path.join(SHEETS_DIR, `_tmp_${ path.basename(pdfOutPath, '.pdf') }.html`);
  fs.writeFileSync(tmpHtml, htmlContent, 'utf8');
  const fileUrl = 'file:///' + tmpHtml.replace(/\\/g, '/');
  try {
    execFileSync(chromeBin, [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfOutPath}`,
      fileUrl
    ], { stdio: 'pipe' });
  } finally {
    if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);
  }
}

function renderHtmlToPng(chromeBin, htmlContent, pngOutPath) {
  const tmpHtml = path.join(SHEETS_DIR, `_tmp_img_${ path.basename(pngOutPath, '.png') }.html`);
  fs.writeFileSync(tmpHtml, htmlContent, 'utf8');
  const fileUrl = 'file:///' + tmpHtml.replace(/\\/g, '/');
  try {
    execFileSync(chromeBin, [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=816,1056',
      '--force-device-scale-factor=2',
      `--screenshot=${pngOutPath}`,
      fileUrl
    ], { stdio: 'pipe' });
  } finally {
    if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);
  }
}

function main() {
  const chromeBin = findChrome();
  console.log('Using browser for PDF/PNG engraving:', chromeBin);

  // 1. Render Full 5-Part Score PDF (2 pages) + Page 1 & 2 PNGs
  const scoreHtml = buildFullScoreHtml();
  const scorePdfPath = path.join(SHEETS_DIR, 'score.pdf');
  const quintetScorePdfPath = path.join(SHEETS_DIR, 'quintet-score.pdf');
  renderHtmlToPdf(chromeBin, scoreHtml, scorePdfPath);
  fs.copyFileSync(scorePdfPath, quintetScorePdfPath);
  console.log('✓ Generated Full Score PDF:', scorePdfPath);

  renderHtmlToPng(chromeBin, buildFullScoreHtml({ singlePageIndex: 1 }), path.join(SHEETS_DIR, 'quintet-score-1.png'));
  renderHtmlToPng(chromeBin, buildFullScoreHtml({ singlePageIndex: 2 }), path.join(SHEETS_DIR, 'quintet-score-2.png'));
  console.log('✓ Generated Full Score PNG pages: quintet-score-1.png, quintet-score-2.png');

  // 2. Render each of the 5 individual instrument part PDFs (1 page each) + PNGs
  for (const part of S.parts) {
    if (part.id === 'score') continue;
    const html = buildSinglePartHtml(part);
    const pdfPath = path.join(SHEETS_DIR, `${part.id}.pdf`);
    const pngPath = path.join(SHEETS_DIR, `${part.id}.png`);
    renderHtmlToPdf(chromeBin, html, pdfPath);
    renderHtmlToPng(chromeBin, html, pngPath);
    console.log(`✓ Generated ${part.name} PDF & PNG: ${pdfPath}`);
  }
}

main();
