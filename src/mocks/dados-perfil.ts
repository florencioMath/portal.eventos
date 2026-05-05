import type { IPerfilData } from '@/features/perfil';

/**
 * Resposta mock de GET /cadastro/dados-usuario (tela Perfil / Editar perfil).
 * Usado quando VITE_MOCK_API=true.
 */
export const DADOS_PERFIL_MOCK: IPerfilData = {
	idUsuario: 'f58e9e7b-756b-461a-b6f1-e576ea8f74b0',
	nome: 'Cidadão',
	dataNascimento: '1990-01-01',
	cpf: '755.263.112-01',
	telefone: '(41)99748-9304',
	cep: '88337460',
	rua: 'Rua Araranguá',
	numero: '123',
	bairro: 'Municípios',
	cidade: 'Balneário Camboriú',
	estado: 'SC',
	email: 'cidadao@transito.gov.br',
	emailRecuperacao: null,
	senha: null,
	confirmarSenha: null,
};
