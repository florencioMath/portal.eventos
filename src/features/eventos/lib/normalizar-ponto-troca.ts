import type { EventoPontoDeTrocaDto } from '@/features/eventos/types';

function primeiroTextoNaoVazio(...vals: unknown[]): string {
	for (const v of vals) {
		if (typeof v === 'number' && Number.isFinite(v)) return String(v);
		if (typeof v === 'string' && v.trim().length > 0) return v.trim();
	}
	return '';
}

/**
 * Aceita o formato do portal (`id`, `nome`, `endereco`), legado (`string`) ou chaves comuns da API Java.
 * Para UI: prioriza **nome** para cards; **id** só como último recurso (nunca substituir nome por id quando nome existe).
 */
export function normalizarItemPontoTroca(raw: unknown, index: number): EventoPontoDeTrocaDto {
	if (typeof raw === 'string') {
		const s = raw.trim();
		return { id: s || `ponto-${index}`, nome: s, endereco: '' };
	}
	if (raw && typeof raw === 'object') {
		const o = raw as Record<string, unknown>;
		const id = primeiroTextoNaoVazio(o.id, o.cdLocalTroca, o.codigo, o.cdPontoTroca) || `ponto-${index}`;
		const nome =
			primeiroTextoNaoVazio(o.nome, o.nomeLocal, o.nmPonto, o.nmLocal, o.nomePonto) || id;
		const endereco = primeiroTextoNaoVazio(o.endereco, o.dsEndereco, o.logradouro, o.enderecoCompleto);
		return { id, nome, endereco };
	}
	return { id: `ponto-${index}`, nome: '', endereco: '' };
}

export function normalizarListaPontosTroca(raw: unknown): EventoPontoDeTrocaDto[] {
	if (!Array.isArray(raw)) return [];
	return raw
		.map((item, i) => normalizarItemPontoTroca(item, i))
		.filter((p) => p.nome.trim().length > 0 || p.endereco.trim().length > 0);
}
