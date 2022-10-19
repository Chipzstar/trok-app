import axios from 'axios';

export const apiClient = axios.create({
	baseURL: String(process.env.API_BASE_URL)
})