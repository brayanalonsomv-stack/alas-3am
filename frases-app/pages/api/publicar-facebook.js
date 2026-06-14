import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import FormData from "form-data";

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
- Máximo 12 palabras
- Sin emojis
- Estilo íntimo, como si lo escribiera una persona real
- Solo devuelve la frase, sin comillas ni explicaciones`;
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [{ role: "user", content: prompt }],
  });
  return message.content[0].text.trim();
}

async function generarImagen(frase) {
  const bgPath = path.join(process.cwd(), "public", "fondo.jpg");
  const outPath = "/tmp/post.jpg";
  const script = `
import sys
sys.stdout.reconfigure(encoding='utf-8')
from PIL import Image, ImageDraw, ImageFont
import textwrap

img = Image.open("${bgPath}")
w, h = img.size
side = min(w, h)
img = img.crop(((w-side)//2, (h-side)//2, (w+side)//2, (h+side)//2))
img = img.resize((1080, 1080))

from PIL import ImageEnhance
img = ImageEnhance.Brightness(img).enhance(0.7)

draw = ImageDraw.Draw(img)

try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 52)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 18)
except:
    font = ImageFont.load_default()
    font_small = font

from PIL import Image as PILImage
overlay = PILImage.new("RGBA", (1080, 1080), (0,0,0,0))
od = ImageDraw.Draw(overlay)
for y in range(300, 780):
    t = 1 - abs(y - 540) / 240
    t = max(0, min(1, t))
    od.line([(0,y),(1080,y)], fill=(0,0,5,int(160*t)))
img = PILImage.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
draw = ImageDraw.Draw(img)

frase = """${frase.replace(/"/g, '\\"').replace(/\n/g, ' ')}"""
lines = textwrap.wrap(frase, width=22)
line_h = 65
total_h = len(lines) * line_h
start_y = 540 - total_h // 2

gold = (210, 190, 130)
draw.line([(290, start_y-45),(790, start_y-45)], fill=gold, width=1)

for i, line in enumerate(lines):
    y = start_y + i * line_h
    bbox = draw.textbbox((0,0), line, font=font)
    x = (1080 - (bbox[2]-bbox[0])) // 2
    draw.text((x+2, y+2), line, fill=(0,0,0), font=font)
    draw.text((x, y), line, fill=(240,232,215), font=font)

end_y = start_y + len(lines)*line_h + 10
draw.line([(290, end_y+15),(790, end_y+15)], fill=gold, width=1)

bbox = draw.textbbox((0,0), "A  L A S  3  A M", font=font_small)
x = (1080 - (bbox[2]-bbox[0])) // 2
draw.text((x, end_y+35), "A  L A S  3  A M", fill=(255,255,255,60), font=font_small)

img.save("${outPath}", quality=95)
print("ok")
`;

  execSync(`python3 -c '${script}'`, { timeout: 30000 });
  return fs.readFileSync(outPath);
}

async function publicarEnFacebook(imageBuffer, frase) {
  const form = new FormData();
  form.append("source", imageBuffer, { filename: "post.jpg", contentType: "image/jpeg" });
  form.append("caption", frase);
  form.append("access_token", PAGE_TOKEN);

  const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/photos`, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
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
    const resultado = await publicarEnFacebook(imagen, frase);
    if (resultado.error) {
      return res.status(500).json({ error: resultado.error.message });
    }
    return res.status(200).json({ ok: true, frase, post_id: resultado.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
