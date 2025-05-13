import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';

export const predict = async (req, res) => {
    try {
        const formData = new FormData();
        formData.append("image", fs.createReadStream(req.file.path));

        const response = await fetch("https://354b-104-199-157-214.ngrok-free.app/predict", {
            method: "POST",
            body: formData,
            headers: formData.getHeaders()
        });

        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Prediction failed.', detail: error.message });
    }
};
