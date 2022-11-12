import axios from 'axios';
import type { AppRouter } from '../../trok-backend/src/app/routes';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();

export const companyHouseClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_COMPANIES_HOUSE_BASE_URL,
	auth: {
		username: process.env.NEXT_PUBLIC_COMPANIES_HOUSE_API_KEY,
		password: null
	}
})

companyHouseClient.interceptors.response.use(function (response) {
	// Any status code that lie within the range of 2xx cause this function to trigger
	// Do something with response data
	return response;
}, function (error) {
	// Any status codes that falls outside the range of 2xx cause this function to trigger
	// Do something with response error
	return Promise.reject(error.response.data);
});

export const apiClient = axios.create()
apiClient.interceptors.response.use(function (response) {
	// Any status code that lie within the range of 2xx cause this function to trigger
	// Do something with response data
	return response;
}, function (error) {
	// Any status codes that falls outside the range of 2xx cause this function to trigger
	// Do something with response error
	return Promise.reject(error.response.data);
});
