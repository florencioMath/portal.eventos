import type { RouteObject } from 'react-router-dom';
import { PaginaEditarPerfil } from './page';

export const editarPerfilPath = '/perfil/editar-perfil';
export const editarPerfilRoute: RouteObject = {
	path: editarPerfilPath,
	element: <PaginaEditarPerfil />,
};


