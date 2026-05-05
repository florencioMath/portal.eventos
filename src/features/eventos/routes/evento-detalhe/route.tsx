import type { RouteObject } from 'react-router-dom';
import { PaginaEventoDetalhe } from './page';

export const eventoDetalhePath = (id: string) => `/eventos/${encodeURIComponent(id)}`;

export const eventoDetalheRoute: RouteObject = {
	path: '/eventos/:id',
	element: <PaginaEventoDetalhe />,
};
