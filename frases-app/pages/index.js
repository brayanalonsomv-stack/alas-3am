import { useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";

const CATEGORIAS = [
  { id: "desamor", label: "💔 Desamor" },
  { id: "reflexion", label: "🌙 Reflexión" },
  { id: "motivacional", label: "⚡ Motivacional" },
  { id: "fe", label: "🙏 Fe & Dios" },
];

export default function Home() {
  const [activas, setActivas] = useState(["desamor", "reflexion", "motivacional", "fe"]);
  const [frases, setFrases] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(null);
  const [error, setError] = useState(null);

  function toggleCategoria(id) {
    setActivas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function generar() {
    if (!activas.length) return;
    setCargando(true);
    setError(null);
    setFrases([]);

    try {
      const res = await fetch("/api/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorias: activas }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFrases(data.frases);
    } catch (e) {
      setError("Error generando frases. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  function copiar(texto, idx) {
    navigator.clipboard.writeText(texto);
    setCopiado(idx);
    setTimeout(() => setCopiado(null), 2000);
  }

  return (
    <>
      <Head>
        <title>Frases del Alma</title>
        <meta name="description" content="Frases emocionales generadas por IA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>

          <header className={styles.header}>
            <h1 className={styles.title}>Frases del Alma</h1>
            <p className={styles.subtitle}>
              Palabras que tocan el corazón, generadas por inteligencia artificial
            </p>
          </header>

          <section className={styles.filtros}>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategoria(cat.id)}
                className={`${styles.catBtn} ${activas.includes(cat.id) ? styles.catActiva : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </section>

          <button
            className={styles.genBtn}
            onClick={generar}
            disabled={cargando || !activas.length}
          >
            {cargando ? (
              <span className={styles.spinner} />
            ) : (
              "✦ Generar frases"
            )}
          </button>

          {error && <p className={styles.error}>{error}</p>}

          <section className={styles.cards}>
            {cargando &&
              [0, 1, 2].map((i) => (
                <div key={i} className={`${styles.card} ${styles.cardSkeleton}`}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} style={{ width: "75%" }} />
                  <div className={styles.skeletonLine} style={{ width: "50%" }} />
                </div>
              ))}

            {!cargando &&
              frases.map((f, i) => (
                <div key={i} className={styles.card}>
                  <span className={styles.cardBadge}>
                    {CATEGORIAS.find((c) => c.id === f.categoria)?.label || f.categoria}
                  </span>
                  <p className={styles.cardTexto}>{f.texto}</p>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copiar(f.texto, i)}
                    >
                      {copiado === i ? "✓ Copiado" : "Copiar"}
                    </button>
                    <button
                      className={styles.shareBtn}
                      onClick={() =>
                        navigator.share
                          ? navigator.share({ text: f.texto })
                          : copiar(f.texto, i)
                      }
                    >
                      Compartir
                    </button>
                  </div>
                </div>
              ))}
          </section>

          <footer className={styles.footer}>
            <p>Frases generadas con IA · Comparte lo que sientes</p>
          </footer>
        </div>
      </main>
    </>
  );
}
