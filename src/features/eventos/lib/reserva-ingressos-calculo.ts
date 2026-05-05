import type { EventoCadastroDto } from '@/features/eventos/types';

/** Limite numérico de ingressos por CPF (fallback 2 quando ausente na API). */
export function limiteIngressosPorCpfNumero(ev: EventoCadastroDto): number {
	const n = ev.ingressoPorCpf;
	if (n != null && Number.isFinite(n)) return Math.max(1, Math.floor(n));
	return 2;
}

/**
 * Máximo de ingressos num único POST de inscrição (novos ou somados à reserva existente),
 * dadas vagas do evento e o que o usuário já possui.
 */
export function calcularMaxIngressosNovaAcao(ev: EventoCadastroDto, jaReservadoPeloUsuario: number): number {
	const lim = limiteIngressosPorCpfNumero(ev);
	const vagasCpf = Math.max(0, lim - jaReservadoPeloUsuario);
	const vagasEvt = Math.max(0, ev.quantidadeIngressosDisponiveis);
	return Math.max(1, Math.min(vagasCpf, vagasEvt));
}

/** Máximo permitido ao alterar a quantidade de uma reserva ativa (pool global + limite por CPF). */
export function calcularMaxQuantidadeAlteracao(ev: EventoCadastroDto, quantidadeAtual: number): number {
	const lim = limiteIngressosPorCpfNumero(ev);
	const comPool = quantidadeAtual + Math.max(0, ev.quantidadeIngressosDisponiveis);
	return Math.max(1, Math.min(lim, comPool));
}
