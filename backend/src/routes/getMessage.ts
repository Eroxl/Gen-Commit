import express from 'express';
import { OpenAIApi, Configuration } from 'openai';

import prompt from '../constants/prompt';

const router = express.Router();

router.post(
  '/',
  async (req, res) => {
    const {
      "git-diff": gitDiff,
    } = req.body;

    if (!gitDiff) {
      res.statusCode = 400;
      res.json({
        status: 'error',
        message: 'Please provide a git diff!',
      });
      return;
    }
    
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: prompt.replace("{{git-diff}}", gitDiff),
    })

    res.statusCode = 200;
    res.json({
      status: 'success',
      message: response.data.choices,
    });
  },
);

export default router;
