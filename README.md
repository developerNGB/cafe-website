# The Green Cup Café — website

A four-page static café website built with **HTML, CSS and vanilla JavaScript**
only. No build step, no framework, no backend, no dependencies to install.

> **Everything about the café itself is placeholder content.** The name, logo,
> contact details, opening hours, menu items, prices and copy come from the
> supplied asset board (`cafe_website_images.zip`) and the project brief. See
> [Replace before publishing](#replace-before-publishing) before this goes live.

---

## What is in the box

```
cafe-website/
├── index.html        Home — hero, welcome, popular items, values, CTA
├── about.html        About — story, values, the room, quote, CTA
├── menu.html         Menu — daily board, category filters, 4 categories, photos
├── contact.html      Contact — validated form, details, hours, social, map
├── css/
│   └── style.css     Design system: tokens, components, responsive, motion
├── js/
│   └── script.js     Nav, sticky header, scroll reveal, filters, form validation
├── images/           45 image assets (42 supplied + 3 derived logo files)
└── README.md
```

**Stack:** HTML5, CSS3, vanilla JavaScript. Google Fonts (Fraunces + Karla) is
the only external request, and the site degrades to system fonts without it.

---

## Run it locally

Any static file server works. From this folder:

```bash
# Python 3
python -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

Opening `index.html` straight from disk (`file://`) also works for browsing, but
a local server is recommended so relative paths and fonts behave exactly as they
will in production.

---

## Deploy

The site is plain static files — deploy the **contents of `cafe-website/`** as
the publish directory.

| Host | Publish directory | Notes |
|------|-------------------|-------|
| **GitHub Pages** | `/` (root) | Push the folder to a repo, enable Pages on the branch |
| **Netlify** | `cafe-website/` | Drag the folder in, or connect the repo |
| **Cloudflare Pages** | `cafe-website/` | Build command: *none*; output dir as above |
| **Any shared host / SFTP** | upload everything | No server-side code required |

**Post-deploy checks:** open all four pages on the live URL, confirm the CSS and
images load, click every nav link, and submit the contact form once to confirm
the message it shows matches how the form is configured.

---

## Connect the contact form

**The form does not send email yet.** HTML and JavaScript on their own cannot
deliver a message to an inbox, so rather than fake a success message, the form
validates the visitor's input and then tells them plainly that no inbox is
connected and gives them the phone number and email address instead.

To make it actually deliver:

1. Pick a form-handling service (Formspree, Basin, Netlify Forms, a Cloudflare
   Worker, or your own API endpoint).
2. Open [`js/script.js`](js/script.js) and set the constant at the top:

   ```js
   var FORM_ENDPOINT = "https://formspree.io/f/yourFormId";
   ```

3. Redeploy.

Once `FORM_ENDPOINT` is set the form `POST`s a `FormData` body to it and shows:

- **success** — only after the endpoint returns a 2xx response,
- **error** — if the request fails, with the direct email address as a fallback.

Until then it shows an **info** status and never claims a message was delivered.

The validation itself is already complete: required fields, email format,
per-field error messages beside the field, `aria-invalid`, live re-validation
after a field is corrected, and submission blocked while a request is in flight.

---

## Replace before publishing

Everything below is placeholder content taken from the asset board. Confirm each
one with the café owner.

- [ ] **Café name** — currently "The Green Cup Café" (illustrative branding).
- [ ] **Logo** — `images/logo-cafe.jpg` is the source; `logo.png`,
      `logo-inverse.png` and `mark.png` were derived from it.
- [ ] **Phone** — `+1 (555) 123-4567` → `tel:` link in header, footer and contact.
- [ ] **Email** — `hello@thegreencup.com` → `mailto:` links and form fallback text.
- [ ] **Address** — `123 Maple Street, Riverside, CA 92507`, plus the Google Maps
      link on `contact.html`.
- [ ] **Opening hours** — Mon–Fri 7:00–17:00, Sat 8:00–16:00, Sun 8:00–14:00
      (footer and `contact.html`).
- [ ] **Menu items and prices** — every item on `menu.html` and the six cards on
      `index.html`.
- [ ] **Dietary tags** — Vegetarian / Cold / Ask us labels.
- [ ] **Social links** — currently point at `instagram.com`, `facebook.com` and
      `x.com` homepages, **not** at the café's accounts. Replace with real URLs.
- [ ] **All copy** — story, values, headings and captions. No founding date,
      awards or sourcing claims have been written, deliberately.
- [ ] **Photography** — see the note below.

### About the images

The supplied photos are **small crops from a generated asset board** (roughly
200–260 px wide, ~430 KB total). They are used at card sizes and behind dark
overlays, where they hold up, but they should be replaced with full-resolution
photography before launch. Drop replacements into `images/` using the same file
names and nothing else needs to change.

Icons in the header, footer, contact list and buttons are **inline SVG**, not the
supplied icon tiles — the tiles are JPEGs on a white background, which would
show as white boxes on the cream and dark surfaces.

---

## Design system

Colours were sampled from the swatch images in the asset board, so the site
matches the brief's "brown, cream, green" direction exactly.

| Token | Hex | Use |
|-------|-----|-----|
| `--espresso` | `#5b3b22` | Brand brown — headings, primary button |
| `--espresso-deep` | `#2f1d10` | Hero, board panel, footer |
| `--cream` | `#eee3cd` | Brand cream — alternating sections |
| `--paper` | `#fbf7ef` | Page background |
| `--sage` | `#546344` | Brand green — CTA band, accents, focus ring |
| `--sage-light` | `#8fa37c` | Accents on dark surfaces |

**Type:** Fraunces (display/headings) and Karla (body/UI), with Georgia and
system sans fallbacks.

**Signature details:** the stacked three-line slogan with its sage rule in the
hero, the cup-and-leaf mark used as a section divider, and dot-leader menu rows
modelled on a real café menu board.

All spacing, radii, shadows, type sizes and easing live in `:root` in
[css/style.css](css/style.css) — change a token to retheme the whole site.

---

## Pages and behaviour

| Page | Sections | JavaScript |
|------|----------|-----------|
| Home | Hero, welcome, 6 popular items, 3 values, CTA | reveal, sticky header |
| About | Page head, story, 3 values, gallery, quote, CTA | reveal |
| Menu | Page head, daily board, filters, 4 categories, photo grid, allergen note, CTA | filters |
| Contact | Page head, form, details, hours, social, map | validation |

- **Mobile nav** — hamburger below 820 px, opens a panel under the sticky
  header, closes on link click, outside click-free, and on `Escape` (focus
  returns to the toggle).
- **Menu filters** — buttons toggle `aria-pressed`; categories hide via the
  `hidden` attribute. With JavaScript off, the full menu renders with no
  filters, so no content is lost.
- **Scroll reveal** — IntersectionObserver, staggered per group, and fully
  disabled under `prefers-reduced-motion`.

---

## Accessibility

- Skip link, `<main id="main">`, one `aria-current="page"` in the main nav.
- Every image has `alt` (decorative brand mark uses `alt=""` since the wordmark
  sits beside it) and explicit `width`/`height` to avoid layout shift.
- Form fields have visible `<label>`s, `aria-describedby` error slots and
  `aria-invalid`; status messages use `role="status"` / `role="alert"`.
- Visible `:focus-visible` ring on every interactive element, tinted for dark
  surfaces.
- Colour contrast checked against WCAG AA: body text ≈ 8.9:1, white on green
  ≈ 6.5:1, white on espresso ≈ 10:1.
- No horizontal scrolling from 360 px up; layouts use `auto-fit`/`minmax` grids
  and `clamp()` type rather than fixed breakpoints where possible.

---

## Testing

Two scripts live at the workspace root (outside the deliverable folder):

```bash
python check_site.py   # static: structure, links, assets, IDs, ARIA, shared header/footer
python test_site.py    # headless Playwright: 77 behaviour checks
```

`test_site.py` expects the site to be served at `http://127.0.0.1:8123/cafe-website/`.

Latest run: **0 structural problems**, **84/84 behaviour checks passed** —
covering page loads, console errors, no horizontal overflow at 360/414/768/1024/
1440 px, mobile nav open/close/Escape, all four menu filters, form validation
and busy-state locking, the honest no-endpoint status message, image decoding,
font application, the skip link, reduced-motion rendering, and a no-JavaScript
pass (all four menu categories visible, filters hidden, inline navigation).

**Recommended manual pass:** Chrome, Firefox and Safari; a narrow phone, a
tablet and a desktop; keyboard-only navigation; and one submit of the form.

---

## Out of scope

As specified in the brief, this is an informational website. There is no online
ordering, payment, customer account, database or admin dashboard, and no
server-side code of any kind.
