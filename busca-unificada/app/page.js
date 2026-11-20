"use client";
import { useEffect, useState } from "react";

const TIPOS = [
  ["todos", "Tudo"],
  ["objeto", "Objetos"],
  ["fundo", "Fundos documentais"],
];
const ROTULO = { objeto: "Objeto", fundo: "Fundo documental" };

export default function Home() {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        setData(await r.json());
      } catch {
        setData({ items: [], status: { fundos: "erro", objetos: "erro" } });
      }
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const items = data?.items || [];
  const count = (t) => items.filter((i) => t === "todos" || i.type === t).length;
  const shown = items.filter((i) => tipo === "todos" || i.type === tipo);
  const st = data?.status || {};

  return (
    <main>
      <header>
        <h1>Acervo do Museu Histórico da FMUSP</h1>
        <p>Objetos e documentos do museu, numa busca só.</p>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque por assunto, pessoa, objeto ou código"
          aria-label="Buscar no acervo"
          autoFocus
        />
      </header>

      <nav aria-label="Filtrar por tipo">
        {TIPOS.map(([k, label]) => (
          <button key={k} aria-pressed={tipo === k} onClick={() => setTipo(k)}>
            {label} <span>{count(k)}</span>
          </button>
        ))}
      </nav>

      {st.fundos === "erro" && (
        <p className="aviso">Não foi possível consultar os fundos documentais agora.</p>
      )}
      {st.objetos === "erro" && (
        <p className="aviso">Não foi possível consultar os objetos agora.</p>
      )}
      {st.objetos === "exemplo" && (
        <p className="aviso">Os objetos mostrados são de exemplo: o Tainacan ainda não está conectado.</p>
      )}

      <ol className={loading ? "lista carregando" : "lista"}>
        {shown.map((it) => (
          <li key={it.id} className={it.type}>
            {it.image && <img src={it.image} alt="" />}
            <div>
              <p className="tipo">{ROTULO[it.type]}</p>
              <h2>
                {it.url ? (
                  <a href={it.url} target="_blank" rel="noopener noreferrer">{it.title}</a>
                ) : (
                  it.title
                )}
              </h2>
              {it.description && <p className="desc">{it.description}</p>}
              {(it.meta.length > 0 || it.creator) && (
                <p className="meta">{[...it.meta, it.creator].filter(Boolean).join(" · ")}</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {!loading && shown.length === 0 && (
        <p className="vazio">Nada encontrado. Tente uma palavra mais geral ou outra grafia.</p>
      )}
    </main>
  );
}
