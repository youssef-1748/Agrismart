import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Erreur: Clé API Groq manquante sur le serveur." }, { status: 500 });
    }

    // Appel à l'API Groq (ultra rapide et gratuite)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: "Tu es un expert agronome intelligent pour l'application AgriSmart Maroc. Tu aides les agriculteurs marocains en répondant en français et en darija de manière claire, concise et pratique sur l'irrigation, les sols et les cultures."
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Erreur de l'API Groq");
    }

    const reply = data.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Erreur Chatbot Groq:", error);
    return NextResponse.json({ reply: "Désolé, une erreur est survenue avec l'assistant. Veuillez réessayer." }, { status: 500 });
  }
}