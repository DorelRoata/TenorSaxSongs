# Tenor Sax Songs

Interactive B-flat tenor saxophone and brass play-alongs with synchronized SVG
notation, live dockable fingering HUD, phrase looping, click-any-bar seeking,
adjustable tempo, concert-pitch backing, multi-voice ensemble mixer, and
printable PDF parts.

## Songs

| # | Song | Type | Time | Keys (Written / Concert) | Level |
| --- | --- | --- | --- | --- | --- |
| 01 | Amazing Grace | Traditional Hymn | 3/4 | D major / C major | Beginner |
| 02 | Midnight Slow Blues | Original Blues | 4/4 | C blues / B♭ blues | Intermediate |
| 03 | Pocket Line Funk | Original Funk | 4/4 | A minor / G minor | Intermediate |
| 04 | St. Louis Blues | W.C. Handy (1914) | 4/4 | D blues / C blues | Intermediate |
| 05 | Rail Yard B-flat Blues | Original 2-Chorus Blues | 4/4 | C blues / B♭ blues | Intermediate |
| 06 | Lanterns in the Rain | Original Ballad | 12/8 | G major / F major | Intermediate |
| 07 | Roads We Leave Behind | Original Acoustic Folk | 6/8 | G major / F major | Intermediate |
| 08 | Joy to the World (Freue dich Welt!) | Handel, arr. A. Perebikovski | 4/4 | F major / E♭ major | 5-Piece B♭ Quintet Score + 5 Parts |

Open `index.html` to browse and filter the collection by instrument, style, or level.

**Joy to the World** opens with a 5-voice synthesized B-flat Quintet playback engine, per-voice Mute/Solo mixer, Minus-One practice mode, and interactive SVG notation tailored to each player's skill level (all in Written F major / Concert E-flat major):
- **Full 5-Part Score** (All 5 B-flat staves in Written F major)
- **Soprano Sax in B-flat** (Advanced / Best Player — Continuous Lead melody + `[A]` lyrical solo + high `A5–G5–F5` Coda, with live sax fingerings)
- **Trumpet in B-flat** (Intermediate — Doubles opening/return fanfare melody, plays comfortable `C4–C5` upper harmony, `[A]` eighth-note pulse, and safe `C5` Coda)
- **Clarinet 1 in B-flat** (More Advanced — Counter-melody, 16th-note fanfare pickups, `[A]` 3rd-harmony duet with Soprano Sax, and `D♭5–E♭5–F5` Coda climb)
- **Clarinet 2 in B-flat** (More Advanced — Agile running 8th-note cascades, dotted-eighth/sixteenth figures, arpeggio pickups, and inner harmony)
- **Tenor Sax in B-flat** (Intermediate — Anchors the ensemble as the Bass & Baritone foundation in a smooth `C4–D5` written range, with live sax fingerings)

## Structure

```text
songs/
  amazing-grace/
    tenor-sax/
      index.html
      song.js
      sheet.pdf
  joy-to-the-world/
    index.html
    song.js
    sheets/
      score.pdf, score-1.jpg, score-2.jpg, ...
shared/
  catalog.js
  player.css
  player.js
  song-page.html
```
