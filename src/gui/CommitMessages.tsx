import { execSync } from 'child_process';
import type { OpenAIApi } from 'openai';
import React, {useState, useEffect} from 'react';

import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import SelectInput from 'ink-select-input';

interface CommitMessageProps {
  prompt: string;
  openai: OpenAIApi;
}

interface SelectItemProps {
  label: string;
  isSelected?: boolean;
}

const SelectionIndicator = ({ isSelected }: SelectItemProps) => (
  <Box marginRight={1}>
    {isSelected
      ? <Text color="greenBright">&gt;</Text>
      : <Text> </Text>
    }
  </Box>
);

const SelectionItem = ({ label, isSelected }: SelectItemProps) => (
  <Box>
    <Text color={isSelected ? 'greenBright' : ''}>{label}</Text>
  </Box>
);

const CommitMessages = (props: CommitMessageProps) => {
  const { prompt, openai } = props;
  const [commitMessages, setCommitMessages] = useState<string[]>([]);

  const generateCommitMessages = async () => {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      n: 5,
    });

    const commitMessages = completion.data.choices.map(
      (choice) => choice.text?.replace(/(^[\s"]+|[\s"]+$|[\r]+|[\n]+)/g, '') || ''
    )

    setCommitMessages(commitMessages);
  }

  useEffect(() => {
    generateCommitMessages();
  }, []);

  if (commitMessages.length === 0) {
    return (
      <Box flexDirection="column">
        <Spinner type="dots" />
        <Text color="greenBright">Generating commit messages...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="greenBright">Select a commit message:</Text>
      <Box height={1} />
      <SelectInput
        items={commitMessages.map((commitMessage) => ({ label: commitMessage, value: commitMessage }))}
        onSelect={(item) => {
          execSync(`git commit -m "${item.value}"`);
          process.exit(0);
        }}
        indicatorComponent={SelectionIndicator}
        itemComponent={SelectionItem}
      />
    </Box>
  );
}

export default CommitMessages;
