# Форма (успех/ошибка) + страница 404 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить одинаковый зелёный блок «успех/ошибка» формы заявки на два визуально различных состояния (карточка вместо формы, вариант B из дизайн-спеки) и добавить недостающую страницу 404 (тёмный технический стиль, вариант A, с кликабельным телефоном).

**Architecture:** Правки централизованы в двух исходниках — `css/styles.css` и `js/main.js` — затем разносятся по всем `.html`-страницам скриптом `.claude/build.ps1` (инлайнит CSS/JS между маркерами `<!--CSS-->`/`<!--JS-->`). Разметка форм на всех страницах меняется единообразно (`.form-success` → `.form-result`), логика подмены — CSS-класс `form--result` на `<form>`, скрывающий исходные поля и показывающий карточку; текст карточки строит JS. 404.html — новый самостоятельный файл по образцу существующих страниц (шапка/подвал/модалка скопированы, добавлена новая секция).

**Tech Stack:** Чистый HTML/CSS/JS (ES5, без сборщиков), PowerShell для инлайн-сборки, локальный статический сервер `.claude/serve.ps1` (порт 5599, запускается через `.claude/launch.json`, конфигурация `"site"`).

## Global Constraints

- Проект — не git-репозиторий (`git status` → "not a git repository"). Шаги "commit" из шаблона плана исключены — ничего не коммитить, просто редактировать файлы.
- Автоматических тестов в проекте нет (статичный сайт без сборки/раннера). Проверка каждого шага = (а) `grep`/`Read` для статической корректности разметки, (б) ручная проверка в браузере через локальный сервер (`preview_start` с `name: "site"` из `.claude/launch.json`, порт 5599) — НЕ через `file://`, у file:// в этой среде проблемы с таймаутами/разрешениями.
- Реальный телефон сайта — `+7 (981) 834-58-64` (`tel:+79818345864`), e-mail — `v.bur@metallcore.pro`. Не путать со старыми плейсхолдерами `+7 (495) 000-00-00` — они больше нигде в актуальной разметке не встречаются (проверено `grep`).
- Дизайн-токены брать из существующего `:root` в `css/styles.css` — в частности `--success: #16A36A` и `--danger: #E23D3D` уже определены и предназначены именно для таких состояний (сейчас `--danger` нигде не используется — этот план первый его потребитель).
- После любой правки `css/styles.css` или `js/main.js` — обязательно запускать `.claude/build.ps1` (PowerShell) из корня сайта, иначе изменения не попадут в инлайн-копии на страницах.
- Единый текст карточки успеха/ошибки для всех форм сайта (не варьировать по странице) — так решено в дизайн-спеке `docs/superpowers/specs/2026-07-17-form-feedback-and-404-design.md`, прежнее разночтение текста между модалкой и обычной формой сознательно убирается.

---

## Файловая структура

- **Modify:** `css/styles.css` — заменить блок `.form-success` на `.form-result` + сопутствующие классы (Task 1); добавить блок стилей `.error-page` (Task 4).
- **Modify:** `js/main.js` — переписать обработчик `submit` для `form[data-form]` (Task 2).
- **Modify:** 9 файлов `*.html` (`index.html`, `kontakty.html`, `uslugi.html`, `o-kompanii.html`, `proekty.html`, `stati.html`, `diagnostika-truboprovodov.html`, `remont-bez-otklyucheniya-vody.html`, `stoimost-vrezki-pod-davleniem.html`) — заменить `<div class="form-success">...</div>` на `<div class="form-result"></div>` (11 вхождений), затем инлайн CSS/JS обновится через `build.ps1` (Task 3).
- **Create:** `404.html` — новая страница (Task 5).

---

### Task 1: CSS для карточки результата формы

**Files:**
- Modify: `css/styles.css:802-807`

**Interfaces:**
- Produces: CSS-классы `.form-result`, `.form-result__icon`, `.form-result--success`, `.form-result--error`, `.form-result__actions`, `.form-result__retry`, и правило `.form.form--result` (скрывает исходные поля формы, показывает карточку). Используются в Task 2 (JS) и Task 3 (разметка на страницах).
- Consumes: существующие токены `--success`, `--danger`, `--muted`, `--blue-600`, `--font-display`, `--r-sm` (уже определены в `:root`, `css/styles.css:9-46`).

- [ ] **Шаг 1: Найти текущий блок `.form-success`**

Открыть `css/styles.css`, найти (около строки 802):

```css
.form-success {
  display: none;
  background: #E9F8F0; border: 1px solid #B7E6CE;
  color: #12734B; padding: 16px; border-radius: var(--r-sm);
  font-weight: 600;
}
```

- [ ] **Шаг 2: Заменить блок на новую разметку**

Заменить весь блок из Шага 1 на:

```css
.form-result {
  display: none;
  text-align: center;
  padding: 10px 4px 4px;
}
.form.form--result > *:not(.form-result) { display: none; }
.form.form--result .form-result { display: block; }
.form-result__icon {
  width: 54px; height: 54px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.form-result__icon svg { width: 26px; height: 26px; stroke-width: 2.5; }
.form-result--success .form-result__icon { background: rgba(22,163,106,.12); color: var(--success); }
.form-result--error .form-result__icon { background: rgba(226,61,61,.12); color: var(--danger); }
.form-result h4 { font-family: var(--font-display); font-size: 19px; margin-bottom: 6px; }
.form-result p { color: var(--muted); font-size: 14px; margin-bottom: 20px; }
.form-result__actions { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.form-result__retry {
  font-size: 13px; font-weight: 700; color: var(--blue-600);
  background: none; border: none; font-family: inherit; cursor: pointer; padding: 4px;
}
.form-result__retry:hover { text-decoration: underline; }
```

- [ ] **Шаг 3: Проверить, что старый класс исчез, а новые появились**

Запустить (из корня сайта):

```bash
grep -c "form-success" css/styles.css
grep -c "form-result" css/styles.css
```

Ожидается: `form-success` — 0, `form-result` (считает строки, где встречается подстрока — совпадения вида `.form-result`, `.form-result__icon`, `.form-result--success` и т.д., но НЕ `.form--result` с двойным дефисом, там другая подстрока) — 12.

---

### Task 2: JS — логика показа карточки и повторной попытки

**Files:**
- Modify: `js/main.js:161-203`

**Interfaces:**
- Consumes: CSS-классы из Task 1 (`.form-result`, `.form--result`, `.form-result--success/--error`, `[data-retry]` через класс `.form-result__retry`).
- Produces: функции `buildResultCard(state)`, `showFormResult(form, state)`, `resetFormResult(form)` — используются только внутри этого файла, наружу не экспортируются (замыкание IIFE как и весь остальной файл).

- [ ] **Шаг 1: Найти текущий обработчик отправки форм**

В `js/main.js` найти блок (около строки 161):

```js
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = form.querySelector('.form-success');
      var btn = form.querySelector('button[type="submit"]');
      var btnText = btn ? btn.textContent : '';

      var honeyField = form.querySelector('input[name="_honey"]');
      if (honeyField && honeyField.value) {
        // Поле-ловушку заполнил бот — тихо считаем форму отправленной,
        // ничего никуда не посылаем.
        if (success) { success.style.display = 'block'; }
        return;
      }

      var data = new FormData(form);
      data.append('_subject', 'Новая заявка с сайта АкваЛайн');
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
        if (success) { success.style.display = 'block'; }
        form.querySelectorAll('input, textarea').forEach(function (el) { el.disabled = true; });
        if (btn) { btn.textContent = 'Отправлено'; }
        if (form.closest('.modal-overlay')) { setTimeout(closeModal, 2500); }
      })
      .catch(function () {
        if (success) {
          success.style.display = 'block';
          success.textContent = 'Не удалось отправить онлайн. Пожалуйста, позвоните нам, мы на связи.';
        }
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
      });
    });
  });
```

- [ ] **Шаг 2: Заменить его на новую версию**

```js
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
      data.append('_subject', 'Новая заявка с сайта АкваЛайн');
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
```

- [ ] **Шаг 3: Статическая проверка**

```bash
grep -n "function buildResultCard\|function showFormResult\|function resetFormResult\|form-success" js/main.js
```

Ожидается: три новые функции найдены, `form-success` — 0 совпадений.

---

### Task 3: Разметка на всех страницах + сборка + функциональная проверка

**Files:**
- Modify: `index.html`, `kontakty.html`, `uslugi.html`, `o-kompanii.html`, `proekty.html`, `stati.html`, `diagnostika-truboprovodov.html`, `remont-bez-otklyucheniya-vody.html`, `stoimost-vrezki-pod-davleniem.html` (11 вхождений `.form-success` суммарно — по 2 в `index.html` и `kontakty.html`, по 1 в остальных 7).

**Interfaces:**
- Consumes: CSS/JS из Task 1 и Task 2 (уже ждут элемент `.form-result` как прямого потомка `<form data-form>`).

- [ ] **Шаг 1: Заменить разметку одной командой на все страницы**

Из корня сайта (`C:\Users\user\Desktop\сайт`):

```bash
for f in index.html kontakty.html uslugi.html o-kompanii.html proekty.html stati.html diagnostika-truboprovodov.html remont-bez-otklyucheniya-vody.html stoimost-vrezki-pod-davleniem.html; do
  sed -i -E 's#<div class="form-success">[^<]*</div>#<div class="form-result"></div>#g' "$f"
done
```

- [ ] **Шаг 2: Проверить, что замена разметки прошла везде**

Инлайн-копии CSS/JS внутри страниц ещё старые (будут обновлены в Шаге 3), поэтому здесь проверяем только сам `<div>`, а не CSS-правила:

```bash
grep -c '<div class="form-success"' *.html
grep -c '<div class="form-result"' *.html
```

Ожидается: первая команда — `0` у всех 9 изменённых файлов (могут быть строки `photo-picker*.html:0`, `mockups-zero-blocks.html:0` — это нормально, там форм нет). Вторая — у `index.html` и `kontakty.html` значение `2`, у остальных семи изменённых файлов — `1`.

- [ ] **Шаг 3: Пересобрать инлайн CSS/JS во все страницы**

Запустить PowerShell (не Bash — это `.ps1`):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/build.ps1
```

Ожидается в выводе: `inlined: <имя>.html` для каждого `.html`-файла в корне (включая только что изменённые 9), и `Done. All pages are now self-contained.` в конце.

- [ ] **Шаг 4: Проверить, что инлайн-копии полностью обновились**

```bash
grep -c "form-success" index.html kontakty.html uslugi.html o-kompanii.html proekty.html stati.html diagnostika-truboprovodov.html remont-bez-otklyucheniya-vody.html stoimost-vrezki-pod-davleniem.html
grep -c "form-result__icon" index.html kontakty.html uslugi.html o-kompanii.html proekty.html stati.html diagnostika-truboprovodov.html remont-bez-otklyucheniya-vody.html stoimost-vrezki-pod-davleniem.html
```

Ожидается: первая команда — `0` для всех 9 файлов (старое инлайн-CSS-правило `.form-success` исчезло вместе с остальным устаревшим инлайном). Вторая — `≥1` для всех 9 (новое правило `.form-result__icon` теперь есть в инлайн-`<style>` каждой страницы, т.к. `build.ps1` копирует весь `css/styles.css` целиком на каждую страницу).

- [ ] **Шаг 5: Запустить локальный сервер и открыть главную**

Через инструменты превью запустить сервер `"site"` (описан в `.claude/launch.json`, порт 5599) и открыть `http://127.0.0.1:5599/index.html`.

- [ ] **Шаг 6: Проверить состояние «успех» через honeypot-путь**

Honeypot-поле (`input[name="_honey"]`) при непустом значении мгновенно показывает карточку успеха без сетевого запроса — детерминированный способ проверить UI без реального FormSubmit-запроса (см. `js/main.js`, ветка `if (honeyField && honeyField.value)`).

В консоли браузера на открытой странице выполнить:

```js
var f = document.querySelector('form[data-form]');
f.querySelector('input[name="_honey"]').value = 'x';
f.requestSubmit();
```

Ожидается: поля формы и кнопка исчезают, появляется карточка с зелёной иконкой-галочкой, заголовком «Спасибо, заявка принята» и кнопкой «На главную». Перезагрузить страницу перед следующим шагом (честь `_honey` не должна остаться).

- [ ] **Шаг 7: Проверить состояние «ошибка» и повторную попытку**

На свежей загрузке страницы в консоли временно подменить `fetch`, чтобы гарантированно получить сетевую ошибку:

```js
window.fetch = function () { return Promise.reject(new Error('test')); };
```

Затем заполнить обязательные поля формы (`Имя`, `Телефон`) через интерфейс и нажать «Отправить заявку».

Ожидается: карточка с красной иконкой-предупреждением, заголовком «Не получилось отправить», кнопкой «Позвонить: +7 (981) 834-58-64» (ссылка `tel:+79818345864`) и ссылкой «Попробовать снова».

Нажать «Попробовать снова» — ожидается: карточка исчезает, поля формы возвращаются с ранее введёнными значениями (имя/телефон не очистились), кнопка «Отправить заявку» снова активна.

Перезагрузить страницу после проверки, чтобы вернуть настоящий `fetch`.

- [ ] **Шаг 8: Повторить проверку Шага 6 или 7 на модалке**

Открыть модалку (кнопка «Заказать звонок» в шапке), повторить honeypot-трюк (Шаг 6) для формы внутри `#callModal` — убедиться, что карточка успеха отображается и внутри модального окна, модалка не разъезжается по высоте некрасиво.

---

### Task 4: CSS для страницы 404

**Files:**
- Modify: `css/styles.css` (добавить новый блок в конец файла).

**Interfaces:**
- Produces: классы `.error-page`, `.error-page__code`, `.error-page__actions`, `.error-page__phone`, `.error-page__phone-label` — потребляются в Task 5 (`404.html`).
- Consumes: `.section`, `.section--navy`, `.btn`, `.btn--primary`, `.btn--outline` (уже существуют и не меняются — `.section--navy .btn--outline` уже даёт белую обводку на тёмном фоне, см. `css/styles.css:146-151`).

- [ ] **Шаг 1: Добавить блок стилей в конец `css/styles.css`**

```css

/* =========================================================
   СТРАНИЦА 404
   ========================================================= */
.error-page { text-align: center; padding: 120px 0; }
.error-page .container { max-width: 640px; }
.error-page__code {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 96px;
  line-height: 1;
  background: linear-gradient(90deg, var(--blue-400), var(--blue-500));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 8px;
}
.error-page h1 { font-size: 30px; margin-bottom: 12px; }
.error-page p { color: #C3D2EC; font-size: 16px; }
.error-page__actions { display: flex; gap: 14px; justify-content: center; margin-top: 30px; flex-wrap: wrap; }
.error-page__phone {
  display: inline-flex; align-items: center; gap: 10px;
  margin-top: 40px; padding-top: 26px;
  border-top: 1px solid rgba(255,255,255,.14);
}
.error-page__phone svg { width: 18px; height: 18px; color: var(--blue-400); flex: none; }
.error-page__phone a { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #fff; text-decoration: none; }
.error-page__phone-label { display: block; font-size: 12.5px; color: #A9BBDD; text-align: left; margin-top: 2px; }

@media (max-width: 640px) {
  .error-page { padding: 80px 0; }
  .error-page__code { font-size: 60px; }
  .error-page__actions { flex-direction: column; align-items: stretch; }
  .error-page__actions .btn { width: 100%; }
}
```

- [ ] **Шаг 2: Проверить**

```bash
grep -c "error-page" css/styles.css
```

Ожидается: `14`.

---

### Task 5: Страница 404.html

**Files:**
- Create: `404.html`

**Interfaces:**
- Consumes: CSS-классы из Task 4, глобальный `js/main.js` (без изменений — обработка `tel:`-ссылок, модалка, форма уже работают одинаково на любой странице через `[data-open-modal]`/`[data-form]`).

- [ ] **Шаг 1: Создать `404.html` с полным содержимым**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Страница не найдена — АкваЛайн</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
</head>
<body>

  <div class="topbar">
    <div class="container topbar__inner">
      <div class="topbar__regions">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        Москва · МО · Санкт-Петербург · ЛО
      </div>
      <div class="topbar__right">
        <span>Аварийная служба 24/7</span>
        <a href="mailto:v.bur@metallcore.pro">v.bur@metallcore.pro</a>
        <a class="topbar__phone" href="tel:+79818345864">+7 (981) 834-58-64</a>
      </div>
    </div>
  </div>

  <header class="header">
    <div class="container header__inner">
      <a href="index.html" class="logo">
        <svg class="logo__mark" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="url(#lg)"/><path d="M24 11c-4.2 5-8 9-8 13.5a8 8 0 1 0 16 0C32 20 28.2 16 24 11Z" fill="#fff"/><path d="M24 27.5a3.5 3.5 0 0 1-3.5-3.5" stroke="#2E76F5" stroke-width="2" stroke-linecap="round"/><defs><linearGradient id="lg" x1="0" y1="0" x2="48" y2="48"><stop stop-color="#2E76F5"/><stop offset="1" stop-color="#1E5FEB"/></linearGradient></defs></svg>
        <span class="logo__text"><span class="logo__name">АкваЛайн</span><span class="logo__tag">Водопроводы без отключения воды</span></span>
      </a>
      <nav class="nav">
        <a href="index.html">Главная</a>
        <a href="uslugi.html">Услуги</a>
        <a href="o-kompanii.html">О компании</a>
        <a href="proekty.html">Объекты</a>
        <a href="stati.html">Статьи</a>
        <a href="kontakty.html">Контакты</a>
        <a href="#" class="btn btn--primary" data-open-modal>Заказать звонок</a>
      </nav>
      <div class="header__actions">
        <a href="#" class="btn btn--primary" data-open-modal>Заказать звонок</a>
      </div>
      <button class="burger" aria-label="Меню"><span></span><span></span><span></span></button>
    </div>
  </header>
  <div class="nav-backdrop"></div>

  <section class="section section--navy error-page">
    <div class="container">
      <div class="error-page__code" aria-hidden="true">404</div>
      <h1>Страница не найдена</h1>
      <p>Возможно, ссылка устарела или страница была перемещена. Загляните на главную или посмотрите список услуг.</p>
      <div class="error-page__actions">
        <a href="index.html" class="btn btn--primary">На главную</a>
        <a href="uslugi.html" class="btn btn--outline">Наши услуги</a>
      </div>
      <div class="error-page__phone">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>
        <div>
          <a href="tel:+79818345864">+7 (981) 834-58-64</a>
          <span class="error-page__phone-label">Не нашли нужное? Просто позвоните</span>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div>
          <div class="logo">
            <svg class="logo__mark" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="url(#lgf)"/><path d="M24 11c-4.2 5-8 9-8 13.5a8 8 0 1 0 16 0C32 20 28.2 16 24 11Z" fill="#fff"/><defs><linearGradient id="lgf" x1="0" y1="0" x2="48" y2="48"><stop stop-color="#2E76F5"/><stop offset="1" stop-color="#1E5FEB"/></linearGradient></defs></svg>
            <span class="logo__text"><span class="logo__name">АкваЛайн</span><span class="logo__tag">Водопроводы без отключения воды</span></span>
          </div>
          <p class="footer__about">Ремонт и обслуживание водопроводных сетей без остановки водоснабжения. Врезка и перекрытие под давлением, аварийная служба 24/7.</p>
        </div>
        <div>
          <h4>Услуги</h4>
          <div class="footer__links">
            <a href="uslugi.html#avariya">Аварийный выезд 24/7</a>
            <a href="uslugi.html#proektirovanie">Проектирование и монтаж</a>
            <a href="uslugi.html#podklyuchenie">Подключение абонентов</a>
            <a href="uslugi.html#remont">Ремонт под давлением</a>
            <a href="uslugi.html#diagnostika">Диагностика и обследование</a>
          </div>
        </div>
        <div>
          <h4>Компания</h4>
          <div class="footer__links">
            <a href="o-kompanii.html">О компании</a>
            <a href="proekty.html">Объекты</a>
            <a href="stati.html">Статьи</a>
            <a href="kontakty.html">Контакты</a>
            <a href="#" data-open-modal>Заказать звонок</a>
          </div>
        </div>
        <div>
          <h4>Контакты</h4>
          <div class="footer__contact">
            <a class="big" href="tel:+79818345864">+7 (981) 834-58-64</a>
            <a href="mailto:v.bur@metallcore.pro">v.bur@metallcore.pro</a>
            <span>Москва · МО · Санкт-Петербург · ЛО</span>
            <span>Офис: 9:00–21:00</span>
            <span>Аварийная служба круглосуточно</span>
          </div>
        </div>
      </div>
      <div class="footer__legal">
        ООО «МЕТАЛЛ КОР» · ИНН 9721259567 · КПП 771301001 · ОГРН 1257700507976<br>
        125599, г. Москва, вн.тер. г. муниципальный округ Западное Дегунино, ул. Ижорская, д. 8, стр. 1
      </div>
      <div class="footer__bottom">
        <span>© 2026 АкваЛайн. Все права защищены.</span>
        <a href="#">Политика конфиденциальности</a>
      </div>
    </div>
  </footer>

  <div class="modal-overlay" id="callModal">
    <div class="modal">
      <button class="modal__close" data-close-modal aria-label="Закрыть"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <h3>Заказать звонок</h3>
      <p>Оставьте номер, перезвоним в ближайшее время.</p>
      <span class="modal__service-tag" id="modalServiceTag"></span>
      <form class="form" data-form>
        <input type="hidden" name="Услуга" id="modalServiceInput" value="Не указана (форма из шапки/футера)">
        <div class="field"><label>Ваше имя</label><input type="text" name="Имя" placeholder="Как к вам обращаться" required></div>
        <div class="field"><label>Телефон</label><input type="tel" name="Телефон" placeholder="+7 (___) ___-__-__" required></div>
        <button type="submit" class="btn btn--primary btn--block">Жду звонка</button>
        <p class="form__note">Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.</p>
        <div class="form-result"></div>
      </form>
    </div>
  </div>

  <button class="to-top" aria-label="Наверх"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Шаг 2: Пересобрать инлайн CSS/JS**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/build.ps1
```

Ожидается: в списке `inlined: ...` присутствует `inlined: 404.html`.

- [ ] **Шаг 3: Проверить, что инлайн прошёл и внешние ссылки исчезли**

```bash
grep -c "error-page__code" 404.html
grep -c 'href="css/styles.css"\|src="js/main.js"' 404.html
```

Ожидается: первая команда — `2` (один раз в инлайн-CSS-правиле `.error-page__code {...}`, второй раз — в самой разметке `<div class="error-page__code">`), вторая — `0` (внешние ссылки `<link>`/`<script>` заменены на инлайн-блоки).

- [ ] **Шаг 4: Проверить `robots.txt` и `sitemap.xml` — 404.html не должен туда попасть**

```bash
grep -c "404.html" robots.txt sitemap.xml
```

Ожидается: `0` в обоих файлах (страницу не индексируем и не блокируем директивой — управляет только `<meta name="robots" content="noindex, nofollow">` внутри самой страницы).

- [ ] **Шаг 5: Открыть страницу в браузере (десктоп)**

Запустить локальный сервер (`preview_start`, `name: "site"`, порт 5599) и открыть `http://127.0.0.1:5599/404.html`.

Проверить:
- Тёмный градиентный фон, крупная цифра «404» градиентом.
- Заголовок «Страница не найдена» и подпись видны, читаемы (белый/светло-голубой текст на тёмном фоне).
- Кнопка «На главную» ведёт на `index.html`, «Наши услуги» — на `uslugi.html` (проверить клик или `read_page`/`href`-атрибуты).
- Блок с телефоном под разделительной линией: иконка трубки, номер `+7 (981) 834-58-64` кликабелен.
- Шапка (навигация, «Заказать звонок») и подвал видны и работают как на остальных страницах.

- [ ] **Шаг 6: Проверить адаптив (мобильная ширина)**

Через `resize_window` с пресетом `mobile` (375×812) перезагрузить `http://127.0.0.1:5599/404.html`.

Проверить:
- Цифра «404» и заголовок уменьшились, не обрезаются и не вылезают за края экрана.
- Кнопки «На главную»/«Наши услуги» расположены в столбик на всю ширину.
- Телефонный блок не расползается, текст не переносится криво.
- Нет горизонтальной прокрутки страницы (`document.documentElement.scrollWidth` не превышает ширину окна — проверить через `javascript_tool`).

- [ ] **Шаг 7: Проверить телефон в блоке 404 кликом**

На десктопной ширине кликнуть по номеру телефона в `.error-page__phone`. Ожидается: появляется тост «Номер скопирован» (уже существующее глобальное поведение из `js/main.js` для всех `a[href^="tel:"]` на десктопе — специально ничего для этого писать не нужно).

---

## Порядок выполнения

Task 1 → Task 2 → Task 3 (зависят друг от друга: CSS, затем JS, затем разметка+сборка+проверка) → Task 4 → Task 5 (независимы от 1–3, но естественно идут после, т.к. используют тот же `build.ps1`-цикл). Можно выполнять как одну последовательную ветку.
