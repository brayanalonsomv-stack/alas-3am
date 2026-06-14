import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN;

async function generarFrase() {
  const categorias = ["desamor", "reflexion", "motivacional", "fe"];
  const cat = categorias[Math.floor(Math.random() * categorias.length)];

  const prompt = `Genera UNA sola frase emocional en español para publicar en Facebook. 
Tema: ${cat}.
Reglas:
- Auténtica, profunda, viral
- Entre 1 y 3 oraciones
- Sin emojis
- Estilo íntimo, como si lo escribiera una persona real desde el corazón
- Solo devuelve la frase, sin comillas ni explicaciones`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].text.trim();
}

async function publicarEnFacebook(texto) {
  const url = `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: texto,
      access_token: PAGE_TOKEN,
    }),
  });
  return await res.json();
}

export default async function handler(req, res) {
  // Verificar clave secreta para evitar llamadas no autorizadas
  const { secret } = req.query;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const frase = await generarFrase();
    const resultado = await publicarEnFacebook(frase);

    if (resultado.error) {
      return res.status(500).json({ error: resultado.error.message });
    }

    return res.status(200).json({
      ok: true,
      frase,
      post_id: resultado.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
