const BASE = process.env.TAINACAN_URL;

// Objetos de exemplo, usados enquanto o Tainacan não está conectado.
const SAMPLE = [
  ["Estetoscópio de madeira", "Instrumento médico de auscuta, madeira torneada. Objeto de exemplo."],
  ["Microscópio de latão", "Microscópio óptico monocular, latão e vidro. Objeto de exemplo."],
  ["Caixa de instrumentos cirúrgicos", "Estojo com bisturis e pinças. Objeto de exemplo."],
  ["Modelo anatômico didático", "Modelo em gesso usado em aulas de anatomia. Objeto de exemplo."],
].map(([title, description], i) => ({
  id: `exemplo-${i}`,
  type: "objeto",
  title: `[Exemplo] ${title}`,
  description,
  meta: [],
  subjects: [],
  creator: "",
  url: "",
  image: null,
}));

const strip = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export async function loadTainacan(q) {
  if (!BASE) return { items: SAMPLE, live: false };
  const url = `${BASE.replace(/\/$/, "")}/wp-json/tainacan/v2/items?perpage=50&search=${encodeURIComponent(q || "")}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Tainacan respondeu ${res.status}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.items || [];
  const items = list.map((it) => ({
    id: `tainacan-${it.id}`,
    type: "objeto",
    title: strip(it.title) || "(sem título)",
    description: strip(it.description),
    meta: [],
    subjects: [],
    creator: "",
    url: it.url || it.link || "",
    image: it.thumbnail?.["tainacan-medium"]?.[0] || it.thumbnail?.medium?.[0] || null,
  }));
  return { items, live: true };
}
