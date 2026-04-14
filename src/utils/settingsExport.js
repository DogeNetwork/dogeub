const NAME = 'dogeub-settings.json';
const dataUrl = (o) => URL.createObjectURL(new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' }));

export const exportSettings = (options = JSON.parse(localStorage.getItem('options') || '{}')) => {
  const url = dataUrl(options);
  const a = document.createElement('a');
  a.href = url;
  a.download = NAME;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url));
};

export const importSettings = () => {
  const i = document.createElement('input');
  i.type = 'file';
  i.accept = '.json,application/json';
  i.onchange = () => {
    const f = i.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(r.result);
        const s = o?.options && typeof o.options === 'object' ? o.options : o;
        if (!s || typeof s !== 'object' || Array.isArray(s)) return;
        localStorage.setItem('options', JSON.stringify(s));
        location.reload();
      } catch {}
    };
    r.readAsText(f);
  };
  i.click();
};