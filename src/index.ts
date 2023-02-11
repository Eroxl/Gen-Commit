import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline/promises';

import { OpenAIApi, Configuration } from 'openai';

const PROMPT = `
I want you to act as a senior software developer.
I will give you a git diff and you will reply with a clear and concise git commitmessage.
The commit message will follow the standard format and should be no longer than 1 line.
`;

// -=- Ensure the API key is set -=-
const getApiKey = async () => {
  // -=- Check if secrets.json exists and contains the API key -=-

  if (!existsSync('./secrets.json')) {
    writeFileSync('./secrets.json', '{}');
  }

  const secretsFile = readFileSync('./secrets.json', 'utf8');    

  const secrets = JSON.parse(secretsFile);
  if (!secrets.OPENAI_API_KEY) {
    console.log('Please set your OpenAI API key (https://beta.openai.com/account/api-keys)');

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const apiKey = await rl.question('OpenAI API Key: ');
      
    secrets.OPENAI_API_KEY = apiKey;
    writeFileSync('./secrets.json', JSON.stringify(secrets, null, 2));
  }

  return secrets.OPENAI_API_KEY as string;
};

// -=- Create the OpenAI API client -=-
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

const formatPrompt = (diff: string, prompt: string) => `${prompt}\n\n${diff}\n\nCommit Message:`;

const diff = getDiff();
const prompt = formatPrompt(diff, PROMPT);

const completion = await openai.createCompletion({
  model: "text-davinci-003",
  prompt,
  n: 5,
});

const commitMessages = completion.data.choices.map(
  (choice) => choice.text?.replace(/(^[\s"]+|[\s"]+$|[\r]+|[\n]+)/g, '') || ''
)

console.log('Commit Messages:\n\n*', commitMessages.join('\n* '));
