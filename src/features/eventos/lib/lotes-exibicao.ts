import type { EventoCadastroDto, EventoLoteIngressoPayload } from '@/features/eventos/types';
import { formatarDataPortugues, formatarHoraPortugues24, normalizarHoraHm } from '@/features/eventos/lib/datas-evento';

export function textoLiberacaoLoteDetalhe(l: EventoLoteIngressoPayload): string {
	switch (l.modoLiberacao) {
		case 'IMEDIATA':
			return 'Venda imediata — reservas disponíveis assim que o evento estiver publicado.';
		case 'APOS_ESGOTAR_ANTERIOR':
			return 'Abre quando o lote anterior esgotar as vagas.';
		case 'DATA_HORA': {
			const d = l.dataLiberacaoVenda?.trim();
			if (d)
				return `Abre a venda em ${formatarDataPortugues(d)} às ${formatarHoraPortugues24(l.horaLiberacaoVenda)}.`;
			return 'Abre a venda numa data e hora definidas.';
		}
		default:
			return '—';
	}
}

export function ordenarLotes(lotes: EventoLoteIngressoPayload[] | undefined): EventoLoteIngressoPayload[] {
	if (!lotes?.length) return [];
	return [...lotes].sort((a, b) => a.ordem - b.ordem);
}

function capacidadePrefix(lotes: EventoLoteIngressoPayload[], atéExclusive: number): number {
	let s = 0;
	for (let j = 0; j < atéExclusive && j < lotes.length; j++) {
		s += Math.max(0, Math.floor(lotes[j]!.quantidade));
	}
	return s;
}

function instanteLiberacaoVenda(l: EventoLoteIngressoPayload): Date | null {
	if (l.modoLiberacao !== 'DATA_HORA') return null;
	const d = l.dataLiberacaoVenda?.trim().slice(0, 10) ?? '';
	if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
	const h = normalizarHoraHm(l.horaLiberacaoVenda);
	return new Date(`${d}T${h}:00`);
}

function alocacaoFifo(lotes: EventoLoteIngressoPayload[], totalReservado: number): number[] {
	const alloc = lotes.map(() => 0);
	let rem = Math.max(0, Math.floor(totalReservado));
	for (let j = 0; j < lotes.length; j++) {
		const q = Math.max(0, Math.floor(lotes[j]!.quantidade));
		alloc[j] = Math.min(q, rem);
		rem -= alloc[j];
	}
	return alloc;
}

/**
 * Indica se o lote na posição `i` (lista já ordenada) está liberado para novas reservas,
 * com base em data/hora, esgotamento do anterior e total já reservado no evento.
 */
function loteLiberadoParaVenda(
	i: number,
	lotes: EventoLoteIngressoPayload[],
	agora: Date,
	totalReservado: number
): boolean {
	const l = lotes[i]!;
	if (i === 0) {
		if (l.modoLiberacao === 'IMEDIATA') return true;
		if (l.modoLiberacao === 'DATA_HORA') {
			const t = instanteLiberacaoVenda(l);
			return t != null && agora >= t;
		}
		return true;
	}
	if (l.modoLiberacao === 'APOS_ESGOTAR_ANTERIOR') {
		const prec = capacidadePrefix(lotes, i);
		return totalReservado >= prec;
	}
	if (l.modoLiberacao === 'DATA_HORA') {
		const t = instanteLiberacaoVenda(l);
		return t != null && agora >= t;
	}
	return false;
}

/**
 * Índice do lote em destaque (venda corrente ou último ativo). `-1` se não houver lotes.
 * Usa distribuição FIFO de `quantidadeIngressosReservados` pelos lotes na ordem.
 */
export function resolverIndiceLoteAtual(evento: EventoCadastroDto, agora: Date = new Date()): number {
	const lotes = ordenarLotes(evento.lotes);
	if (!lotes.length) return -1;
	const R = Math.max(0, Math.floor(evento.quantidadeIngressosReservados ?? 0));
	const alloc = alocacaoFifo(lotes, R);

	for (let i = 0; i < lotes.length; i++) {
		if (!loteLiberadoParaVenda(i, lotes, agora, R)) continue;
		const q = Math.max(0, Math.floor(lotes[i]!.quantidade));
		if (alloc[i] < q) return i;
	}

	for (let i = lotes.length - 1; i >= 0; i--) {
		if (loteLiberadoParaVenda(i, lotes, agora, R)) return i;
	}

	return 0;
}
