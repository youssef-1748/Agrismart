import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Utilisation du modèle Gemini 1.5 Flash (rapide et gratuit)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = "Tu es un expert agronome intelligent pour l'application AgriSmart Maroc. Tu aides les agriculteurs marocains en répondant en français et en darija de manière claire, concise et pratique sur l'irrigation, les sols et les cultures.";

    const result = await model.generateContent(`${systemPrompt}\n\nQuestion de l'agriculteur: ${prompt}`);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return NextResponse.json({ reply: "Désolé, une erreur est survenue. Veuillez réessayer." }, { status: 500 });
  }
}