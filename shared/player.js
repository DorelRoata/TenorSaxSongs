(()=>{
const s=window.SONG,NS='http://www.w3.org/2000/svg',svg=document.querySelector('#sheet'),noteEls=[];
const $=id=>document.getElementById(id),pitchIndex={C:0,D:1,E:2,F:3,G:4,A:5,B:6},semis={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
document.title=`${s.title} - Tenor Sax Play-Along`;$('title').textContent=s.title;$('subtitle').textContent=s.subtitle;$('badge').textContent=`B♭ Tenor Sax · ${s.level}`;$('counting').innerHTML=s.counting;$('transposition').textContent=`The written ${s.writtenKey} part sounds in concert ${s.concertKey}. Play the notes as shown; the backing is already transposed.`;$('status').textContent=`Ready · Written ${s.writtenKey}`;
const tempo=$('tempo');tempo.min=s.tempoRange[0];tempo.max=s.tempoRange[1];tempo.value=s.tempo;$('tempoValue').textContent=s.tempo;
function el(name,attrs={},text=''){const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);n.textContent=text;return n}
function parts(p){return{letter:p[0],sharp:p.includes('#'),flat:p.includes('b'),octave:+p.at(-1)}}
function midi(p){const q=parts(p);return 12*(q.octave+1)+semis[q.letter]+(q.sharp?1:0)-(q.flat?1:0)}
function yFor(p,y){const q=parts(p),s=q.octave*7+pitchIndex[q.letter];return y+20-(s-(4*7+pitchIndex.E))*5}
function draw(){
 const systems=Math.ceil(s.bars.length/4),systemGap=systems>4?108:150,height=100+systems*systemGap;svg.setAttribute('viewBox',`0 0 1100 ${height}`);svg.replaceChildren();noteEls.length=0;
 svg.append(el('text',{x:50,y:31,class:'title-svg'},s.title));svg.append(el('text',{x:50,y:54,class:'meta'},s.direction));svg.append(el('text',{x:865,y:54,class:'meta'},`${s.beatName} = ${s.tempo} · ${s.time[0]}/${s.time[1]}`));
 const left=55,width=990,barW=width/4;
 s.bars.forEach((bar,bi)=>{const sys=Math.floor(bi/4),slot=bi%4,top=75+sys*systemGap,base=top+50,bx=left+slot*barW;
  if(slot===0){for(let l=0;l<5;l++)svg.append(el('line',{x1:left,y1:base-20+l*10,x2:left+width,y2:base-20+l*10,class:'staff'}));svg.append(el('text',{x:left+3,y:base+16,'font-size':54,'font-family':'Georgia'},'𝄞'));(s.keySignature||[]).forEach((s,i)=>svg.append(el('text',{x:left+44+i*11,y:base-15+(i%2)*5,'font-size':16},s.includes('#')?'♯':'♭')));svg.append(el('text',{x:left+66+(s.keySignature||[]).length*9,y:base-2,'font-size':14},s.time[0]));svg.append(el('text',{x:left+66+(s.keySignature||[]).length*9,y:base+15,'font-size':14},s.time[1]))}
  svg.append(el('line',{x1:bx,y1:base-20,x2:bx,y2:base+20,class:'barline'}));svg.append(el('text',{x:bx+5,y:top+10,class:'measure-no'},String(bi+1)));
  const lead=slot===0?105:18,start=bx+lead,usable=barW-lead-10;let cursor=0;
  bar.forEach(([pitch,dur])=>{const x=start+(cursor+dur/2)/s.unitsPerBar*usable,g=el('g',{class:'note','data-index':noteEls.length});
   if(pitch==='R'){g.append(el('text',{x,y:base+7,'font-size':26,'text-anchor':'middle',fill:'#19231f'},'𝄽'));g.append(el('text',{x,y:base+48,class:'note-label'},'rest'))}
   else{const y=yFor(pitch,base),q=parts(pitch),key=s.keySignature||[];if(q.sharp&&!key.includes(`${q.letter}#`))g.append(el('text',{x:x-13,y:y+5,'font-size':17},'♯'));if(q.flat&&!key.includes(`${q.letter}b`))g.append(el('text',{x:x-13,y:y+5,'font-size':17},'♭'));for(let ly=base-30;ly>=y;ly-=10)svg.append(el('line',{x1:x-9,y1:ly,x2:x+9,y2:ly,class:'staff'}));for(let ly=base+30;ly<=y;ly+=10)svg.append(el('line',{x1:x-9,y1:ly,x2:x+9,y2:ly,class:'staff'}));const open=dur>=4;g.append(el('ellipse',{cx:x,cy:y,rx:7,ry:4.8,transform:`rotate(-18 ${x} ${y})`,class:open?'note-head half':'note-head'}));if(dur<s.unitsPerBar){const up=y>base-2,stemX=x+(up?6:-6),stemEnd=y+(up?-31:31);g.append(el('line',{x1:stemX,y1:y,x2:stemX,y2:stemEnd,class:'note-stem'}));if(dur===1)g.append(el('path',{d:up?`M${stemX} ${stemEnd} q12 7 6 17`:`M${stemX} ${stemEnd} q-12 -7 -6 -17`,class:'note-flag'}))}if(dur===3||dur===6)g.append(el('circle',{cx:x+12,cy:y,r:1.8,fill:'#19231f'}));g.append(el('text',{x,y:base+48,class:'note-label'},pitch.replace('#','♯').replace('b','♭')));g.append(el('circle',{cx:x,cy:y,r:8,class:'pulse'}))}
   svg.append(g);noteEls.push(g);cursor+=dur});if(Math.abs(cursor-s.unitsPerBar)>.001)console.error(`Bar ${bi+1} totals ${cursor}, expected ${s.unitsPerBar}`);if(bi===s.bars.length-1)svg.append(el('line',{x1:bx+barW-4,y1:base-20,x2:bx+barW-4,y2:base+20,stroke:'#35423c','stroke-width':4}))});
 svg.append(el('text',{x:50,y:height-22,class:'meta'},`${s.credit} · B♭ tenor sax part`))
}
draw();
const fingerCards=new Map(),fingerGrid=$('fingerGrid'),fingerDialog=$('fingerDialog');
function fingering(p){
 const n=midi(p),pc=((n%12)+12)%12,map={1:[[], 'open'],2:[[1,1,1,1,1,1],''],3:[[1,1,1,1,1,1],'E♭ pinky'],4:[[1,1,1,1,1,0],''],5:[[1,1,1,1,0,0],''],6:[[1,1,1,0,1,0],''],7:[[1,1,1,0,0,0],''],8:[[1,1,1,0,0,0],'G♯ pinky'],9:[[1,1,0,0,0,0],''],10:[[1,0,0,0,0,0],'Bis B♭'],11:[[1,0,0,0,0,0],'']};
 if(pc===0)return n<72?{keys:[1,1,1,1,1,1],modifier:'Low C pinky',octave:false}:{keys:[0,1,0,0,0,0],modifier:'',octave:false};
 const [keys,modifier]=map[pc];return{keys,modifier,octave:n>=74}
}
function drawFingerings(){
 const pitches=[...new Set(s.bars.flat().map(n=>n[0]).filter(p=>p!=='R'))].sort((a,b)=>midi(a)-midi(b));
 pitches.forEach(p=>{const f=fingering(p),card=document.createElement('article');card.className='finger-card';card.dataset.pitch=p;card.innerHTML=`<div class="finger-note"><strong>${p.replace('#','♯').replace('b','♭')}</strong></div><div class="sax-diagram"><span class="octave-lever ${f.octave?'on':''}">OCT</span><span class="hand-tag left">LEFT</span><span class="hand-tag right">RIGHT</span><div class="sax-body">${f.keys.map((on,i)=>`<i class="pearl ${on?'on':''}" aria-label="${i<3?'Left':'Right'} key ${i%3+1}"></i>`).join('')}</div></div><div class="modifier">${f.modifier||'Standard keys'}</div>`;fingerGrid.append(card);fingerCards.set(p,card)})
}
function activeFingering(p){fingerCards.forEach((card,pitch)=>card.classList.toggle('current',pitch===p));if(p&&fingerDialog.open)fingerCards.get(p)?.scrollIntoView({block:'nearest',behavior:'smooth'})}
drawFingerings();$('finger').addEventListener('click',()=>fingerDialog.showModal());$('closeFinger').addEventListener('click',()=>fingerDialog.close());fingerDialog.addEventListener('click',e=>{if(e.target===fingerDialog)fingerDialog.close()});
let audio,playing=false,timers=[];const play=$('play'),status=$('status');
function hz(n){return 440*Math.pow(2,(n-69)/12)}
function tone(freq,start,duration,volume=.07,type='sine'){const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.018);g.gain.exponentialRampToValueAtTime(.0001,start+Math.max(.04,duration-.025));o.connect(g).connect(audio.destination);o.start(start);o.stop(start+duration)}
function click(t,accent){tone(accent?1050:760,t,.045,accent?.07:.035,'square')}
function backing(chord,start,beat,eighth){
 if(s.style==='funk'){for(let b=0;b<s.beatsPerBar;b++){const t=start+b*beat;tone(hz(chord[b%2]-12),t,eighth*.75,.07,'sawtooth');tone(hz(chord[2]),t+(b?eighth:0),eighth*.38,.025,'square')}}
 else if(s.style==='blues'||s.style==='swing'){for(let b=0;b<s.beatsPerBar;b++){const t=start+b*beat;tone(hz(chord[b%chord.length]-12),t,beat*.75,.055,'triangle');if(b===1||b===3)chord.slice(1).forEach(n=>tone(hz(n),t,beat*.45,.018,'sine'))}}
 else if(s.style==='hymn'){for(let b=0;b<s.beatsPerBar;b++){const t=start+b*beat;chord.forEach((n,i)=>tone(hz(n-(i?0:12)),t,beat*.82,.022,'sine'))}}
 else{for(let b=0;b<s.beatsPerBar;b++){const t=start+b*beat;[0,2,1,3,1,2].forEach((ci,j)=>tone(hz(chord[ci%chord.length]-(ci?0:12)),t+j*beat/6,beat/6*.9,.03,j%2?'sine':'triangle'))}}
}
function clear(){noteEls.forEach(n=>n.setAttribute('class','note'));activeFingering(null)}
function stop(){timers.forEach(clearTimeout);timers=[];if(audio){audio.close();audio=null}playing=false;play.textContent='▶ Play';clear();status.textContent=`Ready · Written ${s.writtenKey}`}
function schedule(){stop();audio=new(AudioContext||webkitAudioContext)();playing=true;play.textContent='❚❚ Pause';const bpm=+tempo.value,beat=60/bpm,unit=beat/s.beatUnit,countIn=beat*s.beatsPerBar*2,start=audio.currentTime+.12,melody=$('melodyCue').checked;for(let i=0;i<s.beatsPerBar*2;i++)click(start+i*beat,i%s.beatsPerBar===0);status.textContent='Count in · 2 bars';let units=0,index=0;
 s.bars.forEach((bar,bi)=>{const barStart=start+countIn+bi*s.unitsPerBar*unit;backing(s.chords[bi%s.chords.length],barStart,beat,unit);for(let b=0;b<s.beatsPerBar;b++)click(barStart+b*beat,b===0);bar.forEach(([pitch,dur])=>{const when=start+countIn+units*unit,id=index,ms=(when-audio.currentTime)*1000;if(melody&&pitch!=='R')tone(hz(midi(pitch)-14),when,dur*unit*.92,.08,s.style==='funk'?'sawtooth':'triangle');timers.push(setTimeout(()=>{noteEls.forEach((n,i)=>n.setAttribute('class',i<id?'note past':i===id?'note active':'note'));const pulse=noteEls[id].querySelector('.pulse');if(pulse){pulse.classList.remove('on');void pulse.getBBox();pulse.classList.add('on')}activeFingering(pitch==='R'?null:pitch);status.textContent=`Bar ${bi+1} · ${pitch==='R'?'Rest':pitch.replace('#','♯').replace('b','♭')}`;noteEls[id].scrollIntoView({behavior:'smooth',block:'center'})},Math.max(0,ms)));units+=dur;index++})});
 timers.push(setTimeout(()=>{$('loop').checked?schedule():stop()},(countIn+units*unit)*1000+150))}
play.addEventListener('click',()=>playing?stop():schedule());$('stop').addEventListener('click',stop);$('print').addEventListener('click',()=>window.print());tempo.addEventListener('input',()=>{$('tempoValue').textContent=tempo.value;if(playing)schedule()});window.addEventListener('beforeunload',stop)
})();
