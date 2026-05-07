/** Contrato alinhado à API (JSON camelCase), espelhado do projeto gestão.eventos. */

/** Ponto de troca: identificador, nome para exibição e endereço (estrutura do mock/API). */
export type EventoPontoDeTrocaDto = {
	id: string;
	nome: string;
	endereco: string;
};

export type EventoDominioOpcaoDto = {
	codigo: string;
	nome: string;
};

export type ModoLiberacaoLoteIngresso = 'IMEDIATA' | 'DATA_HORA' | 'APOS_ESGOTAR_ANTERIOR';

export type EventoLoteIngressoPayload = {
	rotulo: string;
	quantidade: number;
	ordem: number;
	modoLiberacao: ModoLiberacaoLoteIngresso;
	dataLiberacaoVenda?: string;
	horaLiberacaoVenda?: string;
};

/** Um dia civil da realização com horário próprio (mock / futura API). */
export type EventoProgramacaoDiaDto = {
	/** Dia civil `YYYY-MM-DD`. */
	data: string;
	horaInicio: string;
	horaFim: string;
};

export type EventoCadastroDto = {
	cdEventosCadastro: string;
	nomeEvento: string;
	descricao: string;
	/** Mensagem de sucesso após inscrição (HTML rico). Pode ausentar em respostas antigas. */
	textoSucessoRegistro?: string;
	/** Quantidade máxima de ingressos por CPF (≥ 1). Pode ausentar em respostas antigas. */
	ingressoPorCpf?: number;
	categoria: string;
	/** Pontos de troca (`id`, `nome`, `endereco`); ignorados quando `semPontoDeTroca`. */
	pontosDeTrocaCodigos: EventoPontoDeTrocaDto[];
	/** Quando verdadeiro, não há pontos de troca associados ao evento. */
	semPontoDeTroca: boolean;
	/** Início do evento: `YYYY-MM-DD` ou ISO `YYYY-MM-DDTHH:mm:ss` (resposta Spring). */
	dataEvento: string;
	horaInicio: string;
	horaFim: string;
	/** Fim do evento no mesmo dia (opcional na API em ISO). */
	dataFimEvento?: string;
	dataDesativacaoAutomatica: string;
	/** Primeiro dia em que o evento pode aparecer no aplicativo (`YYYY-MM-DD`). Ausente: alinhar com portal ou 1.º dia de `dataEvento`. */
	dataInicioExibicaoApp?: string;
	/** Primeiro dia em que o evento pode aparecer no portal (`YYYY-MM-DD`). Ausente: 1.º dia de `dataEvento`. */
	dataInicioExibicaoPortal?: string;
	/** Instantâneo local (`YYYY-MM-DDTHH:mm:ss`) a partir do qual reservas podem abrir. Ausente: início do evento. */
	dataHoraInicioVendas?: string;
	quantidadeIngressosTotal: number;
	quantidadeIngressosReservados: number;
	quantidadeIngressosDisponiveis: number;
	/** Quando falso, o evento não aparece no catálogo do portal (independente de datas). */
	exibirParaCidadao: boolean;
	/** Quando verdadeiro, o portal pode exibir o total de vagas do evento. */
	exibirVagas: boolean;
	/** Horário por dia civil quando o evento abrange vários dias; ausente = legado (um par início/fim). */
	programacaoDiaria?: EventoProgramacaoDiaDto[];
	/** Quando verdadeiro, o portal pode evidenciar este evento (ex.: secção de destaques). Vários eventos podem estar em destaque. Ausente em respostas antigas. */
	eventoEmDestaque?: boolean;
	statusEvento: string;
	cdEventosUsuariosCriacao: string;
	dataCriacao: string;
	dataAtualizacao: string;
	/** Divisão de vagas em lotes (opcional no legado). */
	lotes?: EventoLoteIngressoPayload[];
};


export type EventoAnexoDto = {
	id: string;
	idEvento: string;
	nome: string;
	posicao: number;
	/** Base64 puro, sem prefixo `data:`. */
	codigoBase64: string;
};

/** Imagem do evento na API pública (normalizada a partir de anexos ou modelo legado). */
export type EventoImagemDto = {
	cdEventosImagens: string;
	cdEventosCadastro: string;
	nomeArquivo: string;
	caminhoArquivo: string;
	imagemPrincipal: boolean;
	ordemExibicao: number;
	ativo: boolean;
	dataCriacao: string;
	conteudoBase64Preview?: string;
	conteudoBase64?: string;
	posicao?: number;
	id?: string;
};

/** Reserva conforme modelo Parte 3 (camelCase). */
export type EventoReservaDto = {
	cdEventosReservas: string;
	cdEventosCadastro: string;
	codigoReserva: string;
	quantidadeReservada: number;
	statusReserva: string;
	dataReserva: string;
	dataCancelamento?: string;
	/** Índice do lote (lista ordenada por `ordem`) no momento da reserva; opcional na API. */
	indiceLoteIngresso?: number;
};

/** Ingresso associado a uma reserva (detalhe por bilhete + token do QR). */
export type IngressoReservaDto = {
	cdIngresso: string;
	cdEventosReservas: string;
	/** Ordem na reserva (1-based, como no Gestão). */
	ordem: number;
	/** Texto exacto codificado no QR (payload enviado em `validar-leitura`). */
	tokenQr: string;
	nomeTitular: string;
	/** CPF com 11 dígitos (sem máscara), alinhado ao mock do Gestão. */
	documentoTitular: string;
	retirado?: boolean;
};

/** Item enriquecido para o portal (minhas reservas). */
export type MinhaReservaItemDto = {
	reserva: EventoReservaDto;
	evento: EventoCadastroDto;
	imagens?: EventoAnexoDto[];
	/** Quando a API devolve ingressos por bilhete (QR individual). */
	ingressos?: IngressoReservaDto[];
};

/** Corpo de `PATCH /ingressos/{cdIngresso}` — dados do titular do ingresso. */
export type IngressoTitularAtualizarPayload = {
	nomeTitular?: string;
	documentoTitular?: string;
};

export type ReservaCriarPayload = {
	cdEventosCadastro: string;
	quantidadeReservada?: number;
};

/** Corpo de `PATCH /reservas/{id}` para alterar apenas a quantidade. */
export type ReservaAtualizarQuantidadePayload = {
	quantidadeReservada: number;
};
