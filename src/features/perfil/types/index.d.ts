export interface IPerfilData {
	idUsuario?: string;
	nome: string;
	dataNascimento: string | null;
	cpf: string;
	telefone: string;
	cep: string | null;
	rua: string | null;
	numero: string | null;
	bairro: string | null;
	cidade: string | null;
	estado: string | null;
	email: string;
	emailRecuperacao?: string | null;
	senha?: string | null;
	confirmarSenha?: string | null;
}
