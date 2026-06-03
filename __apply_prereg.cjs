/* One-shot codemod: replace S11 tariff cards with a pre-registration CTA +
   GetCourse full-frame widget (preload, UTM forwarding, height sync).
   Preserves CRLF / UTF-8 (no BOM). Asserts every anchor so nothing is silently missed. */
const fs = require('fs');

function apply(file, edits) {
  let s = fs.readFileSync(file, 'utf8');
  edits.forEach((e, i) => {
    const before = s;
    if (e.re) {
      const m = s.match(e.re);
      if (!m) throw new Error(`[${file}] edit #${i} (${e.name}) — pattern not found`);
      s = s.replace(e.re, e.to);
    } else {
      const count = s.split(e.from).length - 1;
      if (count !== 1) throw new Error(`[${file}] edit #${i} (${e.name}) — anchor count ${count}, expected 1`);
      s = s.split(e.from).join(e.to);
    }
    if (s === before) throw new Error(`[${file}] edit #${i} (${e.name}) — produced no change`);
  });
  return s;
}

/* ───────────────────────── index.html ───────────────────────── */
const BTN =
  '    <button type="button" class="s11__prereg-btn" data-prereg-open>Записаться в лист предзаписи</button>';

const OVERLAY = [
  '',
  '  <!-- ===== Pre-registration full-frame widget (GetCourse) ===== -->',
  '  <div class="prereg" id="prereg" role="dialog" aria-modal="true" aria-label="Лист предзаписи" aria-hidden="true">',
  '    <button type="button" class="prereg__close" id="prereg-close" aria-label="Закрыть">',
  '      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 5 19 19 M19 5 5 19"/></svg>',
  '    </button>',
  '    <div class="prereg__body" id="prereg-body"><!-- GetCourse iframe is preloaded here --></div>',
  '  </div>',
  '',
  '  <!-- Pre-registration widget: preload + UTM forwarding + full-frame open + height sync -->',
  '  <script>',
  '    (function () {',
  "      var WIDGET_BASE = 'https://fincontour.ru/pl/lite/widget/widget?id=1613589';",
  "      var WIDGET_UNIQ = '92d40fc09c2f8651bd216cb34f111e295abfe0d4';",
  '',
  '      // Shared URL helper — forwards page-level tracking (utm_* + ref) into the',
  '      // widget src exactly like the native GetCourse script does: names are',
  "      // lowercased and the widget's own service id is never overwritten.",
  '      function withTracking(baseSrc) {',
  '        var src;',
  '        try { src = new URL(baseSrc, window.location.href); }',
  '        catch (err) { return baseSrc; }',
  '        new URLSearchParams(window.location.search).forEach(function (value, rawKey) {',
  '          var key = rawKey.toLowerCase();',
  "          if (key === 'id') return;",
  "          if (key === 'ref' || key.indexOf('utm_') === 0) src.searchParams.set(key, value);",
  '        });',
  '        return src.toString();',
  '      }',
  '',
  "      var overlay  = document.getElementById('prereg');",
  "      var host     = document.getElementById('prereg-body');",
  "      var closeBtn = document.getElementById('prereg-close');",
  '      if (!overlay || !host || !closeBtn) return;',
  '',
  '      // Preload the iframe on first load so the CTA opens an already-ready widget.',
  "      var iframe = document.createElement('iframe');",
  "      iframe.className = 'prereg__iframe';",
  "      iframe.title = 'Лист предзаписи';",
  "      iframe.setAttribute('allowfullscreen', 'allowfullscreen');",
  '      iframe.src = withTracking(WIDGET_BASE);',
  '      host.appendChild(iframe);',
  '',
  '      // GetCourse posts { uniqName, height, ... } with the real content height —',
  '      // size the iframe to it so there is no huge white tail below the form.',
  "      window.addEventListener('message', function (e) {",
  '        var data = e.data;',
  '        if (!data || data.uniqName !== WIDGET_UNIQ) return;',
  '        var h = parseInt(data.height, 10);',
  "        if (h > 0) iframe.style.height = h + 'px';",
  '      });',
  '',
  "      var lastFocus = null, scrollLocked = false, htmlOv = '', bodyOv = '';",
  '      function lockScroll() {',
  '        if (scrollLocked) return;',
  '        htmlOv = document.documentElement.style.overflow;',
  '        bodyOv = document.body.style.overflow;',
  "        document.documentElement.style.overflow = 'hidden';",
  "        document.body.style.overflow = 'hidden';",
  '        scrollLocked = true;',
  '      }',
  '      function unlockScroll() {',
  '        if (!scrollLocked) return;',
  '        document.documentElement.style.overflow = htmlOv;',
  '        document.body.style.overflow = bodyOv;',
  '        scrollLocked = false;',
  '      }',
  '      function openWidget() {',
  '        lastFocus = document.activeElement;',
  "        overlay.classList.add('is-open');",
  "        overlay.setAttribute('aria-hidden', 'false');",
  '        lockScroll();',
  '        host.scrollTop = 0;',
  '        closeBtn.focus();',
  '      }',
  '      function closeWidget() {',
  "        overlay.classList.remove('is-open');",
  "        overlay.setAttribute('aria-hidden', 'true');",
  '        unlockScroll();',
  "        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();",
  '      }',
  '',
  "      Array.prototype.forEach.call(document.querySelectorAll('[data-prereg-open]'), function (el) {",
  "        el.addEventListener('click', function (ev) { ev.preventDefault(); openWidget(); });",
  '      });',
  "      closeBtn.addEventListener('click', closeWidget);",
  "      document.addEventListener('keydown', function (e) {",
  "        if ((e.key === 'Escape' || e.key === 'Esc') && overlay.classList.contains('is-open')) closeWidget();",
  '      });',
  '    })();',
  '  </script>',
  '',
  '</body>'
].join('\r\n');

let html = apply('index.html', [
  {
    name: 's11 sub text',
    re: /<p class="s11__sub">[\s\S]*?<\/p>/,
    to: '<p class="s11__sub">В данный момент продажа билетов еще не началась, но вы можете оставить заявку и попасть в лист предзаписи по кнопке ниже ⬇️</p>'
  },
  {
    name: 'remove tariff cards, insert CTA',
    re: /[ \t]*<!-- Mobile-only tariff cards[\s\S]*?(?=\r?\n[ \t]*<\/section>)/,
    to: BTN
  },
  {
    name: 'S11_H const',
    from: '    const S11_H  = 1150;',
    to: '    const S11_H  = 680;'
  },
  {
    name: 'reveal selector array',
    from: "'.s11__price', '.s11__btn',",
    to: "'.s11__price', '.s11__btn', '.s11__prereg-btn',"
  },
  {
    name: 'overlay + script before </body>',
    from: '\r\n</body>',
    to: '\r\n' + OVERLAY
  }
]);

// Sanity checks on the result (markup only — class names still linger in the
// reveal-selectors array, which is harmless dead reference)
if (/class="m-s11-card/.test(html)) throw new Error('index.html: mobile tariff card markup still present');
if (/class="s11__card/.test(html)) throw new Error('index.html: desktop tariff card markup still present');
if (/<div class="s11__btn /.test(html)) throw new Error('index.html: tariff buttons still present');
if (!/s11__prereg-btn" data-prereg-open/.test(html)) throw new Error('index.html: CTA button missing');
if (!/id="prereg"/.test(html)) throw new Error('index.html: overlay missing');
fs.writeFileSync('index.html', html, 'utf8');

/* ───────────────────────── styles.css ───────────────────────── */
const DESKTOP_BTN = [
  '',
  '    /* ── Pre-registration CTA (replaces tariff cards) ── */',
  '    .s11__prereg-btn {',
  '      position: absolute; left: 480px; top: 430px;',
  '      width: 640px; height: 118px; box-sizing: border-box;',
  '      padding: 0 48px;',
  '      display: flex; align-items: center; justify-content: center; text-align: center;',
  "      font-family: 'Manrope', sans-serif; font-weight: 700;",
  '      font-size: 30px; line-height: 1.15; letter-spacing: 0.5px; text-transform: uppercase;',
  '      color: #fff;',
  '      background: linear-gradient(157deg,#172545,#2e416b,#172646);',
  '      border: 1.5px solid rgba(255,255,255,0.9);',
  '      border-radius: 999px;',
  '      box-shadow: 0 18px 48px rgba(23,37,69,0.32);',
  '      cursor: pointer;',
  '    }'
].join('\r\n');

const MOBILE_BTN = [
  '',
  '    .s11__prereg-btn {',
  '      width: 100%; max-width: 360px; min-height: 64px;',
  '      margin: 26px auto 0; box-sizing: border-box;',
  '      padding: 14px 24px;',
  '      display: flex; align-items: center; justify-content: center; text-align: center;',
  "      font-family: 'Manrope', sans-serif; font-weight: 700;",
  '      font-size: 15px; line-height: 1.25; letter-spacing: 0.3px; text-transform: uppercase;',
  '      color: #fff;',
  '      background: linear-gradient(157deg,#172545,#2e416b,#172646);',
  '      border: 1px solid rgba(255,255,255,0.5);',
  '      border-radius: 999px;',
  '      box-shadow: 0 12px 28px rgba(23,37,69,0.28);',
  '      cursor: pointer;',
  '    }'
].join('\r\n');

const OVERLAY_CSS = [
  '',
  '',
  '  /* ═══════════════════════════════════════════════════════════════════',
  '     Pre-registration full-frame widget (GetCourse) — overlay layer',
  '  ═══════════════════════════════════════════════════════════════════ */',
  '  .prereg {',
  '    position: fixed; inset: 0; z-index: 100000;',
  '    background: #fff;',
  '    opacity: 0; visibility: hidden; pointer-events: none;',
  '    transition: opacity var(--motion-medium) var(--motion-ease),',
  '                visibility var(--motion-medium) var(--motion-ease);',
  '  }',
  '  .prereg.is-open { opacity: 1; visibility: visible; pointer-events: auto; }',
  '',
  '  /* Scrollable layer — no max-width, no padding, no radius, no shadow */',
  '  .prereg__body {',
  '    position: absolute; inset: 0;',
  '    overflow-y: auto; -webkit-overflow-scrolling: touch;',
  '    background: #fff;',
  '  }',
  '  .prereg__iframe {',
  '    display: block; width: 100%; height: 100vh;',
  '    margin: 0; border: 0; background: #fff;',
  '  }',
  '',
  '  /* Fixed, noticeable close cross — top right */',
  '  .prereg__close {',
  '    position: fixed; top: 18px; right: 18px; z-index: 100001;',
  '    width: 52px; height: 52px; padding: 0;',
  '    display: flex; align-items: center; justify-content: center;',
  '    border-radius: 999px;',
  '    background: linear-gradient(157deg,#172545,#2e416b,#172646);',
  '    border: 1px solid rgba(255,255,255,0.85);',
  '    box-shadow: 0 8px 24px rgba(13,18,33,0.32);',
  '    cursor: pointer;',
  '    transition: scale var(--motion-hover) var(--motion-ease),',
  '                translate var(--motion-hover) var(--motion-ease);',
  '  }',
  '  .prereg__close svg {',
  '    width: 22px; height: 22px;',
  '    fill: none; stroke: #fff; stroke-width: 2.4; stroke-linecap: round;',
  '  }',
  '  .prereg__close:active { scale: 0.95; }',
  '  .prereg__close:focus-visible { outline: 2px solid rgba(255,226,172,0.9); outline-offset: 3px; }',
  '  @media (hover: hover) and (pointer: fine) {',
  '    .prereg__close:hover { scale: 1.06; translate: 0 -1px; }',
  '  }'
].join('\r\n');

let css = apply('styles.css', [
  {
    name: 's11 height 1150->680',
    from: '.s11 { position: absolute; width: 1600px; height: 1150px; background: white; overflow: hidden; transform-origin: top left; }',
    to: '.s11 { position: absolute; width: 1600px; height: 680px; background: white; overflow: hidden; transform-origin: top left; }'
  },
  {
    name: 's11__sub reposition (desktop)',
    from: ".s11__sub { position: absolute; left: 484px; top: 260px; width: 632px; text-align: center;",
    to: ".s11__sub { position: absolute; left: 400px; top: 268px; width: 800px; text-align: center;"
  },
  {
    name: 'desktop CTA button',
    from: '    .s11__btn--outline-4 { left: 1224px; top: 873px; background: transparent; border: 1px solid #ffe2ac; color: #ffe2ac; }',
    to:   '    .s11__btn--outline-4 { left: 1224px; top: 873px; background: transparent; border: 1px solid #ffe2ac; color: #ffe2ac; }' + DESKTOP_BTN
  },
  {
    name: 'mobile CTA button',
    from: "      width: 100% !important; font-size: 13px !important;\r\n      text-align: center; margin-bottom: 0; color: rgba(0,0,0,0.7);\r\n    }",
    to:   "      width: 100% !important; font-size: 13px !important;\r\n      text-align: center; margin-bottom: 0; color: rgba(0,0,0,0.7);\r\n    }" + MOBILE_BTN
  },
  {
    name: 'transition list',
    from: '  .s11__btn:not(.reveal),',
    to:   '  .s11__btn:not(.reveal),\r\n  .s11__prereg-btn:not(.reveal),'
  },
  {
    name: 'hover list',
    from: '    .s11__btn:hover,',
    to:   '    .s11__btn:hover,\r\n    .s11__prereg-btn:hover,'
  },
  {
    name: 'active list',
    from: '    .s11__btn:active,',
    to:   '    .s11__btn:active,\r\n    .s11__prereg-btn:active,'
  },
  {
    name: 'focus-visible list',
    from: '  .s11__btn:focus-visible,',
    to:   '  .s11__btn:focus-visible,\r\n  .s11__prereg-btn:focus-visible,'
  }
]);

css += OVERLAY_CSS;
fs.writeFileSync('styles.css', css, 'utf8');

console.log('OK: index.html and styles.css updated.');
