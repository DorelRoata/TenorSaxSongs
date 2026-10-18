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
| 08 | Joy to the World (Freue dich Welt!) | Handel, arr. A. Perebikovski | 4/4 | F / B♭ / C / E♭ (Concert E♭) | Brass Score + 10 Parts |

Open `index.html` to browse and filter the collection by instrument, style, or level.

**Joy to the World** opens with a 6-voice synthesized brass & B-flat tenor sax playback engine, per-voice Mute/Solo mixer, Minus-One practice mode, interactive SVG notation, and engraved sheets for:
- **Together** (Full Score in Concert E-flat, with 1-page / 2-page spread viewer)
- **Tenor Sax Lead in B-flat** (Lead melody + Section `[A]` solo line in written F major, with live B-flat sax fingerings)
- **Trumpet 1 & Trumpet 2 in B-flat**
- **Euphonium 1 & Euphonium 2** (treble clef in B-flat)
- **Horn in F & Horn in E-flat**
- **Trombone 1, Trombone 2 & Tuba** (concert bass clef)

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
