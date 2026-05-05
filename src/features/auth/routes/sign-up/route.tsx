import type { RouteObject } from 'react-router-dom';
import { PaginaCriarConta } from './page';

export const signUpPath = '/criar-conta';
export const signUpRoute: RouteObject = {
	path: signUpPath,
	element: <PaginaCriarConta />,
};
