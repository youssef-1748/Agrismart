import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const query = prompt.toLowerCase();

    let reply = "Marhaba! Je suis votre assistant AgriSmart. Posez-moi vos questions sur l'irrigation, les sols ou les cultures (ex: 'Wach nsqi lyoum?', 'eau', 'blé').";

    // Logique de réponses intelligentes par mots-clés (Français & Darija)
    if (query.includes('nsqi') || query.includes('arroser') || query.includes('eau') || query.includes('irrigation')) {
      reply = "💧 **Conseil d'irrigation :** Si l'alerte est orange ou rouge, il est conseillé d'irriguer tôt le matin (avant 8h) ou tard le soir pour éviter l'évaporation. *Rdd Ibal, khasses tsqi f l-wqt 9rib.*";
    } else if (query.includes('blé') || query.includes('golt') || query.includes('زرع') || query.includes('céréales')) {
      reply = "🌾 **Pour les céréales (Blé / Orge) :** Les besoins en eau augmentent considérablement pendant la période d'épiaison. Surveillez l'humidité de votre sol de près.";
    } else if (query.includes('sol') || query.includes('terre') || query.includes('أرض')) {
      reply = "🌍 **Gestion du sol :** Un sol argileux retient mieux l'eau qu'un sol sablonneux. Pensez à vérifier la température et l'humidité de votre parcelle via la carte interactive.";
    } else if (query.includes('salut') || query.includes('salam') || query.includes('bonjour') || query.includes('مرحبا')) {
      reply = "Salam! Kif ndar m3akom lyoum? Je suis là pour vous aider à optimiser l'eau de vos parcelles au Maroc. Comment puis-je vous aider ?";
    } else {
      reply = `Excellente question sur "${prompt}". Pour optimiser votre rendement au Maroc, surveillez les prévisions météo Open-Meteo de votre parcelle et référez-vous à l'indicateur d'alerte de l'application !`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ reply: "Désolé, une erreur est survenue. Veuillez réessayer." }, { status: 500 });
  }
}