# Pin-Scroll Word-Swap Animation

This folder documents the scroll-triggered "More Rigorous → Collaborative → Published" animation on the Axiom site — the one where as you scroll, the word on the left crossfades between three states while the red card on the right grows taller (and flips to black on the final state).

Three files make it work:
1. **HTML** — a "tall" scroll track with a sticky inner layout
2. **CSS** — transitions keyed off `data-state` and `.is-active` / `.is-past`
3. **JS** — one `scroll` listener that maps scroll-progress (0 → 1) to state (0 / 1 / 2) and per-bar fill values

---

## 1. How it was built (the technique)

The trick is **scroll-progress driven state**, not scroll-linked tweens:

1. Wrap the animated content in a **tall outer container** (`.pin-scroll`, `height: 340vh`). This container is what the user actually scrolls through.
2. Inside it, put a **sticky inner container** (`.pin-sticky`, `position: sticky; top: 0; height: 100vh`). Once the outer is in view, the inner visually *pins* to the viewport for the full 340vh of scrolling. From the user's POV, the page stops, the animation plays, the page resumes.
3. On every scroll event, compute how far through that tall track we are. Call it `p ∈ [0, 1]`.
4. Break `p` into thirds. `p < 1/3` → state 0, `p < 2/3` → state 1, else state 2. Set `data-state` on the card and `.is-active`/`.is-past` on the word spans.
5. CSS `transition` on `height`, `background`, `color`, `opacity`, `transform`, `filter` does the actual animating — JS only flips classes/attributes. **No rAF tweening. No GSAP. No Framer.**
6. For the progress bars at the bottom, compute per-third fill: `fill = clamp01((p - T[i]) / (T[i+1] - T[i]))` and write it to the bar as a CSS custom property (`--fill`). The `::after` of each bar uses `width: calc(var(--fill) * 100%)` so it animates smoothly.

Why this works well:
- **Buttery on low-end devices** — the browser is animating CSS properties, not JS running 60× per second.
- **No scroll-jacking libraries** — the only dep is Lenis for inertial smoothing (optional).
- **Responsive for free** — everything is `clamp()` + percentages.
- **State is declarative** — `data-state="2"` is readable in devtools.

---

## 2. The exact code

### 2a. HTML (section `<div class="pin" id="pin">`)

```html
<div class="pin" id="pin">
  <div class="pin-intro">
    <h2>The research program that gets<br/>high schoolers... <em>finally.</em></h2>
  </div>

  <!-- TALL outer container = scroll track -->
  <div class="pin-scroll" id="pinScroll">
    <!-- STICKY inner container = what you actually see -->
    <div class="pin-sticky">
      <div class="pin-left">
        <div class="pin-pre">More</div>

        <!-- Stacked absolute words; classes swap as you scroll -->
        <div class="pin-words">
          <span class="pin-word is-active" data-i="0">Rigorous</span>
          <span class="pin-word"           data-i="1">Collaborative</span>
          <span class="pin-word"           data-i="2">Published</span>
        </div>

        <!-- Three progress bars fill one-at-a-time via --fill -->
        <div class="pin-bars">
          <span class="pin-bar b1"></span>
          <span class="pin-bar b2"></span>
          <span class="pin-bar b3"></span>
        </div>
      </div>

      <div class="pin-right">
        <!-- Growing card. data-state drives height + color. -->
        <div class="pin-card-wrap">
          <div class="pin-card" id="pinCard" data-state="0">
            <div class="pin-card-icon">
              <!-- your logo/icon SVG -->
            </div>
          </div>
          <div class="pin-card-label">Axiom Labs</div>
        </div>

        <!-- A smaller static reference card next to it -->
        <div class="pin-other-wrap">
          <div class="pin-other">
            <div class="pin-other-grid">
              <span>SS</span><span>RS</span><span>MI</span><span>IB</span>
            </div>
          </div>
          <div class="pin-other-label">Other Programs</div>
        </div>
      </div>

      <div class="pin-scroll-hint"><span class="m"></span> Scroll</div>
    </div>
  </div>
</div>
```

### 2b. CSS (extracted from `styles.css`)

```css
/* Section shell — black, full-bleed */
.pin{
  --accent:#ff3a3a;                  /* initial accent; JS rewrites this per state */
  background:#050505;color:#fff;
  margin:0;max-width:none;padding:0;
  position:relative;
}

.pin-intro{
  max-width:1100px;margin:0 auto;padding:140px 40px 80px;text-align:center;
}
.pin-intro h2{
  font-family:"Neue Montreal", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight:400;
  font-size:clamp(40px,5.4vw,84px);line-height:1.02;letter-spacing:-.02em;color:#fff;
}
.pin-intro h2 em{
  font-style:italic;color:var(--accent);
  transition:color .9s ease;        /* accent color morphs as state changes */
}

/* THE KEY: tall outer scroll track */
.pin-scroll{ height:340vh; position:relative; }

/* Sticky 2-column inside the tall track */
.pin-sticky{
  position:sticky;top:0;height:100vh;
  display:grid;grid-template-columns:1fr 1fr;
  align-items:center;gap:40px;
  padding:0 clamp(32px,6vw,96px);
  max-width:1440px;margin:0 auto;
}

/* LEFT column */
.pin-left{padding-left:4vw}
.pin-pre{
  font-size:clamp(26px,2.4vw,38px);
  color:rgba(255,255,255,.85);letter-spacing:-.01em;margin-bottom:6px;
}

/* Words are stacked on top of each other; only one is visible at a time */
.pin-words{
  position:relative;
  height:clamp(60px,6.4vw,96px);
  clip-path:inset(-6px -9999px -6px 0); /* allow long words to overflow right */
}
.pin-word{
  position:absolute;inset:auto 0 0 0;
  font-style:italic;font-weight:400;
  font-size:clamp(48px,6.4vw,96px);line-height:1;letter-spacing:-.02em;
  color:var(--accent);white-space:nowrap;
  /* resting state = off-screen below + blurred + invisible */
  opacity:0;transform:translateY(40px);filter:blur(8px);
  transition:
    opacity .7s cubic-bezier(.2,.9,.2,1),
    transform .7s cubic-bezier(.2,.9,.2,1),
    filter .7s ease,
    color .9s ease;
}
.pin-word.is-active{ opacity:1; transform:translateY(0);   filter:blur(0); }
.pin-word.is-past  { opacity:0; transform:translateY(-50px); filter:blur(8px); }

/* Three bars, fill driven by --fill CSS var from JS */
.pin-bars{display:flex;gap:14px;margin-top:34px;max-width:420px}
.pin-bar{
  --fill:0;
  flex:1;height:4px;border-radius:999px;
  background:rgba(255,255,255,.12);position:relative;overflow:hidden;
}
.pin-bar::after{
  content:"";position:absolute;inset:0 auto 0 0;
  width:calc(var(--fill) * 100%);
  background:var(--bar-color,#fff);border-radius:999px;
}
.pin-bar.b1{--bar-color:#ff3a3a}   /* red   — state 0 */
.pin-bar.b2{--bar-color:#1f46ff}   /* blue  — state 1 */
.pin-bar.b3{--bar-color:#ffffff}   /* white — state 2 */

/* RIGHT column cards */
.pin-right{
  display:flex;align-items:flex-end;justify-content:center;gap:22px;
  position:relative;padding-bottom:6vh;
}
.pin-card-wrap,.pin-other-wrap{
  display:flex;flex-direction:column;align-items:center;gap:14px;
}

/* THE GROWING CARD. Height steps per data-state. */
.pin-card{
  width:clamp(140px,13vw,190px);
  height:clamp(200px,20vw,260px);    /* state 0 height */
  background:var(--accent);
  border-radius:22px;
  display:flex;flex-direction:column;align-items:center;
  padding:18px 14px 22px;
  box-shadow:
    0 40px 80px -20px color-mix(in srgb, var(--accent) 50%, transparent),
    0 10px 30px -10px rgba(0,0,0,.5);
  transition:
    background .9s ease,
    box-shadow .9s ease,
    height 1.1s cubic-bezier(.65,0,.2,1),
    width  .9s cubic-bezier(.65,0,.2,1);
}
.pin-card[data-state="1"]{ height:clamp(300px,30vw,400px) }
.pin-card[data-state="2"]{ height:clamp(420px,44vw,580px) }

/* On the final state, flip the icon chip to black-on-white-inverted */
.pin-card[data-state="2"] .pin-card-icon      { background:#0a0a0a; transition:background .6s ease }
.pin-card[data-state="2"] .pin-card-icon svg g{ stroke:#fff;       transition:stroke .6s ease }

.pin-card-icon{
  width:54px;height:54px;border-radius:14px;background:#fff;
  display:grid;place-items:center;
  box-shadow:0 4px 14px rgba(0,0,0,.15);flex:0 0 auto;
}
.pin-card-icon svg{width:32px;height:32px;display:block}

.pin-card-label,.pin-other-label{
  font-size:14px;font-weight:500;color:#fff;letter-spacing:-.01em;
}
.pin-other-label{color:rgba(255,255,255,.6)}

/* Static neighbor card */
.pin-other{
  width:clamp(130px,12vw,170px);
  height:clamp(140px,13vw,180px);
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.08);
  border-radius:22px;display:grid;place-items:center;padding:16px;
}
.pin-other-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.pin-other-grid span{
  width:clamp(30px,3vw,40px);height:clamp(30px,3vw,40px);border-radius:9px;
  background:#fff;display:grid;place-items:center;
  font-family:ui-monospace,"SF Mono",Menlo,monospace;
  font-size:11px;color:#111;font-weight:600;
}
.pin-other-grid span:nth-child(2){background:#1a1a1a;color:#ff8a4a}
.pin-other-grid span:nth-child(3){background:#1a1a1a;color:#4ad1ff}
.pin-other-grid span:nth-child(4){background:#fff;color:#111}

/* Animated "scroll" hint at the bottom */
.pin-scroll-hint{
  position:absolute;bottom:40px;left:50%;transform:translateX(-50%);
  display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.45);
  font-family:ui-monospace,monospace;font-size:11px;
  letter-spacing:.2em;text-transform:uppercase;
}
.pin-scroll-hint .m{
  width:16px;height:24px;border:1.5px solid rgba(255,255,255,.45);
  border-radius:8px;position:relative;
}
.pin-scroll-hint .m::after{
  content:"";position:absolute;top:5px;left:50%;transform:translateX(-50%);
  width:2px;height:5px;background:rgba(255,255,255,.6);border-radius:2px;
  animation:mouse 1.8s ease-in-out infinite;
}
@keyframes mouse{
  0%,100%{transform:translate(-50%,0);opacity:1}
  50%    {transform:translate(-50%,6px);opacity:.3}
}

/* Collapse to 1 column on narrow viewports */
@media(max-width:860px){
  .pin-sticky{grid-template-columns:1fr;text-align:center}
  .pin-left{padding-left:0}
  .pin-bars{margin-left:auto;margin-right:auto}
  .pin-right{margin-top:20px}
}
```

### 2c. JS (extracted from `app.js`)

```js
// Pin section: scroll-progress → state 0 | 1 | 2
(function(){
  const pin   = document.getElementById('pin');
  if(!pin) return;
  const track = document.getElementById('pinScroll');   // the tall container
  const card  = document.getElementById('pinCard');     // the growing card
  const words = pin.querySelectorAll('.pin-word');      // 3 stacked words
  const bars  = pin.querySelectorAll('.pin-bar');       // 3 progress bars
  if(!track || !card) return;

  // One accent color per state — also morphs --accent on .pin
  const ACCENTS = ['#ff3a3a', '#1f46ff', '#ffffff'];
  const T       = [0, 1/3, 2/3, 1];   // state boundaries along scroll progress
  let state = 0;
  let raf   = null;

  function setState(n){
    if(n === state) return;
    state = n;
    words.forEach((w, i)=>{
      w.classList.remove('is-active','is-past');
      if(i === n)      w.classList.add('is-active');
      else if(i < n)   w.classList.add('is-past');
    });
    pin.style.setProperty('--accent', ACCENTS[n]);  // drives em color + card bg
    card.setAttribute('data-state', n);
  }
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

  function onScroll(){
    if(raf) return;                       // throttle to one frame per rAF
    raf = requestAnimationFrame(()=>{
      raf = null;
      // how far into the tall track are we?
      const rect    = track.getBoundingClientRect();
      const vh      = window.innerHeight;
      const total   = rect.height - vh;                // scrollable distance
      const scrolled= Math.min(Math.max(-rect.top, 0), total);
      const p       = total > 0 ? scrolled / total : 0;  // ∈ [0, 1]

      // Map p to state 0/1/2
      let n = 0;
      if(p >= T[1]) n = 1;
      if(p >= T[2]) n = 2;
      setState(n);

      // Fill bars per-third
      for(let i = 0; i < bars.length; i++){
        const f = clamp01((p - T[i]) / (T[i+1] - T[i]));
        bars[i].style.setProperty('--fill', f.toFixed(4));
      }
    });
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  onScroll();   // initialize on load
})();
```

**Optional:** layer Lenis (`https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js`) at the top of your `<script>` for inertial wheel smoothing — makes the animation feel noticeably nicer. Not required.

---

## 3. Prompt to give another AI

> Build a scroll-triggered word-swap section called "pin". The section has:
>
> 1. An intro heading with an italic accent word whose color morphs as the animation plays.
> 2. A left column with the static label **"More"** followed by one italic word that crossfades between three values (**"Rigorous" → "Collaborative" → "Published"**), plus three thin progress bars that fill one-at-a-time.
> 3. A right column with a small rectangular card that grows taller in three height steps, changes background color along with the word accent (**red → blue → white**), and on the final state flips its icon chip to an inverted dark/light treatment. Next to it sits a smaller static "Other Programs" card for reference.
>
> Implement it with **plain HTML/CSS/vanilla JS** — no GSAP, no Framer Motion, no ScrollTrigger. Technique:
>
> - Outer container `.pin-scroll` with `height: 340vh`. Inner `.pin-sticky` with `position: sticky; top: 0; height: 100vh; display: grid; grid-template-columns: 1fr 1fr`. The inner element visually pins while the user scrolls through the tall outer.
> - Stack the three words absolutely on top of each other inside `.pin-words`. Give them three classes: default (hidden below, blurred), `.is-active` (visible, sharp), `.is-past` (hidden above, blurred). Transition opacity/transform/filter with `cubic-bezier(.2,.9,.2,1)` over ~700ms.
> - The growing card uses `data-state="0|1|2"` to drive three height steps via CSS rules like `.pin-card[data-state="1"] { height: clamp(300px,30vw,400px) }`. Transition height with `cubic-bezier(.65,0,.2,1)` over ~1.1s. Use a CSS var `--accent` on the section for the card background and italic em color so they share a color.
> - Progress bars each read `--fill` (0 → 1) via CSS var, rendered by a `::after` with `width: calc(var(--fill) * 100%)`.
> - One `scroll` listener (passive, rAF-throttled) computes `p = clamp01((-track.getBoundingClientRect().top) / (track.height - vh))`. If `p < 1/3` → state 0, else if `p < 2/3` → state 1, else state 2. Write the state as a `data-state` attribute and update `.is-active` / `.is-past` classes. Per-bar fill: `clamp01((p - T[i]) / (T[i+1] - T[i]))`.
> - On mobile (`max-width: 860px`), collapse to a single centered column.
> - Optional: pipe the page through Lenis for inertial wheel smoothing.
>
> Background is `#050505`. Typography is an italic display serif or geometric sans (Neue Montreal / Satoshi / similar) with `font-size: clamp(48px, 6.4vw, 96px)` for the swapping word. Use CSS `clamp()` everywhere so the layout is fluid without media-query tuning. No keyframe animations except a tiny "mouse scroll" hint at the bottom of the section.
>
> Deliverables: one HTML block, one CSS block, one self-invoking JS IIFE. No build step required.

---

## Quick test checklist

- Scroll into the section. The word should be **"Rigorous"** in red.
- Keep scrolling. At ~1/3 through the tall track, it should crossfade to **"Collaborative"** in blue, and the card should grow.
- At ~2/3, it should crossfade to **"Published"** in white, the card grows again, and the icon chip inverts.
- Scrolling back up reverses cleanly — no stuck states.
- On mobile, the grid collapses to a single column and everything still animates.
