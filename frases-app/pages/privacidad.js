import Head from "next/head";

export default function Privacidad() {
  return (
    <>
      <Head>
        <title>Política de Privacidad — A las 3am</title>
      </Head>
      <main style={{minHeight:"100vh",background:"#080808",padding:"3rem 1rem",color:"#555",fontFamily:"Georgia,serif"}}>
        <div style={{maxWidth:"680px",margin:"0 auto"}}>
          <h1 style={{color:"#e8e0d0",fontWeight:400,marginBottom:"2rem"}}>Política de Privacidad</h1>
          <p style={{marginBottom:"1.5rem"}}>A las 3am es una página de contenido emocional generado por inteligencia artificial. No recopilamos datos personales de nuestros visitantes.</p>
          <p style={{marginBottom:"1.5rem"}}>Esta aplicación no solicita, almacena ni procesa información personal identificable. No usamos cookies de rastreo.</p>
          <p style={{marginBottom:"1.5rem"}}>Las frases publicadas son generadas automáticamente por IA y no representan opiniones personales ni consejos profesionales.</p>
          <p>Contacto: <a href="mailto:brayanalonsomv@gmail.com" style={{color:"#777"}}>brayanalonsomv@gmail.com</a></p>
        </div>
      </main>
    </>
  );
}
