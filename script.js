// Galaxy background
(function () {
  const canvas = document.getElementById('galaxy');
  const ctx    = canvas.getContext('2d');

  let W, H, stars = [], nebulas = [];

  const STAR_COUNT = 280;
  const STAR_COLORS = ['#ffffff', '#ffffff', '#ffffff', '#a8c8ff', '#7ab3ff', '#fffde8'];

  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

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

    requestAnimationFrame(draw);
  }

  draw();
})();

// Terminal typing animation
(function () {
  const line1   = 'Trade With';
  const wrong   = 'Confidence.';
  const correct = 'Confluence.';
  const el1 = document.getElementById('hero-line1');
  const el2 = document.getElementById('hero-line2');

  function type(text, el, i, cb) {
    if (i < text.length) {
      el.textContent += text[i];
      setTimeout(() => type(text, el, i + 1, cb), 75);
    } else {
      cb();
    }
  }

  function erase(el, cb) {
    if (el.textContent.length > 0) {
      el.textContent = el.textContent.slice(0, -1);
      setTimeout(() => erase(el, cb), 45);
    } else {
      cb();
    }
  }

  // Phase 1: type "Trade With"
  type(line1, el1, 0, () => {
    el1.classList.remove('typing');
    el2.classList.add('typing');
    // Phase 2: type "Confidence." after short pause
    setTimeout(() => type(wrong, el2, 0, () => {
      // Phase 3: pause, then delete "Confidence."
      setTimeout(() => erase(el2, () => {
        // Phase 4: type "Confluence."
        setTimeout(() => type(correct, el2, 0, () => {
          el2.classList.remove('typing');
        }), 150);
      }), 500);
    }), 300);
  });
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
