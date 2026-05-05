import type { RouteObject } from 'react-router-dom';
import { PaginaPerfil } from './page';

export const perfilPath = '/perfil';
export const perfilRoute: RouteObject = {
	path: perfilPath,
	element: <PaginaPerfil />,
};


