import axios from 'axios';

const VIACEP_BASE = 'https://viacep.com.br/ws';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

interface ViaCepResponse {
	cep: string;
	logradouro: string;
	complemento: string;
	bairro: string;
	localidade: string;
	uf: string;
	erro?: boolean;
}

function viaCepToCepResponse(data: ViaCepResponse): CepResponse {
	return {
		city: data.localidade,
		id: '',
		isOfficialAddress: false,
		lat: '',
		longitude: '',
		neighborhood: data.bairro,
		region: '',
		source: 'viacep',
		state: data.uf,
		street: data.logradouro,
		zipcode: data.cep?.replace(/\D/g, ''),
	};
}

async function buscarCepInterno(cep: string): Promise<CepResponse> {
	const response = await axios.get<CepResponse>(`${API_BASE}/endereco/buscar-por-cep/${cep}`);
	if (!response.data || response.status === 204) {
		throw new Error('CEP não encontrado');
	}
	return response.data;
}

async function buscarCepViaCep(cep: string): Promise<CepResponse> {
	const response = await axios.get<ViaCepResponse>(`${VIACEP_BASE}/${cep}/json/`);
	if (!response.data || response.data.erro) {
		throw new Error('CEP não encontrado');
	}
	return viaCepToCepResponse(response.data);
}

export async function buscarCep(cep: string): Promise<CepResponse> {
	try {
		return await buscarCepInterno(cep);
	} catch {
		return await buscarCepViaCep(cep);
	}
}
