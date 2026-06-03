// Galaxy background
(function () {
  const canvas = document.getElementById('galaxy');
  const ctx    = canvas.getContext('2d');

  const SUPERNOVA = ['#ffffff','#fffde0','#ffd700','#ffaa00','#ff6600','#ff2244','#ff44aa','#cc44ff','#6644ff','#2288ff','#00ccff','#00ffcc'];
  let W, H, stars = [], nebulas = [], textSparkles = [];

  // Overlay canvas for particles (drawn above text)
  const pCanvas = document.createElement('canvas');
  pCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;';
  document.body.appendChild(pCanvas);
  const pCtx = pCanvas.getContext('2d');
  let textAura = false, glowOpacity = 0, nebulaTime = 0;

  window._triggerTextAura = function () { textAura = true; };

  const STAR_COUNT = 280;
  const STAR_COLORS = ['#ffffff', '#ffffff', '#ffffff', '#a8c8ff', '#7ab3ff', '#fffde8'];

  function init() {
    W = canvas.width  = pCanvas.width  = window.innerWidth;
    H = canvas.height = pCanvas.height = window.innerHeight;

    stars = Array.from({ length: STAR_COUNT }, () => ({
      x:           Math.random() * W,
      y:           Math.random() * H,
      r:           Math.random() * 1.3 + 0.2,
      baseOpacity: Math.random() * 0.55 + 0.15,
      phase:       Math.random() * Math.PI * 2,
      speed:       Math.random() * 0.006 + 0.002,
      color:       STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
    }));

    nebulas = [
      { x: 0.15, y: 0.20, r: 320, c: [32,  80, 220] },
      { x: 0.82, y: 0.50, r: 260, c: [80,  20, 180] },
      { x: 0.50, y: 0.80, r: 350, c: [20,  60, 200] },
      { x: 0.68, y: 0.12, r: 220, c: [50, 110, 240] },
      { x: 0.30, y: 0.65, r: 280, c: [60,  30, 160] },
    ];
  }

  init();
  window.addEventListener('resize', init);

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // dark base
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, W, H);

    // nebula glows
    nebulas.forEach(n => {
      const x = n.x * W, y = n.y * H;
      const g = ctx.createRadialGradient(x, y, 0, x, y, n.r);
      g.addColorStop(0,   `rgba(${n.c[0]},${n.c[1]},${n.c[2]},0.18)`);
      g.addColorStop(0.4, `rgba(${n.c[0]},${n.c[1]},${n.c[2]},0.08)`);
      g.addColorStop(1,   'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(x - n.r, y - n.r, n.r * 2, n.r * 2);
    });

    // stars
    stars.forEach(s => {
      s.phase += s.speed;
      const opacity = s.baseOpacity * (0.4 + 0.6 * Math.sin(s.phase));
      ctx.globalAlpha = opacity;
      ctx.fillStyle   = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    // ── Nebula cloud + rim streaks ────────────────────────────────
    pCtx.clearRect(0, 0, W, H);
    if (textAura) {
      const el = document.getElementById('hero-line2');
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const r    = rect.width * 0.54;

        // Fade nebula in over ~5 seconds
        glowOpacity = Math.min(1, glowOpacity + 0.004);
        nebulaTime += 0.3;

        ctx.save();

        // Hollow shell — bright ring, dark hollow center like a supernova remnant
        const shell = ctx.createRadialGradient(cx, cy, r * 0.22, cx, cy, r);
        shell.addColorStop(0,    'rgba(0,0,0,0)');
        shell.addColorStop(0.42, `rgba(160,200,255,${0.07 * glowOpacity})`);
        shell.addColorStop(0.68, `rgba(230,242,255,${0.18 * glowOpacity})`);
        shell.addColorStop(0.86, `rgba(200,225,255,${0.10 * glowOpacity})`);
        shell.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.fillStyle = shell;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

        // Cloud puff lobes around the rim — irregular sizes and positions
        const LOBES = 10;
        for (let i = 0; i < LOBES; i++) {
          const baseA  = (i / LOBES) * Math.PI * 2;
          const wobble = Math.sin(nebulaTime * 0.008 + i * 1.37) * 0.07;
          const angle  = baseA + wobble;
          const dist   = r * (0.60 + Math.sin(i * 2.1 + 1.2) * 0.13);
          const px     = cx + Math.cos(angle) * dist;
          const py     = cy + Math.sin(angle) * dist;
          const pr     = r * (0.17 + Math.abs(Math.sin(i * 1.7)) * 0.11);
          const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
          g.addColorStop(0,   `rgba(245,250,255,${0.20 * glowOpacity})`);
          g.addColorStop(0.5, `rgba(200,225,255,${0.10 * glowOpacity})`);
          g.addColorStop(1,   'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
        }

        // Radial filaments — elongated blobs pointing outward
        const FILS = 6;
        for (let i = 0; i < FILS; i++) {
          const angle = (i / FILS) * Math.PI * 2 + Math.PI / FILS;
          const dist  = r * (0.75 + Math.sin(i * 2.7) * 0.10);
          const fx = cx + Math.cos(angle) * dist;
          const fy = cy + Math.sin(angle) * dist;
          ctx.save();
          ctx.translate(fx, fy);
          ctx.rotate(angle);
          ctx.scale(1, 0.28);
          const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.24);
          fg.addColorStop(0, `rgba(255,255,255,${0.14 * glowOpacity})`);
          fg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = fg;
          ctx.fillRect(-r * 0.24, -r * 0.24, r * 0.48, r * 0.48);
          ctx.restore();
        }

        ctx.restore();

        // Spawn streaks from outer rim
        for (let t = 0; t < 3; t++) {
          const angle = Math.random() * Math.PI * 2;
          const rimR  = r * (0.82 + Math.random() * 0.14);
          textSparkles.push({
            x:     cx + Math.cos(angle) * rimR,
            y:     cy + Math.sin(angle) * rimR,
            vx:    Math.cos(angle) * (Math.random() * 1.3 + 0.5),
            vy:    Math.sin(angle) * (Math.random() * 1.3 + 0.5),
            r:     Math.random() * 0.9 + 0.3,
            life:  1.0,
            decay: 0.013 + Math.random() * 0.009,
            color: SUPERNOVA[Math.floor(Math.random() * SUPERNOVA.length)],
          });
        }

        // Draw streaks on overlay canvas (above text)
        for (let i = textSparkles.length - 1; i >= 0; i--) {
          const sp = textSparkles[i];
          sp.life -= sp.decay;
          sp.x += sp.vx;
          sp.y += sp.vy;
          if (sp.life <= 0) { textSparkles.splice(i, 1); continue; }
          pCtx.globalAlpha = sp.life * 0.85;
          pCtx.strokeStyle = sp.color;
          pCtx.lineWidth   = sp.r * 1.8;
          pCtx.lineCap     = 'round';
          pCtx.beginPath();
          pCtx.moveTo(sp.x, sp.y);
          pCtx.lineTo(sp.x - sp.vx * 7, sp.y - sp.vy * 7);
          pCtx.stroke();
        }
        pCtx.globalAlpha = 1;
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

// Terminal typing animation
(function () {
  const line1 = 'Trade With';
  const line2 = 'Confluence.';
  const el1   = document.getElementById('hero-line1');
  const el2   = document.getElementById('hero-line2');
  let i = 0, phase = 1;

  function type() {
    if (phase === 1) {
      if (i < line1.length) {
        el1.textContent += line1[i++];
        setTimeout(type, 75);
      } else {
        el1.classList.remove('typing');
        el2.classList.add('typing');
        phase = 2; i = 0;
        setTimeout(type, 300);
      }
    } else {
      if (i < line2.length) {
        el2.textContent += line2[i++];
        setTimeout(type, 75);
      } else {
        el2.classList.remove('typing');
        el2.classList.add('shimmer-active');
        if (window._triggerTextAura) window._triggerTextAura();
      }
    }
  }

  type();
})();

// Lightbox
function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = src;
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// Make all chart/journal images clickable
document.querySelectorAll('.hero-img, .oi-panel-img, .journal-img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => openLightbox(img.src));
});

// Contact form AJAX submission
async function handleForm(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn = form.querySelector('.cf-submit');

  btn.textContent = 'Sending…';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  try {
    const res = await fetch('https://formspree.io/f/xgoqgdqz', {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      form.style.cssText = 'display:none!important';
      success.style.cssText = 'display:flex!important';
    } else {
      btn.textContent = 'Failed — try again';
      btn.style.opacity = '1';
      btn.disabled = false;
    }
  } catch {
    btn.textContent = 'Failed — try again';
    btn.style.opacity = '1';
    btn.disabled = false;
  }
}

// Smooth nav background on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.borderBottomColor = window.scrollY > 10 ? '#1e2d45' : 'transparent';
});

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .oi-card, .pricing-card, .step, .j-feature').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
