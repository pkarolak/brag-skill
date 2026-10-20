/** Print mode: number external links per case study and append a footnote list.
 *  Sets window.__printReady once fonts and images are loaded (export-pdf.mjs waits for it). */
export async function preparePrint() {
  document.documentElement.dataset.print = "true";

  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-print="case-study"]'));
  const scopes = sections.length ? sections : [document.body];
  for (const scope of scopes) {
    const links = Array.from(scope.querySelectorAll<HTMLAnchorElement>("a[data-href]")).filter(
      (a) => !a.closest("[data-print-footnotes]"),
    );
    if (!links.length) continue;
    const urls: string[] = [];
    for (const a of links) {
      const url = a.dataset.href!;
      let n = urls.indexOf(url) + 1;
      if (!n) n = urls.push(url);
      const sup = document.createElement("sup");
      sup.className = "print-fn";
      sup.textContent = String(n);
      a.after(sup);
    }
    const list = document.createElement("ol");
    list.dataset.printFootnotes = "";
    list.className = "print-footnotes";
    for (const u of urls) {
      const li = document.createElement("li");
      li.textContent = u;
      list.append(li);
    }
    scope.append(list);
  }

  await document.fonts?.ready;
  await Promise.all(
    Array.from(document.images)
      .filter((img) => !img.complete)
      .map((img) => {
        img.loading = "eager";
        return new Promise((r) => {
          img.onload = img.onerror = r;
        });
      }),
  );
  (window as unknown as { __printReady: boolean }).__printReady = true;
}
