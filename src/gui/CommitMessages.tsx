import { execSync } from 'child_process';

import type { OpenAIApi } from 'openai';
import React, { useState, useEffect } from 'react';
import type { Item } from 'ink-select-input/build/SelectInput';
import { Box, Newline, Text } from 'ink';
import Spinner from 'ink-spinner';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';

import SelectionItem from './SelectionIndicator';
import SelectionIndicator from './SelectionIndicator';

interface CommitMessageProps {
  prompt: string;
  openai: OpenAIApi;
}

const CommitMessages = (props: CommitMessageProps) => {
  const { prompt, openai } = props;
  const [commitMessages, setCommitMessages] = useState<string[]>([]);
  const [selectedCommitMessage, setSelectedCommitMessage] = useState<string>('');

  const generateCommitMessages = async () => {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      n: 5,
    });

    const commitMessages = completion.data.choices.map(
      (choice) => choice.text?.replace(/(^[\s"]+|[\s"]+$|[\r]+|[\n]+)/g, '') || ''
    )

    return commitMessages;
  }

  const onSelect = (item: Item<string>) => {
    if (item.value === 'generate') {
      generateCommitMessages().then((commitMessages) => {
        setCommitMessages(commitMessages);
      });

      return;
    }

    setSelectedCommitMessage(item.value);
  }

  useEffect(() => {
    generateCommitMessages().then((commitMessages) => {
      setCommitMessages(commitMessages);
    });
  }, []);

  if (commitMessages.length === 0) {
    return (
      <Text color="greenBright">
        <Spinner type="dots" />
        <Text>
          {' '}
          Generating commit messages...
        </Text>
      </Text>
    );
  }

  if (selectedCommitMessage) {
    return (
      <Box flexDirection="column">
        <Text color="greenBright">Edit commit message: </Text>
        <Newline />
        <Box height={1} />
        <TextInput
          value={commitMessages[0]}
          onChange={(value) => {
            setCommitMessages([value]);
          }}
          onSubmit={(value) => {
            execSync(`git commit -m "${value}"`);
            process.exit(0);
          }}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="greenBright">Select a commit message:</Text>
      <Box height={1} />
      <SelectInput
        items={
          [
            ...commitMessages.map(
              (commitMessage, index) => ({
                label: commitMessage,
                value: commitMessage,
                key: `${commitMessage}-${index}`
              })
            ),
            {
              label: 'Generate more commit messages',
              value: 'generate',
              key: 'generate-more'
            }
          ]
        }
        onSelect={onSelect}
        indicatorComponent={SelectionIndicator}
        itemComponent={SelectionItem}
      />
    </Box>
  );
}

export default CommitMessages;
