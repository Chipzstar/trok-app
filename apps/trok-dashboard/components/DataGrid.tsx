import React from 'react';
import { Center, createStyles, Group, MantineNumberSize, Pagination, Table, Text, UnstyledButton } from '@mantine/core';
import useTable from '../hooks/useTable';
import useWindowSize from '../hooks/useWindowSize';
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons';
import { TableHeadings } from '../utils/types';
import CustomPagination from './CustomPagination';

const useStyles = createStyles(theme => ({
	th: {
		padding: '0 !important'
	},

	control: {
		width: '100%',
		padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
		}
	},

	icon: {
		width: 21,
		height: 21,
		borderRadius: 21
	}
}));

const EmptyTable = ({ content }) => {
	return <div className='flex h-full items-center justify-center py-5'>{content}</div>;
};

interface ThProps {
	children: React.ReactNode;
	reversed: boolean;
	sorted: boolean;

	onSort(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
	const { classes } = useStyles();
	const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
	return (
		<th className={classes.th}>
			<UnstyledButton onClick={onSort} className={classes.control}>
				<Group position='apart'>
					<Text color='dark' weight={500}>
						{children}
					</Text>
					<Center className={classes.icon}>
						<Icon size={14} />
					</Center>
				</Group>
			</UnstyledButton>
		</th>
	);
}

export interface DataGridProps {
	rows: JSX.Element[];
	activePage: number;
	setPage: (page: number) => void;
	headings: TableHeadings[];
	sortBy?: string;
	onSort?: (key: string) => void;
	reversed?: boolean;
	emptyContent: JSX.Element;
	spacingY?: MantineNumberSize;
	offset?: number;
	rowHeight?: number;
}

const DataGrid = ({
	rows,
	activePage,
	setPage,
	sortBy,
	reversed,
	onSort,
	headings = [],
	emptyContent,
	spacingY = 'sm',
	offset = 0,
	rowHeight = 100
}: DataGridProps) => {
	const { height: windowHeight } = useWindowSize();
	const { slice, range } = useTable(rows, activePage, windowHeight - offset, rowHeight);
	return rows?.length ? (
		<div className='flex h-full flex-col justify-between'>
			<Table
				withBorder={false}
				withColumnBorders={false}
				verticalSpacing={spacingY}
				fontSize='md'
				style={{
					borderSpacing: '0 1.25em',
					borderCollapse: 'inherit',
				}}
			>
				<thead>
					<tr>
						{headings?.map(({ key, label }, index) => {
							return key ? (
								<Th sorted={sortBy === key} reversed={reversed} onSort={() => onSort(key)}>
									{label}
								</Th>
							) : (
								<th key={index}>{label}</th>
							);
						})}
					</tr>
				</thead>
				<tbody>{slice}</tbody>
			</Table>
			<CustomPagination
				page={activePage}
				onChange={setPage}
				numRows={rows.length}
				total={range.length}
			/>
		</div>
	) : (
		<EmptyTable content={emptyContent} />
	);
};

export default DataGrid;
