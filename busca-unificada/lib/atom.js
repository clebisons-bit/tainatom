import { XMLParser } from "fast-xml-parser";

const BASE =
  process.env.ATOM_OAI_URL ||
  "https://textual.museudigital.fm.usp.br/index.php/;oai";

const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
const arr = (v) => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);
const txt = (v) =>
  typeof v === "object" && v !== null ? String(v["#text"] ?? "") : String(v ?? "");

// Enquanto o OAI não entrega dc:title, usamos o final do endereço como título provisório.
function humanize(url) {
  const slug = (url || "").split("/").pop() || "";
  const s = slug.replace(/-\d+$/, "").replace(/-/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function harvestAtom() {
  let url = `${BASE}?verb=ListRecords&metadataPrefix=oai_dc`;
  const out = [];
  for (let i = 0; i < 50 && url; i++) {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`AtoM OAI respondeu ${res.status}`);
    const xml = parser.parse(await res.text());
    const list = xml["OAI-PMH"]?.ListRecords;
    if (!list) break;
    for (const r of arr(list.record)) {
      const dc = r.metadata?.dc;
      if (!dc) continue;
      const ids = arr(dc.identifier).map(txt);
      const link = ids.find((s) => s.startsWith("http")) || "";
      const code = ids.find((s) => !s.startsWith("http")) || "";
      out.push({
        id: txt(r.header.identifier),
        type: "fundo",
        title: txt(arr(dc.title)[0]) || humanize(link) || code,
        description: arr(dc.description).map(txt).join(" "),
        meta: [code, ...arr(dc.date).map(txt)].filter(Boolean),
        subjects: arr(dc.subject).map(txt),
        creator: arr(dc.creator).map(txt).join("; "),
        url: link,
      });
    }
    const tok = txt(list.resumptionToken);
    url = tok
      ? `${BASE}?verb=ListRecords&resumptionToken=${encodeURIComponent(tok)}`
      : null;
  }
  return out;
}
