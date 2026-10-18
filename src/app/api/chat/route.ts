import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "Erreur: Clé API Gemini manquante sur le serveur." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = "Tu es un expert agronome intelligent pour l'application AgriSmart Maroc. Tu aides les agriculteurs marocains en répondant en français et en darija de manière claire, concise et pratique sur l'irrigation, les sols et les cultures.";

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Compris ! Je suis prêt à aider les agriculteurs marocains en français et en darija.' }] },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Erreur Gemini détaillée:", error);
    return NextResponse.json({ reply: "Désolé, une erreur est survenue avec l'IA. Veuillez réessayer." }, { status: 500 });
  }
}