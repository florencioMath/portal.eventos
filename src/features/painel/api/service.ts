import { api } from '@/lib/api';

/**
 * Serviço da feature painel — chamadas de API quando o painel consumir dados do backend.
 */
export class ServicoPainel {
	static async listar() {
		const response = await api.get('/painel');
		return response.data;
	}

	static async obterPorId(id: string | number) {
		const response = await api.get(`/painel/${id}`);
		return response.data;
	}

	static async criar(dados: unknown) {
		const response = await api.post('/painel', dados);
		return response.data;
	}

	static async atualizar(id: string | number, dados: unknown) {
		const response = await api.put(`/painel/${id}`, dados);
		return response.data;
	}

	static async excluir(id: string | number) {
		const response = await api.delete(`/painel/${id}`);
		return response.data;
	}
}
