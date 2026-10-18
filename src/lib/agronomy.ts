export interface ParcelData {
  soilMoisture: number;
  temperature: number;
  cropType: 'cereales' | 'maraichage' | 'arboriculture';
}

export interface IrrigationRecommendation {
  status: 'GREEN' | 'ORANGE' | 'RED';
  messageFr: string;
  messageDarija: string;
  waterNeededMm: number;
}

export function calculateWaterNeeds(data: ParcelData): IrrigationRecommendation {
  let thresholdOptimal = 40;
  let thresholdWarning = 25;

  if (data.cropType === 'maraichage') {
    thresholdOptimal = 50;
    thresholdWarning = 30;
  } else if (data.cropType === 'arboriculture') {
    thresholdOptimal = 45;
    thresholdWarning = 28;
  }

  if (data.soilMoisture >= thresholdOptimal) {
    return {
      status: 'GREEN',
      messageFr: 'Humidité optimale. Pas d\'irrigation nécessaire.',
      messageDarija: 'Lmoḍoɛ mzyan. Ma kayn la haja nsqiw lyoum.',
      waterNeededMm: 0,
    };
  } else if (data.soilMoisture >= thresholdWarning) {
    return {
      status: 'ORANGE',
      messageFr: 'Attention, irrigation conseillée dans les 48 heures.',
      messageDarija: 'Rdd lbal, khasses tsqi f l-wqt 9rib.',
      waterNeededMm: 15,
    };
  } else {
    return {
      status: 'RED',
      messageFr: 'Stress hydrique critique ! Irrigation immédiate requise.',
      messageDarija: 'Khatar! Lard nashafat bzaf, sqi daba.',
      waterNeededMm: 30,
    };
  }
}