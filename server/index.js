import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do CORS para permitir requisições do seu frontend
app.use(cors({
    origin: ['https://standarium-erp-frontend.vercel.app', 'http://127.0.0.1:5500'],
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

// Endpoint para uma única requisição (descrição do produto)
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

// NOVO ENDPOINT PARA CONVERSA COM HISTÓRICO
app.post('/api/generate-chat', async (req, res) => {
    const { history } = req.body;

    if (!history || history.length === 0) {
        return res.status(400).json({ error: 'Histórico da conversa é obrigatório.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const chat = model.startChat({ history: history.slice(0, -1) });
        const lastUserMessage = history[history.length - 1].parts[0].text;
        const result = await chat.sendMessage(lastUserMessage);
        const response = await result.response;
        const text = response.text();
        res.json({ text });
    } catch (error) {
        console.error("Erro ao gerar chat com a Gemini API:", error);
        res.status(500).json({ error: 'Erro interno do servidor ao gerar chat.' });
    }
});

app.listen(port, () => {
    console.log(`Backend rodando em http://localhost:${port}`);
    console.log(`Chave da API Gemini carregada? ${!!geminiApiKey}`);
});
