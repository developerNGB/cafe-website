/* ==========================================================================
   The Green Cup Café — site behaviour
   Vanilla JS, no dependencies. Everything degrades gracefully without it.
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     Contact form endpoint
     ----------------------------------------------------------------------
     Set this to a real form-handling URL (Formspree, Basin, Netlify Forms,
     a Cloudflare Worker, your own API…) and the form will POST to it and
     report genuine success/failure.

     While it stays null the form only validates and then tells the visitor
     plainly that no inbox is connected yet — it never claims a message was
     delivered.
     ---------------------------------------------------------------------- */
  var FORM_ENDPOINT = null;

  /* ---------------------------------------------------------------------- */
  /* Mobile navigation                                                      */
  /* ---------------------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) setNav(false);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Sticky header treatment                                                */
  /* ---------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");

  if (header) {
    var ticking = false;
    var syncHeader = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(syncHeader);
        }
      },
      { passive: true }
    );
    syncHeader();
  }

  /* ---------------------------------------------------------------------- */
  /* Scroll reveal                                                          */
  /* ---------------------------------------------------------------------- */
  var revealItems = document.querySelectorAll(".reveal");

  if (revealItems.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );

      revealItems.forEach(function (el, index) {
        var group = el.closest("[data-reveal-group]");
        if (group) {
          var siblings = group.querySelectorAll(".reveal");
          var position = Array.prototype.indexOf.call(siblings, el);
          el.style.setProperty("--reveal-delay", position * 90 + "ms");
        } else if (index < 3) {
          el.style.setProperty("--reveal-delay", index * 70 + "ms");
        }
        observer.observe(el);
      });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Menu category filters                                                  */
  /* ---------------------------------------------------------------------- */
  var filterBar = document.querySelector(".filter-bar");
  var emptyState = document.querySelector(".empty-state");

  if (filterBar) {
    var buttons = filterBar.querySelectorAll(".filter-btn");
    var categories = document.querySelectorAll(".menu-category");

    filterBar.addEventListener("click", function (event) {
      var button = event.target.closest(".filter-btn");
      if (!button) return;

      var filter = button.dataset.filter;
      var shown = 0;

      buttons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(btn === button));
      });

      categories.forEach(function (category) {
        var match = filter === "all" || category.dataset.category === filter;
        category.hidden = !match;
        if (match) shown += 1;
      });

      if (emptyState) emptyState.classList.toggle("is-visible", shown === 0);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Contact form                                                           */
  /* ---------------------------------------------------------------------- */
  var form = document.querySelector("[data-contact-form]");

  if (form) {
    var status = form.querySelector(".form-status");
    var submit = form.querySelector("[type='submit']");
    var submitLabel = submit ? submit.querySelector("[data-label]") : null;
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = [
      {
        id: "name",
        test: function (value) {
          return value.trim().length >= 2;
        },
        message: "Enter your name so we know who we are replying to."
      },
      {
        id: "email",
        test: function (value) {
          return EMAIL.test(value.trim());
        },
        message: "Enter a valid email address, for example name@example.com."
      },
      {
        id: "subject",
        test: function (value) {
          return value.trim().length >= 3;
        },
        message: "Add a short subject so we can route your message."
      },
      {
        id: "message",
        test: function (value) {
          return value.trim().length >= 10;
        },
        message: "Write at least a sentence so we can help properly."
      }
    ];

    function fieldOf(input) {
      return input.closest(".field");
    }

    function showError(input, message) {
      var field = fieldOf(input);
      if (!field) return;
      var slot = field.querySelector(".field__error");
      field.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      if (slot) slot.textContent = message;
    }

    function clearError(input) {
      var field = fieldOf(input);
      if (!field) return;
      var slot = field.querySelector(".field__error");
      field.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      if (slot) slot.textContent = "";
    }

    function validate(slide) {
      var firstInvalid = null;

      rules.forEach(function (rule) {
        var input = document.getElementById(rule.id);
        if (!input) return;
        if (rule.test(input.value)) {
          clearError(input);
        } else {
          showError(input, rule.message);
          if (slide && !firstInvalid) firstInvalid = input;
        }
      });

      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    }

    function setStatus(kind, text) {
      if (!status) return;
      status.className = "form-status form-status--" + kind + " is-visible";
      status.setAttribute("role", kind === "error" ? "alert" : "status");
      status.innerHTML =
        '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        (kind === "success"
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
          : kind === "info"
            ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
            : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>') +
        "</svg><span></span>";
      status.querySelector("span").textContent = text;
    }

    function hideStatus() {
      if (!status) return;
      status.className = "form-status";
      status.removeAttribute("role");
    }

    function setBusy(busy) {
      if (!submit) return;
      submit.disabled = busy;
      submit.setAttribute("aria-busy", String(busy));
      if (submitLabel) submitLabel.textContent = busy ? "Sending…" : "Send message";
    }

    // Live feedback once a field has already been flagged.
    rules.forEach(function (rule) {
      var input = document.getElementById(rule.id);
      if (!input) return;
      input.addEventListener("blur", function () {
        if (fieldOf(input) && fieldOf(input).classList.contains("is-invalid")) {
          validate(false);
        }
      });
      input.addEventListener("input", function () {
        if (rule.test(input.value)) clearError(input);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideStatus();

      if (!validate(true)) {
        setStatus("error", "Check the highlighted fields and try again.");
        return;
      }

      var data = new FormData(form);

      // No handler connected yet: report that honestly instead of pretending.
      if (!FORM_ENDPOINT) {
        setBusy(true);
        window.setTimeout(function () {
          setBusy(false);
          form.reset();
          setStatus(
            "info",
            "Your details check out, but this demo is not connected to an inbox yet. " +
              "Email hello@thegreencup.com or call +1 (555) 123-4567 and we will get back to you."
          );
        }, 700);
        return;
      }

      setBusy(true);

      fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed with status " + response.status);
          form.reset();
          rules.forEach(function (rule) {
            var input = document.getElementById(rule.id);
            if (input) clearError(input);
          });
          setStatus(
            "success",
            "Thanks — your message is on its way. We usually reply within one working day."
          );
        })
        .catch(function () {
          setStatus(
            "error",
            "That message did not send. Please try again, or email hello@thegreencup.com directly."
          );
        })
        .then(function () {
          setBusy(false);
        });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Footer year                                                            */
  /* ---------------------------------------------------------------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
