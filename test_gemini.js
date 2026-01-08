
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    try {
        console.log("Testeando conexión con gemini-flash-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const response = await model.generateContent("Hola, responde con la palabra 'FUNCIONA' si recibes este mensaje.");
        console.log("Respuesta de la IA:", response.response.text());
    } catch (e) {
        console.error("Error en la prueba:", e.message);
    }
}

test();
