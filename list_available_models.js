
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('Error de API:', data.error.message);
            return;
        }

        const flashModels = data.models
            .filter(m => m.supportedGenerationMethods.includes('generateContent') && m.name.toLowerCase().includes('flash'))
            .map(m => m.name.replace('models/', ''));
        console.log(flashModels.join(', '));
    } catch (error) {
        console.error('Error al conectar:', error.message);
    }
}

listModels();
