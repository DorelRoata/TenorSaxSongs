# Tenor Sax Songs

Interactive B-flat tenor saxophone play-alongs with synchronized notation,
adjustable tempo, concert-pitch backing, note-specific fingering charts, and
printable PDF parts.

## Songs

| Song | Type | Level |
| --- | --- | --- |
| Amazing Grace | Traditional | Beginner |
| Midnight Slow Blues | Original | Intermediate |
| Pocket Line Funk | Original | Intermediate |
| St. Louis Blues | W.C. Handy, public domain | Intermediate |
| Rail Yard B-flat Blues | Original | Intermediate |
| Lanterns in the Rain | Original | Intermediate |
| Roads We Leave Behind | Original | Intermediate |
| Joy to the World (Freue dich Welt!) | Handel, arr. Perebikovski | Brass score and parts |

Open `index.html` to browse the collection. Joy to the World opens on the full score. The same page also switches to trumpet 1, trumpet 2, horn in F, horn in E-flat, trombone 1, trombone 2, euphonium 1, euphonium 2, and tuba. Horn in E-flat and the euphonium parts are the same music in the other usual clefs.

## Structure

Parts are organized by song and then instrument so more instruments can be
added without changing existing song URLs:

```text
songs/
  amazing-grace/
    tenor-sax/
      index.html
      song.js
      sheet.pdf
shared/
  player.css
  player.js
  song-page.html
```

`song.js` contains instrument-specific written notes and concert-pitch backing
chords. All parts use the shared notation and playback engine.
