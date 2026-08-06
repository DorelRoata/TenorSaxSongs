# Tenor Sax Songs

Interactive B-flat tenor saxophone play-alongs with synchronized notation,
adjustable tempo, concert-pitch backing, and printable PDF parts.

## Songs

| Song | Type | Level |
| --- | --- | --- |
| Amazing Grace | Traditional | Beginner |
| Midnight Slow Blues | Original | Intermediate |
| Pocket Line Funk | Original | Intermediate |
| St. Louis Blues | W.C. Handy, public domain | Intermediate |
| Rail Yard B-flat Blues | Original | Intermediate |
| Lanterns in the Rain | Original | Intermediate |

Open `index.html` to browse the collection.

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
