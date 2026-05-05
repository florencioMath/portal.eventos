export type Perfil = {
	id: string;
	name: string;
};

export type Usuario = {
	id: string;
	name: string;
	email: string;
	profile: Perfil;
	claims: string[];
};

export type EstadoAutenticacao = {
	user: Usuario | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
};

export type ValorContextoAutenticacao = EstadoAutenticacao & {
	entrar: (token: string, user: Usuario) => void;
	sair: () => void;
};
