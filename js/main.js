/* =========================================================
   АкваЛайн — общий скрипт для всех страниц
   ========================================================= */
(function () {
  'use strict';

  // Помечаем, что JS работает — только тогда применяем анимации появления
  document.documentElement.classList.add('js');

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  var backdrop = document.querySelector('.nav-backdrop');

  function closeMenu() {
    if (nav) nav.classList.remove('open');
    if (burger) burger.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      if (backdrop) backdrop.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  if (nav) {
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Модальное окно «Заказать звонок» ---------- */
  var modal = document.getElementById('callModal');
  var modalServiceInput = document.getElementById('modalServiceInput');
  var modalServiceTag = document.getElementById('modalServiceTag');

  function setModalService(serviceName) {
    if (!modalServiceInput) return;
    if (serviceName) {
      modalServiceInput.value = serviceName;
      if (modalServiceTag) {
        modalServiceTag.textContent = 'Услуга: ' + serviceName;
        modalServiceTag.style.display = 'inline-flex';
      }
    } else {
      modalServiceInput.value = 'Не указана (форма из шапки/футера)';
      if (modalServiceTag) modalServiceTag.style.display = 'none';
    }
  }

  function openModal() {
    if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }
  function closeModal() {
    if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
  }
  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      setModalService(btn.getAttribute('data-service'));
      openModal();
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  }
  /* ---------- Лайтбокс (просмотр патентов в полном размере) ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbItems = [].slice.call(document.querySelectorAll('[data-lightbox]'));
  var lbIndex = 0;

  function openLightbox(i) {
    if (!lightbox || !lbItems.length) return;
    lbIndex = (i + lbItems.length) % lbItems.length;
    var item = lbItems[lbIndex];
    var img = lightbox.querySelector('.lightbox__img');
    var num = lightbox.querySelector('.lightbox__caption .num');
    var title = lightbox.querySelector('.lightbox__caption .title');
    var counter = lightbox.querySelector('.lightbox__counter');
    img.src = item.getAttribute('data-full');
    img.alt = item.getAttribute('data-title') || '';
    if (num) num.textContent = item.getAttribute('data-num') || '';
    if (title) title.textContent = item.getAttribute('data-title') || '';
    if (counter) counter.textContent = (lbIndex + 1) + ' / ' + lbItems.length;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  lbItems.forEach(function (trigger, i) {
    trigger.addEventListener('click', function (e) { e.preventDefault(); openLightbox(i); });
  });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    var lbClose = lightbox.querySelector('.lightbox__close');
    var lbPrev = lightbox.querySelector('.lightbox__prev');
    var lbNext = lightbox.querySelector('.lightbox__next');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbPrev) lbPrev.addEventListener('click', function () { openLightbox(lbIndex - 1); });
    if (lbNext) lbNext.addEventListener('click', function () { openLightbox(lbIndex + 1); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeMenu(); closeLightbox(); }
    if (lightbox && lightbox.classList.contains('open')) {
      if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
    }
  });

  /* ---------- FAQ-аккордеон ---------- */
  document.querySelectorAll('.faq__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq__item');
      var answer = item.querySelector('.faq__a');
      var isOpen = item.classList.toggle('open');
      answer.style.maxHeight = isOpen ? (answer.scrollHeight + 'px') : null;
    });
  });

  /* ---------- Обработка форм (отправка заявки на почту) ----------
     Заявки уходят через сервис FormSubmit на e-mail ниже.
     E-mail не хранится в коде открытым текстом (base64), чтобы его
     не собирали спам-боты, сканирующие исходный код страниц.
     Чтобы сменить получателя — поменяйте строку в atob(), закодировав
     новый адрес в base64.
     Заработает после публикации сайта в интернете и разовой
     активации (первая заявка -> письмо со ссылкой "Activate").
  ---------------------------------------------------------------- */
  var FORM_EMAIL = atob('bWFua3VsaWV2LnJlbmF0QHlhbmRleC5ydQ==');
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + FORM_EMAIL;

  // Honeypot-поле против спам-ботов: добавляем скрытое поле "_honey" в
  // каждую форму. Обычный человек его не видит и не заполняет, а боты,
  // которые автоматически заполняют все поля формы, попадаются — FormSubmit
  // тихо отклоняет такие отправки. Это и есть работающий аналог капчи для
  // форм, отправляемых через AJAX (визуальная капча FormSubmit показывается
  // только при обычной отправке с перезагрузкой страницы, здесь её не будет).
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    if (!form.querySelector('input[name="_honey"]')) {
      var honey = document.createElement('input');
      honey.type = 'text';
      honey.name = '_honey';
      honey.style.display = 'none';
      honey.tabIndex = -1;
      honey.autocomplete = 'off';
      form.appendChild(honey);
    }
  });

  function buildResultCard(state) {
    if (state === 'success') {
      return '<div class="form-result__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6 9 17l-5-5"/></svg></div>' +
        '<h4>Спасибо, заявка принята</h4>' +
        '<p>Свяжемся с вами в ближайшее время</p>' +
        '<div class="form-result__actions"><a class="btn btn--primary" href="index.html">На главную</a></div>';
    }
    return '<div class="form-result__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg></div>' +
      '<h4>Не получилось отправить</h4>' +
      '<p>Позвоните нам напрямую — мы на связи</p>' +
      '<div class="form-result__actions"><a class="btn btn--primary" href="tel:+79818345864">Позвонить: +7 (981) 834-58-64</a><button type="button" class="form-result__retry" data-retry>Попробовать снова</button></div>';
  }

  function showFormResult(form, state) {
    var result = form.querySelector('.form-result');
    if (!result) return;
    result.className = 'form-result form-result--' + state;
    result.innerHTML = buildResultCard(state);
    form.classList.add('form--result');
  }

  function resetFormResult(form) {
    var result = form.querySelector('.form-result');
    form.classList.remove('form--result');
    if (result) { result.className = 'form-result'; result.innerHTML = ''; }
  }

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('click', function (e) {
      if (e.target.closest('[data-retry]')) { resetFormResult(form); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var btnText = btn ? btn.textContent : '';

      var honeyField = form.querySelector('input[name="_honey"]');
      if (honeyField && honeyField.value) {
        // Поле-ловушку заполнил бот — тихо считаем форму отправленной,
        // ничего никуда не посылаем.
        showFormResult(form, 'success');
        return;
      }

      var data = new FormData(form);
      data.append('_subject', 'Новая заявка с сайта РПД');
      data.append('_template', 'table');
      data.append('_captcha', 'true');

      if (btn) { btn.disabled = true; btn.textContent = 'Отправляем…'; }

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      })
      .then(function (r) { return r.json(); })
      .then(function () {
        showFormResult(form, 'success');
        if (form.closest('.modal-overlay')) { setTimeout(closeModal, 2500); }
      })
      .catch(function () {
        showFormResult(form, 'error');
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
      });
    });
  });

  /* ---------- Маска телефона (простая) ---------- */
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      if (!digits.startsWith('7')) digits = '7' + digits;
      digits = digits.slice(0, 11);
      var out = '+7';
      if (digits.length > 1) out += ' (' + digits.slice(1, 4);
      if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
      if (digits.length >= 7) out += '-' + digits.slice(7, 9);
      if (digits.length >= 9) out += '-' + digits.slice(9, 11);
      input.value = out;
    });
  });

  /* ---------- Полоса прогресса прокрутки + кнопка «наверх» ---------- */
  var toTop = document.querySelector('.to-top');
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  function onScroll() {
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', scrolled > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Появление секций при скролле (с лёгким каскадом) ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    // Каскад для карточек внутри сетки — помечаем детей как reveal с задержкой
    document.querySelectorAll('.cards, .cards--4, .cards--2, .proj-grid, .dir-overview, .steps').forEach(function (grid) {
      var kids = grid.children;
      for (var i = 0; i < kids.length; i++) {
        kids[i].setAttribute('data-reveal', '');
        kids[i].style.transitionDelay = (i % 4 * 0.08) + 's';
      }
    });

    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Счётчик цифр в статистике ---------- */
  function countUp(el) {
    var raw = el.getAttribute('data-count') || el.textContent;
    var m = /^(\d+)(.*)$/.exec(raw.trim());
    if (!m) return;
    var target = parseInt(m[1], 10);
    var suffix = m[2] || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var dur = 1300, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var nums = document.querySelectorAll('.hero__stat .num');
  if (nums.length) {
    if ('IntersectionObserver' in window) {
      var nio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { countUp(en.target); nio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      nums.forEach(function (n) { nio.observe(n); });
    } else {
      nums.forEach(countUp);
    }
  }

  /* ---------- «Магнитные» основные кнопки (только на десктопе с мышью) ---------- */
  if (!reduceMotion && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn--primary').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.22) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Клик по телефону: на десктопе — копировать номер, на мобильном — звонить ---------- */
  var isDesktopPointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (isDesktopPointer) {
    document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var number = link.getAttribute('href').replace('tel:', '');

        // Синхронное копирование через скрытое поле — без запроса разрешений,
        // работает сразу по клику в любом браузере.
        var ta = document.createElement('textarea');
        ta.value = number;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var copied = false;
        try { copied = document.execCommand('copy'); } catch (err) { copied = false; }
        document.body.removeChild(ta);
        if (!copied) return;

        var toast = document.createElement('span');
        toast.className = 'phone-copied-toast';
        toast.textContent = 'Номер скопирован';
        link.appendChild(toast);
        requestAnimationFrame(function () { toast.classList.add('show'); });
        setTimeout(function () {
          toast.classList.remove('show');
          setTimeout(function () { toast.remove(); }, 200);
        }, 1400);
      });
    });
  }
})();
