import type { RouteObject } from 'react-router-dom';
import { editarPerfilRoute } from './editar-perfil/route';
import { perfilRoute } from './perfil/route';

export const perfilRoutes: RouteObject[] = [perfilRoute, editarPerfilRoute];
