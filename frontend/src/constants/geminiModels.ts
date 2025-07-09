export interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
}

export const GEMINI_MODELS: GeminiModel[] = [
  {
    name: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    description: 'Razonamiento complejo en código, matemáticas y STEM. Ideal para exámenes técnicos',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedGenerationMethods: ['generateContent']
  },
  {
    name: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'Capacidades equilibradas con pensamiento adaptativo. Perfecto para grandes volúmenes',
    inputTokenLimit: 1048576,
    outputTokenLimit: 65536,
    supportedGenerationMethods: ['generateContent']
  },
  {
    name: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    description: 'Características de próxima generación. Rápido y eficiente',
    inputTokenLimit: 1048576,
    outputTokenLimit: 8192,
    supportedGenerationMethods: ['generateContent']
  }
];

export const DEFAULT_MODEL = 'gemini-2.5-flash';