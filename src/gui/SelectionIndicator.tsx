import React from 'react';
import { Box, Text } from 'ink';

import type { SelectItemProps } from './SelectionItem';

const SelectionItem = ({ label, isSelected }: SelectItemProps) => (
  <Box>
    <Text color={isSelected ? 'greenBright' : ''}>{label}</Text>
  </Box>
);

export type { SelectItemProps };
export default SelectionItem;
