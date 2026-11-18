(function () {
  "use strict";

  var PLACEHOLDER = "ضع تفاصيل المنتج هنا";
  var COPY_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>';
  var CHECK_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20 6 9 17l-5-5"></path></svg>';

  var toastEl = document.getElementById("toast");
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2200);
  }

  // نسخ النص: الطريقة الحديثة أولًا، ثم بديل للمتصفحات أو الفتح المباشر من الملف
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error("copy failed"));
    });
  }

  function makeCopyButton(getText, label) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--solid";
    var base = COPY_ICON + "<span>نسخ البرومبت</span>";
    btn.innerHTML = base;
    var timer;
    btn.addEventListener("click", function () {
      copyText(getText()).then(function () {
        btn.classList.add("is-done");
        btn.innerHTML = CHECK_ICON + "<span>تم النسخ</span>";
        toast("تم نسخ " + label);
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove("is-done");
          btn.innerHTML = base;
        }, 2200);
      }).catch(function () {
        toast("تعذّر النسخ، حدّد النص وانسخه يدويًا");
      });
    });
    return btn;
  }

  function wordsCount(text) {
    return text.split(/\s+/).filter(Boolean).length;
  }

  function build(box) {
    var key = box.getAttribute("data-prompt");
    var label = box.getAttribute("data-label");
    var text = (window.RUH_PROMPTS || {})[key];
    if (!text) { box.textContent = "تعذّر تحميل البرومبت."; return; }

    // الشريط العلوي: الاسم + زر النسخ
    var bar = document.createElement("div");
    bar.className = "prompt__bar";
    var name = document.createElement("div");
    name.className = "prompt__name";
    name.textContent = label;
    var meta = document.createElement("span");
    meta.className = "prompt__meta";
    meta.textContent = wordsCount(text) + " كلمة";
    name.appendChild(meta);
    bar.appendChild(name);
    bar.appendChild(makeCopyButton(function () { return text; }, label));

    // النص: كل سطر في عنصر مستقل ليأخذ اتجاهه (عربي أو إنجليزي) تلقائيًا
    var body = document.createElement("div");
    body.className = "prompt__body";
    body.id = "prompt-body-" + key;
    text.split("\n").forEach(function (line) {
      var el = document.createElement("div");
      el.className = "prompt__line";
      el.setAttribute("dir", "auto");
      if (line.trim() === "") {
        el.classList.add("prompt__line--gap");
      } else {
        el.textContent = line;
        if (line.trim() === PLACEHOLDER) el.classList.add("prompt__line--ph");
      }
      body.appendChild(el);
    });

    // الأسفل: عرض كل النص + نسخ مرة ثانية
    var foot = document.createElement("div");
    foot.className = "prompt__foot";
    var more = document.createElement("button");
    more.type = "button";
    more.className = "prompt__more";
    more.setAttribute("aria-controls", body.id);
    more.setAttribute("aria-expanded", "false");
    more.textContent = "عرض البرومبت كاملًا";
    more.addEventListener("click", function () {
      var open = box.classList.toggle("is-open");
      more.setAttribute("aria-expanded", String(open));
      more.textContent = open ? "طيّ البرومبت" : "عرض البرومبت كاملًا";
    });
    foot.appendChild(makeCopyButton(function () { return text; }, label));
    foot.appendChild(more);

    box.appendChild(bar);
    box.appendChild(body);
    box.appendChild(foot);
  }

  Array.prototype.forEach.call(document.querySelectorAll(".prompt[data-prompt]"), build);
})();
