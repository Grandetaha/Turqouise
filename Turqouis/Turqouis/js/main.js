/* ============================================================
   Schilderwerken Turquoise — main.js
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Header on scroll + back-to-top ---------- */
  var header = $('#header');
  var toTop = $('#to-top');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) { header.classList.toggle('scrolled', y > 24); }
    if (toTop) { toTop.classList.toggle('visible', y > 600); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = $('#nav-toggle');
  var navList = $('#nav-list');

  function closeNav() {
    if (!navToggle || !navList) { return; }
    navToggle.classList.remove('open');
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Menu openen');
  }

  if (navToggle && navList) {
    navToggle.addEventListener('click', function () {
      var open = navList.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    });

    $$('.nav-link, .nav-cta-item .btn', navList).forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', function (e) {
      if (navList.classList.contains('open') &&
          !navList.contains(e.target) &&
          !navToggle.contains(e.target)) {
        closeNav();
      }
    });
  }

  /* ---------- Active nav link ---------- */
  var sections = $$('main section[id]');
  var navLinks = $$('.nav-link');

  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = $$('[data-count]');

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }

    var duration = 1500;
    var start = null;

    function tick(now) {
      if (!start) { start = now; }
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) { requestAnimationFrame(tick); }
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Portfolio filter ---------- */
  var filterBtns = $$('.filter-btn');
  var works = $$('.work');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      var filter = btn.getAttribute('data-filter');

      works.forEach(function (work) {
        var show = filter === 'all' || work.getAttribute('data-cat') === filter;
        work.classList.remove('pop');
        work.classList.toggle('is-hidden', !show);
        if (show && !reduceMotion) {
          // restart entrance animation
          void work.offsetWidth;
          work.classList.add('pop');
        }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = $('#lightbox');
  var lbImg = $('.lb-img');
  var lbCat = $('.lb-cat');
  var lbTitle = $('.lb-title');
  var lbPrev = $('.lb-prev');
  var lbNext = $('.lb-next');
  var currentIndex = 0;
  var lastFocused = null;

  var visibleWorks = function () {
    return works.filter(function (w) { return !w.classList.contains('is-hidden'); });
  };

  function fillLightbox(work) {
    var img = $('img', work);
    var cat = $('.work-cat', work);
    var title = $('h3', work);
    lbImg.src = img.getAttribute('src');
    lbImg.alt = img.getAttribute('alt');
    lbCat.textContent = cat ? cat.textContent : '';
    lbTitle.textContent = title ? title.textContent : '';
  }

  function openLightbox(work) {
    var visible = visibleWorks();
    currentIndex = visible.indexOf(work);
    if (currentIndex === -1) { currentIndex = 0; }
    lastFocused = document.activeElement;
    fillLightbox(visible[currentIndex]);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lb-close', lightbox).focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) { lastFocused.focus(); }
  }

  function stepLightbox(dir) {
    var visible = visibleWorks();
    if (!visible.length) { return; }
    currentIndex = (currentIndex + dir + visible.length) % visible.length;
    fillLightbox(visible[currentIndex]);
  }

  if (lightbox) {
    works.forEach(function (work) {
      $('.work-zoom', work).addEventListener('click', function () { openLightbox(work); });
      work.addEventListener('click', function (e) {
        if (!e.target.closest('.work-zoom')) { openLightbox(work); }
      });
    });

    $$('[data-close]', lightbox).forEach(function (el) {
      el.addEventListener('click', closeLightbox);
    });
    lbPrev.addEventListener('click', function () { stepLightbox(-1); });
    lbNext.addEventListener('click', function () { stepLightbox(1); });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) { return; }
      if (e.key === 'Escape') { closeLightbox(); }
      if (e.key === 'ArrowLeft') { stepLightbox(-1); }
      if (e.key === 'ArrowRight') { stepLightbox(1); }
    });
  }

  /* ---------- Service modal (diensten) ---------- */
  var serviceModal = $('#service-modal');
  var serviceImg = $('#service-img');
  var serviceTitle = $('#service-title');
  var serviceText = $('#service-text');
  var serviceLastFocused = null;

  var serviceContent = {
    'binnen': {
      title: 'Binnenschilderwerk',
      text: '<p>Van wanden en plafonds tot trappen en kozijnen. We werken met latex- en acrylaatverf op waterbasis, schuren elke ondergrond egaal en gebruiken voor vochtige ruimtes speciale badkamer- en keukenverf.</p>',
      img: 'https://loremflickr.com/640/360/painting,wall',
      alt: 'Binnenschilderwerk: schilderen van een binnenwand'
    },
    'buiten': {
      title: 'Buitenschilderwerk',
      text: '<p>Uw gevel, kozijnen en deuren beschermen we tegen regen, wind en zon. We gebruiken duurzame gevelverf, behandelen hout met beits of vernis en brengen vooraf de juiste primer aan.</p>',
      img: 'https://loremflickr.com/640/360/house,exterior,painting',
      alt: 'Buitenschilderwerk: schilderen van een gevel'
    },
    'lakwerk': {
      title: 'Lakwerk &amp; houtwerk',
      text: '<p>Deuren, kasten, keukens en trappen krijgen een krasvaste finish met lakverf of vernis. Voor grote oppervlakken spuiten we airless — snel, strak en zonder aanzetten.</p>',
      img: 'https://loremflickr.com/640/360/woodwork,door',
      alt: 'Lakwerk en houtwerk: houten deur in lak'
    },
    'behang': {
      title: 'Behang &amp; afwerking',
      text: '<p>Van designbehang tot glasvlies. We bereiden de wand voor door te schuren, plamuren en pleisteren tot een egaal oppervlak, en werken naden netjes af met siliconen.</p>',
      img: 'https://loremflickr.com/640/360/interior,wallpaper',
      alt: 'Behang en afwerking: behang aanbrengen op een wand'
    }
  };

  function openServiceModal(id) {
    var info = serviceContent[id];
    if (!info) { return; }
    serviceLastFocused = document.activeElement;
    serviceTitle.textContent = info.title;
    serviceText.innerHTML = info.text;
    serviceImg.src = info.img;
    serviceImg.alt = info.alt;
    serviceModal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.service-modal-close', serviceModal).focus();
  }

  function closeServiceModal() {
    serviceModal.hidden = true;
    document.body.style.overflow = '';
    if (serviceLastFocused && serviceLastFocused.focus) { serviceLastFocused.focus(); }
  }

  if (serviceModal) {
    $$('.card[data-service]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) { return; }
        openServiceModal(card.getAttribute('data-service'));
      });
    });
    $$('[data-service-close]', serviceModal).forEach(function (el) {
      el.addEventListener('click', closeServiceModal);
    });
    document.addEventListener('keydown', function (e) {
      if (!serviceModal.hidden && e.key === 'Escape') { closeServiceModal(); }
    });
  }

  /* ---------- Reviews: endless horizontal slider ---------- */
  var reviewTrack = $('#reviews-list');

  if (reviewTrack) {
    var reviews = $$('.review', reviewTrack);
    var reviewCount = reviews.length;
    var reviewTicking = false;
    var loopTimer = null;
    var drag = null;

    // Endless loop: a copy of every review sits before and after the real ones.
    // When the track settles on a copy, it jumps silently to the matching real review.
    function cloneReview(r) {
      var c = r.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('inert', '');
      return c;
    }
    reviews.slice().reverse().forEach(function (r) { reviewTrack.insertBefore(cloneReview(r), reviewTrack.firstChild); });
    reviews.forEach(function (r) { reviewTrack.appendChild(cloneReview(r)); });
    var slides = $$('.review', reviewTrack);

    function reviewStep() {
      return slides[1].offsetLeft - slides[0].offsetLeft;
    }

    function slideIndex() {
      return Math.round(reviewTrack.scrollLeft / reviewStep());
    }

    function jumpTo(index) {
      reviewTrack.style.scrollSnapType = 'none';
      reviewTrack.scrollLeft = index * reviewStep();
      reviewTrack.style.scrollSnapType = '';
    }

    function updateReviews() {
      reviewTicking = false;
      var index = ((slideIndex() % reviewCount) + reviewCount) % reviewCount;
      // Mark the real review and its copies alike, so the silent jump doesn't flicker.
      slides.forEach(function (r, i) { r.classList.toggle('is-current', i % reviewCount === index); });
    }

    function settleLoop() {
      if (drag) { return; }
      var index = slideIndex();
      if (index < reviewCount) { jumpTo(index + reviewCount); }
      else if (index >= reviewCount * 2) { jumpTo(index - reviewCount); }
    }

    function scrollReviews(direction) {
      reviewTrack.scrollBy({ left: direction * reviewStep(), behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    reviewTrack.addEventListener('scroll', function () {
      if (!reviewTicking) { reviewTicking = true; window.requestAnimationFrame(updateReviews); }
      clearTimeout(loopTimer);
      loopTimer = setTimeout(settleLoop, 140);
    }, { passive: true });
    window.addEventListener('resize', function () {
      jumpTo(reviewCount + (((slideIndex() % reviewCount) + reviewCount) % reviewCount));
      updateReviews();
    });
    jumpTo(reviewCount);
    updateReviews();

    // Mouse users can drag the track; touch and trackpads scroll it natively.
    reviewTrack.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) { return; }
      drag = { x: e.clientX, left: reviewTrack.scrollLeft, moved: false };
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) { return; }
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        reviewTrack.classList.add('is-dragging');
      }
      if (drag.moved) { reviewTrack.scrollLeft = drag.left - dx; }
    });
    window.addEventListener('pointerup', function () {
      if (!drag) { return; }
      var moved = drag.moved;
      var delta = reviewTrack.scrollLeft - drag.left;
      drag = null;
      if (!moved) { return; }
      reviewTrack.classList.remove('is-dragging');
      // Settle on the next/previous review in the drag direction.
      var step = reviewStep();
      var target = Math.round((reviewTrack.scrollLeft + (Math.abs(delta) > step * .15 ? Math.sign(delta) * step * .35 : 0)) / step) * step;
      reviewTrack.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    reviewTrack.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // Autoplay: advance on its own while the reviews are on screen.
    // Pauses while the visitor touches the slider or tabs into it with the keyboard.
    var AUTOPLAY_MS = 5500;
    var autoplayTimer = null;
    var reviewsVisible = false;
    var reviewsPaused = false;
    var reviewArea = $('#reviews .reviews-layout') || reviewTrack;

    function stopAutoplay() {
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }

    function syncAutoplay() {
      var run = reviewsVisible && !reviewsPaused && !document.hidden && !reduceMotion;
      if (run && !autoplayTimer) { autoplayTimer = setInterval(function () { scrollReviews(1); }, AUTOPLAY_MS); }
      if (!run) { stopAutoplay(); }
    }

    function setReviewsPaused(paused) {
      reviewsPaused = paused;
      stopAutoplay();
      syncAutoplay();
    }

    function restartAutoplay() {
      stopAutoplay();
      syncAutoplay();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        reviewsVisible = entries[0].isIntersecting;
        syncAutoplay();
      }, { threshold: .5 }).observe(reviewTrack);
    }

    // Only keyboard focus pauses; a mouse click on the track shouldn't stop it for good.
    reviewArea.addEventListener('focusin', function () {
      if (reviewTrack.matches(':focus-visible')) { setReviewsPaused(true); }
    });
    reviewArea.addEventListener('focusout', function (e) {
      if (!reviewArea.contains(e.relatedTarget)) { setReviewsPaused(false); }
    });
    reviewTrack.addEventListener('touchstart', function () { setReviewsPaused(true); }, { passive: true });
    reviewTrack.addEventListener('touchend', function () { setReviewsPaused(false); }, { passive: true });
    reviewTrack.addEventListener('pointerup', restartAutoplay);
    document.addEventListener('visibilitychange', syncAutoplay);

    // Scrolling with the mouse wheel over the reviews moves them sideways, one review per gesture.
    // Next to the reviews the page scrolls as usual.
    var wheelLockUntil = 0;
    reviewTrack.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { restartAutoplay(); return; }
      e.preventDefault();
      var now = Date.now();
      // Swallow the rest of the same gesture (trackpad momentum keeps firing small events).
      if (now < wheelLockUntil) {
        wheelLockUntil = Math.max(wheelLockUntil, now + 160);
        return;
      }
      wheelLockUntil = now + 550;
      scrollReviews(e.deltaY > 0 ? 1 : -1);
      restartAutoplay();
    }, { passive: false });
  }
  /* ---------- Contact form ---------- */
  var form = $('#quote-form');
  var status = $('#form-status');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      $$('[required]', form).forEach(function (field) {
        var ok = field.checkValidity();
        field.classList.toggle('invalid', !ok);
        if (!ok) { valid = false; }
      });

      if (!valid) {
        status.textContent = 'Vul alle verplichte velden correct in.';
        status.className = 'form-status err';
        return;
      }

      var key = form.elements.access_key.value;
      if (!key || key.indexOf('JOUW-') === 0) {
        status.textContent = 'Het formulier is nog niet gekoppeld. Bel of mail ons gerust rechtstreeks.';
        status.className = 'form-status err';
        return;
      }

      var submitBtn = $('button[type="submit"]', form);
      var name = ($('#f-naam').value || '').split(' ')[0];
      submitBtn.disabled = true;
      status.textContent = 'Bezig met verzenden…';
      status.className = 'form-status';

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok && data.success, data: data }; }); })
        .then(function (result) {
          if (!result.ok) { throw new Error(result.data && result.data.message); }
          status.textContent = 'Bedankt' + (name ? ' ' + name : '') + '! Uw aanvraag is goed ontvangen. We nemen binnen 24 uur contact met u op.';
          status.className = 'form-status ok';
          form.reset();
          $$('.invalid', form).forEach(function (f) { f.classList.remove('invalid'); });
        })
        .catch(function () {
          status.textContent = 'Er ging iets mis bij het verzenden. Probeer het opnieuw of bel ons op +32 3 123 45 67.';
          status.className = 'form-status err';
        })
        .then(function () { submitBtn.disabled = false; });
    });

    $$('[required]', form).forEach(function (field) {
      field.addEventListener('input', function () { field.classList.remove('invalid'); });
    });
  }
})();
