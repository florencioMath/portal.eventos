import type { RouteObject } from 'react-router-dom';
import { PaginaInicial } from './page';

export const inicioPath = '/inicio';
export const inicioRoute: RouteObject = {
	path: inicioPath,
	element: <PaginaInicial />,
};
