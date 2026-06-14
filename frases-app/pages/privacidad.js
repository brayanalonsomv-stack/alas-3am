import Head from "next/head";
import styles from "../styles/Privacy.module.css";

export default function Privacidad() {
  return (
    <>
      <Head>
        <title>Política de Privacidad — A las 3am</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1>Política de Privacidad</h1>
          <p className={styles.fecha}>Última actualización: junio 2026</p>

          <section>
            <h2>1. Información general</h2>
            <p>A las 3am es una página de contenido emocional generado por inteligencia artificial. No recopilamos datos personales de nuestros visitantes.</p>
          </section>

          <section>
            <h2>2. Datos que no recopilamos</h2>
            <p>Esta aplicación no solicita, almacena ni procesa información personal identificable de los usuarios. No usamos cookies de rastreo ni herramientas de análisis de comportamiento.</p>
          </section>

          <section>
            <h2>3. Contenido generado por IA</h2>
            <p>Las frases publicadas en esta plataforma son generadas automáticamente por inteligencia artificial. No representan opiniones personales ni consejos profesionales.</p>
          </section>

          <section>
            <h2>4. Facebook</h2>
            <p>Esta app utiliza la API de Facebook para publicar contenido en la página "A las 3 am". No accedemos a datos de usuarios de Facebook ni almacenamos información de terceros.</p>
          </section>

          <section>
            <h2>5. Eliminación de datos</h2>
            <p>Si deseas solicitar la eliminación de cualquier dato relacionado con esta app, puedes contactarnos en: <a href="mailto:brayanalonsomv@gmail.com">brayanalonsomv@gmail.com</a></p>
          </section>

          <section>
            <h2>6. Contacto</h2>
            <p>Para cualquier consulta sobre esta política, escríbenos a: <a href="mailto:brayanalonsomv@gmail.com">brayanalonsomv@gmail.com</a></p>
          </section>
        </div>
      </main>
    </>
  );
}
