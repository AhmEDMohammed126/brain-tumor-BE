import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import gTTS from 'node-gtts';
import { uploadFile } from '../../Utils/cloudinary.utils.js';

const USE_CLOUD = true;
const AUDIO_FOLDER = 'public/audio';

export async function transcribeAudio(filePath) {
  const apiKey = process.env.ASSEMBLY_AI_KEY;

  // 1. Upload audio to AssemblyAI
  const uploadUrl = await axios({
    method: 'post',
    url: 'https://api.assemblyai.com/v2/upload',
    headers: { authorization: apiKey },
    data: fs.createReadStream(filePath),
  }).then(res => res.data.upload_url);

  // 2. Request transcription
  const transcriptId = await axios({
    method: 'post',
    url: 'https://api.assemblyai.com/v2/transcript',
    headers: { authorization: apiKey },
    data: { audio_url: uploadUrl },
  }).then(res => res.data.id);

  // 3. Poll for result
  let status, text = '';
  while (true) {
    const polling = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { authorization: apiKey },
    });
    status = polling.data.status;
    if (status === 'completed') {
      text = polling.data.text;
      break;
    } else if (status === 'error') {
      throw new Error('Transcription failed');
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  return text;
}

export async function textToSpeech(text) {
  const filename = `response-${uuidv4()}.mp3`;
  const localPath = path.join(AUDIO_FOLDER, filename);

  // Ensure local directory exists
  if (!fs.existsSync(AUDIO_FOLDER)) {
    fs.mkdirSync(AUDIO_FOLDER, { recursive: true });
  }

  // Use English for TTS
  const tts = gTTS('en');
  await new Promise((resolve, reject) => {
    tts.save(localPath, text, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  if (USE_CLOUD) {
    const { secure_url } = await uploadFile({
      file: localPath,
      folder: 'brain-tumor/audio',
      resource_type: 'video', // Cloudinary treats audio as video
    });

    fs.unlinkSync(localPath); // delete local file after upload
    return secure_url;
  }

  return `/audio/${filename}`;
}