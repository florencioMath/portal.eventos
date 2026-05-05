import { api, apiPublicSilent, apiSilent } from '@/lib/api';
import type { InternalAxiosRequestConfig } from 'axios';
import { registrarMocksEventosPortal } from './eventos-portal-mock';
import { DADOS_PERFIL_MOCK } from './dados-perfil';
import { HISTORICO_COMPONENTES_DEMO } from './historico-componentes-demo';
import { SENHA_MOCK, USUARIOS_MOCK } from './users';

/**
 * Caminho da rota de login com senha (não confundir com /auth/login-codigo).
 */
function isLoginComSenha(url: string | undefined): boolean {
	if (!url) return false;
	const u = url.toLowerCase();
	if (u.includes('login-codigo')) return false;
	return /\/auth\/login(\?|$|#)/.test(u) || u.endsWith('/auth/login');
}

function isLoginComCodigoWhatsapp(url: string | undefined): boolean {
	if (!url) return false;
	return url.toLowerCase().includes('/auth/login-codigo');
}

function isEnviarCodigoWhatsapp(url: string | undefined): boolean {
	if (!url) return false;
	return url.toLowerCase().includes('/auth/enviar-codigo');
}

function isObterDadosUsuario(url: string | undefined): boolean {
	if (!url) return false;
	return url.toLowerCase().includes('/cadastro/dados-usuario');
}

function isAtualizarCadastro(url: string | undefined): boolean {
	if (!url) return false;
	return url.toLowerCase().includes('/cadastro/atualizar');
}

function isTrocaSenha(url: string | undefined): boolean {
	if (!url) return false;
	return url.toLowerCase().includes('/auth/troca-senha');
}

function extrairPathname(url: string): string {
	if (!url) return '';
	try {
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return new URL(url).pathname.split('?')[0] ?? '';
		}
	} catch {
		/* ignore */
	}
	return url.split('?')[0];
}

function isHistoricoComponentesDemo(url: string | undefined): boolean {
	return (url ?? '').toLowerCase().includes('/componentes/historico-demo');
}

function obterCorpo(config: InternalAxiosRequestConfig): Record<string, unknown> {
	if (config.data == null) return {};
	if (typeof config.data === 'string') {
		try {
			return JSON.parse(config.data) as Record<string, unknown>;
		} catch {
			return {};
		}
	}
	return config.data as Record<string, unknown>;
}

function resolverUsuarioMock(body: Record<string, unknown>) {
	const identificador = String(body.login ?? body.email ?? '')
		.trim()
		.toLowerCase();
	const senha = String(body.senha ?? body.password ?? '');

	const porChaveExata = USUARIOS_MOCK[identificador];
	if (porChaveExata && senha === SENHA_MOCK) return porChaveExata;

	for (const [email, dados] of Object.entries(USUARIOS_MOCK)) {
		if (email.toLowerCase() === identificador && senha === SENHA_MOCK) {
			return dados;
		}
		if (dados.user.email.toLowerCase() === identificador && senha === SENHA_MOCK) {
			return dados;
		}
	}
	return null;
}

/**
 * Habilita interceptadores de mock nas instâncias axios.
 *
 * O login real usa `apiPublicSilent` + POST `{baseUrl}/auth/login` com `login` e `senha`.
 *
 * Ativado pela variável de ambiente: VITE_MOCK_API=true
 */
export function habilitarMocks() {
	console.log(
		'%c🔶 MOCK API ATIVO',
		'background: #f59e0b; color: #000; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
	);
	console.log('%cUsuário disponível:', 'color: #f59e0b; font-weight: bold;');
	console.table(
		Object.entries(USUARIOS_MOCK).map(([email, data]) => ({
			email,
			senha: SENHA_MOCK,
			perfil: data.user.profile.name,
			claims: data.user.claims.length > 0 ? data.user.claims.join(', ') : '(nenhuma)',
		}))
	);

	apiPublicSilent.interceptors.request.use((config: InternalAxiosRequestConfig) => {
		const url = config.url ?? '';
		const method = (config.method ?? 'get').toLowerCase();

		if (method === 'post' && isLoginComSenha(url)) {
			return criarRespostaMock(config, () => {
				const body = obterCorpo(config);
				const mockUser = resolverUsuarioMock(body);

				if (!mockUser) {
					throw { status: 401, message: 'CPF/Email ou senha incorretos.' };
				}

				console.log(
					`%c✅ Login mock: ${mockUser.user.name} (${mockUser.user.profile.name})`,
					'color: #22c55e; font-weight: bold;'
				);
				console.log('   Claims:', mockUser.user.claims);

				return {
					token: mockUser.token,
					user: mockUser.user,
				} satisfies SignInResponse;
			});
		}

		if (method === 'post' && isLoginComCodigoWhatsapp(url)) {
			return criarRespostaMock(config, () => {
				const body = obterCorpo(config);
				const login = String(body.login ?? '').trim().toLowerCase();
				const mockEntry =
					USUARIOS_MOCK[login] ??
					Object.values(USUARIOS_MOCK).find(
						(u) => u.user.email.toLowerCase() === login
					);

				if (!mockEntry || !String(body.codigo ?? '').trim()) {
					throw { status: 401, message: 'Código inválido ou expirado.' };
				}

				return {
					token: mockEntry.token,
					user: mockEntry.user,
				} satisfies SignInResponse;
			});
		}

		if (method === 'post' && isEnviarCodigoWhatsapp(url)) {
			return criarRespostaMock(config, () => ({
				telefoneMascarado: '(**) *****-0000',
				mensagem: 'Código enviado (mock). Use qualquer código para concluir o login.',
			}));
		}

		return config;
	});

	/** Perfil e cadastro usam a instância `api` (token). */
	api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
		const url = config.url ?? '';
		const method = (config.method ?? 'get').toLowerCase();

		if (method === 'get' && isObterDadosUsuario(url)) {
			return criarRespostaMock(config, () => {
				console.log('%c📋 Perfil: retorno mock (dados-usuario)', 'color: #22c55e; font-weight: bold;');
				return { ...DADOS_PERFIL_MOCK };
			});
		}

		if (method === 'put' && isAtualizarCadastro(url)) {
			return criarRespostaMock(config, () => {
				const body = obterCorpo(config) as Partial<typeof DADOS_PERFIL_MOCK>;
				console.log('%c📋 Perfil: atualização mock (cadastro/atualizar)', 'color: #22c55e; font-weight: bold;');
				return { ...DADOS_PERFIL_MOCK, ...body };
			});
		}

		if (method === 'post' && isTrocaSenha(url)) {
			return criarRespostaMock(config, () => {
				console.log('%c📋 Perfil: troca de senha mock', 'color: #22c55e; font-weight: bold;');
				return { sucesso: true, mensagem: 'Senha alterada (mock).' };
			});
		}

		if (method === 'get' && isHistoricoComponentesDemo(url)) {
			return criarRespostaMock(config, () => [...HISTORICO_COMPONENTES_DEMO]);
		}

		return config;
	});

	/** Endereço (FormularioEndereco) usa `apiSilent`. */
	apiSilent.interceptors.request.use((config: InternalAxiosRequestConfig) => {
		const url = config.url ?? '';
		const method = (config.method ?? 'get').toLowerCase();
		const path = extrairPathname(url);
		const matchCep = path.match(/\/endereco\/buscar-por-cep\/(\d{8})$/);

		if (method === 'get' && matchCep) {
			const digitos = matchCep[1];
			return criarRespostaMock(config, () => ({
				id: `mock-cep-${digitos}`,
				city: 'São Paulo',
				state: 'SP',
				street: 'AVENIDA PAULISTA',
				neighborhood: 'BELA VISTA',
				zipcode: digitos,
				lat: '-23.561414',
				longitude: '-46.655881',
				isOfficialAddress: true,
				region: 'Sudeste',
				source: 'mock',
			}));
		}

		if (method === 'post' && path.includes('/endereco/buscar-por-logradouro')) {
			return criarRespostaMock(config, () => {
				const corpo = obterCorpo(config);
				const logr = String((corpo as { logradouro?: string }).logradouro ?? 'RUA').toUpperCase();
				return [
					{
						id: 'mock-log-1',
						city: 'São Paulo',
						state: 'SP',
						street: `${logr} MOCK 100`,
						neighborhood: 'CENTRO',
						zipcode: '01001000',
						lat: '-23.5500',
						longitude: '-46.6333',
						isOfficialAddress: true,
						region: '',
						source: 'mock',
					},
					{
						id: 'mock-log-2',
						city: 'São Paulo',
						state: 'SP',
						street: `${logr} MOCK 200`,
						neighborhood: 'JARDINS',
						zipcode: '01415000',
						lat: '-23.5670',
						longitude: '-46.6480',
						isOfficialAddress: true,
						region: '',
						source: 'mock',
					},
				];
			});
		}

		return config;
	});

	registrarMocksEventosPortal(apiPublicSilent, api);
}

/**
 * Cria uma resposta mockada para o axios sem fazer requisição real.
 * Usa o campo `adapter` do config para curto-circuitar a requisição.
 */
function criarRespostaMock(
	config: InternalAxiosRequestConfig,
	handler: () => unknown
): InternalAxiosRequestConfig {
	config.adapter = async () => {
		await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

		try {
			const data = handler();

			return {
				data,
				status: 200,
				statusText: 'OK',
				headers: {},
				config,
			};
		} catch (error) {
			const err = error as { status?: number; message?: string };

			const axiosError = {
				response: {
					status: err.status ?? 500,
					data: { message: err.message ?? 'Erro interno do mock' },
					statusText: 'Error',
					headers: {},
					config,
				},
				config,
				isAxiosError: true,
				message: err.message ?? 'Mock error',
				name: 'AxiosError',
				toJSON: () => ({}),
			};

			return Promise.reject(axiosError);
		}
	};

	return config;
}
