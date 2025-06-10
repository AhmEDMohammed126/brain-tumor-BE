import { Router } from "express";
import multer from "multer";
import { transcribeAudio, textToSpeech } from "./speechUtils.js";
import { chat } from "./GeminiChat.controller.js";
import { auth } from "../../Middlewares/index.js";

const upload = multer({ dest: "uploads/" });
const GeminiChatRouter = Router();

// Text chat
GeminiChatRouter.post("/chat", auth(), chat);

// Voice chat
GeminiChatRouter.post(
  "/chat/audio",
  auth(),
  upload.single("audio"),
  async (req, res) => {
    try {
      const userId = req.authUser._id;
      const audioPath = req.file.path;

      // 1. Transcribe audio to text
      const userText = await transcribeAudio(audioPath);

      // 2. Prepare request for Gemini chat
      req.body.message = userText;
      req.authUser._id = userId;

      // 3. Capture Gemini chat reply
      let replyText = '';
      const fakeRes = {
        json: (data) => {
          replyText = data.response;
          return data;
        },
        status: () => ({
          json: (err) => {
            throw new Error(err.error || "Chat error");
          }
        }),
      };

      await chat(req, fakeRes);

      // 4. Convert reply to audio
      const audioUrl = await textToSpeech(replyText);

      // 5. Send response
      res.json({
        transcript: userText,
        reply: replyText,
        audio_url: audioUrl,
      });
    } catch (err) {
      console.error("Audio Chat Error:", err);
      res.status(500).json({ error: "Failed to handle audio chat." });
    }
  }
);

export { GeminiChatRouter };