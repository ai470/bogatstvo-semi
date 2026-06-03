
    (function () {
      var WIDGET_BASE = 'https://fincontour.ru/pl/lite/widget/widget?id=1613589';
      var WIDGET_UNIQ = '92d40fc09c2f8651bd216cb34f111e295abfe0d4';

      // Shared URL helper — forwards page-level tracking (utm_* + ref) into the
      // widget src exactly like the native GetCourse script does: names are
      // lowercased and the widget's own service id is never overwritten.
      function withTracking(baseSrc) {
        var src;
        try { src = new URL(baseSrc, window.location.href); }
        catch (err) { return baseSrc; }
        new URLSearchParams(window.location.search).forEach(function (value, rawKey) {
          var key = rawKey.toLowerCase();
          if (key === 'id') return;
          if (key === 'ref' || key.indexOf('utm_') === 0) src.searchParams.set(key, value);
        });
        return src.toString();
      }

      var overlay  = document.getElementById('prereg');
      var host     = document.getElementById('prereg-body');
      var closeBtn = document.getElementById('prereg-close');
      if (!overlay || !host || !closeBtn) return;

      // Preload the iframe on first load so the CTA opens an already-ready widget.
      var iframe = document.createElement('iframe');
      iframe.className = 'prereg__iframe';
      iframe.title = 'Лист предзаписи';
      iframe.setAttribute('allowfullscreen', 'allowfullscreen');
      iframe.src = withTracking(WIDGET_BASE);
      host.appendChild(iframe);

      // GetCourse posts { uniqName, height, ... } with the real content height —
      // size the iframe to it so there is no huge white tail below the form.
      window.addEventListener('message', function (e) {
        var data = e.data;
        if (!data || data.uniqName !== WIDGET_UNIQ) return;
        var h = parseInt(data.height, 10);
        if (h > 0) iframe.style.height = h + 'px';
      });

      var lastFocus = null, scrollLocked = false, htmlOv = '', bodyOv = '';
      function lockScroll() {
        if (scrollLocked) return;
        htmlOv = document.documentElement.style.overflow;
        bodyOv = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        scrollLocked = true;
      }
      function unlockScroll() {
        if (!scrollLocked) return;
        document.documentElement.style.overflow = htmlOv;
        document.body.style.overflow = bodyOv;
        scrollLocked = false;
      }
      function openWidget() {
        lastFocus = document.activeElement;
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        lockScroll();
        host.scrollTop = 0;
        closeBtn.focus();
      }
      function closeWidget() {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        unlockScroll();
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
      }

      Array.prototype.forEach.call(document.querySelectorAll('[data-prereg-open]'), function (el) {
        el.addEventListener('click', function (ev) { ev.preventDefault(); openWidget(); });
      });
      closeBtn.addEventListener('click', closeWidget);
      document.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.key === 'Esc') && overlay.classList.contains('is-open')) closeWidget();
      });
    })();
  