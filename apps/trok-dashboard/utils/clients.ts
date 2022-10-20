import axios from 'axios';

export const apiClient = axios.create()

/*
export const apiClient = axios.create({
	baseURL: String(process.env.NEXT_PUBLIC_API_BASE_URL)
})*/
