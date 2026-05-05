import type { RouteObject } from 'react-router-dom';
import { PaginaEntrar } from './page';

export const signInPath = '/entrar';
export const signInRoute: RouteObject = {
	path: signInPath,
	element: <PaginaEntrar />,
};
