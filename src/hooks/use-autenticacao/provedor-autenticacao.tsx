import { USER_KEY } from '@/config';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { ContextoAutenticacao } from './contexto-autenticacao';
import type { EstadoAutenticacao, Usuario, ValorContextoAutenticacao } from './types';

export const ProvedorAutenticacao = ({ children }: { children: React.ReactNode }) => {
	const [state, setState] = useState<EstadoAutenticacao>({
		user: null,
		token: null,
		isAuthenticated: false,
		isLoading: true,
	});

	useEffect(() => {
		const inicializar = () => {
			const token = getAuthToken();
			const userJson = localStorage.getItem(USER_KEY);

			if (token && userJson) {
				try {
					const parsed = JSON.parse(userJson) as Usuario;

					const user: Usuario = {
						...parsed,
						claims: Array.isArray(parsed.claims) ? parsed.claims : [],
						profile: parsed.profile ?? { id: '', name: '' },
					};

					setState({
						user,
						token,
						isAuthenticated: true,
						isLoading: false,
					});
				} catch {
					removeAuthToken();
					localStorage.removeItem(USER_KEY);
					setState({
						user: null,
						token: null,
						isAuthenticated: false,
						isLoading: false,
					});
				}
			} else {
				setState({
					user: null,
					token: null,
					isAuthenticated: false,
					isLoading: false,
				});
			}
		};

		inicializar();
	}, []);

	const entrar = (token: string, user: Usuario) => {
		setAuthToken(token);
		localStorage.setItem(USER_KEY, JSON.stringify(user));

		setState({
			user,
			token,
			isAuthenticated: true,
			isLoading: false,
		});
	};

	const sair = () => {
		removeAuthToken();
		localStorage.removeItem(USER_KEY);

		setState({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
		});
	};

	const value: ValorContextoAutenticacao = {
		...state,
		entrar,
		sair,
	};

	return (
		<ContextoAutenticacao.Provider value={value}>{children}</ContextoAutenticacao.Provider>
	);
};
