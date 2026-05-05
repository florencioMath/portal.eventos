import { api } from '@/lib/api';
import type { EventoReservaDto, MinhaReservaItemDto, ReservaCriarPayload } from '@/features/eventos/types';

/** Contrato REST do portal: `PATCH /reservas/{id}/cancelar` e `PATCH /reservas/{id}` com corpo `{ quantidadeReservada }`. */
export class ReservasApi {
	static async criar(payload: ReservaCriarPayload): Promise<EventoReservaDto> {
		const body = {
			cdEventosCadastro: payload.cdEventosCadastro,
			quantidadeReservada: payload.quantidadeReservada ?? 1,
		};
		const { data } = await api.post<EventoReservaDto>('/reservas', body);
		return data;
	}

	static async listarMinhas(): Promise<MinhaReservaItemDto[]> {
		const { data } = await api.get<MinhaReservaItemDto[]>('/reservas/usuario');
		return data;
	}

	static async cancelar(cdEventosReservas: string): Promise<EventoReservaDto> {
		const id = encodeURIComponent(cdEventosReservas);
		const { data } = await api.patch<EventoReservaDto>(`/reservas/${id}/cancelar`);
		return data;
	}

	static async atualizarQuantidade(
		cdEventosReservas: string,
		quantidadeReservada: number
	): Promise<EventoReservaDto> {
		const id = encodeURIComponent(cdEventosReservas);
		const { data } = await api.patch<EventoReservaDto>(`/reservas/${id}`, { quantidadeReservada });
		return data;
	}
}
