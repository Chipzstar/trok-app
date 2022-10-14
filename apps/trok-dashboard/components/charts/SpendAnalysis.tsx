import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarController, BarElement, BarOptions } from 'chart.js';
import dayjs from 'dayjs';
import useWindowSize from '../../hooks/useWindowSize';

Chart.register(BarController, BarElement, CategoryScale, LinearScale);

const labels = [0, 1, 2, 3, 4, 5, 6].reverse().map(val => dayjs().subtract(val, 'd').format("MMM D"))

const SpendAnalysis = () => {
	const { height } = useWindowSize()
	return (
		<div style={{
			height: height - 440
		}}>
			<Bar
				options={{
					plugins: {
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
								stepSize: 20,
								callback: function(value, index, ticks) {
									return '£' + value;
								}
							}
						}
					},
					maintainAspectRatio: false,
					responsive: true,
					color: '#3646F5'
				}}
				data={{
					datasets: [
						{
							data: Array(7).fill(0).map(val => Math.floor(Math.random() * (100 - 5 + 1) + 5)),
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
