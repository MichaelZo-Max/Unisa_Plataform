
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

        console.log('Modelos disponibles para tu cuenta:');
        data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${m.name.replace('models/', '')}`);
            }
        });
    } catch (error) {
        console.error('Error al conectar:', error.message);
    }
}

listModels();
