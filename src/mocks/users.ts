/**
 * Usuário mockado para desenvolvimento com VITE_MOCK_API=true.
 *
 * | Email              | Senha  | Perfil   | Claims      |
 * |--------------------|--------|----------|-------------|
 * | cidadao@teste.com  | 123456 | Cidadão  | (nenhuma)   |
 *
 * A tela Perfil (GET /cadastro/dados-usuario) usa os dados em `mocks/dados-perfil.ts`.
 */

type UsuarioMock = {
	token: string;
	user: {
		id: string;
		name: string;
		email: string;
		profile: {
			id: string;
			name: string;
		};
		claims: string[];
	};
};

export const USUARIOS_MOCK: Record<string, UsuarioMock> = {
	'cidadao@teste.com': {
		token: 'mock-token-cidadao',
		user: {
			id: '1',
			name: 'Cidadão Teste',
			email: 'cidadao@teste.com',
			profile: { id: 'profile-cidadao', name: 'Cidadão' },
			claims: [],
		},
	},
};

export const SENHA_MOCK = '123456';
