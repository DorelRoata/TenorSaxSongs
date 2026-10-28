(() => {
  const CATALOG = [
    {
      number: '01',
      slug: 'amazing-grace',
      title: 'Amazing Grace',
      origin: 'TRADITIONAL',
      category: 'solo',
      style: 'hymn',
      styleLabel: 'Hymn / Sacred',
      level: 'Beginner',
      tempo: '72 BPM',
      bpm: 72,
      time: '3/4',
      writtenKey: 'D major',
      concertKey: 'C major',
      bars: 16,
      instruments: ['B♭ Tenor Sax'],
      href: 'songs/amazing-grace/tenor-sax/',
      description: 'A warm 3/4 hymn arrangement for shaping long phrases and steady breath support.'
    },
    {
      number: '02',
      slug: 'midnight-slow-blues',
      title: 'Midnight Slow Blues',
      origin: 'ORIGINAL',
      category: 'solo',
      style: 'blues',
      styleLabel: 'Blues & Swing',
      level: 'Intermediate',
      tempo: '58 BPM',
      bpm: 58,
      time: '4/4',
      writtenKey: 'C blues',
      concertKey: 'B♭ blues',
      bars: 12,
      instruments: ['B♭ Tenor Sax'],
      href: 'songs/midnight-slow-blues/tenor-sax/',
      description: 'A laid-back 12-bar blues with bends, space, and a smoky backing groove.'
    },
    {
      number: '03',
      slug: 'pocket-line-funk',
      title: 'Pocket Line Funk',
      origin: 'ORIGINAL',
      category: 'solo',
      style: 'funk',
      styleLabel: 'Funk & Groove',
      level: 'Intermediate',
      tempo: '94 BPM',
      bpm: 94,
      time: '4/4',
      writtenKey: 'A minor',
      concertKey: 'G minor',
      bars: 16,
      instruments: ['B♭ Tenor Sax'],
      href: 'songs/pocket-line-funk/tenor-sax/',
      description: 'Offbeat attitude, syncopated phrases, and a tight clav/bass rhythm section.'
    },
    {
      number: '04',
      slug: 'st-louis-blues',
      title: 'St. Louis Blues',
      origin: 'W.C. HANDY',
      category: 'solo',
      style: 'blues',
      styleLabel: 'Blues & Swing',
      level: 'Intermediate',
      tempo: '76 BPM',
      bpm: 76,
      time: '4/4',
      writtenKey: 'D blues',
      concertKey: 'C blues',
      bars: 12,
      instruments: ['B♭ Tenor Sax'],
      href: 'songs/st-louis-blues/tenor-sax/',
      description: 'A public-domain 1914 blues standard arranged as a concise tenor sax study.'
    },
    {
      number: '05',
      slug: 'rail-yard-bb-blues',
      title: 'Rail Yard B♭ Blues',
      origin: 'ORIGINAL',
      category: 'solo',
      style: 'blues',
      styleLabel: 'Blues & Swing',
      level: 'Intermediate',
      tempo: '88 BPM',
      bpm: 88,
      time: '4/4',
      writtenKey: 'C blues',
      concertKey: 'B♭ blues',
      bars: 24,
      instruments: ['B♭ Tenor Sax'],
      href: 'songs/rail-yard-bb-blues/tenor-sax/',
      description: 'A written 12-bar blues chorus followed by a 12-bar solo chorus with guide tones.'
    },
    {
      number: '06',
      slug: 'lanterns-in-the-rain',
      title: 'Lanterns in the Rain',
      origin: 'ORIGINAL',
      category: 'solo',
      style: 'ballad',
      styleLabel: 'Ballad & Folk',
      level: 'Intermediate',
      tempo: '62 BPM',
      bpm: 62,
      time: '12/8',
      writtenKey: 'G major',
      concertKey: 'F major',
      bars: 16,
      instruments: ['B♭ Tenor Sax'],
      href: 'songs/lanterns-in-the-rain/tenor-sax/',
      description: 'The lyrical 12/8 ballad that started the collection, with flowing compound-meter lines.'
    },
    {
      number: '07',
      slug: 'roads-we-leave-behind',
      title: 'Roads We Leave Behind',
      origin: 'ORIGINAL',
      category: 'solo',
      style: 'ballad',
      styleLabel: 'Ballad & Folk',
      level: 'Intermediate',
      tempo: '70 BPM',
      bpm: 70,
      time: '6/8',
      writtenKey: 'G major',
      concertKey: 'F major',
      bars: 16,
      instruments: ['B♭ Tenor Sax'],
      href: 'songs/roads-we-leave-behind/tenor-sax/',
      description: 'A gentle acoustic-folk ballad in 6/8 with a warm, unhurried original melody.'
    },
    {
      number: '08',
      slug: 'joy-to-the-world',
      title: 'Joy to the World',
      origin: 'G. F. HANDEL · ARR. PEREBIKOVSKI',
      category: 'ensemble',
      style: 'hymn',
      styleLabel: '5-Piece B♭ Quintet',
      level: 'Score + 5 Parts',
      tempo: '92 BPM · Moderato',
      bpm: 92,
      time: '4/4',
      writtenKey: 'F major (All B♭ Parts)',
      concertKey: 'E♭ major',
      bars: 28,
      instruments: ['Full 5-Part Score', 'Soprano Sax B♭', 'Trumpet B♭', 'Clarinet 1 B♭', 'Clarinet 2 B♭', 'Tenor Sax B♭'],
      href: 'songs/joy-to-the-world/',
      description: 'Freue dich Welt! Interactive 5-voice B♭ Quintet play-along (Soprano Sax, Trumpet, 2 Clarinets, Tenor Sax), all in Written F major.',
      quickLinks: [
        { label: 'Full 5-Part Score', hash: '#score' },
        { label: 'Soprano Sax (Lead)', hash: '#soprano-sax' },
        { label: 'Trumpet in B♭', hash: '#trumpet' },
        { label: 'Clarinet 1 in B♭', hash: '#clarinet-1' },
        { label: 'Clarinet 2 in B♭', hash: '#clarinet-2' },
        { label: 'Tenor Sax (Bass/Baritone)', hash: '#tenor-sax' }
      ]
    }
  ];

  window.SONG_CATALOG = CATALOG;

  function mountSongNav() {
    const backLink = document.querySelector('header .back');
    if (!backLink || document.querySelector('.song-nav-bar')) return;

    const rootPrefix = backLink.getAttribute('href') || '../../';
    const path = location.pathname.replace(/\\/g, '/');
    const currentIndex = CATALOG.findIndex(item => path.includes(`/songs/${item.slug}/`));
    if (currentIndex === -1) return;

    const prev = CATALOG[(currentIndex - 1 + CATALOG.length) % CATALOG.length];
    const next = CATALOG[(currentIndex + 1) % CATALOG.length];

    const nav = document.createElement('nav');
    nav.className = 'song-nav-bar';
    nav.setAttribute('aria-label', 'Collection navigation');

    const allLink = document.createElement('a');
    allLink.className = 'back-pill';
    allLink.href = rootPrefix;
    allLink.textContent = '← Collection';

    const pager = document.createElement('div');
    pager.className = 'song-pager';

    const prevLink = document.createElement('a');
    prevLink.className = 'nav-step';
    prevLink.href = rootPrefix + prev.href;
    prevLink.title = `Previous: ${prev.number} · ${prev.title}`;
    prevLink.textContent = `‹ ${prev.number} ${prev.title}`;

    const select = document.createElement('select');
    select.className = 'song-jumper';
    select.setAttribute('aria-label', 'Jump to another song');
    CATALOG.forEach((song, idx) => {
      const opt = document.createElement('option');
      opt.value = rootPrefix + song.href;
      opt.selected = idx === currentIndex;
      opt.textContent = `${song.number} · ${song.title} (${song.time})`;
      select.append(opt);
    });
    select.addEventListener('change', () => {
      if (select.value) location.href = select.value;
    });

    const nextLink = document.createElement('a');
    nextLink.className = 'nav-step';
    nextLink.href = rootPrefix + next.href;
    nextLink.title = `Next: ${next.number} · ${next.title}`;
    nextLink.textContent = `${next.number} ${next.title} ›`;

    pager.append(prevLink, select, nextLink);
    nav.append(allLink, pager);

    backLink.replaceWith(nav);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountSongNav);
  } else {
    mountSongNav();
  }
})();
