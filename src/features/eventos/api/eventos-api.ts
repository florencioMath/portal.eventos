import { normalizarEventoImagemApi } from '@/features/eventos/lib/normalizar-imagem-api';
import { apiPublicSilent } from '@/lib/api';
import type { EventoCadastroDto, EventoImagemDto } from '@/features/eventos/types';

export class EventosApi {
	static async listarPublicos(): Promise<EventoCadastroDto[]> {
		const { data } = await apiPublicSilent.get<EventoCadastroDto[]>('/eventos');
		return data;
	}

	static async obterPublico(id: string): Promise<EventoCadastroDto> {
		const { data } = await apiPublicSilent.get<EventoCadastroDto>(`/eventos/${id}`);
		return data;
	}
}

export class ImagensApi {
	static async listarPorEvento(cdEventosCadastro: string): Promise<EventoImagemDto[]> {
		const { data } = await apiPublicSilent.get<Record<string, unknown>[]>(`/imagens/${cdEventosCadastro}`);
		const lista = (Array.isArray(data) ? data : []).map((raw) => {
			const n = normalizarEventoImagemApi(raw);
			return { ...n, cdEventosCadastro: n.cdEventosCadastro || cdEventosCadastro };
		});
		return lista.sort((a, b) => a.ordemExibicao - b.ordemExibicao);
	}

	static async baixarArquivo(cdEventosCadastro: string, cdEventosImagens: string): Promise<Blob> {
		const { data } = await apiPublicSilent.get<Blob>(
			`/imagens/${cdEventosCadastro}/download/${cdEventosImagens}`,
			{ responseType: 'blob' }
		);
		return data;
	}
}
