import React from 'react';
import { Group, Loader, Paper, Text } from '@mantine/core';
import { IconArrowDownRight, IconArrowUpRight, IconCash, IconCreditCard, IconTruck, IconUserPlus } from '@tabler/icons';
import { GBP } from '@trok-app/shared-utils';

export const icons = {
	user: IconUserPlus,
	card: IconCreditCard,
	cardholder: IconTruck,
	cash: IconCash,
};

export interface StatsGridProps {
	title: string;
	icon: keyof typeof icons;
	value: number;
	diff: number;
	loading: boolean;
	diff_interval?: string;
	is_currency?: boolean;
}

const Stat = ({title, diff, value, icon, loading, is_currency=false, diff_interval="month"} : StatsGridProps) => {
	const Icon = icons[icon];
	const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight;
	return (
		<Paper withBorder p="md" radius="md">
			<Group position="apart">
				<Text size="sm" color="dimmed" className="uppercase font-bold">
					{title}
				</Text>
				<Icon color="gray" size={22} stroke={1.5} />
			</Group>

			<Group align="center" spacing="xs" mt={10}>
				{loading ? <Loader size="sm"/> : <Text size="xl" className="font-bold">{is_currency ? GBP(value).format() : value}</Text>}
				{!isNaN(diff) && <Text
					color={diff > 0 ? 'teal' : 'red'}
					size="sm"
					weight={500}
					className="flex items-center"
				>
					<span>{diff.toFixed(1)}%</span>
					<DiffIcon size={16} stroke={1.5} />
				</Text>}
			</Group>
			<Text size="xs" color="dimmed" mt={7}>
				{`Compared to previous ${diff_interval}`}
			</Text>
		</Paper>
	);
};

export default Stat;
