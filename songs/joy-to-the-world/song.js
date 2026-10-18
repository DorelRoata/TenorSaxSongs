// Joy to the World (Freue dich Welt!) - G. F. Handel, arr. A. Perebikovski
// 28 measures, 4/4 time, 16 sixteenth-note units per bar (quarter = 4, eighth = 2, sixteenth = 1)
(() => {
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const NAMES_SHARP = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  function parsePitch(p) {
    return {
      letter: p[0],
      sharp: p.includes('#'),
      flat: p.includes('b'),
      octave: +p.at(-1)
    };
  }

  function toMidi(p) {
    if (p === 'R') return null;
    const q = parsePitch(p);
    return 12 * (q.octave + 1) + SEMI[q.letter] + (q.sharp ? 1 : 0) - (q.flat ? 1 : 0);
  }

  function fromMidi(m, preferSharp = false) {
    const octave = Math.floor(m / 12) - 1;
    const pc = ((m % 12) + 12) % 12;
    const names = preferSharp ? NAMES_SHARP : NAMES_FLAT;
    return `${names[pc]}${octave}`;
  }

  function transposeBars(bars, semitones, preferSharp = false) {
    if (semitones === 0) return bars.map(bar => bar.map(([p, d]) => [p, d]));
    return bars.map(bar =>
      bar.map(([p, d]) => {
        if (p === 'R') return ['R', d];
        const m = toMidi(p) + semitones;
        // Preserve F# spelling in chromatic passages (bar 13)
        const useSharp = preferSharp || p.includes('#');
        return [fromMidi(m, useSharp), d];
      })
    );
  }

  // Trumpet 1 in Bb (Written in F major: 1 flat Bb; sounds 2 semitones lower in Concert Eb)
  const TRUMPET_1_BB = [
    // 1-5
    [['F5', 4], ['E5', 3], ['D5', 1], ['C5', 6], ['Bb4', 2]],
    [['A4', 4], ['G4', 4], ['F4', 6], ['C5', 2]],
    [['D5', 6], ['D5', 2], ['E5', 6], ['E5', 2]],
    [['F5', 12], ['F5', 2], ['F5', 2]],
    [['F5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['C5', 3], ['Bb4', 1], ['A4', 2], ['F5', 2]],
    // 6-10
    [['F5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['C5', 3], ['Bb4', 1], ['A4', 2], ['A4', 2]],
    [['A4', 2], ['A4', 2], ['A4', 2], ['A4', 1], ['Bb4', 1], ['C5', 6], ['Bb4', 1], ['A4', 1]],
    [['G4', 2], ['G4', 2], ['G4', 2], ['G4', 1], ['A4', 1], ['Bb4', 6], ['A4', 1], ['G4', 1]],
    [['F4', 2], ['F5', 4], ['D5', 2], ['C5', 3], ['Bb4', 1], ['A4', 2], ['Bb4', 2]],
    [['A4', 4], ['G4', 4], ['F4', 8]],
    // 11-15 [A] (Trumpet 1 rests 5 bars)
    [['R', 16]],
    [['R', 16]],
    [['R', 16]],
    [['R', 16]],
    [['R', 16]],
    // 16-20 [B]
    [['F5', 4], ['E5', 3], ['D5', 1], ['C5', 6], ['Bb4', 2]],
    [['A4', 4], ['G4', 4], ['F4', 6], ['C5', 2]],
    [['D5', 6], ['D5', 2], ['E5', 6], ['E5', 2]],
    [['F5', 12], ['F5', 2], ['F5', 2]],
    [['F5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['C5', 3], ['Bb4', 1], ['A4', 2], ['F5', 2]],
    // 21-25
    [['F5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['C5', 3], ['Bb4', 1], ['A4', 2], ['A4', 2]],
    [['A4', 2], ['A4', 2], ['A4', 2], ['A4', 1], ['Bb4', 1], ['C5', 6], ['Bb4', 1], ['A4', 1]],
    [['G4', 2], ['G4', 2], ['G4', 2], ['G4', 1], ['A4', 1], ['Bb4', 6], ['A4', 1], ['G4', 1]],
    [['F4', 2], ['F5', 4], ['D5', 2], ['C5', 3], ['Bb4', 1], ['A4', 2], ['Bb4', 2]],
    [['A4', 4], ['A5', 12]],
    // 26-28
    [['G5', 16]],
    [['F5', 16]],
    [['F5', 12], ['F5', 4]]
  ];

  // Trumpet 2 in Bb (Written in F major: 1 flat Bb; sounds 2 semitones lower in Concert Eb)
  const TRUMPET_2_BB = [
    // 1-5
    [['A4', 4], ['C5', 3], ['Bb4', 1], ['A4', 6], ['G4', 2]],
    [['F4', 4], ['E4', 4], ['F4', 6], ['A4', 2]],
    [['Bb4', 6], ['Bb4', 2], ['C5', 6], ['G4', 2]],
    [['A4', 12], ['A4', 2], ['A4', 2]],
    [['A4', 2], ['C5', 2], ['Bb4', 2], ['A4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['A4', 2]],
    // 6-10
    [['A4', 2], ['C5', 2], ['Bb4', 2], ['A4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['F4', 2]],
    [['F4', 2], ['F4', 2], ['F4', 2], ['F4', 1], ['G4', 1], ['A4', 6], ['G4', 1], ['F4', 1]],
    [['E4', 2], ['E4', 2], ['E4', 2], ['E4', 1], ['F4', 1], ['G4', 6], ['F4', 1], ['E4', 1]],
    [['F4', 2], ['A4', 4], ['Bb4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['G4', 2]],
    [['F4', 4], ['E4', 4], ['F4', 2], ['A4', 2], ['A4', 2], ['A4', 2]],
    // 11-15 [A]
    [['A4', 2], ['A4', 2], ['A4', 2], ['A4', 2], ['F4', 2], ['F4', 2], ['F4', 2], ['F4', 2]],
    [['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['E4', 2], ['E4', 2], ['E4', 2], ['E4', 2]],
    [['F#4', 2], ['F#4', 2], ['F#4', 2], ['F#4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2]],
    [['F4', 2], ['F4', 2], ['F4', 2], ['F4', 2], ['E4', 8]],
    [['F4', 8], ['E4', 8]],
    // 16-20 [B]
    [['A4', 4], ['C5', 3], ['Bb4', 1], ['A4', 6], ['G4', 2]],
    [['F4', 4], ['E4', 4], ['F4', 6], ['A4', 2]],
    [['Bb4', 6], ['Bb4', 2], ['C5', 6], ['G4', 2]],
    [['A4', 12], ['A4', 2], ['A4', 2]],
    [['A4', 2], ['C5', 2], ['Bb4', 2], ['A4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['A4', 2]],
    // 21-25
    [['A4', 2], ['C5', 2], ['Bb4', 2], ['A4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['F4', 2]],
    [['F4', 2], ['F4', 2], ['F4', 2], ['F4', 1], ['G4', 1], ['A4', 6], ['G4', 1], ['F4', 1]],
    [['E4', 2], ['E4', 2], ['E4', 2], ['E4', 1], ['F4', 1], ['G4', 6], ['F4', 1], ['E4', 1]],
    [['F4', 2], ['A4', 4], ['Bb4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['G4', 2]],
    [['F4', 4], ['C5', 12]],
    // 26-28
    [['A4', 4], ['G4', 4], ['F4', 4], ['C4', 4]],
    [['Db4', 8], ['Bb4', 8]],
    [['C5', 12], ['F5', 4]]
  ];

  // Horn in Eb (Written in C major: 0 flats; sounds 9 semitones lower in Concert Eb)
  const HORN_EB = [
    // 1-5
    [['C5', 4], ['C5', 3], ['C5', 1], ['C5', 6], ['A4', 2]],
    [['F4', 4], ['B4', 4], ['C5', 6], ['C5', 2]],
    [['C5', 6], ['F5', 2], ['D5', 6], ['B4', 2]],
    [['C5', 4], ['D5', 4], ['D5', 4], ['R', 2], ['C5', 2]],
    [['C5', 2], ['C5', 2], ['C5', 2], ['C5', 2], ['C5', 3], ['B4', 1], ['C5', 2], ['C5', 2]],
    // 6-10
    [['C5', 2], ['E5', 2], ['C5', 2], ['C5', 2], ['C5', 3], ['B4', 1], ['C5', 2], ['R', 2]],
    [['R', 8], ['C5', 2], ['C5', 2], ['C5', 4]],
    [['R', 8], ['B4', 2], ['B4', 2], ['B4', 4]],
    [['C5', 2], ['C5', 2], ['D5', 2], ['C5', 2], ['C5', 3], ['C5', 1], ['C5', 2], ['C5', 2]],
    [['B4', 4], ['B4', 4], ['B4', 2], ['B4', 2], ['B4', 2], ['B4', 2]],
    // 11-15 [A]
    [['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2]],
    [['A4', 2], ['A4', 2], ['A4', 2], ['A4', 2], ['B4', 2], ['B4', 2], ['B4', 2], ['B4', 2]],
    [['Bb4', 2], ['Bb4', 2], ['Bb4', 2], ['Bb4', 2], ['A4', 2], ['A4', 2], ['A4', 2], ['A4', 2]],
    [['A4', 2], ['A4', 2], ['A4', 2], ['A4', 2], ['G4', 8]],
    [['C5', 8], ['B4', 8]],
    // 16-20 [B]
    [['C5', 4], ['C5', 3], ['C5', 1], ['C5', 6], ['A4', 2]],
    [['F4', 4], ['B4', 4], ['C5', 6], ['C5', 2]],
    [['C5', 6], ['F5', 2], ['D5', 6], ['B4', 2]],
    [['C5', 4], ['D5', 4], ['D5', 4], ['R', 2], ['C5', 2]],
    [['C5', 2], ['C5', 2], ['C5', 2], ['C5', 2], ['C5', 3], ['B4', 1], ['C5', 2], ['C5', 2]],
    // 21-25
    [['C5', 2], ['E5', 2], ['C5', 2], ['C5', 2], ['C5', 3], ['B4', 1], ['C5', 2], ['R', 2]],
    [['R', 8], ['C5', 2], ['C5', 2], ['C5', 4]],
    [['R', 8], ['B4', 2], ['B4', 2], ['B4', 4]],
    [['C5', 2], ['C5', 2], ['D5', 2], ['C5', 2], ['C5', 3], ['C5', 1], ['C5', 2], ['C5', 2]],
    [['C5', 8], ['E5', 8]],
    // 26-28
    [['D5', 8], ['D5', 8]],
    [['C5', 8], ['D5', 8]],
    [['E5', 12], ['C5', 4]]
  ];

  // Horn in F is 2 semitones lower written than Horn in Eb (sounds identical, -7 semitones to concert)
  const HORN_F = transposeBars(HORN_EB, -2);

  // Euphonium 1 in Bb Treble Clef (Written in F major: 1 flat Bb; sounds -14 semitones in Concert Eb)
  const EUPHONIUM_1_BB = [
    // 1-5
    [['C5', 4], ['C5', 3], ['C5', 1], ['C5', 6], ['C5', 2]],
    [['A4', 4], ['C5', 4], ['A4', 6], ['C5', 2]],
    [['Bb4', 3], ['C5', 1], ['Bb4', 2], ['D5', 2], ['C5', 3], ['D5', 1], ['C5', 2], ['Bb4', 2]],
    [['F5', 12], ['F5', 2], ['R', 2]],
    [['C5', 4], ['R', 2], ['D5', 1], ['E5', 1], ['F5', 2], ['R', 4], ['F5', 1], ['C5', 1]],
    // 6-10
    [['A4', 4], ['R', 2], ['D5', 1], ['E5', 1], ['F5', 2], ['R', 6]],
    [['R', 8], ['C5', 2], ['C5', 2], ['C5', 4]],
    [['R', 8], ['C5', 2], ['C5', 2], ['C5', 4]],
    [['C5', 2], ['C5', 4], ['C5', 2], ['C5', 6], ['Bb4', 2]],
    [['A4', 4], ['Bb4', 4], ['F4', 8]],
    // 11-15 [A] (Lyrical solo melody in Euphonium 1 / Trombone 1)
    [['F5', 4], ['E5', 3], ['D5', 1], ['E5', 8]],
    [['E5', 4], ['D5', 3], ['C5', 1], ['D5', 8]],
    [['D5', 4], ['C5', 3], ['Bb4', 1], ['C5', 2], ['A4', 2], ['C5', 2], ['E5', 2]],
    [['D5', 8], ['C5', 8]],
    [['D5', 8], ['C5', 8]],
    // 16-20 [B]
    [['C5', 4], ['C5', 3], ['C5', 1], ['C5', 6], ['C5', 2]],
    [['A4', 4], ['C5', 4], ['A4', 6], ['C5', 2]],
    [['F5', 2], ['F5', 2], ['F5', 4], ['E5', 2], ['E5', 2], ['E5', 4]],
    [['F5', 12], ['F5', 2], ['R', 2]],
    [['C5', 4], ['R', 2], ['D5', 1], ['E5', 1], ['F5', 2], ['R', 4], ['F5', 1], ['C5', 1]],
    // 21-25
    [['A4', 4], ['R', 2], ['D5', 1], ['E5', 1], ['F5', 2], ['R', 6]],
    [['R', 8], ['C5', 2], ['C5', 2], ['C5', 4]],
    [['R', 8], ['C5', 2], ['C5', 2], ['C5', 4]],
    [['C5', 2], ['C5', 4], ['C5', 2], ['C5', 6], ['Bb4', 2]],
    [['C5', 16]],
    // 26-28
    [['D5', 8], ['C5', 8]],
    [['Db5', 8], ['Eb5', 8]],
    [['F5', 12], ['F5', 4]]
  ];

  // Trombone 1 (Concert Bass Clef, -14 semitones from Euphonium 1 Bb Treble)
  const TROMBONE_1 = transposeBars(EUPHONIUM_1_BB, -14);

  // Euphonium 2 in Bb Treble Clef (Written in F major: 1 flat Bb; sounds -14 semitones in Concert Eb)
  const EUPHONIUM_2_BB = [
    // 1-5
    [['F4', 4], ['C5', 3], ['Bb4', 1], ['A4', 2], ['G4', 2], ['F4', 2], ['D4', 2]],
    [['C4', 4], ['C4', 4], ['F4', 2], ['G4', 2], ['A4', 2], ['Bb4', 2]],
    [['Bb4', 3], ['A4', 1], ['G4', 2], ['Bb4', 2], ['Bb4', 3], ['A4', 1], ['Bb4', 2], ['G4', 2]],
    [['A4', 2], ['G4', 2], ['F4', 2], ['E4', 2], ['F4', 2], ['E4', 2], ['D4', 2], ['C4', 2]],
    [['F4', 4], ['R', 2], ['A4', 1], ['C5', 1], ['F5', 2], ['R', 4], ['A4', 1], ['G4', 1]],
    // 6-10
    [['F4', 4], ['R', 2], ['A4', 1], ['C5', 1], ['F5', 2], ['R', 6]],
    [['R', 8], ['F4', 2], ['F4', 2], ['F4', 4]],
    [['R', 8], ['G4', 2], ['G4', 2], ['G4', 4]],
    [['F4', 2], ['F4', 4], ['G4', 2], ['A4', 6], ['F4', 2]],
    [['F4', 4], ['G4', 4], ['F4', 2], ['F4', 2], ['F4', 2], ['F4', 2]],
    // 11-15 [A]
    [['F4', 2], ['F4', 2], ['F4', 2], ['F4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2]],
    [['Bb4', 2], ['Bb4', 2], ['Bb4', 2], ['Bb4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2]],
    [['F#4', 2], ['F#4', 2], ['F#4', 2], ['F#4', 2], ['Bb4', 2], ['Bb4', 2], ['Bb4', 2], ['Bb4', 2]],
    [['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['G4', 8]],
    [['G4', 8], ['G4', 8]],
    // 16-20 [B]
    [['F4', 4], ['C5', 3], ['Bb4', 1], ['A4', 2], ['G4', 2], ['F4', 2], ['D4', 2]],
    [['C4', 4], ['C4', 4], ['F4', 2], ['G4', 2], ['A4', 2], ['Bb4', 2]],
    [['Bb4', 2], ['Bb4', 2], ['Bb4', 4], ['C5', 2], ['C5', 2], ['C5', 4]],
    [['A4', 2], ['G4', 2], ['F4', 2], ['E4', 2], ['F4', 2], ['E4', 2], ['D4', 2], ['C4', 2]],
    [['F4', 4], ['R', 2], ['A4', 1], ['C5', 1], ['F5', 2], ['R', 4], ['A4', 1], ['G4', 1]],
    // 21-25
    [['F4', 4], ['R', 2], ['A4', 1], ['C5', 1], ['F5', 2], ['R', 6]],
    [['R', 8], ['F4', 2], ['F4', 2], ['F4', 4]],
    [['R', 8], ['G4', 2], ['G4', 2], ['G4', 4]],
    [['F4', 2], ['F4', 4], ['G4', 2], ['A4', 6], ['F4', 2]],
    [['A4', 16]],
    // 26-28
    [['C5', 4], ['A4', 4], ['F4', 4], ['C4', 4]],
    [['Ab4', 8], ['Bb4', 8]],
    [['C5', 12], ['A4', 4]]
  ];

  // Trombone 2 (Concert Bass Clef, -14 semitones from Euphonium 2 Bb Treble)
  const TROMBONE_2 = transposeBars(EUPHONIUM_2_BB, -14);

  // Tuba (Concert Bass Clef, Eb major: 3 flats Bb, Eb, Ab)
  const TUBA = [
    // 1-5
    [['Eb2', 4], ['Bb1', 4], ['Eb2', 2], ['D2', 2], ['C2', 2], ['Ab1', 2]],
    [['Bb1', 4], ['Bb1', 4], ['Eb2', 4], ['Eb2', 4]],
    [['Ab1', 2], ['R', 2], ['Eb2', 2], ['R', 2], ['G2', 2], ['R', 2], ['Bb2', 2], ['R', 2]],
    [['C3', 2], ['Bb2', 2], ['Ab2', 2], ['G2', 2], ['Ab2', 2], ['G2', 2], ['F2', 2], ['Eb2', 2]],
    [['Bb1', 4], ['R', 2], ['F2', 1], ['Ab2', 1], ['Bb2', 2], ['R', 4], ['Ab2', 1], ['F2', 1]],
    // 6-10
    [['Eb2', 4], ['R', 2], ['F2', 1], ['Ab2', 1], ['Bb2', 2], ['R', 4], ['G2', 1], ['Eb2', 1]],
    [['C2', 4], ['G1', 4], ['C2', 2], ['G2', 2], ['E2', 2], ['C2', 2]],
    [['G1', 4], ['D2', 4], ['G2', 2], ['D2', 2], ['B1', 2], ['G1', 2]],
    [['C2', 2], ['C2', 4], ['G1', 2], ['Ab1', 4], ['Bb1', 4]],
    [['Bb1', 4], ['Bb1', 4], ['Eb2', 6], ['R', 2]],
    // 11-15 [A]
    [['D2', 4], ['D2', 4], ['Bb1', 4], ['Bb1', 4]],
    [['Eb2', 4], ['Eb2', 4], ['F2', 4], ['F2', 4]],
    [['G2', 4], ['G2', 4], ['D2', 4], ['D2', 4]],
    [['F2', 8], ['F2', 8]],
    [['Bb1', 8], ['D2', 8]],
    // 16-20 [B]
    [['Eb2', 4], ['Bb1', 4], ['Eb2', 2], ['D2', 2], ['C2', 2], ['Ab1', 2]],
    [['Bb1', 4], ['Bb1', 4], ['Eb2', 4], ['Eb2', 4]],
    [['Ab1', 2], ['R', 2], ['Eb2', 2], ['R', 2], ['G2', 2], ['R', 2], ['Bb2', 2], ['R', 2]],
    [['C3', 2], ['Bb2', 2], ['Ab2', 2], ['G2', 2], ['Ab2', 2], ['G2', 2], ['F2', 2], ['Eb2', 2]],
    [['Bb1', 4], ['R', 2], ['F2', 1], ['Ab2', 1], ['Bb2', 2], ['R', 4], ['Ab2', 1], ['F2', 1]],
    // 21-25
    [['Eb2', 4], ['R', 2], ['F2', 1], ['Ab2', 1], ['Bb2', 2], ['R', 4], ['G2', 1], ['Eb2', 1]],
    [['C2', 4], ['G1', 4], ['C2', 2], ['G2', 2], ['E2', 2], ['C2', 2]],
    [['G1', 4], ['D2', 4], ['G2', 2], ['D2', 2], ['B1', 2], ['G1', 2]],
    [['C2', 2], ['C2', 4], ['G1', 2], ['Ab1', 4], ['Bb1', 4]],
    [['Bb1', 8], ['F2', 8]],
    // 26-28
    [['Eb2', 4], ['Bb1', 4], ['G1', 4], ['Eb1', 4]],
    [['Cb2', 8], ['Db2', 8]],
    [['Eb2', 12], ['Eb2', 4]]
  ];

  // Tenor Sax Lead in Bb (Combines Trumpet 1 main melody in bars 1-10 & 16-28 with Euphonium 1 solo in [A] bars 11-15!)
  const TENOR_SAX_LEAD_BB = TRUMPET_1_BB.map((bar, index) =>
    index >= 10 && index <= 14 ? EUPHONIUM_1_BB[index] : bar
  );

  window.ENSEMBLE_SONG = {
    slug: 'joy-to-the-world',
    title: 'Joy to the World',
    subtitle: 'Freue dich Welt! · Радуйся мир · G. F. Handel, arr. A. Perebikovski',
    direction: 'Moderato · festive brass & B♭ tenor sax arrangement',
    credit: 'G. F. Handel · arr. A. Perebikovski',
    tempo: 92,
    tempoRange: [60, 128],
    time: [4, 4],
    beatName: 'quarter note',
    unitsPerBar: 16,
    beatUnit: 4,
    beatsPerBar: 4,
    concertKey: 'E♭ major',
    rehearsalMarks: { 1: 'Intro', 11: 'A', 16: 'B', 24: 'Coda' },
    sections: [
      { id: 'all', label: 'All Bars (1–28)', startBar: 1, endBar: 28 },
      { id: 'intro', label: 'Opening (1–10)', startBar: 1, endBar: 10 },
      { id: 'section-a', label: '[A] Lyrical Middle (11–15)', startBar: 11, endBar: 15 },
      { id: 'section-b', label: '[B] Full Return (16–23)', startBar: 16, endBar: 23 },
      { id: 'coda', label: 'Coda Finale (24–28)', startBar: 24, endBar: 28 }
    ],
    voices: [
      {
        id: 'trumpet-1',
        name: 'Trumpet 1',
        short: 'Tpt 1',
        family: 'bb-treble',
        clef: 'treble',
        transpositionLabel: 'in B♭',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        semitonesToConcert: -2,
        wave: 'sawtooth',
        gain: 0.055,
        bars: TRUMPET_1_BB
      },
      {
        id: 'trumpet-2',
        name: 'Trumpet 2',
        short: 'Tpt 2',
        family: 'bb-treble',
        clef: 'treble',
        transpositionLabel: 'in B♭',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        semitonesToConcert: -2,
        wave: 'sawtooth',
        gain: 0.045,
        bars: TRUMPET_2_BB
      },
      {
        id: 'horn-f',
        name: 'Horn in F',
        short: 'Hn F',
        family: 'horns',
        clef: 'treble',
        transpositionLabel: 'in F',
        writtenKey: 'B♭ major',
        keySignature: ['Bb', 'Eb'],
        semitonesToConcert: -7,
        wave: 'triangle',
        gain: 0.055,
        bars: HORN_F
      },
      {
        id: 'trombone-1',
        name: 'Trombone 1',
        short: 'Tbn 1',
        family: 'bass-clef',
        clef: 'bass',
        transpositionLabel: 'Bass Clef (C)',
        writtenKey: 'E♭ major',
        keySignature: ['Bb', 'Eb', 'Ab'],
        semitonesToConcert: 0,
        wave: 'sawtooth',
        gain: 0.052,
        bars: TROMBONE_1
      },
      {
        id: 'trombone-2',
        name: 'Trombone 2',
        short: 'Tbn 2',
        family: 'bass-clef',
        clef: 'bass',
        transpositionLabel: 'Bass Clef (C)',
        writtenKey: 'E♭ major',
        keySignature: ['Bb', 'Eb', 'Ab'],
        semitonesToConcert: 0,
        wave: 'triangle',
        gain: 0.048,
        bars: TROMBONE_2
      },
      {
        id: 'tuba',
        name: 'Tuba',
        short: 'Tuba',
        family: 'bass-clef',
        clef: 'bass',
        transpositionLabel: 'Bass Clef (C)',
        writtenKey: 'E♭ major',
        keySignature: ['Bb', 'Eb', 'Ab'],
        semitonesToConcert: 0,
        wave: 'sine',
        gain: 0.075,
        bars: TUBA
      }
    ],
    parts: [
      {
        id: 'score',
        name: 'Together',
        badge: 'Full Score · E♭',
        group: 'Full Score',
        detail: '6-part brass score · Concert E♭',
        clef: 'score',
        writtenKey: 'E♭ major (Concert)',
        keySignature: ['Bb', 'Eb', 'Ab'],
        voiceId: null,
        supportsSaxFingering: false,
        pdf: 'sheets/score.pdf',
        pages: ['sheets/score-1.jpg', 'sheets/score-2.jpg'],
        bars: TRUMPET_1_BB
      },
      {
        id: 'tenor-sax',
        name: 'Tenor Sax Lead',
        badge: 'B♭ Treble · Lead + [A] Solo',
        group: 'B♭ Treble Parts',
        detail: 'Written F major · Melody + [A] Solo',
        clef: 'treble',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        voiceId: 'trumpet-1',
        semitonesToConcert: -14,
        supportsSaxFingering: true,
        pdf: 'sheets/trumpet-1.pdf',
        pages: ['sheets/trumpet-1.jpg', 'sheets/euphonium-1.jpg'],
        bars: TENOR_SAX_LEAD_BB
      },
      {
        id: 'trumpet-1',
        name: 'Trumpet 1',
        badge: 'B♭ Treble',
        group: 'B♭ Treble Parts',
        detail: 'Written F major · Soprano Lead',
        clef: 'treble',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        voiceId: 'trumpet-1',
        semitonesToConcert: -2,
        supportsSaxFingering: true,
        pdf: 'sheets/trumpet-1.pdf',
        pages: ['sheets/trumpet-1.jpg'],
        bars: TRUMPET_1_BB
      },
      {
        id: 'trumpet-2',
        name: 'Trumpet 2',
        badge: 'B♭ Treble',
        group: 'B♭ Treble Parts',
        detail: 'Written F major · Harmony',
        clef: 'treble',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        voiceId: 'trumpet-2',
        semitonesToConcert: -2,
        supportsSaxFingering: true,
        pdf: 'sheets/trumpet-2.pdf',
        pages: ['sheets/trumpet-2.jpg'],
        bars: TRUMPET_2_BB
      },
      {
        id: 'euphonium-1',
        name: 'Euphonium 1 / Sax Tenor Voice',
        badge: 'B♭ Treble',
        group: 'B♭ Treble Parts',
        detail: 'Written F major · Trombone 1 in B♭ TC',
        clef: 'treble',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        voiceId: 'trombone-1',
        semitonesToConcert: -14,
        supportsSaxFingering: true,
        pdf: 'sheets/euphonium-1.pdf',
        pages: ['sheets/euphonium-1.jpg'],
        bars: EUPHONIUM_1_BB
      },
      {
        id: 'euphonium-2',
        name: 'Euphonium 2',
        badge: 'B♭ Treble',
        group: 'B♭ Treble Parts',
        detail: 'Written F major · Trombone 2 in B♭ TC',
        clef: 'treble',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        voiceId: 'trombone-2',
        semitonesToConcert: -14,
        supportsSaxFingering: true,
        pdf: 'sheets/euphonium-2.pdf',
        pages: ['sheets/euphonium-2.jpg'],
        bars: EUPHONIUM_2_BB
      },
      {
        id: 'horn-f',
        name: 'Horn in F',
        badge: 'F Treble',
        group: 'Horns (F / E♭)',
        detail: 'Written B♭ major · Alto/Tenor Voice',
        clef: 'treble',
        writtenKey: 'B♭ major',
        keySignature: ['Bb', 'Eb'],
        voiceId: 'horn-f',
        semitonesToConcert: -7,
        supportsSaxFingering: false,
        pdf: 'sheets/horn-f.pdf',
        pages: ['sheets/horn-f.jpg'],
        bars: HORN_F
      },
      {
        id: 'horn-eb',
        name: 'Horn in E♭',
        badge: 'E♭ Treble',
        group: 'Horns (F / E♭)',
        detail: 'Written C major · Same line for E♭ Horn',
        clef: 'treble',
        writtenKey: 'C major',
        keySignature: [],
        voiceId: 'horn-f',
        semitonesToConcert: -9,
        supportsSaxFingering: false,
        pdf: 'sheets/horn-eb.pdf',
        pages: ['sheets/horn-eb.jpg'],
        bars: HORN_EB
      },
      {
        id: 'trombone-1',
        name: 'Trombone 1',
        badge: 'Bass Clef · C',
        group: 'Bass Clef (Concert)',
        detail: 'Concert E♭ major · Tenor Lead & [A] Solo',
        clef: 'bass',
        writtenKey: 'E♭ major',
        keySignature: ['Bb', 'Eb', 'Ab'],
        voiceId: 'trombone-1',
        semitonesToConcert: 0,
        supportsSaxFingering: false,
        pdf: 'sheets/trombone-1.pdf',
        pages: ['sheets/trombone-1.jpg'],
        bars: TROMBONE_1
      },
      {
        id: 'trombone-2',
        name: 'Trombone 2',
        badge: 'Bass Clef · C',
        group: 'Bass Clef (Concert)',
        detail: 'Concert E♭ major · Baritone Counterline',
        clef: 'bass',
        writtenKey: 'E♭ major',
        keySignature: ['Bb', 'Eb', 'Ab'],
        voiceId: 'trombone-2',
        semitonesToConcert: 0,
        supportsSaxFingering: false,
        pdf: 'sheets/trombone-2.pdf',
        pages: ['sheets/trombone-2.jpg'],
        bars: TROMBONE_2
      },
      {
        id: 'tuba',
        name: 'Tuba',
        badge: 'Bass Clef · C',
        group: 'Bass Clef (Concert)',
        detail: 'Concert E♭ major · Bass Foundation',
        clef: 'bass',
        writtenKey: 'E♭ major',
        keySignature: ['Bb', 'Eb', 'Ab'],
        voiceId: 'tuba',
        semitonesToConcert: 0,
        supportsSaxFingering: false,
        pdf: 'sheets/tuba.pdf',
        pages: ['sheets/tuba.jpg'],
        bars: TUBA
      }
    ]
  };
})();
