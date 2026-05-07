import { api } from '@/lib/api';
import type { IngressoReservaDto, IngressoTitularAtualizarPayload } from '@/features/eventos/types';

export class IngressosApi {
	static async atualizarTitular(
		cdIngresso: string,
		payload: IngressoTitularAtualizarPayload
	): Promise<IngressoReservaDto> {
		const id = encodeURIComponent(cdIngresso);
		const { data } = await api.patch<IngressoReservaDto>(`/ingressos/${id}`, payload);
		return data;
	}
}
