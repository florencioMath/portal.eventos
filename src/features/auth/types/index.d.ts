type SignInRequest = {
	login: string;
	senha: string;
	ambiente?: string;
};

type SignInResponse = {
	token: string;
	user: {
		id: string;
		name: string;
		email: string;
		profile: {
			id: string;
			name: string;
		};
		claims: string[];
	};
};

interface SignUpRequest {
	displayName: string;
	dataNascimento: string;
	userName: string;
	phoneNumber: string;
	endereco: {
		cep: string;
		rua: string;
		numero: string;
		bairro: string;
		cidade: string;
		estado: string;
	};
	email: string;
	normalizedEmail: string;
	senha: string;
}

interface CepResponse {
	city: string;
	id: string;
	isOfficialAddress: boolean;
	lat: string;
	longitude: string;
	neighborhood: string;
	region: string;
	source: string;
	state: string;
	street: string;
	zipcode: string;
}

interface DatabaseAddress {
	status: boolean;
	zipCode: string;
	state: string;
	city: string;
	street: string;
	neighborhood: string;
	lat: string;
	long: string;
	id?: string;
	isOfficialAddress: boolean;
	region: string;
}

interface SignUpData {
	idUsuario: string;
	nome: string;
	dataNascimento: string;
	cpf: string;
	telefone: string;
	cep: string;
	rua: string;
	numero: string;
	bairro: string;
	cidade: string;
	estado: string;
	email: string;
	emailRecuperacao: string;
	senha: string;
	confirmarSenha: string;
}

type SendWhatsAppCodeResponse = {
	telefoneMascarado: string;
	mensagem: string;
};
