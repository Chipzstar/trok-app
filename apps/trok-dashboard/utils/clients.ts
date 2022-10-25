import axios from 'axios';
import type { AppRouter } from '../../trok-backend/src/app/routes';
import { createTRPCReact } from '@trpc/react';

export const trpc = createTRPCReact<AppRouter>();

export const apiClient = axios.create()
