/** Resposta mock de GET …/componentes/historico-demo (DialogoHistorico). */
export const HISTORICO_COMPONENTES_DEMO: HistoricoItem[] = [
	{
		visivelAoSolicitante: true,
		usuario: {
			nome: 'admin transito',
			email: 'admin@transito.gov.br',
			perfil: 'ADMINISTRADOR',
		},
		acao: {
			status: 'RETIRADO',
			descricao: 'Remoção finalizada - veículo retirado',
		},
		data: '2026-04-27T15:33:31.256496-03:00',
	},
	{
		visivelAoSolicitante: true,
		usuario: {
			nome: 'admin transito',
			email: 'admin@transito.gov.br',
			perfil: 'ADMINISTRADOR',
		},
		acao: {
			status: 'CONCLUIDO',
			descricao: 'Veículo retirado do pátio. Motivo: Solicitação concluída',
		},
		data: '2026-04-27T15:33:31.206981-03:00',
	},
	{
		visivelAoSolicitante: true,
		usuario: {
			nome: 'Cidadão Teste',
			email: 'cidadao@teste.com',
			perfil: 'CIDADAO',
		},
		acao: {
			status: 'PENDENTE',
			descricao: 'Solicitação de retirada cadastrada',
		},
		data: '2026-04-27T15:31:33.16027-03:00',
	},
	{
		visivelAoSolicitante: false,
		usuario: {
			nome: 'operador transito',
			email: 'app@transito.gov.br',
			perfil: 'OPERADOR',
		},
		acao: {
			status: 'AGUARDANDO_REVISAO_DEPARTAMENTO',
			descricao: 'Remoção cadastrada.',
		},
		data: '2026-04-27T14:41:25.57096-03:00',
	},
];
