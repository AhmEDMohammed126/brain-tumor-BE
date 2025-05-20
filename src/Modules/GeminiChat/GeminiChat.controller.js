import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are NeuroLight AI Assistant, a highly knowledgeable and friendly expert in brain tumors.
Only introduce yourself if the user asks who you are.
If someone asks "Who are you?" or "انت مين؟", respond: 'I am NeuroLight AI Assistant, here to help you with any brain tumor related questions!'
If the user speaks Arabic, respond in Arabic. If the user speaks English, respond in English.
Stay friendly and focused only on brain tumor related topics.`;

// In-memory session storage for conversation history
// Should be replaced with persistent storage (Redis, MongoDB, etc.) for production
const sessions = {};

export const chat = async (req, res) => {
    const userId = req.authUser._id;
    const { message } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Initialize session for the user if not exists
    if (!sessions[userId]) {
        sessions[userId] = {
            history: [],
            chatInitialized: false
        };
    }

    const session = sessions[userId];
    
    try {
        let chat;
        
        // Initialize chat with system prompt only once
        if (!session.chatInitialized) {
            chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: 'System: ' + SYSTEM_PROMPT }] },
                    { role: 'model', parts: [{ text: 'I understand. I will act as NeuroLight AI Assistant.' }] }
                ]
            });
            session.chatInitialized = true;
        } else {
            // Continue with existing history
            chat = model.startChat({
                history: session.history
            });
        }
        
        // Send user message to the model
        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        // Update the conversation history with the new message and response
        session.history.push({ role: 'user', parts: [{ text: message }] });
        session.history.push({ role: 'model', parts: [{ text: reply }] });

        // Respond back to the client
        res.json({ response: reply });
        
    } catch (err) {
        console.error('Gemini API error:', err);
        res.status(500).json({ error: 'Failed to process your request' });
    }
};