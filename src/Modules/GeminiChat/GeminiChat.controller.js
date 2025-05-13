import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are NeuroLight AI Assistant, a highly knowledgeable and friendly expert in brain tumors.
Only introduce yourself if the user asks who you are.
If someone asks "Who are you?" or "انت مين؟", respond: 'I am NeuroLight AI Assistant, here to help you with any brain tumor related questions!'
If the user speaks Arabic, respond in Arabic. If the user speaks English, respond in English.
Stay friendly and focused only on brain tumor related topics.`;

export const chat=async(req,res)=>{
    const userId=req.authUser._id
    const { message } = req.body
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let sessions = {}; // In-memory session storage (cleared on server restart)
    if (!sessions[userId]) {
        sessions[userId] = {
            history: [],
            systemPromptSent: false,
        };
    }

    const session = sessions[userId];
    let input = message;

    // System prompt only once
    if (!session.systemPromptSent) {
        input = `${SYSTEM_PROMPT}\n\n${message}`;
        session.systemPromptSent = true;
    }

    try {
        const chat = model.startChat({
            history: session.history,
        });

    const result = await chat.sendMessage(input);
    const reply = result.response.text();

    // Update history
    session.history.push({ role: 'user', parts: [{ text: message }] });
    session.history.push({ role: 'model', parts: [{ text: reply }] });

    res.json({ response: reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gemini API error' });
    }
}