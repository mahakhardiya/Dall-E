import express from 'express';
import fetch from 'node-fetch';
import * as dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(`<html><body><pre>${text}</pre></body></html>`);
    }

    if (contentType.includes('application/json')) {
      const result = await response.json();
      res.status(200).json(result);
    } else if (contentType.includes('application/octet-stream') || contentType.includes('image/')) {
      // Handle binary data or image data
      const imageBuffer = await response.buffer();
      const imageBase64 = imageBuffer.toString('base64');
      res.status(200).json({ photo: `data:image/png;base64,${imageBase64}` });
    } else {
      res.status(500).json({ error: 'Unexpected response format' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Something went wrong!' });
  }
});

export default router;
// import express from "express";
// import * as dotenv from "dotenv";
// import { OpenAI } from 'openai';

// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const router = express.Router();

// router.route("/").post(async (req, res) => {
//   try {
//     const { prompt } = req.body;

//     // Ensure correct method usage based on SDK documentation
//     const response = await openai.images.generate({
//       prompt: prompt,
//       n: 1,
//       size: "1024x1024",
//       response_format: "url",  // or "b64_json" based on your preference
//     });

//     const image_url = response.data[0].url;

//     res.status(200).json({ photo: image_url });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: error.message || "Something went wrong!" });
//   }
// });

// export default router;

