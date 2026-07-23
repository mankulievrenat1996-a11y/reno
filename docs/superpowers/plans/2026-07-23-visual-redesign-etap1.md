# Визуальный редизайн, этап 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Довести статичный сайт РПД до полной визуальной согласованности с новой тёплой терракотово-янтарной палитрой: янтарные CTA-кнопки, крупнее заголовки, «живая» правая панель героя, подтверждённый ритм фона секций, без остатков холодных синих полутонов в CSS.

**Architecture:** Сайт — 10 статичных `.html`-файлов, каждый со встроенным `<!--CSS-->...<!--/CSS-->` блоком, который является побайтовой копией `css/styles.css`. `css/styles.css` — источник правды для стилей; `.claude/build.ps1` разносит его (и `js/main.js`) по всем 10 страницам через regex-замену между маркерами-комментариями. Прямые правки HTML-разметки (не CSS) делаются в конкретном `.html`-файле напрямую и переживают повторный запуск `build.ps1` (он трогает только `<style>`/`<script>` блоки).

**Tech Stack:** Чистый HTML/CSS, без сборщиков и препроцессоров. PowerShell-скрипт для синхронизации. Локальный просмотр — `.claude/serve.ps1` (порт 5602) через `.claude/launch.json` (`preview_start({name: "site"})`).

## Global Constraints

- Источник правды для CSS — только `css/styles.css`; HTML-страницы не редактируются напрямую для CSS-only изменений (искл. Task 3, где меняется разметка `index.html`).
- После КАЖДОЙ правки `css/styles.css` — обязательно прогнать `.claude/build.ps1` (команда: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".claude/build.ps1"` из корня репозитория), иначе HTML-страницы разойдутся с источником.
- Верификация — через `preview_start({name: "site"})` (не ad-hoc `python -m http.server`) и проверку вычисленных стилей через `mcp__Claude_Browser__javascript_tool` (скриншот — опционально, инструмент захвата экрана в этой машине бывает нестабилен).
- Не менять контент, порядок блоков или шрифтовую пару — только цвета/размеры/разметку, явно описанные в спеке.
- Спек: `docs/superpowers/specs/2026-07-23-visual-redesign-etap1-design.md`.

---

### Task 1: CTA-кнопки → янтарный акцент

**Files:**
- Modify: `css/styles.css:137-142` (`.btn--primary`, `.btn--primary:hover`)
- Modify (auto, via build.ps1): все 10 `.html`

**Interfaces:**
- Consumes: существующие переменные `--terra-500: #D4941F`, `--terra-600: #C17A17` (уже определены в `:root`, `css/styles.css:27-29`).
- Produces: `.btn--primary` остаётся тем же классом, используемым во всех кнопках-действиях сайта («Оставить заявку», «Заказать звонок», «Отправить заявку», «Жду звонка») — визуальный контракт (класс, разметка) не меняется, меняется только цвет.

- [ ] **Step 1: Прочитать текущий блок для точного якоря**

Файл `css/styles.css`, строки 137-142 сейчас:

```css
.btn--primary {
  background: linear-gradient(135deg, var(--blue-500), var(--blue-600));
  color: #fff;
  box-shadow: 0 10px 24px rgba(181,80,46,0.32);
}
.btn--primary:hover { transform: translateY(-2px); box-shadow: 0 16px 32px rgba(181,80,46,0.40); }
```

- [ ] **Step 2: Заменить на янтарный градиент**

Заменить на:

```css
.btn--primary {
  background: linear-gradient(135deg, var(--terra-500), var(--terra-600));
  color: #fff;
  box-shadow: 0 10px 24px rgba(193,122,23,0.32);
}
.btn--primary:hover { transform: translateY(-2px); box-shadow: 0 16px 32px rgba(193,122,23,0.40); }
```

(`rgba(193,122,23,...)` — это `#C17A17` = `--terra-600` в rgb, для тени в тон кнопке.)

- [ ] **Step 3: Синхронизировать во все HTML-страницы**

Команда (из корня репозитория):

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".claude/build.ps1"
```

Ожидаемый вывод: `inlined: <имя>.html` для всех 10 файлов, затем `Done. All pages are now self-contained.`

- [ ] **Step 4: Проверить в браузере**

```
preview_start({name: "site"})
navigate → http://localhost:5602/index.html
```

Через `mcp__Claude_Browser__javascript_tool`:

```js
const el = document.querySelector('.btn--primary');
getComputedStyle(el).backgroundImage
```

Ожидается: строка вида `linear-gradient(135deg, rgb(212, 148, 31), rgb(193, 122, 23))`.

Повторить на `uslugi.html` (кнопка «Оставить заявку» в форме) — тот же результат.

- [ ] **Step 5: Commit**

```bash
git add css/styles.css index.html proekty.html kontakty.html o-kompanii.html 404.html remont-bez-otklyucheniya-vody.html stoimost-vrezki-pod-davleniem.html diagnostika-truboprovodov.html stati.html uslugi.html
git commit -m "Switch primary CTA buttons to amber accent"
```

---

### Task 2: Крупнее заголовки на всех страницах

**Files:**
- Modify: `css/styles.css:108-110` (`h1, h2, h3, h4`, `h1`, `h2`)
- Modify (auto, via build.ps1): все 10 `.html`

**Interfaces:**
- Consumes: ничего нового.
- Produces: те же селекторы `h1`/`h2`, размер и line-height меняются глобально для сайта — задаёт масштаб для героя (`.hero h1`) и внутренних страниц (`.page-hero h1`, `h2` секций), т.к. они не переопределяют `font-size` сами.

- [ ] **Step 1: Прочитать текущий блок**

`css/styles.css`, строки 108-110:

```css
h1, h2, h3, h4 { font-family: var(--font-display); line-height: 1.12; font-weight: 700; letter-spacing: -0.02em; }
h1 { font-size: clamp(34px, 5vw, 62px); }
h2 { font-size: clamp(28px, 3.8vw, 46px); }
```

- [ ] **Step 2: Увеличить масштаб и слегка сжать line-height**

Заменить на:

```css
h1, h2, h3, h4 { font-family: var(--font-display); line-height: 1.08; font-weight: 700; letter-spacing: -0.02em; }
h1 { font-size: clamp(40px, 5.6vw, 72px); }
h2 { font-size: clamp(30px, 4.2vw, 54px); }
```

(рост нижней и верхней границы `h1` — с 34/62 до 40/72px, `h2` — с 28/46 до 30/54px, около 15-20%; `line-height` с 1.12 до 1.08 для более плотного набора крупного текста.)

- [ ] **Step 3: Синхронизировать**

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".claude/build.ps1"
```

- [ ] **Step 4: Проверить в браузере**

На `http://localhost:5602/index.html`:

```js
getComputedStyle(document.querySelector('.hero h1')).fontSize
```

Ожидается значение между `40px` и `72px` (конкретное число зависит от ширины вьюпорта из-за `clamp`/`vw`; на viewport 1280px — `5.6vw * 1280 = 71.68px`, это меньше верхней границы 72px, значит сработает именно это значение, примерно `71.68px` — главное, что оно заметно больше старого максимума 62px). Проверить также на `uslugi.html`:

```js
getComputedStyle(document.querySelector('.page-hero h1')).fontSize
getComputedStyle(document.querySelector('.section-head h2') || document.querySelector('h2')).fontSize
```

Значения должны быть крупнее, чем до правки (было максимум 62px/46px).

- [ ] **Step 5: Commit**

```bash
git add css/styles.css index.html proekty.html kontakty.html o-kompanii.html 404.html remont-bez-otklyucheniya-vody.html stoimost-vrezki-pod-davleniem.html diagnostika-truboprovodov.html stati.html uslugi.html
git commit -m "Scale up heading sizes across all pages"
```

---

### Task 3: Правая панель героя — «живая» карточка вместо списка (только index.html)

**Files:**
- Modify: `css/styles.css:302-315` (блок `.hero__panel` — удалить правила `ul`/`li`, добавить новые классы)
- Modify: `index.html:1351-1360` (разметка `.hero__panel`) — правится напрямую, НЕ через build.ps1 (это markup, не CSS), но build.ps1 запускается следом, чтобы подтянуть новый CSS в inline-блок этой же страницы.

**Interfaces:**
- Consumes: `--navy-700`, `--navy-900` (тёмный фон), `--terra-500` (амбер для «горячей» карточки), `--r-md`/`--r-sm` (радиусы), `--font-display`.
- Produces: новые классы `.hero__panel-visual`, `.hero__panel-visual-label`, `.hero__panel-stats`, `.hero__panel-stat`, `.hero__panel-stat--hot` — используются только в `index.html`, больше нигде.

- [ ] **Step 1: Прочитать текущий CSS-блок панели**

`css/styles.css`, строки 302-315:

```css
/* Карточка-панель в герое */
.hero__panel {
  background: rgba(33,23,18,.6);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: var(--r-lg);
  padding: 32px;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-lg);
}
.hero__panel h2 { color: #fff; font-size: 24px; margin-bottom: 8px; }
.hero__panel .muted { color: #C7D6F0; font-size: 15.5px; margin-bottom: 24px; }
.hero__panel ul { display: grid; gap: 16px; }
.hero__panel li { display: flex; gap: 12px; align-items: flex-start; font-size: 17px; color: #fff; }
.hero__panel li svg { width: 23px; height: 23px; flex: none; color: #4ade80; margin-top: 1px; }
```

- [ ] **Step 2: Заменить `ul`/`li` правила на новые классы визуальной карточки**

Заменить строки `.hero__panel ul { ... }` / `.hero__panel li { ... }` / `.hero__panel li svg { ... }` (последние три правила блока) на:

```css
.hero__panel-visual {
  position: relative;
  border-radius: var(--r-md);
  overflow: hidden;
  min-height: 190px;
  padding: 18px;
  background: linear-gradient(160deg, var(--navy-700), var(--navy-900));
}
.hero__panel-visual::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(135deg, rgba(217,139,98,.08) 0 10px, transparent 10px 20px);
}
.hero__panel-visual-label {
  position: relative;
  display: block;
  font-size: 13px;
  color: #D9C7B8;
  margin-bottom: 40px;
}
.hero__panel-stats {
  position: relative;
  display: flex;
  gap: 10px;
}
.hero__panel-stat {
  flex: 1;
  background: rgba(255,255,255,.1);
  border-radius: var(--r-sm);
  padding: 12px 10px;
  text-align: center;
}
.hero__panel-stat .num { display: block; font-family: var(--font-display); font-size: 22px; font-weight: 700; color: #fff; }
.hero__panel-stat .lbl { display: block; font-size: 11px; color: #D9C7B8; margin-top: 3px; }
.hero__panel-stat--hot { background: rgba(212,148,31,.28); }
.hero__panel-stat--hot .num { color: var(--terra-500); }
```

Итоговый блок `.hero__panel` (строки 302-315 целиком) должен выглядеть так:

```css
/* Карточка-панель в герое */
.hero__panel {
  background: rgba(33,23,18,.6);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: var(--r-lg);
  padding: 32px;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-lg);
}
.hero__panel h2 { color: #fff; font-size: 24px; margin-bottom: 8px; }
.hero__panel .muted { color: #C7D6F0; font-size: 15.5px; margin-bottom: 24px; }
.hero__panel-visual {
  position: relative;
  border-radius: var(--r-md);
  overflow: hidden;
  min-height: 190px;
  padding: 18px;
  background: linear-gradient(160deg, var(--navy-700), var(--navy-900));
}
.hero__panel-visual::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(135deg, rgba(217,139,98,.08) 0 10px, transparent 10px 20px);
}
.hero__panel-visual-label {
  position: relative;
  display: block;
  font-size: 13px;
  color: #D9C7B8;
  margin-bottom: 40px;
}
.hero__panel-stats {
  position: relative;
  display: flex;
  gap: 10px;
}
.hero__panel-stat {
  flex: 1;
  background: rgba(255,255,255,.1);
  border-radius: var(--r-sm);
  padding: 12px 10px;
  text-align: center;
}
.hero__panel-stat .num { display: block; font-family: var(--font-display); font-size: 22px; font-weight: 700; color: #fff; }
.hero__panel-stat .lbl { display: block; font-size: 11px; color: #D9C7B8; margin-top: 3px; }
.hero__panel-stat--hot { background: rgba(212,148,31,.28); }
.hero__panel-stat--hot .num { color: var(--terra-500); }
```

- [ ] **Step 3: Синхронизировать CSS в HTML-страницы**

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".claude/build.ps1"
```

(это обновит `<style>`-блок и в `index.html` тоже — разметку `<body>` трогать не будет.)

- [ ] **Step 4: Заменить разметку правой панели в `index.html`**

Текущая разметка (`index.html:1351-1360`):

```html
      <div class="hero__panel">
        <h2>Зачем нужна врезка без остановки потока</h2>
        <p class="muted">Мы проводим работы, пока среда — вода, газ или другой продукт — продолжает идти по трубе.</p>
        <ul>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg> Производство не останавливает технологический процесс</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg> Потребители не остаются без воды, газа или тепла</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg> Не нужно сливать и заново запускать систему</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg> Экономия времени и денег на каждой врезке</li>
        </ul>
      </div>
```

Заменить на:

```html
      <div class="hero__panel">
        <h2>Зачем нужна врезка без остановки потока</h2>
        <p class="muted">Мы проводим работы, пока среда — вода, газ или другой продукт — продолжает идти по трубе.</p>
        <div class="hero__panel-visual">
          <span class="hero__panel-visual-label">Врезка на объекте</span>
          <div class="hero__panel-stats">
            <div class="hero__panel-stat"><span class="num">12+</span><span class="lbl">лет</span></div>
            <div class="hero__panel-stat"><span class="num">800+</span><span class="lbl">объектов</span></div>
            <div class="hero__panel-stat hero__panel-stat--hot"><span class="num">24/7</span><span class="lbl">выезд</span></div>
          </div>
        </div>
      </div>
```

- [ ] **Step 5: Проверить в браузере**

```
preview_start({name: "site"}) → navigate → http://localhost:5602/index.html
```

```js
const hot = document.querySelector('.hero__panel-stat--hot .num');
getComputedStyle(hot).color
```

Ожидается `rgb(212, 148, 31)` (`--terra-500`). И:

```js
document.querySelectorAll('.hero__panel-stat').length
```

Ожидается `3`.

- [ ] **Step 6: Commit**

```bash
git add css/styles.css index.html
git commit -m "Rework hero right panel with floating stat visual"
```

---

### Task 4: Ритм фона секций — аудит по всем 10 страницам

**Files:**
- Не изменяются (по итогам аудита — см. ниже).

**Interfaces:** нет (проверочная задача).

Контекст: правило из спека — на одной странице не должно быть двух идущих подряд секций с одинаковым белым фоном (класс `section` без модификатора `--sky`/`--navy`) без разбивки акцентным/тёмным блоком между ними.

- [ ] **Step 1: Аудит порядка секций по каждой странице**

Команда для каждого файла (пример для `index.html`, повторить для всех 10):

```bash
grep -oE '<section[^>]*class="[^"]*"' index.html | sed -E 's/.*class="([^"]*)"/\1/'
```

Результат аудита (уже выполнен при написании этого плана, зафиксирован здесь для воспроизводимости):

| Страница | Последовательность фонов (N=тёмный/навy, W=белый, S=акцент/sky) | Нарушения (W подряд без разбивки) |
|---|---|---|
| index.html | N,N,W,S,W,S,N,N,W,N,S,W,S,W,S,W | нет |
| uslugi.html | N,S,W,S,W,S,W,S,N,W,S | нет |
| o-kompanii.html | N,W,S,W,S,N,W,S,W | нет |
| proekty.html | N,W,S,W | нет |
| kontakty.html | N,W,S | нет |
| stati.html | N,W | нет (всего одна белая секция) |
| remont-bez-otklyucheniya-vody.html | N,W,S | нет |
| stoimost-vrezki-pod-davleniem.html | N,W,S | нет |
| diagnostika-truboprovodov.html | N,W,S | нет |
| 404.html | N | нет (одна секция) |

(`N` включает `.hero`/`.page-hero`/`.evidence`/`section--navy` — все они имеют тёмный/навy фон согласно `css/styles.css`; `.section--tight` — это только паддинг, не фон, классифицируется по наличию/отсутствию `--sky`/`--navy` рядом с ним.)

- [ ] **Step 2: Зафиксировать результат — правок не требуется**

Все 10 страниц уже соответствуют правилу чередования из спека. Задача закрывается без изменений кода — это ожидаемый и валидный исход аудита (сайт уже был спроектирован с чередованием фона до этого этапа редизайна).

- [ ] **Step 3: Визуально подтвердить на 2 страницах**

```
preview_start({name: "site"}) → navigate → http://localhost:5602/index.html
```

```js
[...document.querySelectorAll('section, .evidence, .hero')].map(s => ({
  cls: s.className,
  bg: getComputedStyle(s).backgroundColor || getComputedStyle(s).backgroundImage
}))
```

Пробежаться глазами по массиву — подряд не должно быть двух одинаковых белых `rgba(0, 0, 0, 0)`/`rgb(255, 255, 255)` без разбивки. Повторить на `uslugi.html`.

- [ ] **Step 4: Commit (пропустить, если Step 2 подтвердил отсутствие изменений)**

Правок нет — коммитить нечего, шаг пропускается. Если в Step 1 на реальном коде обнаружится расхождение с таблицей выше (например, из-за более ранних правок в этом же сеансе работы) — исправить конкретную секцию переключением класса на `section--sky` или `section--navy` (без изменения контента), затем:

```bash
git add <изменённый файл>.html
git commit -m "Fix section background rhythm on <page>"
```

---

### Task 5: Полировка — убрать оставшиеся холодные полутона

**Files:**
- Modify: `css/styles.css` (16 точечных замен hex-цветов, список ниже)
- Modify (auto, via build.ps1): все 10 `.html`

**Interfaces:**
- Consumes: ничего нового (все замены — точечные литеральные hex-значения, не переменные).
- Produces: ничего нового наружу — визуальный фикс существующих селекторов.

Контекст: при замене основной палитры (до этого плана) были заменены все цвета, производные от `:root`-переменных `--navy-*`/`--blue-*`/`--sky-*`. Отдельные точечные hex-цвета (текст на тёмном фоне, бордеры карточек, декоративная сетка), которые никогда не были переменными, а были подобраны вручную под старую синюю тему, остались нетронутыми. Полный список найден аудитом (`grep -noE "#[0-9A-Fa-f]{6}" css/styles.css`) и приведён ниже с точными заменами.

- [ ] **Step 1: Выполнить последовательность точечных замен в `css/styles.css`**

Таблица замен (старое значение → новое, с ролью для контекста):

| Старый hex | Новый hex | Где используется (селектор/строка) |
|---|---|---|
| `#7E93BA` | `#B0987F` | `.footer .logo__tag`, `.footer__legal` |
| `#8FA6CC` | `#C2AF9C` | подпись под меткой доверия (около строки 327) |
| `#94ABD4` | `#C2AF9C` | `.crumbs` (хлебные крошки) |
| `#A9BBDD` | `#C9B7A4` | `.error-page__phone-label` |
| `#A9BEE2` | `#C9B7A4` | `.hero__stat .lbl`, `.section--navy .stat-card__lbl` |
| `#B7C6E4` | `#CEBFAE` | `.section--navy .step p` |
| `#C3D2EC` | `#D3C5B6` | `.section--navy .section-head p`, `.marquee__track span`, `.error-page p` |
| `#C7D6F0` | `#D9CCBE` | `.hero__sub`, `.hero__panel .muted`, `.dir-card p`, `.page-hero p` |
| `#CBD8F2` | `#DED2C4` | `.cta__phone span` |
| `#CFE0FF` | `#E2D6C8` | `.hero__badge` (color), `.card:hover` (border-color), `.chip`/`.dir-head .dir-num` (border-color, строка 419), `.proj-tile__cap p` |
| `#D8E4FA` | `#E2D6C8` | `.topbar` |
| `#DBE9FF` | `#F2E6D8` | `.card__icon` (градиент) |
| `#DCE6FB` | `#E2D6C8` | `.cta p` |
| `#E4ECFA` | `#E5DACD` | `.section--navy .check-list li`, `.lightbox__caption .title` |
| `#eef3fb` | `#F7F1E8` | декоративная сетка (repeating-linear-gradient, около строки 887) |
| `#e6edf8` | `#EFE3D3` | декоративная сетка (repeating-linear-gradient, около строки 887) |

Применить построчно через `Edit`-инструмент (каждая замена — отдельный вызов с `replace_all: true`, так как некоторые hex встречаются по 2-4 раза в разных селекторах и все вхождения нужно заменить одинаково). Пример для первой строки таблицы:

- old_string: `#7E93BA`
- new_string: `#B0987F`
- replace_all: true

Повторить для каждой строки таблицы (16 замен; `#CFE0FF`→`#E2D6C8`, `#D8E4FA`→`#E2D6C8` и `#DCE6FB`→`#E2D6C8` — три отдельных `Edit`-вызова с одинаковым `new_string`, т.к. `old_string` у них разный).

- [ ] **Step 2: Проверить, что старых hex не осталось**

```bash
grep -inE "#7E93BA|#8FA6CC|#94ABD4|#A9BBDD|#A9BEE2|#B7C6E4|#C3D2EC|#C7D6F0|#CBD8F2|#CFE0FF|#D8E4FA|#DBE9FF|#DCE6FB|#E4ECFA|#eef3fb|#e6edf8" css/styles.css
```

Ожидается: пустой вывод (ничего не найдено).

- [ ] **Step 3: Синхронизировать**

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".claude/build.ps1"
```

- [ ] **Step 4: Проверить, что во всех HTML тоже чисто**

```bash
grep -lE "#7E93BA|#8FA6CC|#94ABD4|#A9BBDD|#A9BEE2|#B7C6E4|#C3D2EC|#C7D6F0|#CBD8F2|#CFE0FF|#D8E4FA|#DBE9FF|#DCE6FB|#E4ECFA|#eef3fb|#e6edf8" *.html
```

Ожидается: пустой вывод.

- [ ] **Step 5: Визуальная проверка в браузере**

```
preview_start({name: "site"}) → navigate → http://localhost:5602/index.html
```

```js
function checkCold(){
  const cold = /rgb\(\s*(1[5-9]\d|2[0-3]\d),\s*(1[8-9]\d|2[0-3]\d),\s*(2[3-4]\d|25[0-5])\s*\)/;
  const found = [];
  document.querySelectorAll('*').forEach(e=>{
    const cs = getComputedStyle(e);
    ['color','backgroundColor','borderColor'].forEach(p=>{
      if (cold.test(cs[p])) found.push({tag:e.tagName, cls:e.className, prop:p, v:cs[p]});
    });
  });
  return found;
}
JSON.stringify(checkCold());
```

Ожидается пустой массив `[]` (или значения, не относящиеся к синим тонам — если что-то найдётся, проверить вручную, т.к. regex грубый и может ловить случайные совпадения).

- [ ] **Step 6: Commit**

```bash
git add css/styles.css index.html proekty.html kontakty.html o-kompanii.html 404.html remont-bez-otklyucheniya-vody.html stoimost-vrezki-pod-davleniem.html diagnostika-truboprovodov.html stati.html uslugi.html
git commit -m "Replace remaining cool-toned hex colors with warm equivalents"
```

---

## Итоговая проверка этапа 1

- [ ] Открыть `index.html`, `uslugi.html`, `o-kompanii.html` в браузере через `preview_start({name: "site"})`, визуально пробежаться сверху вниз — кнопки янтарные, заголовки заметно крупнее, правая панель героя — тёмная карточка с тремя цифрами (последняя жёлтая), нигде нет синеватых оттенков текста на тёмном фоне.
- [ ] `git log --oneline -5` — 5 новых коммитов с этого плана поверх коммита спека.
