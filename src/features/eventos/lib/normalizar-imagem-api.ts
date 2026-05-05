import type { EventoImagemDto } from '@/features/eventos/types';

export function normalizarEventoImagemApi(raw: Record<string, unknown>): EventoImagemDto {
	const cdEventosImagens = String(raw.cdEventosImagens ?? raw.id ?? '');
	const cdEventosCadastro = String(raw.cdEventosCadastro ?? raw.idEvento ?? '');
	const nomeArquivo = String(raw.nomeArquivo ?? raw.nome ?? '');
	const caminhoArquivo = String(raw.caminhoArquivo ?? '');
	const imagemPrincipal = Boolean(raw.imagemPrincipal);
	const ordemRaw = raw.ordemExibicao ?? raw.posicao;
	const ordemExibicao =
		typeof ordemRaw === 'number' && Number.isFinite(ordemRaw) ? ordemRaw : Number(ordemRaw ?? 0) || 0;
	const ativo = raw.ativo !== undefined ? Boolean(raw.ativo) : true;
	const dataCriacao = String(raw.dataCriacao ?? new Date().toISOString());
	const codigoAnexo =
		typeof raw.codigoBase64 === 'string' && raw.codigoBase64.trim() ? raw.codigoBase64 : undefined;
	const conteudoBase64Preview =
		(typeof raw.conteudoBase64Preview === 'string' && raw.conteudoBase64Preview) ||
		codigoAnexo ||
		(typeof raw.conteudoBase64 === 'string' ? raw.conteudoBase64 : undefined);
	const conteudoBase64 =
		(typeof raw.conteudoBase64 === 'string' && raw.conteudoBase64) || codigoAnexo || undefined;
	const posicao = typeof raw.posicao === 'number' ? raw.posicao : ordemExibicao;
	const id = typeof raw.id === 'string' ? raw.id : undefined;

	return {
		cdEventosImagens,
		cdEventosCadastro,
		nomeArquivo,
		caminhoArquivo,
		imagemPrincipal,
		ordemExibicao,
		ativo,
		dataCriacao,
		conteudoBase64Preview,
		conteudoBase64,
		posicao,
		id,
	};
}
