import { PrivateGuard } from '@/components/private-guard';
import { RouteErrorBoundary } from '@/components/route-error-boundary';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PrivateLayout } from '../layouts/private-layout';
import { PublicLayout } from '../layouts/public-layout';

import { authRoutes } from '@/features/auth';
import { eventosRoutes } from '@/features/eventos/routes/routes';
import { inicioRoutes } from '@/features/inicio';
import { painelRoutes } from '@/features/painel';
import { componentesRoutes } from '@/features/componentes';
import { perfilRoutes } from '@/features/perfil';
// [generate:import]

export const router = createBrowserRouter([
	// Rotas públicas (não requerem autenticação)
	{
		element: <PublicLayout />,
		errorElement: <RouteErrorBoundary />,
		children: [
			...authRoutes,
			...inicioRoutes,
			...eventosRoutes,
			// [generate:public-route]
		],
	},

	// Rotas privadas (requerem autenticação)
	{
		element: (
			<PrivateGuard>
				<PrivateLayout />
			</PrivateGuard>
		),
		errorElement: <RouteErrorBoundary />,
		children: [
			...painelRoutes,
			...perfilRoutes,
			...componentesRoutes,
			// [generate:private-route]
		],
	},

	// Rota 404 - redireciona para home
	{
		path: '*',
		element: <Navigate to='/inicio' replace />,
	},
]);
