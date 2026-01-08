
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
        const names = data.models.map(m => m.name.replace('models/', ''));
        fs.writeFileSync('available_models.txt', names.join('\n'));
        console.log('Modelos guardados en available_models.txt');
    } else {
        console.log('No se encontraron modelos:', data);
    }
}

listModels();
