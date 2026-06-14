import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { categorias } = req.body;
  if (!categorias || !categorias.length) {
    return res.status(400).json({ error: "Selecciona al menos una categoría" });
  }

  const catStr = categorias.join(", ");

  const prompt = `Genera exactamente 3 frases emocionales en español para redes sociales. Los temas disponibles son: ${catStr}.

Reglas:
- Suenan auténticas, profundas, como algo viral que la gente comparte en Facebook o Instagram
- Entre 1 y 3 oraciones cada una
- Sin emojis
- Estilo íntimo y directo, como si lo escribiera una persona real desde el corazón
- Varía entre los temas disponibles: ${catStr}

Responde ÚNICAMENTE con JSON válido, sin backticks ni texto extra:
{"frases":[{"texto":"...","categoria":"desamor"},{"texto":"...","categoria":"reflexion"},{"texto":"...","categoria":"fe"}]}

Categorías válidas: desamor, reflexion, motivacional, fe`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(text);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generando frases" });
  }
}
