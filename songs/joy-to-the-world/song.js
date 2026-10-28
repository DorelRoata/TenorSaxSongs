// Joy to the World (Freue dich Welt!) - G. F. Handel, arr. A. Perebikovski
// Adapted for 5-Piece B-flat Quintet:
//   1. Soprano Sax (Advanced / Best Player) - Continuous Lead + [A] Solo + High Coda
//   2. Trumpet (Intermediate)               - Fanfare Co-Lead + Upper Harmony (Safe C4-F5 range)
//   3. Clarinet 1 (More Advanced)           - Counter-Melody + Fanfare Pickups + [A] Solo Harmony
//   4. Clarinet 2 (More Advanced)           - Agile Contrapuntal Inner Line + Rhythmic Pulse
//   5. Tenor Sax (Intermediate)             - Bass & Baritone Foundation (Smooth C4-D5 range)
// 28 measures, 4/4 time, 16 sixteenth-note units per bar (quarter = 4, eighth = 2, sixteenth = 1)
// All 5 instruments read in Written F Major (1 flat: Bb), sounding in Concert Eb Major.
(() => {
  // 1. Soprano Sax in Bb (Advanced / Best Player)
  // Written in F major (1 flat Bb), sounds 2 semitones lower in Concert Eb.
  // Plays the primary melody in [Intro] & [B], takes the featured lyrical solo in [A] (bars 11-15),
  // and soars up to the climactic high A5-G5-F5 descant in the Coda (bars 25-28).
  const SOPRANO_SAX_BB = [
    // 1-5 [Intro]
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
    // 11-15 [A] Featured Lyrical Solo
    [['F5', 4], ['E5', 3], ['D5', 1], ['E5', 8]],
    [['E5', 4], ['D5', 3], ['C5', 1], ['D5', 8]],
    [['D5', 4], ['C5', 3], ['Bb4', 1], ['C5', 2], ['A4', 2], ['C5', 2], ['E5', 2]],
    [['D5', 8], ['C5', 8]],
    [['D5', 8], ['C5', 8]],
    // 16-20 [B] Full Return
    [['F5', 4], ['E5', 3], ['D5', 1], ['C5', 6], ['Bb4', 2]],
    [['A4', 4], ['G4', 4], ['F4', 6], ['C5', 2]],
    [['D5', 6], ['D5', 2], ['E5', 6], ['E5', 2]],
    [['F5', 12], ['F5', 2], ['F5', 2]],
    [['F5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['C5', 3], ['Bb4', 1], ['A4', 2], ['F5', 2]],
    // 21-25 (Bar 24 = Coda)
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

  // 2. Trumpet in Bb (Intermediate)
  // Written in F major (1 flat Bb), sounds 2 semitones lower in Concert Eb.
  // Doubles the bold opening fanfare melody in bars 1-2 and 16-17, then stays in a comfortable
  // intermediate C4-C5 register on the Trumpet 2 harmony, [A] eighth-note pulse, and Coda (no high A5).
  const TRUMPET_BB = [
    // 1-5 (Bars 1-2 double main fanfare; Bars 3-5 play upper harmony)
    [['F5', 4], ['E5', 3], ['D5', 1], ['C5', 6], ['Bb4', 2]],
    [['A4', 4], ['G4', 4], ['F4', 6], ['A4', 2]],
    [['Bb4', 6], ['Bb4', 2], ['C5', 6], ['G4', 2]],
    [['A4', 12], ['A4', 2], ['A4', 2]],
    [['A4', 2], ['C5', 2], ['Bb4', 2], ['A4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['A4', 2]],
    // 6-10
    [['A4', 2], ['C5', 2], ['Bb4', 2], ['A4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['F4', 2]],
    [['F4', 2], ['F4', 2], ['F4', 2], ['F4', 1], ['G4', 1], ['A4', 6], ['G4', 1], ['F4', 1]],
    [['E4', 2], ['E4', 2], ['E4', 2], ['E4', 1], ['F4', 1], ['G4', 6], ['F4', 1], ['E4', 1]],
    [['F4', 2], ['A4', 4], ['Bb4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['G4', 2]],
    [['F4', 4], ['E4', 4], ['F4', 2], ['A4', 2], ['A4', 2], ['A4', 2]],
    // 11-15 [A] Steady eighth-note pulse in comfortable middle staff
    [['A4', 2], ['A4', 2], ['A4', 2], ['A4', 2], ['F4', 2], ['F4', 2], ['F4', 2], ['F4', 2]],
    [['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['E4', 2], ['E4', 2], ['E4', 2], ['E4', 2]],
    [['F#4', 2], ['F#4', 2], ['F#4', 2], ['F#4', 2], ['G4', 2], ['G4', 2], ['G4', 2], ['G4', 2]],
    [['F4', 2], ['F4', 2], ['F4', 2], ['F4', 2], ['E4', 8]],
    [['F4', 8], ['E4', 8]],
    // 16-20 [B] (Bars 16-17 double main fanfare return; Bars 18-20 play upper harmony)
    [['F5', 4], ['E5', 3], ['D5', 1], ['C5', 6], ['Bb4', 2]],
    [['A4', 4], ['G4', 4], ['F4', 6], ['A4', 2]],
    [['Bb4', 6], ['Bb4', 2], ['C5', 6], ['G4', 2]],
    [['A4', 12], ['A4', 2], ['A4', 2]],
    [['A4', 2], ['C5', 2], ['Bb4', 2], ['A4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['A4', 2]],
    // 21-25
    [['A4', 2], ['C5', 2], ['Bb4', 2], ['A4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['F4', 2]],
    [['F4', 2], ['F4', 2], ['F4', 2], ['F4', 1], ['G4', 1], ['A4', 6], ['G4', 1], ['F4', 1]],
    [['E4', 2], ['E4', 2], ['E4', 2], ['E4', 1], ['F4', 1], ['G4', 6], ['F4', 1], ['E4', 1]],
    [['F4', 2], ['A4', 4], ['Bb4', 2], ['A4', 3], ['G4', 1], ['F4', 2], ['G4', 2]],
    [['F4', 4], ['C5', 12]],
    // 26-28 Safe, resonant middle-register Coda ending on C5
    [['A4', 4], ['G4', 4], ['F4', 4], ['C4', 4]],
    [['Db4', 8], ['Bb4', 8]],
    [['C5', 12], ['C5', 4]]
  ];

  // 3. Clarinet 1 in Bb (More Advanced)
  // Written in F major (1 flat Bb), sounds 2 semitones lower in Concert Eb.
  // Covers the 3rd harmony in bars 1-2 & 16-17 while Trumpet doubles the lead, plays the
  // agile dotted/sixteenth counter-melody and fanfare pickups (D5-E5-F5), harmonizes a 3rd below
  // Soprano Sax's solo in [A] (bars 11-15), and drives the Db5-Eb5-F5 Coda climb.
  const CLARINET_1_BB = [
    // 1-5
    [['A4', 4], ['C5', 3], ['Bb4', 1], ['A4', 6], ['G4', 2]],
    [['F4', 4], ['E4', 4], ['F4', 6], ['C5', 2]],
    [['Bb4', 3], ['C5', 1], ['Bb4', 2], ['D5', 2], ['C5', 3], ['D5', 1], ['C5', 2], ['Bb4', 2]],
    [['C5', 4], ['D5', 4], ['D5', 4], ['C5', 2], ['C5', 2]],
    [['C5', 4], ['R', 2], ['D5', 1], ['E5', 1], ['F5', 2], ['R', 4], ['F5', 1], ['C5', 1]],
    // 6-10
    [['A4', 4], ['R', 2], ['D5', 1], ['E5', 1], ['F5', 2], ['R', 6]],
    [['C5', 4], ['G4', 4], ['C5', 2], ['D5', 2], ['E5', 2], ['C5', 2]],
    [['B4', 4], ['G4', 4], ['B4', 2], ['C5', 2], ['D5', 2], ['B4', 2]],
    [['C5', 2], ['C5', 2], ['D5', 2], ['C5', 2], ['C5', 3], ['C5', 1], ['C5', 2], ['Bb4', 2]],
    [['A4', 4], ['Bb4', 4], ['A4', 8]],
    // 11-15 [A] Lyrical Solo Harmony (Duet in 3rds/6ths with Soprano Sax)
    [['D5', 4], ['C5', 3], ['Bb4', 1], ['C5', 8]],
    [['C5', 4], ['Bb4', 3], ['A4', 1], ['Bb4', 8]],
    [['Bb4', 4], ['A4', 3], ['G4', 1], ['A4', 2], ['F4', 2], ['A4', 2], ['C5', 2]],
    [['Bb4', 8], ['A4', 8]],
    [['Bb4', 8], ['B4', 8]],
    // 16-20 [B]
    [['A4', 4], ['C5', 3], ['Bb4', 1], ['A4', 6], ['G4', 2]],
    [['F4', 4], ['E4', 4], ['F4', 6], ['C5', 2]],
    [['F5', 2], ['F5', 2], ['F5', 4], ['E5', 2], ['E5', 2], ['E5', 4]],
    [['C5', 4], ['D5', 4], ['D5', 4], ['C5', 2], ['C5', 2]],
    [['C5', 4], ['R', 2], ['D5', 1], ['E5', 1], ['F5', 2], ['R', 4], ['F5', 1], ['C5', 1]],
    // 21-25
    [['A4', 4], ['R', 2], ['D5', 1], ['E5', 1], ['F5', 2], ['R', 6]],
    [['C5', 4], ['G4', 4], ['C5', 2], ['D5', 2], ['E5', 2], ['C5', 2]],
    [['B4', 4], ['G4', 4], ['B4', 2], ['C5', 2], ['D5', 2], ['B4', 2]],
    [['C5', 2], ['C5', 2], ['D5', 2], ['C5', 2], ['C5', 3], ['C5', 1], ['C5', 2], ['Bb4', 2]],
    [['C5', 8], ['E5', 8]],
    // 26-28 Coda Climb
    [['D5', 8], ['C5', 8]],
    [['Db5', 8], ['Eb5', 8]],
    [['F5', 12], ['F5', 4]]
  ];

  // 4. Clarinet 2 in Bb (More Advanced)
  // Written in F major (1 flat Bb), sounds 2 semitones lower in Concert Eb.
  // Plays the active moving eighth-note cascades (bars 1-2, 4, 16-17, 19), dotted-eighth/sixteenth
  // inner figures (bar 3), sixteenth-note arpeggio answers (A4-C5-F5 in bars 5-6 & 20-21),
  // and interlocking eighth-note pulse in [A].
  const CLARINET_2_BB = [
    // 1-5
    [['F4', 4], ['C5', 3], ['Bb4', 1], ['A4', 2], ['G4', 2], ['F4', 2], ['D4', 2]],
    [['C4', 4], ['C4', 4], ['F4', 2], ['G4', 2], ['A4', 2], ['Bb4', 2]],
    [['Bb4', 3], ['A4', 1], ['G4', 2], ['Bb4', 2], ['Bb4', 3], ['A4', 1], ['Bb4', 2], ['G4', 2]],
    [['A4', 2], ['G4', 2], ['F4', 2], ['E4', 2], ['F4', 2], ['E4', 2], ['D4', 2], ['C4', 2]],
    [['F4', 4], ['R', 2], ['A4', 1], ['C5', 1], ['F5', 2], ['R', 4], ['A4', 1], ['G4', 1]],
    // 6-10
    [['F4', 4], ['R', 2], ['A4', 1], ['C5', 1], ['F5', 2], ['R', 6]],
    [['E4', 4], ['C4', 4], ['F4', 2], ['F4', 2], ['F4', 4]],
    [['D4', 4], ['B3', 4], ['G4', 2], ['G4', 2], ['G4', 4]],
    [['F4', 2], ['F4', 4], ['G4', 2], ['A4', 6], ['F4', 2]],
    [['F4', 4], ['G4', 4], ['F4', 2], ['F4', 2], ['F4', 2], ['F4', 2]],
    // 11-15 [A] Interlocking eighth-note accompaniment
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
    [['E4', 4], ['C4', 4], ['F4', 2], ['F4', 2], ['F4', 4]],
    [['D4', 4], ['B3', 4], ['G4', 2], ['G4', 2], ['G4', 4]],
    [['F4', 2], ['F4', 4], ['G4', 2], ['A4', 6], ['F4', 2]],
    [['A4', 16]],
    // 26-28 Coda Inner Harmony (holds the 3rd A4 in the final chord)
    [['C5', 4], ['A4', 4], ['F4', 4], ['C4', 4]],
    [['Ab4', 8], ['Bb4', 8]],
    [['A4', 12], ['A4', 4]]
  ];

  // 5. Tenor Sax in Bb (Intermediate - Bass & Baritone Foundation)
  // Written in F major (1 flat Bb), sounds 14 semitones lower (1 octave + major 2nd) in Concert Eb.
  // Because Tenor Sax is the lowest-sounding instrument in this 5-piece group, it anchors the
  // harmonic bassline in a smooth, intermediate-friendly written C4-D5 range (Concert Bb2-C4).
  const TENOR_SAX_BB = [
    // 1-5
    [['F4', 4], ['C4', 4], ['F4', 2], ['E4', 2], ['D4', 2], ['Bb4', 2]],
    [['C4', 4], ['C4', 4], ['F4', 4], ['F4', 4]],
    [['Bb4', 4], ['F4', 4], ['A4', 4], ['C5', 4]],
    [['D5', 2], ['C5', 2], ['Bb4', 2], ['A4', 2], ['Bb4', 2], ['A4', 2], ['G4', 2], ['F4', 2]],
    [['C4', 4], ['R', 2], ['G4', 2], ['C5', 4], ['R', 2], ['Bb4', 2]],
    // 6-10
    [['F4', 4], ['R', 2], ['G4', 2], ['C5', 4], ['R', 2], ['A4', 2]],
    [['F4', 4], ['C4', 4], ['F4', 2], ['C5', 2], ['A4', 2], ['F4', 2]],
    [['C4', 4], ['G4', 4], ['C5', 2], ['G4', 2], ['E4', 2], ['C4', 2]],
    [['F4', 2], ['F4', 4], ['D4', 2], ['F4', 4], ['C4', 4]],
    [['C4', 4], ['C4', 4], ['F4', 6], ['R', 2]],
    // 11-15 [A] Warm quarter/half-note harmonic bass foundation
    [['D4', 4], ['D4', 4], ['C4', 4], ['C4', 4]],
    [['G4', 4], ['G4', 4], ['C4', 4], ['C4', 4]],
    [['A4', 4], ['D4', 4], ['G4', 4], ['G4', 4]],
    [['G4', 8], ['C4', 8]],
    [['G4', 8], ['C4', 8]],
    // 16-20 [B]
    [['F4', 4], ['C4', 4], ['F4', 2], ['E4', 2], ['D4', 2], ['Bb4', 2]],
    [['C4', 4], ['C4', 4], ['F4', 4], ['F4', 4]],
    [['Bb4', 4], ['F4', 4], ['A4', 4], ['C5', 4]],
    [['D5', 2], ['C5', 2], ['Bb4', 2], ['A4', 2], ['Bb4', 2], ['A4', 2], ['G4', 2], ['F4', 2]],
    [['C4', 4], ['R', 2], ['G4', 2], ['C5', 4], ['R', 2], ['Bb4', 2]],
    // 21-25
    [['F4', 4], ['R', 2], ['G4', 2], ['C5', 4], ['R', 2], ['A4', 2]],
    [['F4', 4], ['C4', 4], ['F4', 2], ['C5', 2], ['A4', 2], ['F4', 2]],
    [['C4', 4], ['G4', 4], ['C5', 2], ['G4', 2], ['E4', 2], ['C4', 2]],
    [['F4', 2], ['F4', 4], ['D4', 2], ['F4', 4], ['C4', 4]],
    [['F4', 8], ['G4', 8]],
    // 26-28 Coda Bass Foundation
    [['F4', 4], ['C4', 4], ['A4', 4], ['F4', 4]],
    [['Db4', 8], ['Eb4', 8]],
    [['F4', 12], ['F4', 4]]
  ];

  window.ENSEMBLE_SONG = {
    slug: 'joy-to-the-world',
    title: 'Joy to the World',
    subtitle: 'Freue dich Welt! · G. F. Handel, arr. A. Perebikovski · Adapted for 5-Piece B♭ Quintet',
    direction: 'Moderato · B♭ Quintet (Soprano Sax, Trumpet, 2 Clarinets, Tenor Sax)',
    credit: 'G. F. Handel · arr. A. Perebikovski (B♭ Quintet Adaptation)',
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
      { id: 'section-a', label: '[A] Lyrical Duet (11–15)', startBar: 11, endBar: 15 },
      { id: 'section-b', label: '[B] Full Return (16–23)', startBar: 16, endBar: 23 },
      { id: 'coda', label: 'Coda Finale (24–28)', startBar: 24, endBar: 28 }
    ],
    voices: [
      {
        id: 'soprano-sax',
        name: 'Soprano Sax',
        short: 'Sop Sax',
        family: 'bb-quintet',
        clef: 'treble',
        transpositionLabel: 'in B♭',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        semitonesToConcert: -2,
        wave: 'sawtooth',
        gain: 0.058,
        bars: SOPRANO_SAX_BB
      },
      {
        id: 'trumpet',
        name: 'Trumpet in B♭',
        short: 'Trumpet',
        family: 'bb-quintet',
        clef: 'treble',
        transpositionLabel: 'in B♭',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        semitonesToConcert: -2,
        wave: 'sawtooth',
        gain: 0.050,
        bars: TRUMPET_BB
      },
      {
        id: 'clarinet-1',
        name: 'Clarinet 1 in B♭',
        short: 'Clar 1',
        family: 'bb-quintet',
        clef: 'treble',
        transpositionLabel: 'in B♭',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        semitonesToConcert: -2,
        wave: 'triangle',
        gain: 0.058,
        bars: CLARINET_1_BB
      },
      {
        id: 'clarinet-2',
        name: 'Clarinet 2 in B♭',
        short: 'Clar 2',
        family: 'bb-quintet',
        clef: 'treble',
        transpositionLabel: 'in B♭',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        semitonesToConcert: -2,
        wave: 'triangle',
        gain: 0.054,
        bars: CLARINET_2_BB
      },
      {
        id: 'tenor-sax',
        name: 'Tenor Sax in B♭',
        short: 'Ten Sax',
        family: 'bb-quintet',
        clef: 'treble',
        transpositionLabel: 'in B♭ (Bass/Baritone)',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        semitonesToConcert: -14,
        wave: 'sawtooth',
        gain: 0.068,
        bars: TENOR_SAX_BB
      }
    ],
    parts: [
      {
        id: 'score',
        name: 'Full 5-Part Score',
        badge: 'All 5 Players · Written F',
        group: 'Full Quintet Score',
        detail: '5-Part B♭ Quintet Score (Written F major · Sounds Concert E♭)',
        skill: 'Full Ensemble',
        range: 'All 5 Staves',
        clef: 'score',
        writtenKey: 'F major (Concert E♭)',
        keySignature: ['Bb'],
        voiceId: null,
        saxType: null,
        supportsSaxFingering: false,
        pdf: 'sheets/score.pdf',
        pages: ['sheets/score-1.jpg', 'sheets/score-2.jpg'],
        bars: SOPRANO_SAX_BB
      },
      {
        id: 'soprano-sax',
        name: 'Soprano Sax',
        badge: 'Best Player · Lead + [A] Solo',
        group: 'Lead & Brass (B♭)',
        detail: 'Written F major · Continuous Lead, [A] Solo & High A5 Coda (Range F4–A5)',
        skill: 'Advanced (Best Player)',
        range: 'F4 – A5',
        clef: 'treble',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        voiceId: 'soprano-sax',
        semitonesToConcert: -2,
        saxType: 'B♭ Soprano Saxophone',
        supportsSaxFingering: true,
        pdf: 'sheets/trumpet-1.pdf',
        pages: ['sheets/trumpet-1.jpg', 'sheets/euphonium-1.jpg'],
        bars: SOPRANO_SAX_BB
      },
      {
        id: 'trumpet',
        name: 'Trumpet in B♭',
        badge: 'Intermediate · Co-Lead & Harmony',
        group: 'Lead & Brass (B♭)',
        detail: 'Written F major · Fanfare Co-Lead (bars 1–2, 16–17) & Upper Harmony (Safe C4–F5)',
        skill: 'Intermediate',
        range: 'C4 – F5',
        clef: 'treble',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        voiceId: 'trumpet',
        semitonesToConcert: -2,
        saxType: null,
        supportsSaxFingering: false,
        pdf: 'sheets/trumpet-2.pdf',
        pages: ['sheets/trumpet-2.jpg'],
        bars: TRUMPET_BB
      },
      {
        id: 'clarinet-1',
        name: 'Clarinet 1 in B♭',
        badge: 'Advanced · Counter-Melody & [A] Duet',
        group: 'Clarinets (B♭)',
        detail: 'Written F major · Counter-Melody, 16th-Note Fanfare Pickups & [A] Solo Harmony (Range F4–F5)',
        skill: 'More Advanced',
        range: 'F4 – F5',
        clef: 'treble',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        voiceId: 'clarinet-1',
        semitonesToConcert: -2,
        saxType: null,
        supportsSaxFingering: false,
        pdf: 'sheets/euphonium-1.pdf',
        pages: ['sheets/euphonium-1.jpg'],
        bars: CLARINET_1_BB
      },
      {
        id: 'clarinet-2',
        name: 'Clarinet 2 in B♭',
        badge: 'Advanced · Agile Inner Counterline',
        group: 'Clarinets (B♭)',
        detail: 'Written F major · Running 8th Cascades, Arpeggio Pickups & Inner Harmony (Range B3–F5)',
        skill: 'More Advanced',
        range: 'B3 – F5',
        clef: 'treble',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        voiceId: 'clarinet-2',
        semitonesToConcert: -2,
        saxType: null,
        supportsSaxFingering: false,
        pdf: 'sheets/euphonium-2.pdf',
        pages: ['sheets/euphonium-2.jpg'],
        bars: CLARINET_2_BB
      },
      {
        id: 'tenor-sax',
        name: 'Tenor Sax in B♭',
        badge: 'Intermediate · Bass & Baritone',
        group: 'Low Saxophone (B♭)',
        detail: 'Written F major · Harmonic Bass Foundation & Walking Basslines (Smooth C4–D5)',
        skill: 'Intermediate',
        range: 'C4 – D5 (Sounds B♭2–C4)',
        clef: 'treble',
        writtenKey: 'F major',
        keySignature: ['Bb'],
        voiceId: 'tenor-sax',
        semitonesToConcert: -14,
        saxType: 'B♭ Tenor Saxophone',
        supportsSaxFingering: true,
        pdf: 'sheets/euphonium-2.pdf',
        pages: ['sheets/euphonium-2.jpg'],
        bars: TENOR_SAX_BB
      }
    ]
  };
})();
