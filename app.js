/* After Hours — all data stays inside this browser. No external services. */
(() => {
'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const builtIn = [...(Array.isArray(window.AFTER_HOURS_CARDS) ? window.AFTER_HOURS_CARDS : []), ...(Array.isArray(window.AFTER_HOURS_QUICK_CARDS) ? window.AFTER_HOURS_QUICK_CARDS : [])];
const PHASES = ['Warm Up','Turn Up','After Dark'];
const CATEGORIES = {talk:'Conversation',truth:'Daring questions',flirt:'Flirting',party:'Party games',touch:'Affectionate touch',kiss:'Kissing',roleplay:'Roleplay',partner:'Partner connection',private:'Private intimacy (my cards)'};
const CATEGORY_KEYS = Object.keys(CATEGORIES);
const DEFAULT_CATEGORIES=CATEGORY_KEYS.filter(c=>c!=='private'); // Requires an explicit opt-in for intimate user-created cards.
const STORAGE = 'afterhours-free-v2'; // Preserve previously stored preferences during this upgrade.
const escapeHTML = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => (crypto?.randomUUID?.() || ('ah-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)));
const unique = ar => [...new Set(ar)];
const makePlayer = name => ({id:uid(), name, partnerId:null, comfort:2, pairing:'partner', categories:[...DEFAULT_CATEGORIES], approvals:[], notes:'', score:0});
function defaults(){
  // Never invent a second guest or assume a couple exists.
  return {version:2,adult:false,players:[makePlayer('Player 1')],coupleRules:{},settings:{mode:'partners',level:2,turns:6,timer:30,scoring:true,chapters:true,spicyFirst:true,deckMode:'quick',showExamples:true,categories:[...DEFAULT_CATEGORIES]},custom:[],favorites:[],game:{active:false,ended:false,turn:0,phase:0,seen:[],actorCounts:{},current:null,history:[],remaining:30,startPhase:0}};
}
let state=defaults();
let saveOnInit=false;
try {const raw=localStorage.getItem(STORAGE); if(raw){const p=JSON.parse(raw); if(p?.version===2 && Array.isArray(p.players)){
 const d=defaults();state={...d,...p,settings:{...d.settings,...p.settings},game:{...d.game,...p.game}};
 state.players=state.players.slice(0,12).map((pl,i)=>({...makePlayer('Player '+(i+1)),...pl,id:String(pl.id||uid()),name:String(pl.name||'Player').slice(0,40),categories:CATEGORY_KEYS.filter(c=>Array.isArray(pl.categories)&&pl.categories.includes(c)),approvals:Array.isArray(pl.approvals)?pl.approvals.map(String):[],comfort:Math.min(4,Math.max(1,Number(pl.comfort)||1))}));
 state.custom=Array.isArray(state.custom)?state.custom.filter(validCard).slice(0,500):[];
 state.favorites=Array.isArray(state.favorites)?state.favorites.map(String):[];
 // Older builds silently created Alex + Jamie as a linked demo couple. If that
 // untouched demo is still present before a first game, remove it without
 // deleting any custom cards or the adult acknowledgement.
 const demo=state.players.find(pl=>pl.name==='Jamie' && pl.comfort===2 && pl.pairing==='partner' && pl.categories.length===CATEGORY_KEYS.length && !pl.approvals.length && !pl.notes && !pl.score);
 const other=state.players.find(pl=>pl.id!==demo?.id);
 const noSession=!state.game.active&&!state.game.ended&&!(state.game.seen||[]).length;
 if(state.players.length===2&&demo&&other&&['Alex','Glenn','Player 1'].includes(other.name)&&noSession&&other.partnerId===demo.id&&demo.partnerId===other.id&& !Object.keys(state.coupleRules||{}).length){
   state.players=[{...other,partnerId:null}];
   saveOnInit=true;
 }
 }}}catch(e){console.warn('Could not load prior local data',e)}
let currentScreen='home', libraryLimit=18, timerInterval=null, timerTarget=null, toastTimer=null;
const allCards=()=>[...builtIn,...state.custom];
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch(e){console.warn('Browser storage unavailable',e)}}
if(saveOnInit)save();
function notify(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3300)}
function openDialog(title,html,locked=false){$('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=html;$('#overlay').hidden=false;$('#closeDialog').hidden=locked;$('#overlay').dataset.locked=locked?'1':'0';setTimeout(()=>{$('.dialog button:not([hidden])')?.focus()},0)}
function closeDialog(){if($('#overlay').dataset.locked==='1')return;$('#overlay').hidden=true;$('#dialogBody').replaceChildren()}
$('#closeDialog').onclick=closeDialog;
$('#overlay').addEventListener('click',e=>{if(e.target===$('#overlay'))closeDialog()});
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeDialog()});
function consentDialog(){openDialog('Adults only · 18+',`<p>This game is for consenting adults 18 and older. Everyone playing must be free to decline or stop any challenge at any time, without pressure or punishment.</p><p>No photograph, recording, contact, or activity is required. Set boundaries before playing.</p><div class="dialog-actions"><button class="btn ghost" id="ageNo">I am not 18</button><button class="btn primary" id="ageYes">I am 18 or older</button></div>`,true);
 $('#ageYes').onclick=()=>{state.adult=true;save();$('#overlay').dataset.locked='0';closeDialog();notify('Welcome. Your rules come first.')};
 $('#ageNo').onclick=()=>{openDialog('18+ access only',`<p>This game is intended only for adults aged 18 or older.</p>`,true)};
}
function help(){openDialog('How to play',`<p><strong>1.</strong> Add everyone in Players. Link any couples and let each person choose their comfort level, categories, and who they allow in a paired challenge.</p><p><strong>2.</strong> Pick a mode: couples-only, mixed with mutual opt-ins, or group social cards. Each challenge must fit every participant's settings.</p><p><strong>3.</strong> Start the game. Finish, skip, or redraw any challenge. Skipping has no penalty. Timers and scoring are optional.</p><p><strong>Consent comes first:</strong> Always ask in the moment, particularly before physical contact. Pause or stop whenever needed. The game does not share player data online.</p><div class="dialog-actions"><button class="btn primary" id="helpDone">Got it</button></div>`);$('#helpDone').onclick=closeDialog}
$('#topHelp').onclick=help;$('#helpSettings').onclick=help;
function updateResumeButton(){ $('#resumeGame').hidden=!state.game.active; }
function navigate(id){updateResumeButton();if(id==='game'&&!state.game.active&&!state.game.ended){id='setup';notify('Set up players and start the game first.')}
  document.body.classList.toggle('game-open', id==='game');
  currentScreen=id;$$('.screen').forEach(s=>s.classList.toggle('active',s.id===id));$$('[data-nav]').forEach(x=>{x.classList.toggle('active',x.dataset.nav===id);if(x.dataset.nav===id)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')});
  if(id==='setup')renderSetup();if(id==='game'){const g=state.game;if(g.active&&g.current&&!eligibleAssignments(g.phase).some(x=>x.card.id===g.current.cardId&&x.actorId===g.current.actorId&&x.targetId===g.current.targetId)){g.current=null;save();newDraw()}else renderGame();}if(id==='library')renderLibrary();if(id==='home')$('#homeDeck').textContent=builtIn.length+'+';
  stayAtGameTop();
}
function stayAtGameTop(){document.documentElement.style.overflowAnchor='none';document.body.style.overflowAnchor='none';window.scrollTo(0,0);requestAnimationFrame(()=>window.scrollTo(0,0));}
$$('[data-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.nav)));
const playerById = id=>state.players.find(p=>p.id===id);
const coupleKey=(a,b)=>[a,b].sort().join('::');
function pairPlayer(id,targetId){
 const p=playerById(id), t=playerById(targetId);if(!p)return;
 const old=playerById(p.partnerId);if(old)old.partnerId=null;p.partnerId=null;
 if(!t || t.id===p.id)return;
 const prev=playerById(t.partnerId);if(prev)prev.partnerId=null;
 t.partnerId=p.id;p.partnerId=t.id;
}
function couples(){return state.players.filter(p=>p.partnerId && p.id< p.partnerId && playerById(p.partnerId)?.partnerId===p.id).map(p=>[p,playerById(p.partnerId)])}
function describePref(p){const partner=playerById(p.partnerId);return `${partner?'Paired with '+partner.name:'No partner linked'} · Level ${p.comfort} · ${p.categories.length} categories`}
function renderSetup(){
 const openIds=new Set($$('#playersList .player[open]').map(x=>x.dataset.player));
 const hasRendered=!!$('#playersList .player');
 $('#playerCount').textContent=state.players.length;
 const list=$('#playersList');list.innerHTML=state.players.map((p,i)=>`<details class="player" data-player="${escapeHTML(p.id)}" ${openIds.has(p.id)||(!hasRendered&&i===0)?'open':''}><summary><span class="avatar">${escapeHTML((p.name||'?').slice(0,1).toUpperCase())}</span><span class="player-summary"><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(describePref(p))}</small></span><span class="summary-arrow">›</span></summary><div class="player-fields">
 <div class="field-row"><label class="form-field"><span>Name</span><input data-field="name" maxlength="40" value="${escapeHTML(p.name)}" aria-label="Player name"></label><label class="form-field"><span>Partner</span><select data-field="partner"><option value="">No partner</option>${state.players.filter(q=>q.id!==p.id).map(q=>`<option value="${escapeHTML(q.id)}" ${q.id===p.partnerId?'selected':''}>${escapeHTML(q.name)}</option>`).join('')}</select></label></div>
 <div class="field-row"><label class="form-field"><span>Personal comfort level</span><select data-field="comfort">${[1,2,3,4].map((n)=>`<option value="${n}" ${p.comfort===n?'selected':''}>${n} · ${['Easygoing','Flirty','Bold','Adventurous'][n-1]}</option>`).join('')}</select></label><label class="form-field"><span>Pairing preference</span><select data-field="pairing"><option value="partner" ${p.pairing==='partner'?'selected':''}>My partner only</option><option value="mixed" ${p.pairing==='mixed'?'selected':''}>Open to mutually approved pairs</option><option value="group" ${p.pairing==='group'?'selected':''}>Group cards only</option></select></label></div>
 <div class="minor-heading">Activities I opt into</div><div class="check-pills">${CATEGORY_KEYS.map(c=>`<label class="check-pill"><input type="checkbox" data-category="${c}" ${p.categories.includes(c)?'checked':''}><span>${escapeHTML(CATEGORIES[c])}</span></label>`).join('')}</div>
 <label class="form-field" style="margin-top:15px"><span>My boundary notes (for this device only)</span><textarea data-field="notes" maxlength="250" placeholder="Optional, for your own reference">${escapeHTML(p.notes||'')}</textarea></label>
 <div class="player-footer"><button class="subtle-link remove-player" type="button" ${state.players.length<=1?'disabled':''}>Remove player</button></div></div></details>`).join('');
 const c=$('#couplesList');const pairs=couples();$('#unlinkAll').hidden=!pairs.length;c.innerHTML=pairs.length?pairs.map(([a,b])=>{const key=coupleKey(a.id,b.id),v=state.coupleRules[key]||'partner';return `<div class="couple-row"><div><strong>${escapeHTML(a.name)} + ${escapeHTML(b.name)}</strong><p>Shared boundary for this couple</p></div><select class="couple-rule" data-key="${escapeHTML(key)}"><option value="partner" ${v==='partner'?'selected':''}>Partner-only dares</option><option value="mixed" ${v==='mixed'?'selected':''}>Allow mutual mixing</option><option value="group" ${v==='group'?'selected':''}>Group activities only</option></select></div>`}).join(''):`<div class="empty-state">No linked couples yet. You can still play with friends.</div>`;
 const approvals=$('#approvalList');const approvalOpen=new Set($$('#approvalList .approval[open]').map(x=>x.dataset.approval));approvals.innerHTML=state.players.map(p=>{const options=state.players.filter(q=>q.id!==p.id&&q.id!==p.partnerId);return `<details class="approval" data-approval="${escapeHTML(p.id)}" ${approvalOpen.has(p.id)?'open':''}><summary>${escapeHTML(p.name)} · ${p.approvals.filter(id=>options.some(q=>q.id===id)).length} individual approval(s)</summary><p>Only ${escapeHTML(p.name)} can decide which other people to approve. The other person must also approve ${escapeHTML(p.name)}.</p>${options.length?options.map(q=>`<label class="approval-choice"><input type="checkbox" data-approval-from="${escapeHTML(p.id)}" data-approval-to="${escapeHTML(q.id)}" ${p.approvals.includes(q.id)?'checked':''}> ${escapeHTML(q.name)}</label>`).join(''):'<p>No other players to approve.</p>'}</details>`}).join('');
 $('#spicyFirst').checked=state.settings.spicyFirst!==false;
 $('#gameMode').value=state.settings.mode;$('#maxLevel').value=state.settings.level;$('#turnsPerPhase').value=state.settings.turns;$('#defaultTimer').value=state.settings.timer;$('#scoreToggle').checked=state.settings.scoring;$('#chapterToggle').checked=state.settings.chapters;
 $('#globalCategories').innerHTML=CATEGORY_KEYS.map(c=>`<label class="check-pill"><input type="checkbox" data-global-category="${c}" ${state.settings.categories.includes(c)?'checked':''}>${escapeHTML(CATEGORIES[c])}</label>`).join('');
 $('#eligibilityNote').textContent=state.players.length<2?'Add at least one more adult to start.':`${eligibleAssignments(0).length} eligible pairings/cards in Warm Up for your current settings.`;
}
$('#addPlayer').onclick=()=>{if(state.players.length>=12){notify('The maximum is 12 adults.');return;}state.players.push(makePlayer('Player '+(state.players.length+1)));save();renderSetup()};
$('#playersList').addEventListener('change',e=>{const row=e.target.closest('[data-player]');if(!row)return;const p=playerById(row.dataset.player);if(!p)return;
 const field=e.target.dataset.field;if(field==='name'){p.name=e.target.value.trim().slice(0,40)||'Player'}
 if(field==='partner')pairPlayer(p.id,e.target.value);
 if(field==='comfort')p.comfort=+e.target.value;
 if(field==='pairing')p.pairing=e.target.value;
 if(field==='notes')p.notes=e.target.value.slice(0,250);
 if(e.target.dataset.category){const c=e.target.dataset.category;p.categories=e.target.checked?unique([...p.categories,c]):p.categories.filter(x=>x!==c)}
 save();renderSetup();
});
$('#playersList').addEventListener('click',e=>{if(!e.target.matches('.remove-player'))return;const row=e.target.closest('[data-player]');if(state.players.length<=1)return;const p=playerById(row.dataset.player);if(!p)return;state.players=state.players.filter(x=>x.id!==p.id);state.players.forEach(x=>{if(x.partnerId===p.id)x.partnerId=null;x.approvals=x.approvals.filter(y=>y!==p.id)});save();renderSetup()});
$('#couplesList').addEventListener('change',e=>{if(!e.target.matches('.couple-rule'))return;state.coupleRules[e.target.dataset.key]=e.target.value;save();renderSetup()});
$('#approvalList').addEventListener('change',e=>{const p=playerById(e.target.dataset.approvalFrom);if(!p)return;const to=e.target.dataset.approvalTo;p.approvals=e.target.checked?unique([...p.approvals,to]):p.approvals.filter(x=>x!==to);save();const details=e.target.closest('details');const options=state.players.filter(q=>q.id!==p.id&&q.id!==p.partnerId);const count=p.approvals.filter(id=>options.some(q=>q.id===id)).length;details.querySelector('summary').textContent=`${p.name} · ${count} individual approval(s)`;$('#eligibilityNote').textContent=state.players.length<2?'Add at least one more adult to start.':`${eligibleAssignments(0).length} eligible pairings/cards in Warm Up for your current settings.`;});
for(const [id,key,cast] of [['gameMode','mode',String],['maxLevel','level',Number],['turnsPerPhase','turns',Number],['defaultTimer','timer',Number],['scoreToggle','scoring',Boolean],['chapterToggle','chapters',Boolean]]){
 $('#'+id).addEventListener('change',e=>{state.settings[key]=e.target.type==='checkbox'?e.target.checked:cast(e.target.value);save();renderSetup()});
}
$('#spicyFirst').addEventListener('change',e=>{state.settings.spicyFirst=e.target.checked;save();renderSetup()});
$('#unlinkAll').onclick=()=>{state.players.forEach(p=>{p.partnerId=null;p.approvals=[]});state.coupleRules={};save();renderSetup();notify('All partner links removed.');};
$('#globalCategories').addEventListener('change',e=>{const c=e.target.dataset.globalCategory;if(!c)return;state.settings.categories=e.target.checked?unique([...state.settings.categories,c]):state.settings.categories.filter(x=>x!==c);save();renderSetup()});
function allowed(p,c){return !!p && p.comfort>=c.level && p.categories.includes(c.category)}
function coupleRule(p){if(!p.partnerId)return 'mixed';return state.coupleRules[coupleKey(p.id,p.partnerId)]||'partner'}
function mutualMix(a,b){return !!a&&!!b&&a.pairing==='mixed'&&b.pairing==='mixed'&&coupleRule(a)==='mixed'&&coupleRule(b)==='mixed'&&a.approvals.includes(b.id)&&b.approvals.includes(a.id)}
function eligibleAssignments(phase){const s=state.settings;
 const deck=s.deckMode||'quick';const cards=allCards().filter(c=>c.phase===phase&&c.level<=s.level&&s.categories.includes(c.category)&&(deck==='all'||(deck==='quick'&&c.quick===true)||(deck==='private'&&state.custom.some(x=>x.id===c.id))));const res=[];
 for(const c of cards){
  if(s.mode==='group'&&c.scope!=='group')continue;
  if(c.scope==='group'){
   // Group cards are always non-contact: pairwise consent is never implied by group membership.
   if(c.category==='touch'||c.category==='kiss'||c.category==='private')continue;
   if(state.players.length>=2 && state.players.every(p=>allowed(p,c))){res.push({card:c,actorId:null,targetId:null})}continue;
  }
  for(const a of state.players){if(!allowed(a,c)||a.pairing==='group')continue;
   if(c.scope==='solo'){res.push({card:c,actorId:a.id,targetId:null});continue}
   if(c.scope==='partner'){
    const b=playerById(a.partnerId);if(b&&b.partnerId===a.id&&allowed(b,c)&&b.pairing!=='group'&&coupleRule(a)!=='group'){res.push({card:c,actorId:a.id,targetId:b.id})}continue;
   }
   if(c.scope==='pair'){
    for(const b of state.players){if(b.id===a.id||!allowed(b,c)||b.pairing==='group')continue;
     if(b.id===a.partnerId){if(b.partnerId===a.id&&coupleRule(a)!=='group')res.push({card:c,actorId:a.id,targetId:b.id});}
     else if(s.mode==='mixed'&&mutualMix(a,b))res.push({card:c,actorId:a.id,targetId:b.id});
    }
   }
  }
 }
 return res;
}
function maxTurns(){return state.settings.turns*(state.settings.chapters?(3-(state.game.startPhase||0)):1)}
function chooseCandidate(phase){const g=state.game,options=eligibleAssignments(phase).filter(x=>!g.seen.includes(x.card.id));if(!options.length)return null;
 let min=Infinity;for(const c of options){const n=g.actorCounts[c.actorId||'group']||0;if(n<min)min=n}
 const fair=options.filter(c=>(g.actorCounts[c.actorId||'group']||0)<=min+1);
 // Preference changes the odds, never overrides participants' boundaries.
 const weighted=fair.map(c=>({choice:c,weight:state.settings.spicyFirst!==false&&c.card.vibe==='spicy'?5:1}));
 const total=weighted.reduce((sum,x)=>sum+x.weight,0);let rand=Math.random()*total;
 for(const item of weighted){rand-=item.weight;if(rand<0)return item.choice}
 return weighted[weighted.length-1].choice;
}
function newDraw(){stopTimer();let g=state.game;while(g.active&&g.turn<maxTurns()){
  const chapter=Math.floor(g.turn/state.settings.turns);g.phase=state.settings.chapters?Math.min(2,(g.startPhase||0)+chapter):(g.startPhase||0);
  const result=chooseCandidate(g.phase);if(result){g.current={cardId:result.card.id,actorId:result.actorId,targetId:result.targetId};g.seen.push(result.card.id);g.actorCounts[result.actorId||'group']=(g.actorCounts[result.actorId||'group']||0)+1;g.remaining=state.settings.timer||result.card.seconds;save();renderGame();stayAtGameTop();return}
  // No eligible cards in this chapter; ask user to change preferences rather than cycling forever.
  g.current=null;save();renderGame();stayAtGameTop();notify('No matching unused cards. Adjust player preferences, switch decks, or try another chapter.');return;
 }
 if(g.turn>=maxTurns())finishGame();
}
$('#startGame').onclick=()=>{
 if(state.players.length<2){notify('Add at least two adults.');return}
 if(!state.settings.categories.length){notify('Enable at least one category.');return}
 if(!eligibleAssignments(0).length){notify('No matching challenges. Check players, categories, and comfort settings.');return}
 stopTimer();state.players.forEach(p=>p.score=0);state.game={active:true,ended:false,turn:0,phase:0,seen:[],actorCounts:{},current:null,history:[],remaining:state.settings.timer,startPhase:0};save();updateResumeButton();navigate('game');newDraw();
};
function gameCard(){return allCards().find(c=>c.id===state.game.current?.cardId)}
function showCurrentText(c){const {actorId,targetId}=state.game.current||{};const actor=playerById(actorId),target=playerById(targetId);return c.body.replaceAll('{actor}',actor?.name||'Everyone').replaceAll('{target}',target?.name||'your guest').replaceAll('{partner}',target?.name||'your partner')}
// All examples are non-explicit, original vector stick figures. No artwork is downloaded.
function exampleSvg(c){
 const pose=c?.illustration || ({private:'flirt',kiss:'kiss',touch:'hands',flirt:'flirt',partner:'hands',roleplay:'dance',party:'party',truth:'question',talk:'question'})[c?.category] || 'question';
 const person=(x,arm)=>`<circle cx="${x}" cy="43" r="14"/><path d="M ${x} 57 V 117 M ${x} 117 l -22 38 M ${x} 117 l 22 38"/>${arm==='reach'?`<path d="M ${x} 76 l ${x<125?42:-42} 18 M ${x} 76 l ${x<125?-29:29} 34"/>`:`<path d="M ${x} 77 l -26 28 M ${x} 77 l 26 28"/>`}`;
 const poses={
  kiss:`${person(90,'reach')}${person(170,'reach')}<path class="accent" d="M 125 49 Q130 32 136 49 Q143 35 149 49 Q142 61 136 66 Z"/>`,
  hands:`${person(80,'reach')}${person(180,'reach')}<path class="accent" d="M 120 94 H 140"/>`,
  flirt:`${person(82,'reach')}${person(178,'reach')}<path class="accent" d="M 132 36 q-9 -13 -18 0 q0 9 18 22 q18 -13 18 -22 q-9 -13 -18 0 Z"/>`,
  dance:`${person(91,'reach')}${person(169,'reach')}<path class="accent" d="M 128 87 Q 136 82 144 87"/><path d="M 70 24 q25 -16 40 0 M 150 24 q25 -16 40 0" stroke-dasharray="5 6"/>`,
  party:`${person(58,'normal')}${person(130,'normal')}${person(203,'normal')}<path class="accent" d="M117 11 l5 10 11 0 -9 7 4 11 -11 -7 -10 7 4 -11 -9 -7 11 0 Z"/>`,
  question:`${person(125,'normal')}<text x="177" y="50" fill="#ffd0d9" stroke="none" font-size="40" font-weight="700">?</text>`
 };
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 180" aria-hidden="true" class="stick-scene" fill="none" stroke="#fce1e7" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><g>${poses[pose]||poses.question}</g></svg>`;
}
function renderExample(c){const zone=$('#exampleZone');const show=state.settings.showExamples!==false;zone.hidden=!show;$('#exampleToggle').textContent=show?'Hide illustration':'Show illustration';if(c){$('#cardIllustration').innerHTML=exampleSvg(c);$('#cardIllustration').setAttribute('aria-label',`Non-explicit stick-figure example for ${c.category} challenge`);$('#exampleCaption').textContent='ILLUSTRATED EXAMPLE'}else{$('#cardIllustration').replaceChildren();$('#exampleCaption').textContent='';}}
function eligibleUnused(phase){return eligibleAssignments(phase).some(x=>!state.game.seen.includes(x.card.id))}
function jumpToChapter(phase){const g=state.game;if(!g.active)return;if(!eligibleUnused(phase)){notify('No eligible unused dares in this chapter. Try raising comfort levels in Players, or switch decks.');return;}stopTimer();g.startPhase=phase;g.turn=0;g.phase=phase;g.current=null;save();newDraw();notify(`Now playing ${PHASES[phase]} — only compatible dares.`);stayAtGameTop();}
$$('[data-jump]').forEach(b=>b.addEventListener('click',()=>jumpToChapter(Number(b.dataset.jump))));
$('#playDeck').onchange=e=>{const previous=state.settings.deckMode;state.settings.deckMode=e.target.value;if(!eligibleUnused(state.game.phase)){state.settings.deckMode=previous;e.target.value=previous;notify(e.target.value==='private'?'Add your own cards in Cards, then opt in to Private intimacy in player and game settings.':'No compatible unused cards in this deck. Try another deck or change player preferences.');return;}save();newDraw();stayAtGameTop();};
$('#exampleToggle').onclick=()=>{state.settings.showExamples=state.settings.showExamples===false;save();renderExample(gameCard());};
function renderGame(){const g=state.game;if(!g.active&&!g.ended){navigate('setup');return}
 const phase=g.phase;$('#playDeck').value=state.settings.deckMode||'quick';$$('[data-jump]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.jump)===phase);b.setAttribute('aria-pressed',String(Number(b.dataset.jump)===phase));});$('#phaseLabel').textContent=`CHAPTER ${['I','II','III'][phase]} / ${PHASES[phase].toUpperCase()}`;
 $('#chapterTrack').innerHTML=PHASES.map((p,i)=>`<div class="chapter ${i===phase?'on':i<phase?'done':''}">${escapeHTML(p)}</div>`).join('');
 const c=gameCard();if(c){const actor=playerById(g.current.actorId),target=playerById(g.current.targetId);
 $('#cardCategory').textContent=CATEGORIES[c.category]||c.category;$('#cardLevel').textContent=`LEVEL ${c.level}`;
 $('#cardActors').textContent=c.scope==='group'?'Everyone playing':`${actor?.name||'Someone'}${target?' + '+target.name:''}`;
 $('#cardTitle').textContent=c.title;$('#cardText').textContent=showCurrentText(c);$('#cardScope').textContent=({solo:'Solo challenge',partner:'Partner challenge',pair:'Mutually approved pair',group:'Group activity'})[c.scope]||'Challenge';$('#cardPoints').textContent=state.settings.scoring?`+${c.points} pts${c.scope==='group'?' each':''} if completed`:'';
 } else {
 $('#cardCategory').textContent='NO CARD DRAWN';$('#cardLevel').textContent='✦';$('#cardActors').textContent=g.ended?'The night is complete':'No compatible unused cards';$('#cardTitle').textContent=g.ended?'That was a night to remember.':'Time to change the mood.';
 $('#cardText').textContent=g.ended?'Celebrate the conversations and connections. Everyone played by their own rules.':'Try enabling more categories, adjusting comfort levels, or adding custom cards. You can also end the session.';$('#cardScope').textContent='Consent first';$('#cardPoints').textContent='';
 }
 renderExample(c);$('#miniProgress').textContent=`${Math.min(g.turn,maxTurns())+ (c?1:0)} / ${maxTurns()}`;
 $('#skipCard').disabled=!c;$('#completeCard').disabled=!c;$('#redrawCard').disabled=!c;
 const total=maxTurns(),done=Math.min(g.turn,total);$('#progressText').textContent=`${done} / ${total} challenges completed or skipped`;$('#progressBar').style.width=total?`${100*done/total}%`:'0%';
 $('#seenCount').textContent=g.seen.length;$('#remainingCount').textContent=eligibleAssignments(g.phase).filter(x=>!g.seen.includes(x.card.id)).filter((x,i,arr)=>arr.findIndex(y=>y.card.id===x.card.id)===i).length;
 $('#timerText').textContent=state.settings.timer?fmtTime(g.remaining):'OFF';$('#timerPlay').disabled=!state.settings.timer||!c;$('#timerReset').disabled=!state.settings.timer||!c;$('#scorePanel').hidden=!state.settings.scoring;
 $('#scoreList').innerHTML=[...state.players].sort((a,b)=>b.score-a.score).map(p=>`<div class="score-row"><span>${escapeHTML(p.name)}</span><strong>${p.score}</strong></div>`).join('');
 $('#undoScore').disabled=!g.history.some(h=>h.points>0&&!h.undone);
}
const fmtTime=s=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,'0')}:${String(Math.max(0,s)%60).padStart(2,'0')}`;
function stopTimer(){if(timerInterval)clearInterval(timerInterval);timerInterval=null;timerTarget=null;$('#timerPlay').textContent='▶ Start'}
function pauseTimer(){if(!timerInterval)return;state.game.remaining=Math.max(0,Math.ceil((timerTarget-Date.now())/1000));stopTimer();save()}
$('#timerPlay').onclick=()=>{if(!state.settings.timer||!gameCard())return;if(timerInterval){pauseTimer();renderGame();return}timerTarget=Date.now()+state.game.remaining*1000;$('#timerPlay').textContent='Ⅱ Pause';timerInterval=setInterval(()=>{state.game.remaining=Math.max(0,Math.ceil((timerTarget-Date.now())/1000));$('#timerText').textContent=fmtTime(state.game.remaining);if(!state.game.remaining){stopTimer();save();notify('Time! Choose complete or skip.')}},250)};
$('#timerReset').onclick=()=>{stopTimer();state.game.remaining=state.settings.timer;save();renderGame();stayAtGameTop()};
function doTurn(success){const g=state.game,c=gameCard();if(!c)return;stopTimer();const points=success&&state.settings.scoring?c.points:0;const p=playerById(g.current.actorId);const awardedIds=points?(c.scope==='group'?state.players.map(x=>x.id):(p?[p.id]:[])):[];for(const id of awardedIds){const player=playerById(id);if(player)player.score+=points}
 g.history.push({cardId:c.id,actorId:g.current.actorId,awardedIds,points,undone:false});g.turn++;save();stayAtGameTop();if(success)notify(points?`+${points} points${c.scope==='group'?' for everyone':p?' for '+p.name:''}!`:'Challenge complete!');else notify('Skipped. No penalty, no explanation needed.');newDraw();}
$('#completeCard').onclick=()=>doTurn(true);$('#skipCard').onclick=()=>doTurn(false);$('#redrawCard').onclick=()=>{if(!gameCard())return;newDraw();notify('New card, no penalty.')};
$('#undoScore').onclick=()=>{const h=[...state.game.history].reverse().find(h=>h.points>0&&!h.undone);if(!h)return;for(const id of h.awardedIds||[h.actorId]){const p=playerById(id);if(p)p.score=Math.max(0,p.score-h.points)}h.undone=true;save();renderGame();notify('Last score undone.')};
function finishGame(){stopTimer();state.game.active=false;state.game.ended=true;state.game.current=null;save();updateResumeButton();renderGame();const sorted=[...state.players].sort((a,b)=>b.score-a.score);openDialog('Night complete ✦',`<p>Thanks for playing. Every skip and boundary was part of making the night yours.</p>${state.settings.scoring?`<div class="result-list">${sorted.map(p=>`<div><span>${escapeHTML(p.name)}</span><strong>${p.score} pts</strong></div>`).join('')}</div>`:''}<div class="dialog-actions"><button id="resultSetup" class="btn secondary">Edit setup</button><button id="resultAgain" class="btn primary">Play again</button></div>`);$('#resultSetup').onclick=()=>{closeDialog();navigate('setup')};$('#resultAgain').onclick=()=>{closeDialog();navigate('setup');$('#startGame').click()}}
$('#nextChapter').onclick=()=>{if(!state.game.active)return;const next=state.game.phase+1;if(next>2){finishGame();return;}jumpToChapter(next)};
$('#endGame').onclick=()=>{openDialog('End this game?',`<p>You can see the results now, or go back to playing.</p><div class="dialog-actions"><button id="cancelEnd" class="btn ghost">Keep playing</button><button id="confirmEnd" class="btn primary">End & show results</button></div>`);$('#cancelEnd').onclick=closeDialog;$('#confirmEnd').onclick=()=>{closeDialog();finishGame()};};
function validCard(c){return c&&typeof c==='object'&&typeof c.title==='string'&&c.title.trim().length>0&&c.title.length<=70&&typeof c.body==='string'&&c.body.trim().length>0&&c.body.length<=650&&Number.isInteger(c.phase)&&c.phase>=0&&c.phase<=2&&CATEGORY_KEYS.includes(c.category)&&['solo','partner','pair','group'].includes(c.scope)&&Number.isInteger(c.level)&&c.level>=1&&c.level<=4&&Number.isInteger(c.points)&&c.points>=0&&c.points<=20&&Number.isInteger(c.seconds)&&c.seconds>=0&&c.seconds<=300}
function cardForm(edit=null){const c=edit||{title:'',body:'',phase:0,category:'talk',scope:'solo',level:1,points:3,seconds:30};openDialog(edit?'Edit custom card':'Create custom card',`<p>Create your own private challenge. Placeholders: {actor}, {target}, or {partner}. Custom text stays on this device until you export it.</p><label class="form-field">Title<input id="edTitle" maxlength="70" value="${escapeHTML(c.title)}"></label><label class="form-field">Challenge<textarea id="edBody" maxlength="650" rows="4" placeholder="Write your challenge here…">${escapeHTML(c.body)}</textarea></label><div class="field-row"><label class="form-field">Chapter<select id="edPhase">${PHASES.map((x,i)=>`<option value="${i}" ${c.phase===i?'selected':''}>${escapeHTML(x)}</option>`).join('')}</select></label><label class="form-field">Category<select id="edCat">${CATEGORY_KEYS.map(key=>`<option value="${key}" ${c.category===key?'selected':''}>${escapeHTML(CATEGORIES[key])}</option>`).join('')}</select></label></div><div class="field-row"><label class="form-field">Participants<select id="edScope"><option value="solo" ${c.scope==='solo'?'selected':''}>One player</option><option value="partner" ${c.scope==='partner'?'selected':''}>Couple partners</option><option value="pair" ${c.scope==='pair'?'selected':''}>Mutually approved pair</option><option value="group" ${c.scope==='group'?'selected':''}>Everyone</option></select></label><label class="form-field">Comfort level<select id="edLevel">${[1,2,3,4].map(i=>`<option value="${i}" ${c.level===i?'selected':''}>${i} · ${['Easygoing','Flirty','Bold','Adventurous'][i-1]}</option>`).join('')}</select></label></div><div class="field-row"><label class="form-field">Points<input type="number" min="0" max="20" id="edPoints" value="${c.points}"></label><label class="form-field">Seconds<input type="number" min="0" max="300" id="edSeconds" value="${c.seconds}"></label></div><div class="dialog-actions"><button class="btn ghost" id="edCancel">Cancel</button><button class="btn primary" id="edSave">${edit?'Save changes':'Add to my deck'}</button></div>`);
 $('#edCancel').onclick=closeDialog;$('#edSave').onclick=()=>{const n={id:edit?.id||uid(),title:$('#edTitle').value.trim(),body:$('#edBody').value.trim(),phase:Number($('#edPhase').value),category:$('#edCat').value,scope:$('#edScope').value,level:Number($('#edLevel').value),points:Number($('#edPoints').value),seconds:Number($('#edSeconds').value)};if(!validCard(n)){notify('Check the title, challenge, level, and number fields.');return}if(edit){state.custom=state.custom.map(x=>x.id===edit.id?n:x)}else{if(state.custom.length>=500){notify('Maximum 500 custom cards.');return}state.custom.push(n)}save();closeDialog();renderLibrary();notify(edit?'Card updated':'Custom card added')};}
$('#newCard').onclick=()=>cardForm();
function renderLibrary(){const f=$('#filterCategory');if(f.options.length===1)f.innerHTML='<option value="all">All categories</option>'+CATEGORY_KEYS.map(c=>`<option value="${c}">${escapeHTML(CATEGORIES[c])}</option>`).join('');
 const q=$('#cardSearch').value.toLowerCase().trim(),phase=$('#filterPhase').value,cat=$('#filterCategory').value,deck=$('#filterDeck').value,vibe=$('#filterVibe').value;
 const cards=allCards().filter(c=>((phase==='all'||String(c.phase)===phase)&&(cat==='all'||c.category===cat)&&(vibe==='all'||(vibe==='spicy'?c.vibe==='spicy':c.vibe!=='spicy')))&&(!q||(`${c.title} ${c.body} ${CATEGORIES[c.category]}`).toLowerCase().includes(q))&&(deck==='all'||(deck==='quick'&&c.quick===true)||(deck==='built-in'&&!state.custom.some(x=>x.id===c.id))||(deck==='custom'&&state.custom.some(x=>x.id===c.id))||(deck==='favorites'&&state.favorites.includes(c.id))));
 $('#libraryCount').textContent=`${cards.length} cards · ${builtIn.length} original + ${state.custom.length} private`;
 $('#cardList').innerHTML=cards.slice(0,libraryLimit).map(c=>{const custom=state.custom.some(x=>x.id===c.id);return `<article class="small-card" data-card="${escapeHTML(c.id)}"><div class="small-card-top"><span class="small-tag">${escapeHTML(PHASES[c.phase])} · ${escapeHTML(CATEGORIES[c.category])}</span><button class="favorite ${state.favorites.includes(c.id)?'on':''}" data-fav="${escapeHTML(c.id)}" aria-label="${state.favorites.includes(c.id)?'Remove from':'Add to'} favorites" title="Toggle favorite">${state.favorites.includes(c.id)?'♥':'♡'}</button></div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.body)}</p><div class="small-card-foot"><span>Level ${c.level} · ${c.scope}${c.vibe==='spicy'?' · 🔥 Spicy':''}${custom?' · private':''}</span>${custom?`<div class="small-card-actions"><button class="subtle-link" data-edit="${escapeHTML(c.id)}">Edit</button><button class="subtle-link" data-delete="${escapeHTML(c.id)}">Delete</button></div>`:''}</div></article>`}).join('')||'<div class="empty-state">No cards match these filters. Try another search or add your own.</div>';
 $('#loadCards').hidden=libraryLimit>=cards.length;
 $('#loadCards').textContent=libraryLimit>=cards.length?'All matching cards shown':`Show ${Math.min(18,cards.length-libraryLimit)} more cards (${Math.max(0,cards.length-libraryLimit)} left)`;
}
for(const id of ['cardSearch','filterPhase','filterCategory','filterDeck','filterVibe'])$('#'+id).addEventListener(id==='cardSearch'?'input':'change',()=>{libraryLimit=18;renderLibrary()});
$('#loadCards').onclick=()=>{const previous=$$('#cardList .small-card').length;libraryLimit+=18;renderLibrary();const next=$$('#cardList .small-card')[previous];if(next){next.scrollIntoView({block:'start',behavior:'smooth'});next.setAttribute('tabindex','-1');next.focus({preventScroll:true})}};
$('#cardList').addEventListener('click',e=>{const el=e.target.closest('button');if(!el)return;const id=el.dataset.fav||el.dataset.edit||el.dataset.delete;if(!id)return;
 if(el.dataset.fav){state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();renderLibrary()}
 if(el.dataset.edit){const c=state.custom.find(x=>x.id===id);if(c)cardForm(c)}
 if(el.dataset.delete){const c=state.custom.find(x=>x.id===id);if(!c)return;openDialog('Delete this card?',`<p>Remove <strong>${escapeHTML(c.title)}</strong> from your private deck?</p><div class="dialog-actions"><button id="deleteNo" class="btn ghost">Cancel</button><button id="deleteYes" class="btn danger">Delete</button></div>`);$('#deleteNo').onclick=closeDialog;$('#deleteYes').onclick=()=>{state.custom=state.custom.filter(x=>x.id!==id);state.favorites=state.favorites.filter(x=>x!==id);save();closeDialog();renderLibrary();notify('Card deleted')}}
});
function downloadJSON(filename,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
$('#exportCards').onclick=()=>{downloadJSON('after-hours-custom-cards.json',state.custom);notify(`Exported ${state.custom.length} custom cards.`)};
$('#importCards').onclick=()=>$('#importFile').click();
$('#importFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>1_500_000)throw new Error('File too large');const data=JSON.parse(await f.text());if(!Array.isArray(data)||data.length>500)throw new Error('Expected an array of up to 500 cards');let added=0;for(const input of data){const c={...input,id:uid()};if(!validCard(c))continue;if(state.custom.length>=500)break;state.custom.push(c);added++}save();renderLibrary();notify(`Imported ${added} valid cards. Invalid entries were ignored.`)}catch(error){notify('Could not import: '+error.message)}finally{e.target.value=''}});
$('#exportBackup').onclick=()=>{openDialog('Save a private backup?',`<p>This file contains names, custom cards, and relationship preferences. Save it only somewhere private.</p><div class="dialog-actions"><button class="btn ghost" id="backupCancel">Cancel</button><button class="btn primary" id="backupSave">Download backup</button></div>`);$('#backupCancel').onclick=closeDialog;$('#backupSave').onclick=()=>{downloadJSON('after-hours-private-backup.json',state);closeDialog();notify('Backup downloaded to this device.')}};
$('#resetAll').onclick=()=>{openDialog('Erase everything?',`<p>Erase all players, approvals, custom cards, favorites, and active game history on this device? This cannot be undone unless you have a backup.</p><div class="dialog-actions"><button class="btn ghost" id="resetNo">Cancel</button><button class="btn danger" id="resetYes">Erase all local data</button></div>`);$('#resetNo').onclick=closeDialog;$('#resetYes').onclick=()=>{stopTimer();localStorage.removeItem(STORAGE);state=defaults();save();closeDialog();updateResumeButton();navigate('home');consentDialog();notify('Local game data erased')}};
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
updateResumeButton();renderLibrary();navigate('home');if(!state.adult)consentDialog();
window.__AFTER_HOURS_TEST__={getState:()=>structuredClone(state),eligible:eligibleAssignments,allCards,mutualMix};
})();
