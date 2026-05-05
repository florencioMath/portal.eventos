import { api, apiPublicSilent } from '@/lib/api';

const cadastroUrl = import.meta.env.VITE_CADASTROS_DOMAIN;
const baseUrl = import.meta.env.VITE_API_BASE;

export class ServicoAutenticacao {
	/**
	 * Login do usuário
	 */
	static async entrar(dados: SignInRequest): Promise<SignInResponse> {
		const payload = { ...dados, ambiente: 'CIDADÃO' };
		const response = await apiPublicSilent.post<SignInResponse>(
			`${baseUrl}/auth/login`,
			payload
		);
		return response.data;
	}

	static async buscarCepApi(cep: string): Promise<CepResponse> {
		const response = await apiPublicSilent.get<CepResponse>(`/endereco/buscar-por-cep/${cep}`);
		if (!response.data || response.status === 204) {
			throw new Error('CEP não encontrado');
		}
		return response.data;
	}

	/**
	 * Cadastro de novo usuário
	 */
	static async cadastrarUsuario(dados: SignUpData) {
		const response = await api.post('/cadastro/usuario', dados);
		return response.data;
	}

	/**
	 * Verificar se CPF já existe
	 */
	static async cpfJaCadastrado(cpf: string): Promise<boolean> {
		try {
			const response = await apiPublicSilent.get(`/cadastro/verificar-cpf/${cpf}`);
			return response.data; // true = CPF já existe
		} catch (error: unknown) {
			const err = error as { response?: { status?: number } };
			// 404 = usuário não encontrado = CPF livre
			if (err?.response?.status === 404) return false;
			throw error;
		}
	}

	/**
	 * Busca endereço completo no banco de dados.
	 * Se não encontrar, busca pelo CEP no endpoint próprio.
	 */
	static async buscarEnderecoNoCadastro(cep: string): Promise<{ data: DatabaseAddress }> {
		try {
			const cleanCep = cep.replace(/\D/g, '');
			const response = await api.get<DatabaseAddress>(
				`${cadastroUrl}/registers/address/by-zip-code?zipCode=${cleanCep}`
			);

			return response;
		} catch {
			console.log('Endereço não encontrado no banco, buscando por CEP...');

			const endereco = await this.buscarCepApi(cep.replace(/\D/g, ''));

			return {
				data: {
					status: true,
					zipCode: endereco.zipcode,
					state: endereco.state,
					city: endereco.city,
					street: endereco.street,
					neighborhood: endereco.neighborhood,
					lat: endereco.lat,
					long: endereco.longitude,
					isOfficialAddress: endereco.isOfficialAddress,
					region: endereco.region,
				},
			};
		}
	}

	static cepValido(cep: string): boolean {
		const cleanCep = cep.replace(/\D/g, '');
		return /^\d{8}$/.test(cleanCep);
	}

	static formatarCep(cep: string): string {
		const cleanCep = cep.replace(/\D/g, '');
		return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
	}

	static async enviarCodigoWhatsapp(dados: { login: string }): Promise<SendWhatsAppCodeResponse> {
		const payload = { ...dados };
		const response = await apiPublicSilent.post<SendWhatsAppCodeResponse>(
			'/auth/enviar-codigo',
			payload
		);
		return response.data;
	}

	static async entrarComCodigoWhatsapp(dados: {
		login: string;
		codigo: string;
	}): Promise<SignInResponse> {
		const payload = { ...dados, ambiente: 'CIDADÃO' };
		const response = await apiPublicSilent.post<SignInResponse>('/auth/login-codigo', payload);
		return response.data;
	}
}
