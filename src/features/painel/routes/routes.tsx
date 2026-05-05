import type { RouteObject } from 'react-router-dom';
import { minhasReservasRoute } from './minhas-reservas/route';
import { painelRoute } from './painel/route';

export const painelRoutes: RouteObject[] = [painelRoute, minhasReservasRoute];
