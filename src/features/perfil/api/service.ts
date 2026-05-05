import { api, apiPublic } from '@/lib/api';
import type { IPerfilData } from '../types';

/**
 * Serviço da feature perfil — dados cadastrais e senha.
 */
export class ServicoPerfil {
	static async obterPerfil(): Promise<IPerfilData> {
		const response = await api.get('/cadastro/dados-usuario');
		return response.data;
	}

	static async buscarCep(cep: string) {
		const response = await apiPublic.get(`/endereco/buscar-por-cep/${cep}`);
		if (!response.data || response.status === 204) {
			throw new Error('CEP não encontrado');
		}
		return response.data;
	}

	static async atualizarPerfil(dados: IPerfilData) {
		const response = await api.put('/cadastro/atualizar', dados);
		return response.data;
	}

	static async trocarSenha(dados: {
		idUsuario: string;
		senhaAtual: string;
		novaSenha: string;
		confirmacaoNovaSenha: string;
	}) {
		const response = await api.post('/auth/troca-senha', dados);
		return response.data;
	}
}
