import type { EventoCadastroDto, EventoPontoDeTrocaDto } from '@/features/eventos/types';
import {
	combinarDataHoraIsoLocal,
	extrairDataEHoraDoDto,
	extrairSoDataDesativacao,
} from '@/features/eventos/lib/datas-evento';
import { normalizarListaPontosTroca } from '@/features/eventos/lib/normalizar-ponto-troca';

/** Primeiro dia civil de listagem no portal (`YYYY-MM-DD`). */
export function obterYmdInicioListagemPortal(evento: EventoCadastroDto): string {
	const raw = evento.dataInicioExibicaoPortal?.trim();
	if (raw && raw.length >= 10) return raw.slice(0, 10);
	return extrairDataEHoraDoDto(evento).dataDia;
}

/** ISO local `YYYY-MM-DDTHH:mm:ss` usado para o início global de vendas. */
export function obterIsoDataHoraInicioVendas(evento: EventoCadastroDto): string {
	const raw = evento.dataHoraInicioVendas?.trim();
	if (raw?.includes('T')) return raw.slice(0, 19);
	const { dataDia, horaInicio } = extrairDataEHoraDoDto(evento);
	return combinarDataHoraIsoLocal(dataDia, horaInicio);
}

/** Instantâneo (ms) a partir do qual as reservas podem abrir (regra global do evento). */
export function obterInstanteInicioVendasMs(evento: EventoCadastroDto): number {
	const ms = Date.parse(obterIsoDataHoraInicioVendas(evento));
	return Number.isNaN(ms) ? Number.MAX_SAFE_INTEGER : ms;
}

/** Lista normalizada de pontos de troca (respeita `semPontoDeTroca`). */
export function obterPontosDeTroca(evento: EventoCadastroDto): EventoPontoDeTrocaDto[] {
	if (evento.semPontoDeTroca) return [];
	const bruto = (evento as { pontosDeTrocaCodigos?: unknown }).pontosDeTrocaCodigos;
	return normalizarListaPontosTroca(bruto);
}

/**
 * Texto curto só com **nomes** dos locais (cards, hero). Não usar para detalhe — use `ListaPontosDeTrocaDetalhe`.
 */
export function resumoLocalEvento(evento: EventoCadastroDto): string {
	if (evento.semPontoDeTroca) {
		return 'Troca conforme descrição do evento';
	}
	const pts = obterPontosDeTroca(evento);
	if (pts.length === 0) return 'Locais conforme descrição';
	return pts.map((p) => p.nome.trim()).filter(Boolean).join(' · ');
}

/** Evento com `statusEvento` que permite novas reservas no portal (ex.: `ATIVO`; legado `PUBLICADO`). */
export function eventoAceitaReservas(evento: EventoCadastroDto): boolean {
	const s = evento.statusEvento?.trim().toUpperCase() ?? '';
	return s === 'ATIVO' || s === 'PUBLICADO';
}

/**
 * O evento entra no catálogo público do portal quando **exibirParaCidadao** é verdadeiro.
 * Essa flag tem precedência sobre a janela de datas (início de exibição / desativação): se ativa, o cidadão vê o evento.
 */
export function eventoListadoNoPortal(evento: EventoCadastroDto, _ref: Date = new Date()): boolean {
	return evento.exibirParaCidadao === true;
}

/** Data civil local `YYYY-MM-DD` (timezone do cliente). */
export function obterYmdHojeLocal(ref: Date = new Date()): string {
	const y = ref.getFullYear();
	const m = String(ref.getMonth() + 1).padStart(2, '0');
	const d = String(ref.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/**
 * Inscrições ainda permitidas pelo calendário do portal (até `dataDesativacaoAutomatica`, inclusive)
 * e pelo status do evento.
 */
export function inscricoesAindaAbertasPorData(evento: EventoCadastroDto, ref: Date = new Date()): boolean {
	if (!eventoAceitaReservas(evento)) return false;
	const limite = extrairSoDataDesativacao(evento);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(limite)) return false;
	return obterYmdHojeLocal(ref) <= limite;
}
