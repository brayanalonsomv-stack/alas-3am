import Anthropic from "@anthropic-ai/sdk";
import { v2 as cloudinary } from "cloudinary";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function generarFrase() {
  const categorias = ["desamor", "reflexion", "motivacional", "fe"];
  const cat = categorias[Math.floor(Math.random() * categorias.length)];
  const prompt = `Genera UNA sola frase emocional en español para publicar en Facebook.
Tema: ${cat}.
Reglas:
- Auténtica, directa, como algo que diría una persona real en redes sociales
- Máximo 12 palabras
- Sin emojis
- Nada poética ni literaria, como un pensamiento que se te viene a la cabeza a las 3am
- Estilo conversacional, crudo, honesto
- Ejemplos del estilo correcto: "Imagínate romperle el corazón a alguien que le pedía a Dios que te amara bien", "Hay personas que se van y te dejan con preguntas que nunca vas a poder hacerles"
- Solo devuelve la frase, sin comillas ni explicaciones`;
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [{ role: "user", content: prompt }],
  });
  return message.content[0].text.trim();
}

function generarImagenUrl(frase) {
  const fraseEncoded = encodeURIComponent(frase);
  const url = cloudinary.url("noche_de_estrellas_r6gy6o", {
    transformation: [
      { width: 1080, height: 1080, crop: "fill", gravity: "center" },
      { effect: "brightness:-20" },
      {
        overlay: {
          font_family: "Georgia",
          font_size: 52,
          font_weight: "bold",
          text_align: "center",
          text: fraseEncoded,
        },
        color: "#F0E8D7",
        width: 820,
        crop: "fit",
        gravity: "center",
        y: 0,
      },
      {
        overlay: {
          font_family: "Georgia",
          font_size: 18,
          text: "A  L A S  3  A M",
          letter_spacing: 6,
        },
        color: "#ffffff",
        opacity: 25,
        gravity: "center",
        y: 200,
      },
    ],
    format: "jpg",
    quality: 95,
  });
  return url;
}

async function publicarEnFacebook(imageUrl, frase) {
  const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: imageUrl,
      caption: frase,
      access_token: PAGE_TOKEN,
    }),
  });
  return await res.json();
}

export default async function handler(req, res) {
  const { secret } = req.query;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "No autorizado" });
  }
  try {
    const frase = await generarFrase();
    const imageUrl = generarImagenUrl(frase);
    const resultado = await publicarEnFacebook(imageUrl, frase);
    if (resultado.error) {
      return res.status(500).json({ error: resultado.error.message, url: imageUrl });
    }
    return res.status(200).json({ ok: true, frase, post_id: resultado.id, url: imageUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
