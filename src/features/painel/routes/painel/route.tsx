import type { RouteObject } from 'react-router-dom';
import { PaginaPainel } from './page';

export const painelPath = '/painel';
export const painelRoute: RouteObject = {
	path: painelPath,
	element: <PaginaPainel />,
};


