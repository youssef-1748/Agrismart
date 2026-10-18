"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { calculateWaterNeeds, IrrigationRecommendation } from '../lib/agronomy';
import ChatAssistant from '../components/ChatAssistant';
import jsPDF from 'jspdf';

const MapComponent = dynamic(() => import('../components/MapComponent'), { 
  ssr: false,
  loading: () => <p className="text-center p-4">Chargement de la carte interactive...</p>
});

export default function Home() {
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<IrrigationRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [cropType, setCropType] = useState<'cereales' | 'maraichage' | 'arboriculture'>('cereales');

  const handleSelectLocation = async (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setLoading(true);

    try {
      // Appel de l'API Open-Meteo (Gratuite, sans clé)
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation&soil_temperature_0cm=true&soil_moisture_0_to_1cm=true`
      );
      const data = await res.json();
      setWeatherData(data.current);

      // Simulation du taux d'humidité du sol basé sur l'API ou estimation par défaut
      const soilMoistureVal = data.current.soil_moisture_0_to_1cm !== undefined 
        ? data.current.soil_moisture_0_to_1cm * 100 
        : 35;

      // Calcul agronomique (normes FAO)
      const rec = calculateWaterNeeds({
        soilMoisture: soilMoistureVal,
        temperature: data.current.temperature_2m,
        cropType: cropType
      });

      setRecommendation(rec);
    } catch (error) {
      console.error("Erreur lors de la récupération météo :", error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!selectedCoords || !weatherData || !recommendation) return;

    const doc = new jsPDF();

    // En-tête du document
    doc.setFillColor(34, 139, 34); // Vert
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("AgriSmart Maroc - Rapport de Parcelle", 14, 20);

    // Corps du rapport
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    let y = 45;

    doc.text(`Type de culture : ${cropType}`, 14, y);
    y += 10;
    doc.text(`Coordonnées GPS : Lat ${selectedCoords.lat.toFixed(4)} | Lng ${selectedCoords.lng.toFixed(4)}`, 14, y);
    y += 15;

    doc.setFontSize(14);
    doc.text("Données Météo et Sol en direct :", 14, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`- Température de l'air : ${weatherData.temperature_2m} °C`, 20, y);
    y += 8;
    doc.text(`- Humidité de l'air : ${weatherData.relative_humidity_2m} %`, 20, y);
    y += 8;
    doc.text(`- Humidité du sol : ${(weatherData.soil_moisture_0_to_1cm * 100).toFixed(1)} %`, 20, y);
    y += 15;

    doc.setFontSize(14);
    doc.text("Recommandation d'irrigation :", 14, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Statut : ${recommendation.status}`, 20, y);
    y += 8;
    doc.text(`Conseil : ${recommendation.messageFr}`, 20, y);
    y += 8;
    doc.text(`Volume d'eau conseillé : ${recommendation.waterNeededMm} mm`, 20, y);

    // Pied de page
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Généré par AgriSmart Maroc - Version Turbo MVP", 14, 280);

    // Téléchargement du fichier
    doc.save("AgriSmart-Rapport-Parcelle.pdf");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 relative">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-800">🌾 AgriSmart Maroc</h1>
            <p className="text-gray-600">Plateforme intelligente d'optimisation de l'irrigation et suivi des parcelles</p>
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-semibold border border-green-200">
            Version Turbo (MVP)
          </div>
        </div>

        {/* Sélection du type de culture */}
        <div className="bg-white p-4 rounded-xl shadow-md flex items-center space-x-4">
          <label className="font-semibold text-gray-700">Type de culture :</label>
          <select 
            value={cropType} 
            onChange={(e) => setCropType(e.target.value as any)}
            className="border border-gray-300 rounded-lg p-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="cereales">Céréales (Blé, Orge...)</option>
            <option value="maraichage">Maraîchage (Tomates, Légumes...)</option>
            <option value="arboriculture">Arboriculture (Oliviers, Arbres fruitiers...)</option>
          </select>
        </div>

        {/* Section Carte */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📍 Cliquez sur votre parcelle sur la carte</h2>
          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-inner">
            <MapComponent onSelectLocation={handleSelectLocation} />
          </div>

          {selectedCoords && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-900">
              <p className="font-medium">Coordonnées : Lat {selectedCoords.lat.toFixed(4)} | Lng {selectedCoords.lng.toFixed(4)}</p>
              {loading && <p className="text-sm text-green-700 mt-2">⏳ Récupération des données météo et sol en direct...</p>}
            </div>
          )}
        </div>

        {/* Résultats Météo & Recommandations */}
        {weatherData && recommendation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🌤️ Météo & Sol en direct</h3>
              <ul className="space-y-2 text-gray-600">
                <li>🌡️ Température de l'air : <strong className="text-gray-800">{weatherData.temperature_2m} °C</strong></li>
                <li>💧 Humidité de l'air : <strong className="text-gray-800">{weatherData.relative_humidity_2m} %</strong></li>
                <li>🌱 Humidité du sol : <strong className="text-gray-800">{(weatherData.soil_moisture_0_to_1cm * 100).toFixed(1)} %</strong></li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Recommandation d'irrigation</h3>
                <div className={`p-3 rounded-lg border font-semibold mb-3 ${
                  recommendation.status === 'GREEN' ? 'bg-green-100 text-green-800 border-green-300' :
                  recommendation.status === 'ORANGE' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                  'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {recommendation.status === 'GREEN' && '🟢 État Optimal'}
                  {recommendation.status === 'ORANGE' && '🟠 Attention - Irrigation conseillée'}
                  {recommendation.status === 'RED' && '🔴 Stress Critique - Sqi daba !'}
                </div>
                <p className="text-gray-700 text-sm mb-1">🇫🇷 {recommendation.messageFr}</p>
                <p className="text-gray-700 text-sm italic">🇲🇦 {recommendation.messageDarija}</p>
              </div>

              <div className="mt-4 space-y-2">
                <div className="pt-2 border-t text-sm font-medium text-green-700">
                  💧 Volume conseillé : {recommendation.waterNeededMm} mm d'eau
                </div>
                <button
                  onClick={exportPDF}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
                >
                  📥 Télécharger le Rapport PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <div className="absolute top-4 right-4 z-50 flex gap-3">
  <a 
    href="/login" 
    className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
  >
    Connexion
  </a>
  <a 
    href="/signup" 
    className="bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-800 transition"
  >
    Inscription
  </a>
</div>
      {/* Assistant Chatbot Flottant */}
      <ChatAssistant />
    </main>
  );
}