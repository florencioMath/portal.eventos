import type { EventoAnexoDto, EventoImagemDto } from '@/features/eventos/types';

function mimePorNome(nome: string): string {
	const n = nome.toLowerCase();
	if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
	if (n.endsWith('.webp')) return 'image/webp';
	if (n.endsWith('.gif')) return 'image/gif';
	return 'image/png';
}

/** Data URL para `<img src>` quando a API envia preview em Base64 (sem prefixo `data:`). */
export function imagemDtoParaDataUrl(
	im: EventoImagemDto | EventoAnexoDto | undefined | null
): string | null {
	const b64 = (() => {
		if (!im) return undefined;
		if ('codigoBase64' in im && im.codigoBase64) return im.codigoBase64;
		if ('conteudoBase64Preview' in im && im.conteudoBase64Preview) return im.conteudoBase64Preview;
		if ('conteudoBase64' in im && im.conteudoBase64) return im.conteudoBase64;
		return undefined;
	})();
	if (!b64?.trim()) return null;
	const nome =
		im && 'nome' in im ? im.nome : (im as EventoImagemDto | undefined)?.nomeArquivo ?? '';
	const mime = mimePorNome(nome);
	return `data:${mime};base64,${b64}`;
}
