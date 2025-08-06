import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); 

const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
    origin: ['http://127.0.0.1:5500', 'https://vercel.com/canevojs-projects/standarium-erp-frontend/6Ps8DMMuYyWZyJUV1KL4CJogX3UW'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(express.json());


const geminiApiKey = process.env.GEMINI_API_KEY;


if (!geminiApiKey) {
    console.error("Erro: A variável de ambiente GEMINI_API_KEY não está configurada.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

app.post('/api/generate-text', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt é obrigatório.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ text });
    } catch (error) {
        console.error("Erro ao gerar conteúdo com a Gemini API:", error);
        res.status(500).json({ error: 'Erro interno do servidor ao gerar conteúdo.' });
    }
});

app.listen(port, () => {
    console.log(`Backend rodando em http://localhost:${port}`);
    console.log(`Chave da API Gemini carregada? ${!!geminiApiKey}`);
});
