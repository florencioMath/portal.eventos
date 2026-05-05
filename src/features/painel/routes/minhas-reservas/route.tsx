import type { RouteObject } from 'react-router-dom';
import { PaginaMinhasReservas } from './page';

export const minhasReservasPath = '/painel/minhas-reservas';

export const minhasReservasRoute: RouteObject = {
	path: minhasReservasPath,
	element: <PaginaMinhasReservas />,
};
