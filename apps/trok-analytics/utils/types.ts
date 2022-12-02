export enum INTERVAL {
	TODAY="Today",
	LAST_3_DAYS="Last 3 Days",
	LAST_WEEK="Last Week",
	THIS_MONTH="This Month",
	LAST_MONTH="Last Month",
    THIS_YEAR="This Year",
}

const Intervals = ["Today", "Last 3 Days", "Last Week", "This Month", "Last Month", "This Year"] as const
export type TimeInterval = typeof Intervals[number]
