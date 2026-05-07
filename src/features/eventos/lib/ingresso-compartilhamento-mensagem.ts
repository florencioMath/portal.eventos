export type DadosMensagemIngresso = {
	nomeEvento: string;
	/** Data ou período já formatados para leitura (ex.: output de `formatarEventoDataPeriodoPt`). */
	realizacaoLabel: string;
	codigoReserva: string;
	ordem: number;
	nomeTitular: string;
	tokenQr: string;
};

export function montarAssuntoCompartilhamentoIngresso(d: DadosMensagemIngresso): string {
	return `Ingresso — ${d.nomeEvento} · ${d.codigoReserva}`;
}

/** Texto único para copiar, WhatsApp, e-mail e Web Share. */
export function montarMensagemCompartilhamentoIngresso(d: DadosMensagemIngresso): string {
	return [
		`Evento: ${d.nomeEvento}`,
		`Realização: ${d.realizacaoLabel}`,
		`Reserva: ${d.codigoReserva}`,
		`Ingresso: ${d.ordem}`,
		`Titular: ${d.nomeTitular}`,
		'',
		`Código do ingresso (QR): ${d.tokenQr}`,
		'',
		'Mantenha este código confidencial até a retirada.',
	].join('\n');
}
