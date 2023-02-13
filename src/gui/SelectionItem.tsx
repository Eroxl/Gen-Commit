import React from 'react';
import { Box, Text } from 'ink';

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

export type { SelectItemProps };
export default SelectionIndicator;
