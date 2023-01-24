import React from 'react';
import { Group, GroupPosition, MantineNumberSize, Pagination, Text } from '@mantine/core';

interface CustomPaginationProps {
	page: number;
	onChange: (value: number) => void;
	numPages: number;
	total: number;
	start?: number;
	end?: number;
	position?: GroupPosition;
	spacing?: MantineNumberSize;
}

const CustomPagination = ({page, onChange, start=1, end=5, numPages, total, position="center", spacing=50} : CustomPaginationProps) => {
	return (
		<div className='py-5 space-y-4'>
			<Pagination
				page={page}
				onChange={onChange}
				total={numPages}
				position={position}
				spacing={spacing}
				styles={theme => ({
					item: {
						'&[data-active]': {
							backgroundColor: "white",
							border: '1px solid lightgray',
							color: "black"
						}
					}
				})}
			/>
			<Group position="center">
				<Text size="sm">Showing {start} - {end} of {total} </Text>
			</Group>
		</div>
	);
};

export default CustomPagination;
