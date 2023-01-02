import { Group, Text } from '@mantine/core';
import React from 'react';

const DocumentInfo = ({ fileInfo }: { fileInfo: File | null }) => {
	return (
		<Group>
			<Text size='sm'>{fileInfo?.name}</Text>
			<Text size='sm' color='dimmed'>
				({fileInfo?.size / 1000} Kb)
			</Text>
		</Group>
	);
};

export default DocumentInfo;