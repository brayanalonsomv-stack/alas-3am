import Anthropic from "@anthropic-ai/sdk";
import { createCanvas, loadImage } from "canvas";
import path from "path";

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
- Máximo 15 palabras
- Sin emojis
- Estilo íntimo, como si lo escribiera una persona real desde el corazón
- Solo devuelve la frase, sin comillas ni explicaciones`;
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [{ role: "user", content: prompt }],
  });
  return message.content[0].text.trim();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function generarImagen(frase) {
  const SIZE = 1080;
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");

  const bgPath = path.join(process.cwd(), "public", "fondo.jpg");
  const bg = await loadImage(bgPath);

  const { width: bw, height: bh } = bg;
  const side = Math.min(bw, bh);
  const sx = (bw - side) / 2;
  const sy = (bh - side) / 2;
  ctx.drawImage(bg, sx, sy, side, side, 0, 0, SIZE, SIZE);

  ctx.fillStyle = "rgba(0, 0, 8, 0.35)";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const grad = ctx.createLinearGradient(0, 300, 0, 780);
  grad.addColorStop(0, "rgba(0,0,5,0)");
  grad.addColorStop(0.3, "rgba(0,0,5,0.65)");
  grad.addColorStop(0.7, "rgba(0,0,5,0.65)");
  grad.addColorStop(1, "rgba(0,0,5,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 300, SIZE, 480);

  ctx.textAlign = "center";
  ctx.font = "bold 52px serif";
  const lines = wrapText(ctx, frase, 820);
  const lineH = 72;
  const totalH = lines.length * lineH;
  const startY = SIZE / 2 - totalH / 2 + 20;

  ctx.strokeStyle = "rgba(210,190,130,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(290, startY - 48);
  ctx.lineTo(790, startY - 48);
  ctx.stroke();
  ctx.fillStyle = "rgba(210,190,130,0.5)";
  ctx.beginPath();
  ctx.arc(540, startY - 48, 3, 0, Math.PI * 2);
  ctx.fill();

  lines.forEach((line, i) => {
    const y = startY + i * lineH;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillText(line, SIZE / 2 + 2, y + 2);
    ctx.fillStyle = "rgba(240,232,215,0.97)";
    ctx.fillText(line, SIZE / 2, y);
  });

  const endY = startY + lines.length * lineH + 12;

  ctx.strokeStyle = "rgba(210,190,130,0.5)";
  ctx.beginPath();
  ctx.moveTo(290, endY + 20);
  ctx.lineTo(790, endY + 20);
  ctx.stroke();
  ctx.fillStyle = "rgba(210,190,130,0.5)";
  ctx.beginPath();
  ctx.arc(540, endY + 20, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "16px serif";
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillText("A  L A S  3  A M", SIZE / 2, endY + 52);

  return canvas.toBuffer("image/jpeg", { quality: 0.95 });
}

async function publicarImagenEnFacebook(imageBuffer, frase) {
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/jpeg" });
  formData.append("source", blob, "post.jpg");
  formData.append("caption", frase);
  formData.append("access_token", PAGE_TOKEN);

  const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/photos`, {
    method: "POST",
    body: formData,
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
    const imagen = await generarImagen(frase);
    const resultado = await publicarImagenEnFacebook(imagen, frase);
    if (resultado.error) {
      return res.status(500).json({ error: resultado.error.message });
    }
    return res.status(200).json({ ok: true, frase, post_id: resultado.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
