#! /usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline/promises';

import React from 'react';
import { OpenAIApi, Configuration } from 'openai';
import { render } from 'ink';

import CommitMessages from './gui/CommitMessages';

const PROMPT = `
I want you to act as a senior software developer.
I will give you a git diff and you will reply with a clear and concise git commit message.
The commit message will follow the standard format and should be no longer than 40 characters.
`;

// -=- Ensure the API key is set -=-
const getApiKey = async () => {
  // -=- Check if secrets.json exists and contains the API key -=-

  const secretsPath = `${__dirname}/secrets.json`;

  if (!existsSync(secretsPath)) {
    writeFileSync(secretsPath, JSON.stringify({}));
  }

  const secretsFile = readFileSync(secretsPath, 'utf8');    

  const secrets = JSON.parse(secretsFile);
  if (!secrets.OPENAI_API_KEY) {
    console.log('Please set your OpenAI API key (https://beta.openai.com/account/api-keys)');

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const apiKey = await rl.question('OpenAI API Key: ');
      
    secrets.OPENAI_API_KEY = apiKey;
    writeFileSync(secretsPath, JSON.stringify(secrets, null, 2));
  }

  return secrets.OPENAI_API_KEY as string;
};

// -=- Create the OpenAI API client -=-
(async () => {
  const apiKey = await getApiKey();
  const config = new Configuration({ apiKey });
  const openai = new OpenAIApi(config);

  const getDiff = () => {
    try {
      const diff = execSync('git diff --cached').toString();
      if (!diff) {
        console.log('No changes to commit.');
        process.exit(0);
      }
      return diff;
    } catch (e) {
      console.log('Failed to run git diff --cached');
      process.exit(1);
    }
  };

  const diff = getDiff();

  if (diff.length > (4096 * 5)) {
    console.log('The diff is too large. Please try again with fewer changes.');
    process.exit(1);
  }

  // -=- Create the completion request -=-
  render(
    <CommitMessages prePrompt={PROMPT} diff={diff} openai={openai} />
  );
})();
