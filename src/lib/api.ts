import { TOKEN_KEY } from '@/config';
import { signInPath } from '@/features/auth/routes/sign-in/route';
import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

/**
 * Configuração base para as instâncias do Axios
 */
const baseConfig = {
	baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
	timeout: 180000,
	headers: {
		'Content-Type': 'application/json',
	},
};

/**
 * Interface para padronizar respostas de erro da API
 */
interface ApiErrorResponse {
	message?: string;
	error?: string;
	statusCode?: number;
}

/**
 * Manipula erros de resposta HTTP
 */
const handleResponseError = (error: AxiosError<ApiErrorResponse>, shouldHandleAuth = false) => {
	if (!error.response) {
		toast.error('Erro de conexão. Verifique sua internet.');
		console.error('Network Error:', error.message);
		return Promise.reject(error);
	}

	const { status, data } = error.response;
	const errorMessage = data?.message || data?.error || 'Ocorreu um erro inesperado.';

	if (import.meta.env.DEV) {
		console.error('API Error:', {
			status,
			url: error.config?.url,
			method: error.config?.method,
			data,
		});
	}

	if (status === 401 && shouldHandleAuth) {
		localStorage.removeItem(TOKEN_KEY);
		toast.error('Sessão expirada. Faça login novamente.');

		window.location.href = signInPath;
		return Promise.reject(error);
	}

	// 500-599 - Erros de servidor
	if (status >= 500) {
		toast.error('Erro no servidor. Tente novamente mais tarde.');
		console.error('Server Error:', { status, data });
		return Promise.reject(error);
	}

	// 400-499 - Erros de cliente (exceto 401 já tratado)
	if (status >= 400 && status < 500) {
		toast.error(errorMessage);
		return Promise.reject(error);
	}

	return Promise.reject(error);
};

/**
 * ==========================================
 * apiPublic - Instância SEM autenticação
 * ==========================================
 *
 * Use esta instância para endpoints públicos como:
 * - Login
 * - Registro
 * - Recuperação de senha
 * - Endpoints que não requerem autenticação
 *
 * @example
 * ```typescript
 * import { apiPublic } from "@/lib/api";
 *
 * // Login
 * const { data } = await apiPublic.post("/auth/login", { email, password });
 *
 * // Registro
 * const { data } = await apiPublic.post("/auth/register", userData);
 * ```
 */
const apiPublic: AxiosInstance = axios.create(baseConfig);

// Response interceptor para apiPublic (apenas erros de servidor e rede)
apiPublic.interceptors.response.use(
	(response) => response,
	(error: AxiosError<ApiErrorResponse>) => handleResponseError(error, false)
);

/**
 * ==========================================
 * api - Instância COM autenticação (default)
 * ==========================================
 *
 * Use esta instância para endpoints protegidos que requerem autenticação.
 * O token será automaticamente injetado no header Authorization.
 *
 * @example
 * ```typescript
 * import api from "@/lib/api";
 *
 * // GET - Buscar usuários
 * const { data } = await api.get("/users");
 *
 * // POST - Criar usuário
 * const { data } = await api.post("/users", { name: "João" });
 *
 * // PUT - Atualizar perfil
 * const { data } = await api.put("/profile", profileData);
 *
 * // DELETE - Deletar usuário
 * await api.delete("/users/123");
 * ```
 */
const api: AxiosInstance = axios.create(baseConfig);

api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem(TOKEN_KEY);

		if (token) {
			config.headers.Authorization = `${token}`;
		}

		if (import.meta.env.DEV) {
			console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
				hasToken: !!token,
				data: config.data,
			});
		}

		return config;
	},
	(error) => {
		console.error('Request Interceptor Error:', error);
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => response,
	(error: AxiosError<ApiErrorResponse>) => handleResponseError(error, true)
);

/**
 * ==========================================
 * apiSilent - COM autenticação, SEM toasts
 * ==========================================
 *
 * Instância autenticada que NÃO dispara toasts em erros.
 * Ideal para uploads individuais cujo feedback visual já
 * é tratado pelo componente que faz a chamada.
 */
const apiSilent: AxiosInstance = axios.create(baseConfig);

apiSilent.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem(TOKEN_KEY);
		if (token) {
			config.headers.Authorization = `${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

/**
 * ==========================================
 * apiPublicSilent - SEM autenticação, SEM toasts
 * ==========================================
 *
 * Use para endpoints públicos onde o componente
 * já trata o feedback de erro localmente.
 */
const apiPublicSilent: AxiosInstance = axios.create(baseConfig);

apiPublicSilent.interceptors.response.use(
	(response) => response,
	(error: AxiosError<ApiErrorResponse>) => {
		if (!error.response) {
			console.error('Network Error:', error.message);
		}
		return Promise.reject(error);
	}
);

export { api, apiPublic, apiPublicSilent, apiSilent };
