/* ============================================
   TOUCHE VERTE — JavaScript principal
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. NAVBAR : scroll shadow + burger ---- */
  const navbar = document.querySelector('.navbar');
  const burger = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  if (burger) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = burger.querySelectorAll('span');
      if (navLinks.classList.contains('open')) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  /* ---- 2. ANIMATIONS au scroll (Intersection Observer) ---- */
  const fadeEls = document.querySelectorAll('.fade-up');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach(el => observer.observe(el));

  /* ---- 3. ACTIVE link selon la page courante ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

  /* ---- 4. FORMULAIRE de contact ---- */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;

      // Simule un envoi (à remplacer par fetch vers votre backend)
      setTimeout(() => {
        btn.textContent = 'Message envoyé ✓';
        btn.style.background = 'var(--green-light)';
        form.reset();
        setTimeout(() => {
          btn.textContent = 'Envoyer la demande';
          btn.style.background = '';
          btn.disabled = false;
        }, 3500);
      }, 1200);
    });
  }

  /* ---- 5. COMPTEUR animé pour les stats ---- */
  const statNums = document.querySelectorAll('.stat-num[data-target]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const sup = el.querySelector('sup') ? el.querySelector('sup').outerHTML : '';
      const duration = 1500;
      const step = Math.ceil(target / (duration / 16));
      let current = 0;

      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.innerHTML = current + sup;
        if (current >= target) clearInterval(timer);
      }, 16);

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => counterObserver.observe(el));

  /* ---- 6. GALERIE : lightbox simple ---- */
  const realItems = document.querySelectorAll('.real-item');

  realItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const name = item.querySelector('.real-name')?.textContent;
      if (!img) return;

      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(26,58,31,.92);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:zoom-out;padding:24px';

      const pic = document.createElement('img');
      pic.src = img.src;
      pic.style.cssText = 'max-width:90vw;max-height:80vh;object-fit:contain;display:block';

      const caption = document.createElement('p');
      caption.textContent = name || '';
      caption.style.cssText = 'font-family:"Cormorant Garamond",serif;font-size:22px;color:#f7f3ec;margin-top:20px;font-style:italic';

      const close = document.createElement('button');
      close.textContent = '✕';
      close.style.cssText = 'position:absolute;top:24px;right:32px;background:none;border:none;color:#f7f3ec;font-size:28px;cursor:pointer;opacity:.7';
      close.addEventListener('click', () => overlay.remove());

      overlay.append(close, pic, caption);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
      document.body.appendChild(overlay);
    });
  });

});
