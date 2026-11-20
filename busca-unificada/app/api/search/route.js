import { harvestAtom } from "../../../lib/atom";
import { loadTainacan } from "../../../lib/tainacan";

const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export async function GET(req) {
  const q = new URL(req.url).searchParams.get("q") || "";
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const status = { fundos: "ok", objetos: "ok" };
  let items = [];

  const [atom, tain] = await Promise.allSettled([harvestAtom(), loadTainacan(q)]);
  if (atom.status === "fulfilled") items.push(...atom.value);
  else status.fundos = "erro";
  if (tain.status === "fulfilled") {
    items.push(...tain.value.items);
    if (!tain.value.live) status.objetos = "exemplo";
  } else status.objetos = "erro";

  const haystack = (it) =>
    norm([it.title, it.description, it.creator, ...it.subjects, ...it.meta].join(" "));
  items = items
    .filter((it) => terms.every((t) => haystack(it).includes(t)))
    .map((it) => ({ it, score: terms.filter((t) => norm(it.title).includes(t)).length }))
    .sort((a, b) => b.score - a.score || a.it.title.localeCompare(b.it.title, "pt"))
    .map((x) => x.it);

  return Response.json({ items, status });
}
