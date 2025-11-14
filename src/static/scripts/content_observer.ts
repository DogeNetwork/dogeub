let cur: HTMLIFrameElement | null = null;
let curClick: ((this: Document, ev: MouseEvent) => any) | null = null;

export function unbind(): void {
  if (cur && curClick) {
    try {
      cur.contentWindow?.document.removeEventListener('click', curClick);
    } catch {}
  }

  cur = null;
  curClick = null;
}

export function bind(): void {
  const f = Array.from(document.querySelectorAll('iframe')).find(
    (f): f is HTMLIFrameElement => getComputedStyle(f).display === 'block',
  );
  if (!f || f === cur) return;

  unbind();
  cur = f;

  curClick = () => {
    let m = document.getElementById('menu-btn');
    let d = document.getElementById('menu-popover');
    if (m.getAttribute('aria-expanded') == 'true') {
      m.setAttribute('aria-expanded', 'false');
      d.setAttribute('aria-hidden', 'true');
    }
    // dot dot dot
  };

  const tryBind = () => {
    try {
      const d = cur?.contentWindow?.document;
      if (d) {
        d.addEventListener('click', curClick!);
      } else {
        requestAnimationFrame(tryBind);
      }
    } catch {
      requestAnimationFrame(tryBind);
    }
  };

  requestAnimationFrame(tryBind);
}

export function init(): void {
  new MutationObserver(() => bind()).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });

  bind();
}
