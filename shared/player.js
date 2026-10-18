(() => {
  // Dynamically load shared catalog navigation if not already loaded
  if (!window.SONG_CATALOG) {
    const sc = document.createElement('script');
    sc.src = '../../../shared/catalog.js';
    document.head.append(sc);
  }

  const s = window.SONG;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.querySelector('#sheet');
  const noteEls = [];
  const barBoxEls = [];
  const $ = id => document.getElementById(id);
  const pitchIndex = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const semis = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const NOTE_NAMES_SHARP = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  const NOTE_NAMES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

  document.title = `${s.title} - Tenor Sax Play-Along`;
  $('title').textContent = s.title;
  $('subtitle').textContent = s.subtitle;
  $('badge').textContent = `B♭ Tenor Sax · ${s.level} · ${s.time[0]}/${s.time[1]}`;
  $('counting').innerHTML = s.counting;
  $('transposition').textContent = `The written ${s.writtenKey} part sounds in concert ${s.concertKey}. Play the notes as shown; the backing is already transposed. Click any bar or note to practice from there.`;
  $('status').textContent = `Ready · Written ${s.writtenKey}`;

  const tempo = $('tempo');
  tempo.min = s.tempoRange[0];
  tempo.max = s.tempoRange[1];
  tempo.value = s.tempo;
  $('tempoValue').textContent = `${s.tempo} BPM`;

  let currentBar = 0;
  let playing = false;
  let paused = false;
  let audio = null;
  let timers = [];

  // Inject Phrase / Section Selector into .controls
  const controls = document.querySelector('.controls');
  const phraseLabel = document.createElement('label');
  phraseLabel.innerHTML = `Section <select id="phraseSelect" class="phrase-select" aria-label="Select bars to practice"></select>`;
  const loopLabel = $('loop')?.closest('label');
  if (loopLabel) {
    controls.insertBefore(phraseLabel, loopLabel);
  } else {
    controls.append(phraseLabel);
  }
  const phraseSelect = $('phraseSelect');

  function buildPhraseOptions() {
    const total = s.bars.length;
    const opts = [{ value: `1-${total}`, label: `All Bars (1–${total})` }];
    if (total === 24) {
      opts.push({ value: '1-12', label: 'Chorus 1: Melody (1–12)' });
      opts.push({ value: '13-24', label: 'Chorus 2: Solo (13–24)' });
    } else if (total >= 8) {
      const half = Math.floor(total / 2);
      opts.push({ value: `1-${half}`, label: `First Half (1–${half})` });
      opts.push({ value: `${half + 1}-${total}`, label: `Second Half (${half + 1}–${total})` });
    }
    for (let start = 1; start <= total; start += 4) {
      const end = Math.min(total, start + 3);
      opts.push({ value: `${start}-${end}`, label: `Bars ${start}–${end}` });
    }
    opts.forEach(o => {
      const elOpt = document.createElement('option');
      elOpt.value = o.value;
      elOpt.textContent = o.label;
      phraseSelect.append(elOpt);
    });
  }
  buildPhraseOptions();

  function getPhraseRange() {
    const [a, b] = (phraseSelect.value || `1-${s.bars.length}`).split('-').map(Number);
    return { startBar: (a || 1) - 1, endBar: (b || s.bars.length) - 1 };
  }

  // Inject Dockable Live Fingering HUD above .sheet-wrap
  const sheetWrap = document.querySelector('.sheet-wrap');
  const liveHud = document.createElement('section');
  liveHud.className = 'live-finger-hud';
  liveHud.setAttribute('aria-label', 'Live Tenor Saxophone Fingering Guide');
  liveHud.innerHTML = `
    <div class="hud-Current">
      <div class="hud-pitch-box">
        <strong id="hudNote">—</strong>
        <span id="hudConcert">Written ${s.writtenKey}</span>
      </div>
      <div class="hud-diagram">
        <span>Left</span>
        <span class="hud-hand" id="hudLeft"></span>
        <span>Right</span>
        <span class="hud-hand" id="hudRight"></span>
        <span class="hud-oct" id="hudOct">OCT</span>
        <span class="hud-mod" id="hudMod">Click any note or press Play</span>
      </div>
    </div>
    <div class="hud-right">
      <span class="hud-next" id="hudNext">Next: —</span>
      <span>Click any measure to seek · Click any note to hear pitch</span>
    </div>
  `;
  sheetWrap.parentNode.insertBefore(liveHud, sheetWrap);

  function el(name, attrs = {}, text = '') {
    const n = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (text) n.textContent = text;
    return n;
  }

  function parts(p) {
    return {
      letter: p[0],
      sharp: p.includes('#'),
      flat: p.includes('b'),
      octave: +p.at(-1)
    };
  }

  function midi(p) {
    const q = parts(p);
    return 12 * (q.octave + 1) + semis[q.letter] + (q.sharp ? 1 : 0) - (q.flat ? 1 : 0);
  }

  function formatPitch(p) {
    return p.replace('#', '♯').replace('b', '♭');
  }

  function yFor(p, y) {
    const q = parts(p);
    const step = q.octave * 7 + pitchIndex[q.letter];
    return y + 20 - (step - (4 * 7 + pitchIndex.E)) * 5;
  }

  // Exact staff Y coordinate for Treble Clef key signatures
  function keySigY(acc, base) {
    const map = {
      'F#': base - 20, // Top line F5
      'C#': base - 5,  // Third space C5
      'G#': base - 25, // Space above top line G5
      'Bb': base,      // Middle line B4
      'Eb': base - 15, // Fourth space E5
      'Ab': base + 5   // Second space A4
    };
    return map[acc] ?? (base - 15);
  }

  // Infer chord symbol from MIDI chord array [root, third, fifth, seventh]
  function chordLabel(chord) {
    if (!chord || !chord.length) return null;
    const useSharp = (s.keySignature || []).some(k => k.includes('#')) || s.writtenKey.includes('D') || s.writtenKey.includes('G') || s.writtenKey.includes('A');
    const names = useSharp ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;
    const rootPc = ((chord[0] % 12) + 12) % 12;
    const writtenPc = (rootPc + 2) % 12; // B-flat Tenor Sax is +2 semitones above concert
    const intervals = chord.slice(1).map(n => (((n - chord[0]) % 12) + 12) % 12);
    const isMinor = intervals.includes(3);
    const hasMin7 = intervals.includes(10);
    const quality = isMinor ? (hasMin7 ? 'm7' : 'm') : (hasMin7 ? '7' : '');
    return {
      written: `${names[writtenPc]}${quality}`,
      concert: `${NOTE_NAMES_FLAT[rootPc]}${quality}`
    };
  }

  function draw() {
    const systems = Math.ceil(s.bars.length / 4);
    const systemGap = systems > 4 ? 116 : 148;
    const height = 104 + systems * systemGap;
    svg.setAttribute('viewBox', `0 0 1100 ${height}`);
    svg.replaceChildren();
    noteEls.length = 0;
    barBoxEls.length = 0;

    svg.append(el('text', { x: 50, y: 31, class: 'title-svg' }, s.title));
    svg.append(el('text', { x: 50, y: 54, class: 'meta' }, `${s.direction} · Click any measure to play from that bar`));
    svg.append(el('text', { x: 840, y: 54, class: 'meta' }, `${s.beatName} = ${tempo.value} · ${s.time[0]}/${s.time[1]}`));

    const left = 55;
    const width = 990;
    const barW = width / 4;
    const key = s.keySignature || [];

    s.bars.forEach((bar, bi) => {
      const sys = Math.floor(bi / 4);
      const slot = bi % 4;
      const top = 76 + sys * systemGap;
      const base = top + 52;
      const bx = left + slot * barW;

      if (slot === 0) {
        for (let l = 0; l < 5; l++) {
          svg.append(el('line', {
            x1: left,
            y1: base - 20 + l * 10,
            x2: left + width,
            y2: base - 20 + l * 10,
            class: 'staff'
          }));
        }
        svg.append(el('text', { x: left + 3, y: base + 16, 'font-size': 54, 'font-family': 'Georgia' }, '𝄞'));
        key.forEach((acc, i) => {
          svg.append(el('text', {
            x: left + 44 + i * 11,
            y: keySigY(acc, base) + 5,
            'font-size': 16
          }, acc.includes('#') ? '♯' : '♭'));
        });
        const timeX = left + 56 + key.length * 11;
        svg.append(el('text', { x: timeX, y: base - 2, 'font-size': 14, 'font-weight': 'bold' }, s.time[0]));
        svg.append(el('text', { x: timeX, y: base + 15, 'font-size': 14, 'font-weight': 'bold' }, s.time[1]));
      }

      // Clickable Measure Box
      const barRect = el('rect', {
        x: bx,
        y: base - 34,
        width: barW,
        height: 70,
        rx: 4,
        class: bi === currentBar ? 'measure-active-bg' : 'measure-hit'
      });
      barRect.addEventListener('click', () => seekToBar(bi));
      svg.append(barRect);
      barBoxEls.push(barRect);

      svg.append(el('line', { x1: bx, y1: base - 20, x2: bx, y2: base + 20, class: 'barline' }));
      svg.append(el('text', { x: bx + 5, y: top + 10, class: 'measure-no' }, String(bi + 1)));

      // Chord symbol above measure (when chord changes or at start of system)
      const ch = chordLabel(s.chords[bi % s.chords.length]);
      const prevCh = bi > 0 ? chordLabel(s.chords[(bi - 1) % s.chords.length]) : null;
      if (ch && (slot === 0 || !prevCh || prevCh.written !== ch.written)) {
        svg.append(el('text', { x: bx + 24, y: top + 10, class: 'chord-symbol' }, ch.written));
        svg.append(el('text', { x: bx + 26 + ch.written.length * 7.5, y: top + 10, class: 'chord-concert' }, `(${ch.concert})`));
      }

      const lead = slot === 0 ? (78 + key.length * 10) : 18;
      const start = bx + lead;
      const usable = barW - lead - 10;

      // Precompute note coordinates for eighth-note beaming within beats
      let cursor = 0;
      const barMeta = bar.map(([pitch, dur], ni) => {
        const x = start + (cursor + dur / 2) / s.unitsPerBar * usable;
        const y = pitch === 'R' ? base : yFor(pitch, base);
        const startUnit = cursor;
        cursor += dur;
        return { pitch, dur, x, y, startUnit, ni, beamed: false, up: y > base - 2 };
      });

      // Group consecutive eighth notes (dur === 1) within the same beat for beaming
      const beatSize = s.beatUnit || 2;
      let i = 0;
      while (i < barMeta.length) {
        if (barMeta[i].pitch !== 'R' && barMeta[i].dur === 1) {
          const beatBucket = Math.floor(barMeta[i].startUnit / beatSize);
          const group = [barMeta[i]];
          let j = i + 1;
          while (
            j < barMeta.length &&
            barMeta[j].pitch !== 'R' &&
            barMeta[j].dur === 1 &&
            Math.floor(barMeta[j].startUnit / beatSize) === beatBucket
          ) {
            group.push(barMeta[j]);
            j++;
          }
          if (group.length >= 2) {
            const avgY = group.reduce((sum, n) => sum + n.y, 0) / group.length;
            const up = avgY >= base;
            group.forEach(n => {
              n.beamed = true;
              n.up = up;
              n.stemX = n.x + (up ? 6 : -6);
              n.stemEnd = n.y + (up ? -30 : 30);
            });
            const first = group[0];
            const last = group[group.length - 1];
            // Align intermediate stems linearly along the beam
            group.forEach(n => {
              const t = last.stemX === first.stemX ? 0 : (n.stemX - first.stemX) / (last.stemX - first.stemX);
              n.stemEnd = first.stemEnd + t * (last.stemEnd - first.stemEnd);
            });
            svg.append(el('line', {
              x1: first.stemX,
              y1: first.stemEnd,
              x2: last.stemX,
              y2: last.stemEnd,
              class: 'note-beam'
            }));
          }
          i = j;
        } else {
          i++;
        }
      }

      barMeta.forEach(meta => {
        const { pitch, dur, x, y } = meta;
        const noteIdx = noteEls.length;
        const g = el('g', { class: 'note', 'data-index': noteIdx, 'data-bar': bi });
        g.style.cursor = 'pointer';
        g.addEventListener('click', e => {
          e.stopPropagation();
          seekToBar(bi, pitch, noteIdx);
        });

        if (pitch === 'R') {
          if (dur >= s.unitsPerBar || dur >= 6) {
            // Whole / full-bar rest hanging below 4th line (D5)
            g.append(el('rect', { x: x - 7, y: base - 10, width: 14, height: 6, fill: '#19231f' }));
          } else if (dur >= 4) {
            // Half rest sitting on middle line (B4)
            g.append(el('rect', { x: x - 7, y: base - 6, width: 14, height: 6, fill: '#19231f' }));
          } else if (dur === 1) {
            g.append(el('text', { x, y: base + 7, 'font-size': 24, 'text-anchor': 'middle', fill: '#19231f' }, '𝄾'));
          } else {
            g.append(el('text', { x, y: base + 7, 'font-size': 26, 'text-anchor': 'middle', fill: '#19231f' }, '𝄽'));
            if (dur === 3) g.append(el('circle', { cx: x + 10, cy: base - 2, r: 1.8, fill: '#19231f' }));
          }
          g.append(el('text', { x, y: base + 48, class: 'note-label' }, dur >= s.unitsPerBar ? 'bar rest' : 'rest'));
        } else {
          const q = parts(pitch);
          if (q.sharp && !key.includes(`${q.letter}#`)) {
            g.append(el('text', { x: x - 13, y: y + 5, 'font-size': 17 }, '♯'));
          }
          if (q.flat && !key.includes(`${q.letter}b`)) {
            g.append(el('text', { x: x - 13, y: y + 5, 'font-size': 17 }, '♭'));
          }
          for (let ly = base - 30; ly >= y; ly -= 10) {
            svg.append(el('line', { x1: x - 9, y1: ly, x2: x + 9, y2: ly, class: 'staff' }));
          }
          for (let ly = base + 30; ly <= y; ly += 10) {
            svg.append(el('line', { x1: x - 9, y1: ly, x2: x + 9, y2: ly, class: 'staff' }));
          }

          // Open notehead for half notes (dur=4), dotted half notes (dur=6), and whole notes (dur>=8)
          const open = dur >= 4;
          g.append(el('ellipse', {
            cx: x,
            cy: y,
            rx: 7,
            ry: 4.8,
            transform: `rotate(-18 ${x} ${y})`,
            class: open ? 'note-head half' : 'note-head'
          }));

          // Draw stem for all notes shorter than a whole note (dur < 8 eighth-units)
          if (dur < 8) {
            const up = meta.beamed ? meta.up : (y > base - 2);
            const stemX = meta.beamed ? meta.stemX : (x + (up ? 6 : -6));
            const stemEnd = meta.beamed ? meta.stemEnd : (y + (up ? -31 : 31));
            g.append(el('line', { x1: stemX, y1: y, x2: stemX, y2: stemEnd, class: 'note-stem' }));

            // Unbeamed eighth note draws a right-facing flag
            if (dur === 1 && !meta.beamed) {
              g.append(el('path', {
                d: up
                  ? `M${stemX} ${stemEnd} q12 7 6 17`
                  : `M${stemX} ${stemEnd} q12 -7 6 -17`,
                class: 'note-flag'
              }));
            }
          }

          if (dur === 3 || dur === 6) {
            g.append(el('circle', { cx: x + 12, cy: y - 1, r: 1.8, fill: '#19231f' }));
          }
          g.append(el('text', { x, y: base + 48, class: 'note-label' }, formatPitch(pitch)));
          g.append(el('circle', { cx: x, cy: y, r: 8, class: 'pulse' }));
        }

        svg.append(g);
        noteEls.push({ el: g, barIndex: bi, pitch, dur });
      });

      if (Math.abs(cursor - s.unitsPerBar) > 0.001) {
        console.error(`Bar ${bi + 1} totals ${cursor}, expected ${s.unitsPerBar}`);
      }
      if (bi === s.bars.length - 1) {
        svg.append(el('line', {
          x1: bx + barW - 4,
          y1: base - 20,
          x2: bx + barW - 4,
          y2: base + 20,
          stroke: '#35423c',
          'stroke-width': 4
        }));
      }
    });

    svg.append(el('text', { x: 50, y: height - 20, class: 'meta' }, `${s.credit} · B♭ tenor sax part`));
  }

  const fingerCards = new Map();
  const fingerGrid = $('fingerGrid');
  const fingerDialog = $('fingerDialog');

  function fingering(p) {
    const n = midi(p);
    const pc = ((n % 12) + 12) % 12;
    const map = {
      1: [[], 'Open (C♯)'],
      2: [[1, 1, 1, 1, 1, 1], ''],
      3: [[1, 1, 1, 1, 1, 1], 'E♭ pinky'],
      4: [[1, 1, 1, 1, 1, 0], ''],
      5: [[1, 1, 1, 1, 0, 0], ''],
      6: [[1, 1, 1, 0, 1, 0], 'F♯ key'],
      7: [[1, 1, 1, 0, 0, 0], ''],
      8: [[1, 1, 1, 0, 0, 0], 'G♯ pinky'],
      9: [[1, 1, 0, 0, 0, 0], ''],
      10: [[1, 0, 0, 0, 0, 0], 'Bis B♭'],
      11: [[1, 0, 0, 0, 0, 0], '']
    };
    if (pc === 0) {
      return n < 72
        ? { keys: [1, 1, 1, 1, 1, 1], modifier: 'Low C pinky', octave: false }
        : { keys: [0, 1, 0, 0, 0, 0], modifier: 'Middle C', octave: n >= 74 };
    }
    const [keys, modifier] = map[pc];
    const normalized = [0, 1, 2, 3, 4, 5].map(i => keys[i] ? 1 : 0);
    return { keys: normalized, modifier, octave: n >= 74 };
  }

  function concertPitchName(p) {
    const m = midi(p) - 14; // B-flat Tenor Sax sounds 14 semitones lower
    const pc = ((m % 12) + 12) % 12;
    const oct = Math.floor(m / 12) - 1;
    return `${NOTE_NAMES_FLAT[pc]}${oct}`;
  }

  function updateLiveHud(pitch, nextPitch = null) {
    $('hudNext').textContent = `Next: ${nextPitch && nextPitch !== 'R' ? formatPitch(nextPitch) : (nextPitch === 'R' ? 'Rest' : '—')}`;
    if (!pitch || pitch === 'R') {
      $('hudNote').textContent = 'Rest';
      $('hudConcert').textContent = 'Breathe / Count';
      $('hudMod').textContent = 'Rest beat';
      return;
    }
    const f = fingering(pitch);
    $('hudNote').textContent = formatPitch(pitch);
    $('hudConcert').textContent = `Sounds ${concertPitchName(pitch)}`;
    $('hudLeft').innerHTML = f.keys.slice(0, 3).map(on => `<i class="hud-pearl ${on ? 'on' : ''}"></i>`).join('');
    $('hudRight').innerHTML = f.keys.slice(3, 6).map(on => `<i class="hud-pearl ${on ? 'on' : ''}"></i>`).join('');
    $('hudOct').classList.toggle('on', !!f.octave);
    $('hudMod').textContent = f.modifier || 'Standard keys';
  }

  function activeFingering(p, nextPitch = null) {
    fingerCards.forEach((card, pitch) => card.classList.toggle('current', pitch === p));
    if (p && fingerDialog.open) {
      fingerCards.get(p)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    updateLiveHud(p, nextPitch);
  }

  function drawFingerings() {
    const pitches = [...new Set(s.bars.flat().map(n => n[0]).filter(p => p !== 'R'))].sort((a, b) => midi(a) - midi(b));
    pitches.forEach(p => {
      const f = fingering(p);
      const card = document.createElement('article');
      card.className = 'finger-card';
      card.dataset.pitch = p;
      card.title = 'Click to hear this note';
      card.innerHTML = `
        <div class="finger-note"><strong>${formatPitch(p)}</strong></div>
        <div class="sax-diagram">
          <span class="octave-lever ${f.octave ? 'on' : ''}">OCT</span>
          <span class="hand-tag left">LEFT</span>
          <span class="hand-tag right">RIGHT</span>
          <div class="sax-body">${f.keys.map((on, i) => `<i class="pearl ${on ? 'on' : ''}" aria-label="${i < 3 ? 'Left' : 'Right'} key ${i % 3 + 1}"></i>`).join('')}</div>
        </div>
        <div class="modifier">${f.modifier || 'Standard keys'}</div>
      `;
      card.addEventListener('click', () => previewPitch(p));
      fingerGrid.append(card);
      fingerCards.set(p, card);
    });
  }

  draw();
  drawFingerings();

  // Initialize HUD with first note of song
  const initialNote = s.bars[0]?.find(n => n[0] !== 'R')?.[0] || null;
  const secondNote = s.bars.flat()[1]?.[0] || null;
  updateLiveHud(initialNote, secondNote);

  $('finger').addEventListener('click', () => fingerDialog.showModal());
  $('closeFinger').addEventListener('click', () => fingerDialog.close());
  fingerDialog.addEventListener('click', e => {
    if (e.target === fingerDialog) fingerDialog.close();
  });

  const play = $('play');
  const status = $('status');

  function hz(n) {
    return 440 * Math.pow(2, (n - 69) / 12);
  }

  function ensureAudio() {
    if (!audio || audio.state === 'closed') {
      audio = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audio.state === 'suspended') audio.resume();
  }

  function tone(freq, start, duration, volume = 0.07, type = 'sine') {
    if (!audio) return;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.04, duration - 0.025));
    o.connect(g).connect(audio.destination);
    o.start(start);
    o.stop(start + duration);
  }

  function previewPitch(p) {
    if (!p || p === 'R') return;
    ensureAudio();
    tone(hz(midi(p) - 14), audio.currentTime + 0.02, 0.5, 0.09, s.style === 'funk' ? 'sawtooth' : 'triangle');
    activeFingering(p, null);
  }

  function click(t, accent) {
    tone(accent ? 1050 : 760, t, 0.045, accent ? 0.07 : 0.035, 'square');
  }

  function backing(chord, start, beat, eighth) {
    if (s.style === 'funk') {
      for (let b = 0; b < s.beatsPerBar; b++) {
        const t = start + b * beat;
        tone(hz(chord[b % 2] - 12), t, eighth * 0.75, 0.07, 'sawtooth');
        tone(hz(chord[2]), t + (b ? eighth : 0), eighth * 0.38, 0.025, 'square');
      }
    } else if (s.style === 'blues' || s.style === 'swing') {
      for (let b = 0; b < s.beatsPerBar; b++) {
        const t = start + b * beat;
        tone(hz(chord[b % chord.length] - 12), t, beat * 0.75, 0.055, 'triangle');
        if (b === 1 || b === 3) {
          chord.slice(1).forEach(n => tone(hz(n), t, beat * 0.45, 0.018, 'sine'));
        }
      }
    } else if (s.style === 'hymn') {
      for (let b = 0; b < s.beatsPerBar; b++) {
        const t = start + b * beat;
        chord.forEach((n, i) => tone(hz(n - (i ? 0 : 12)), t, beat * 0.82, 0.022, 'sine'));
      }
    } else {
      for (let b = 0; b < s.beatsPerBar; b++) {
        const t = start + b * beat;
        [0, 2, 1, 3, 1, 2].forEach((ci, j) =>
          tone(hz(chord[ci % chord.length] - (ci ? 0 : 12)), t + j * beat / 6, beat / 6 * 0.9, 0.03, j % 2 ? 'sine' : 'triangle')
        );
      }
    }
  }

  function highlightBarBox(bi) {
    currentBar = bi;
    barBoxEls.forEach((rect, idx) => {
      rect.setAttribute('class', idx === bi ? 'measure-active-bg' : 'measure-hit');
    });
  }

  function clearAudioTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    if (audio) {
      audio.close().catch(() => {});
      audio = null;
    }
  }

  function pause() {
    clearAudioTimers();
    playing = false;
    paused = true;
    play.textContent = `▶ Resume (Bar ${currentBar + 1})`;
    status.textContent = `Paused · Bar ${currentBar + 1} · Written ${s.writtenKey}`;
  }

  function stop() {
    clearAudioTimers();
    playing = false;
    paused = false;
    const { startBar } = getPhraseRange();
    currentBar = startBar;
    play.textContent = '▶ Play';
    noteEls.forEach(n => n.el.setAttribute('class', 'note'));
    highlightBarBox(currentBar);
    const firstP = s.bars[currentBar]?.find(n => n[0] !== 'R')?.[0] || null;
    activeFingering(firstP, null);
    status.textContent = `Ready · Bar ${currentBar + 1} · Written ${s.writtenKey}`;
  }

  function seekToBar(bi, clickedPitch = null, clickedNoteIdx = null) {
    currentBar = Math.max(0, Math.min(s.bars.length - 1, bi));
    highlightBarBox(currentBar);
    if (playing) {
      schedule(currentBar, false);
    } else {
      if (paused) play.textContent = `▶ Resume (Bar ${currentBar + 1})`;
      if (clickedNoteIdx !== null) {
        noteEls.forEach((n, i) => n.el.setAttribute('class', i === clickedNoteIdx ? 'note active' : 'note'));
      }
      if (clickedPitch && clickedPitch !== 'R') {
        previewPitch(clickedPitch);
        status.textContent = `Bar ${currentBar + 1} · Audition ${formatPitch(clickedPitch)}`;
      } else {
        const firstP = s.bars[currentBar]?.find(n => n[0] !== 'R')?.[0] || null;
        activeFingering(firstP, null);
        status.textContent = `Ready at Bar ${currentBar + 1} · Written ${s.writtenKey}`;
      }
    }
  }

  function schedule(startBarIdx = currentBar, withCountIn = true) {
    clearAudioTimers();
    ensureAudio();
    playing = true;
    paused = false;
    play.textContent = '❚❚ Pause';

    const { endBar } = getPhraseRange();
    const lastBarIdx = Math.max(startBarIdx, endBar);
    const bpm = +tempo.value;
    const beat = 60 / bpm;
    const unit = beat / s.beatUnit;
    const countInBars = withCountIn ? 1 : 0;
    const countIn = beat * s.beatsPerBar * countInBars;
    const start = audio.currentTime + 0.1;
    const melody = $('melodyCue').checked;

    if (withCountIn) {
      for (let i = 0; i < s.beatsPerBar * countInBars; i++) {
        click(start + i * beat, i % s.beatsPerBar === 0);
      }
      status.textContent = `Count-in · Starting Bar ${startBarIdx + 1}`;
    }

    let units = 0;
    for (let bi = startBarIdx; bi <= lastBarIdx; bi++) {
      const bar = s.bars[bi];
      const barStart = start + countIn + (bi - startBarIdx) * s.unitsPerBar * unit;
      backing(s.chords[bi % s.chords.length], barStart, beat, unit);
      for (let b = 0; b < s.beatsPerBar; b++) {
        click(barStart + b * beat, b === 0);
      }

      bar.forEach(([pitch, dur], ni) => {
        const when = start + countIn + units * unit;
        const ms = (when - audio.currentTime) * 1000;
        const globalNoteIdx = noteEls.findIndex(item => item.barIndex === bi && item.el === noteEls.filter(x => x.barIndex === bi)[ni]?.el);
        const nextNoteObj = noteEls[globalNoteIdx + 1];

        if (melody && pitch !== 'R') {
          tone(hz(midi(pitch) - 14), when, dur * unit * 0.92, 0.08, s.style === 'funk' ? 'sawtooth' : 'triangle');
        }

        timers.push(setTimeout(() => {
          highlightBarBox(bi);
          noteEls.forEach((n, i) =>
            n.el.setAttribute('class', i < globalNoteIdx ? 'note past' : i === globalNoteIdx ? 'note active' : 'note')
          );
          const activeNode = noteEls[globalNoteIdx]?.el;
          if (activeNode) {
            const pulse = activeNode.querySelector('.pulse');
            if (pulse) {
              pulse.classList.remove('on');
              void pulse.getBBox();
              pulse.classList.add('on');
            }
            activeNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          activeFingering(pitch === 'R' ? null : pitch, nextNoteObj?.pitch || null);
          status.textContent = `Bar ${bi + 1}/${s.bars.length} · ${pitch === 'R' ? 'Rest' : formatPitch(pitch)}`;
        }, Math.max(0, ms)));

        units += dur;
      });
    }

    timers.push(setTimeout(() => {
      if ($('loop').checked) {
        const { startBar } = getPhraseRange();
        schedule(startBar, false);
      } else {
        stop();
      }
    }, (countIn + units * unit) * 1000 + 140));
  }

  play.addEventListener('click', () => {
    if (playing) pause();
    else schedule(currentBar, !paused);
  });
  $('stop').addEventListener('click', stop);
  $('print').addEventListener('click', () => window.print());

  tempo.addEventListener('input', () => {
    $('tempoValue').textContent = `${tempo.value} BPM`;
    draw();
    if (playing) schedule(currentBar, false);
  });

  phraseSelect.addEventListener('change', () => {
    const { startBar } = getPhraseRange();
    seekToBar(startBar);
  });

  window.addEventListener('beforeunload', clearAudioTimers);
})();
