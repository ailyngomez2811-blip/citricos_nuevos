/* ════════════════════════════════════════════
   UNIDAD DE CÍTRICOS NUEVOS · SENA La Angostura
   main.js
   ════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. SCROLL REVEAL
     Agrega la clase .visible a los elementos
     .reveal y .reveal-card cuando entran al
     viewport, con stagger (delay escalonado).
  ───────────────────────────────────────────*/
  const revealEls = document.querySelectorAll('.reveal');
  const revealCards = document.querySelectorAll('.reveal-card');

  // Asigna índice CSS para el delay escalonado de las tarjetas
  revealCards.forEach((card, i) => {
    card.style.setProperty('--i', i);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));
  revealCards.forEach(el => revealObserver.observe(el));


  /* ─────────────────────────────────────────
     2. CONTADORES ANIMADOS
     Los elementos con data-target reciben
     un conteo progresivo al entrar al viewport.
  ───────────────────────────────────────────*/
  function animarContador(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const duracion = 1400; // ms
    const fps = 60;
    const totalFrames = duracion / (1000 / fps);
    const incremento = target / totalFrames;
    let actual = 0;

    const timer = setInterval(() => {
      actual += incremento;
      if (actual >= target) {
        actual = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(actual);
    }, 1000 / fps);
  }

  const contadorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animarContador(entry.target);
        contadorObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => {
    contadorObserver.observe(el);
  });


  /* ─────────────────────────────────────────
     3. NAVBAR DINÁMICA (Auto-ocultar al hacer scroll)
     El nav se oculta al hacer scroll hacia abajo y
     vuelve a aparecer al hacer scroll hacia arriba.
  ───────────────────────────────────────────*/
  let lastScrollY = window.scrollY;
  const navbar = document.querySelector('.navbar');
  const navbarToggle = document.getElementById('navbarToggle');
  const navbarLinks = document.getElementById('navbarLinks');

  // Toggle Menú Hamburguesa
  if (navbarToggle && navbarLinks) {
    navbarToggle.addEventListener('click', () => {
      navbarToggle.classList.toggle('active');
      navbarLinks.classList.toggle('active');
    });

    // Cerrar el menú al dar click a un enlace
    navbarLinks.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        navbarToggle.classList.remove('active');
        navbarLinks.classList.remove('active');
      });
    });
  }

  if (navbar) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.classList.add('navbar--hidden');
        // Si se hace scroll hacia abajo, también cerramos el menú móvil
        if (navbarToggle && navbarLinks) {
          navbarToggle.classList.remove('active');
          navbarLinks.classList.remove('active');
        }
      } else {
        navbar.classList.remove('navbar--hidden');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }


  /* ─────────────────────────────────────────
     4. PLACEHOLDERS: mostrar texto guía
     Cuando una imagen falla (onerror ya lo
     maneja), el label de ruta se hace visible
     para que sepas qué archivo colocar.
  ───────────────────────────────────────────*/
  document.querySelectorAll('.img-placeholder-label').forEach(label => {
    const parent = label.closest(
      '.hero__image-frame, .img-frame, .variedad-card__img-wrap, .galeria-item'
    );
    if (!parent) return;

    const img = parent.querySelector('img');
    if (!img) return;

    // Si la imagen ya falló al cargar (DOM ya procesado)
    if (img.complete && img.naturalWidth === 0) {
      label.style.display = 'block';
    }

    // Si falla después
    img.addEventListener('error', () => {
      label.style.display = 'block';
    });

    // Si carga bien, ocultar el label
    img.addEventListener('load', () => {
      label.style.display = 'none';
    });
  });


  /* ─────────────────────────────────────────
     5. HOVER MAGNÉTICO EN TARJETAS DE VARIEDAD
     Las tarjetas de variedad siguen ligeramente
     el cursor del mouse para una sensación viva.
  ───────────────────────────────────────────*/
  document.querySelectorAll('.variedad-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      card.style.transform = `
        translateY(-6px)
        rotateX(${-dy * 4}deg)
        rotateY(${dx * 4}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    });
  });


  /* ─────────────────────────────────────────
     6. GALERÍA: lightbox simple
     Al hacer clic en una imagen de la galería
     se muestra ampliada con fondo oscuro.
  ───────────────────────────────────────────*/
  const galeriaItems = document.querySelectorAll('.galeria-item img');

  if (galeriaItems.length > 0) {
    // Crear el lightbox
    const overlay = document.createElement('div');
    overlay.id = 'lightbox';
    overlay.style.cssText = `
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,0.88); z-index:9999;
      align-items:center; justify-content:center;
      cursor:zoom-out;
    `;

    const lightboxImg = document.createElement('img');
    lightboxImg.style.cssText = `
      max-width:90vw; max-height:90vh;
      border-radius:12px;
      box-shadow:0 20px 60px rgba(0,0,0,0.6);
      object-fit:contain;
    `;

    overlay.appendChild(lightboxImg);
    document.body.appendChild(overlay);

    galeriaItems.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        if (img.naturalWidth === 0) return; // imagen no cargada
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });

    overlay.addEventListener('click', () => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

});
