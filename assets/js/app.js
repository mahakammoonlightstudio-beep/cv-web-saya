/* ============================================================
   Portfolio v3 - app.js
   Tema (View Transitions + fallback), 3D hero canvas, reveal,
   tilt, lightbox, progress, counter, copy email.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Tema terang/gelap dengan transisi halus ---------- */
  var root = document.documentElement;
  var KEY = "theme";

  function apply(theme) {
    root.setAttribute("data-bs-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0e0e12" : "#f7f6f2");
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: theme } }));
  }

  function setTheme(theme) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && document.startViewTransition) {
      document.startViewTransition(function () { apply(theme); });
    } else {
      root.classList.add("theme-anim");
      apply(theme);
      setTimeout(function () { root.classList.remove("theme-anim"); }, 600);
    }
  }

  function init() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    var q = new URLSearchParams(location.search).get("theme");
    var sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    apply(q === "dark" || q === "light" ? q : (saved || sys));
  }
  init();

  window.__toggleTheme = function () {
    setTheme(root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
  };

  /* ---------- Scroll progress + back to top ---------- */
  var bar = document.getElementById("progress");
  var toTop = document.getElementById("toTop");
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
    if (toTop) toTop.classList.toggle("show", h.scrollTop > 480);
  }, { passive: true });
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- Counter angka ---------- */
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      var el = en.target, end = parseInt(el.dataset.count, 10) || 0, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var k = Math.min((ts - t0) / 1200, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (el.dataset.suffix || "");
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });

  /* ---------- Tilt halus pada kartu ---------- */
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var r = null;
      card.addEventListener("mousemove", function (e) {
        if (r) return;
        r = requestAnimationFrame(function () {
          r = null;
          var b = card.getBoundingClientRect();
          var x = (e.clientX - b.left) / b.width - 0.5;
          var y = (e.clientY - b.top) / b.height - 0.5;
          card.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) +
            "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
        });
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Lightbox screenshot ---------- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    document.querySelectorAll(".shot-frame img").forEach(function (img) {
      img.addEventListener("click", function () {
        lbImg.src = img.src; lbImg.alt = img.alt;
        lb.classList.add("open");
      });
    });
    lb.addEventListener("click", function () { lb.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") lb.classList.remove("open");
    });
  }

  /* ---------- Salin email ---------- */
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = "mahakammoonlightstudio@gmail.com";
      var done = function () {
        var t = copyBtn.querySelector(".copy-label");
        var old = t.textContent;
        t.textContent = "Tersalin!";
        setTimeout(function () { t.textContent = old; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = email; document.body.appendChild(ta);
        ta.select(); document.execCommand("copy"); ta.remove(); done();
      }
    });
  }

  /* ---------- Tahun footer ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ============================================================
     3D hero - wireframe polyhedron + partikel (canvas 2D murni)
     ============================================================ */
  var canvas = document.getElementById("hero3d");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mx = 0, my = 0, tmx = 0, tmy = 0;

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    document.addEventListener("themechange", function () { /* warna dibaca tiap frame */ });

    window.addEventListener("mousemove", function (e) {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // Vertices icosahedron (discale)
    var t = (1 + Math.sqrt(5)) / 2, s = 110;
    var V = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ].map(function (v) { return [v[0] * s, v[1] * s, v[2] * s]; });

    // Edges: pasangan vertex dengan jarak terdekat (menghasilkan 30 edge)
    var E = [];
    V.forEach(function (a, i) {
      V.forEach(function (b, j) {
        if (j <= i) return;
        var d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        if (d < s * 1.2) E.push([i, j]);
      });
    });

    // Partikel latar
    var P = [];
    for (var i = 0; i < 90; i++) {
      P.push({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, r: 0.6 + Math.random() * 1.6 });
    }

    function css(name) {
      return getComputedStyle(root).getPropertyValue(name).trim() || "#2dd4bf";
    }

    var rotY = 0, rotX = 0.35;
    function frame(ts) {
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      rotY = ts * 0.00022 + mx * 0.6;
      rotX = 0.35 + my * 0.3;

      var accent = css("--accent"), dim = css("--ink-2"), line = css("--line");
      ctx.clearRect(0, 0, W, H);

      // Partikel
      P.forEach(function (p) {
        p.x += 0.00022 * p.z; if (p.x > 1.05) p.x = -0.05;
        ctx.globalAlpha = 0.16 + 0.3 * p.z;
        ctx.fillStyle = dim;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r * p.z, 0, 6.283);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Proyeksi wireframe
      var cx = W * 0.5, cy = H * 0.46, fov = 620;
      var sy = Math.sin(rotY), cyw = Math.cos(rotY);
      var sx = Math.sin(rotX), cxw = Math.cos(rotX);
      var pts = V.map(function (v) {
        var x = v[0] * cyw - v[2] * sy;
        var z = v[0] * sy + v[2] * cyw;
        var y = v[1] * cxw - z * sx;
        z = v[1] * sx + z * cxw;
        var k = fov / (fov + z);
        return { x: cx + x * k, y: cy + y * k, k: k, z: z };
      });

      E.forEach(function (e) {
        var a = pts[e[0]], b = pts[e[1]];
        var depth = (a.k + b.k) / 2;
        ctx.strokeStyle = accent;
        ctx.globalAlpha = Math.min(0.55, Math.max(0.08, depth - 0.5));
        ctx.lineWidth = 1.1 * depth;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });

      pts.forEach(function (p) {
        ctx.globalAlpha = Math.min(0.9, Math.max(0.15, p.k - 0.4));
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.1 * p.k, 0, 6.283); ctx.fill();
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
