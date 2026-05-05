/**
 * Tipos da feature painel
 */

/**
 * Representa um item de painel
 */
export type Painel = {
	id: string | number;
	// Adicione aqui os campos do seu modelo
	createdAt?: string;
	updatedAt?: string;
};

/**
 * Dados para criar um novo painel
 */
export type CreatePainelRequest = {
	// Adicione aqui os campos necessários para criação
};

/**
 * Dados para atualizar um painel
 */
export type UpdatePainelRequest = {
	// Adicione aqui os campos que podem ser atualizados
};

/**
 * Resposta da API ao listar painel
 */
export type ListPainelResponse = {
	data: Painel[];
	total?: number;
	page?: number;
	pageSize?: number;
};
