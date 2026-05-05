import type { RouteObject } from 'react-router-dom';
import { PaginaCatalogoComponentes } from './page';

export const componentesCatalogoPath = '/painel/componentes';

export const componentesCatalogoRoute: RouteObject = {
	path: componentesCatalogoPath,
	element: <PaginaCatalogoComponentes />,
};
