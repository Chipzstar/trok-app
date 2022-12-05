import React, { useCallback, useEffect, useMemo } from 'react';
import { filterByTimeRange } from '../utils/functions';
import dayjs from 'dayjs';
import { Line } from 'react-chartjs-2';
import { GBP } from '@trok-app/shared-utils';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isBetween from 'dayjs/plugin/isBetween';
import { DateRangePickerValue } from '@mantine/dates';
import { trpc } from '../utils/clients';
import useWindowSize from '../hooks/useWindowSize';

dayjs.extend(advancedFormat);
dayjs.extend(isBetween);
interface TransactionChartProps {
	dateRange: DateRangePickerValue;
	height: number;
}

const TransactionsChart = ({dateRange, height} : TransactionChartProps) => {
	const { height: HEIGHT } = useWindowSize();
	const transactions = trpc.getApprovedTransactions.useQuery();
	const generateLabels = useCallback((range: DateRangePickerValue) => {
		let startDate = dayjs(range[0])
		let numDays = dayjs(range[1]).diff(dayjs(range[0]), "days") + 1
		console.log(numDays)
		const labels = new Array(numDays).fill(0).map((item, index) => startDate.clone().add(index, "d").format("Do MMM"))
		const values = new Array(numDays).fill(0).map((item, index) => startDate.clone().add(index, "d").unix())
		return { labels, values }
	}, []);

	const generateDataPoints = useCallback((timestamps) => {
		const filteredTransactions = filterByTimeRange(transactions?.data ?? [], dateRange);
		return timestamps.map(timestamp => {
			const startOfDay = dayjs.unix(timestamp).startOf('day')
			const endOfDay = dayjs.unix(timestamp).endOf('day')
			return filteredTransactions
				.filter(t => dayjs(t.created_at).isBetween(startOfDay, endOfDay, 'h'))
				.reduce((prev, curr) => prev + curr.transaction_amount, 0);
		})
	}, [transactions.data, dateRange]);

	const { labels, data } = useMemo(() => {
		let { values, labels } = generateLabels(dateRange);
		let data = generateDataPoints(values);
		return {
			labels,
			data
		}
	}, [transactions.data, dateRange]);

	useEffect(() => {
		console.log("child:", HEIGHT)
	}, [HEIGHT]);

	return (
		<div style={{height: HEIGHT - 350}}>
			<Line
				options={{
					plugins: {
						datalabels: {
							formatter: (value, context) => GBP(value).format(),
							anchor: 'end',
							align: 'top',
							clamp: true
						},
						legend: {
							display: false
						}
					},
					scales: {
						x: {
							grid: {
								display: false
							},
							title: {
								display: true,
								font: {
									weight: '600'
								},
								text: 'Days'
							}
						},
						y: {
							grid: {
								display: false
							},
							title: {
								display: true,
								text: 'Amount Spent',
								font: {
									weight: '600'
								}
							},
							ticks: {
								callback: function(value, index, ticks) {
									return value > 100 ? `£${Number(value) / 100}` : `£${value}`;
								}
							}
						}
					},
					layout: {
						padding: {
							top: 25
						}
					},
					maintainAspectRatio: false,
					responsive: true,
					color: '#3646F5'
				}}
				data={{
					datasets: [
						{
							data,
							backgroundColor: ['rgba(54, 70, 245, 0.2)'],
							borderColor: '#3646F5',
							borderWidth: 1
						}
					],
					labels,
				}}
			/>
		</div>
	);
};

export default TransactionsChart;
