import React, { useCallback, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarController, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';
import dayjs from 'dayjs';
import useWindowSize from '../../hooks/useWindowSize';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useLocalStorage } from '@mantine/hooks';
import { STORAGE_KEYS } from '../../utils/constants';
import { trpc } from '../../utils/clients';
import { filterByTimeRange } from '../../utils/functions';
import { DateRangePickerValue } from '@mantine/dates';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isBetween from 'dayjs/plugin/isBetween';
import { GBP } from '@trok-app/shared-utils';

dayjs.extend(advancedFormat);
dayjs.extend(isBetween);
Chart.register(BarController, BarElement, CategoryScale, LinearScale, ChartDataLabels);

const SpendAnalysis = ({sessionId, dateRange}) => {
	const transactionsQuery = trpc.getTransactions.useQuery({ userId: sessionId });
	const [testMode, setTestMode] = useLocalStorage({ key: STORAGE_KEYS.TEST_MODE, defaultValue: false });
	const { height } = useWindowSize()

	const generateLabels = useCallback((range: DateRangePickerValue) => {
		let startDate = dayjs(range[0])
		let numDays = dayjs(range[1]).diff(dayjs(range[0]), "days")
		const labels = new Array(numDays).fill(0).map((item, index) => startDate.clone().add(index, "d").format("Do MMM"))
		const values = new Array(numDays).fill(0).map((item, index) => startDate.clone().add(index, "d").unix())
		return { labels, values }
	}, []);

	const generateDataPoints = useCallback((timestamps) => {
		const filteredTransactions = filterByTimeRange(transactionsQuery?.data ?? [], dateRange);
		return timestamps.map(timestamp => {
			const startOfDay = dayjs.unix(timestamp).startOf('day')
			const endOfDay = dayjs.unix(timestamp).endOf('day')
			return filteredTransactions
				.filter(t => dayjs(t.created_at).isBetween(startOfDay, endOfDay, 'h'))
				.reduce((prev, curr) => prev + curr.transaction_amount, 0);
		})
	}, [transactionsQuery.data, dateRange]);
	
	const { labels, data } = useMemo(() => {
		let { values, labels } = generateLabels(dateRange);
		let data;
		if (testMode) {
			data = Array(7)
				.fill(0)
				.map(val => Math.floor(Math.random() * (100 - 5 + 1) + 5));
		} else {
			data = generateDataPoints(values);
		}
		return {
			labels,
            data
		}
	}, [transactionsQuery, dateRange, testMode]);
	
	return (
		<div style={{
			height: height - 485
		}}>
			<Bar
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

export default SpendAnalysis;
