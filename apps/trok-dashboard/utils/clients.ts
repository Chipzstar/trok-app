import axios from 'axios';
import type { AppRouter } from '../../trok-backend/src/app/routes';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: 'http://localhost:3333/server/trpc',
		}),
	],
});

export const apiClient = axios.create()
