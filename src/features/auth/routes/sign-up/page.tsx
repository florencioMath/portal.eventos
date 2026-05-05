import { Button } from '@/components/base/button';
import { CONFIG } from '@/config';
import { Input } from '@/components/base/input';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { buscarCep } from '@/lib/cep';
import { maskCEP, maskCPF, maskDate, maskPhone } from '@/lib/utils';
import axios from 'axios';
import { Calendar, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ServicoAutenticacao } from '../../api/service';
import { signInPath } from '../sign-in/route';

export const PaginaCriarConta = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [loadingAddress, setLoadingAddress] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	const [cpfExistente, setCpfExistente] = useState(false);
	const [dataNascimentoExibicao, setDataNascimentoExibicao] = useState('');

	const [aceitoTermos, setAceitoTermos] = useState(false);

	const [formData, setFormData] = useState<SignUpData>({
		idUsuario: '',
		nome: '',
		dataNascimento: '',
		cpf: '',
		telefone: '',
		cep: '',
		rua: '',
		numero: '',
		bairro: '',
		cidade: '',
		estado: '',
		email: '',
		emailRecuperacao: '',
		senha: '',
		confirmarSenha: '',
	});

	const handleDataNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const masked = maskDate(e.target.value);
		setDataNascimentoExibicao(masked);

		const partes = masked.split('/');
		if (partes.length === 3 && partes[2].length === 4) {
			const iso = `${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`;
			setFormData({ ...formData, dataNascimento: iso });
		} else {
			setFormData({ ...formData, dataNascimento: '' });
		}
	};

	const searchCep = async (cep: string) => {
		setLoadingAddress(true);
		try {
			const res = await buscarCep(cep);
			setFormData((prev) => ({
				...prev,
				cep: res.zipcode,
				estado: res.state,
				cidade: res.city,
				rua: res.street,
				bairro: res.neighborhood,
			}));
			toast.success('Endereço preenchido com sucesso!');
		} catch {
			toast.error('CEP não encontrado');
		} finally {
			setLoadingAddress(false);
		}
	};

	const verificarCpfExistente = async (cpf: string) => {
		try {
			const cpfLimpo = cpf.replace(/\D/g, '');
			if (cpfLimpo.length !== 11) return;
			const exists = await ServicoAutenticacao.cpfJaCadastrado(cpfLimpo);
			setCpfExistente(exists);
			if (exists) {
				setFormData((prev) => ({ ...prev, cpf: '' }));
			}
		} catch (error: any) {
			if (error?.response?.status === 400) {
				toast.error(error.response.data?.message ?? 'CPF inválido');
				setFormData((prev) => ({ ...prev, cpf: '' }));
			}
			console.error('Erro ao verificar CPF:', error);
			setCpfExistente(false);
		}
	};

	const validateForm = () => {
		if (!formData.nome.trim()) {
			toast.error('Nome é obrigatório');
			return false;
		}
		if (!formData.dataNascimento) {
			toast.error('Data de nascimento é obrigatória');
			return false;
		}

		const cpfLimpo = formData.cpf.replace(/\D/g, '');
		if (cpfLimpo.length !== 11) {
			toast.error('CPF inválido');
			return false;
		}

		const telefoneLimpo = formData.telefone.replace(/\D/g, '');
		if (telefoneLimpo.length !== 11) {
			toast.error('Telefone inválido');
			return false;
		}

		const cepLimpo = formData.cep.replace(/\D/g, '');
		if (cepLimpo.length !== 8) {
			toast.error('CEP inválido');
			return false;
		}

		if (!formData.rua.trim()) {
			toast.error('Rua é obrigatória');
			return false;
		}
		if (!formData.numero.trim()) {
			toast.error('Número é obrigatório');
			return false;
		}
		if (!formData.bairro.trim()) {
			toast.error('Bairro é obrigatório');
			return false;
		}
		if (!formData.cidade.trim()) {
			toast.error('Cidade é obrigatória');
			return false;
		}
		if (!formData.estado.trim()) {
			toast.error('Estado é obrigatório');
			return false;
		}
		if (!formData.email.trim() || !formData.email.includes('@')) {
			toast.error('E-mail inválido');
			return false;
		}
		if (formData.senha.length < 6) {
			toast.error('A senha deve ter no mínimo 6 caracteres');
			return false;
		}
		if (formData.senha !== formData.confirmarSenha) {
			toast.error('As senhas não coincidem');
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		if (cpfExistente) {
			toast.error('CPF já cadastrado');
			return;
		}

		setIsLoading(true);
		try {
			const payload: SignUpData = {
				...formData,
				cpf: formData.cpf.replace(/\D/g, ''),
				telefone: formData.telefone.replace(/\D/g, ''),
				cep: formData.cep.replace(/\D/g, ''),
			};

			await ServicoAutenticacao.cadastrarUsuario(payload);
			toast.success('Cadastro realizado com sucesso!');
			navigate(signInPath);
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				try {
					const rawMessage = error.response?.data?.message;

					const parsed = JSON.parse(rawMessage);

					const mensagens = parsed?.errors?.Mensagens;
					const errorMsg =
						Array.isArray(mensagens) && mensagens.length > 0
							? mensagens[0]
							: (parsed?.title ?? 'Erro ao realizar cadastro');

					toast.error(errorMsg);
				} catch {
					toast.error('Erro ao realizar cadastro');
				}
			} else {
				toast.error('Erro inesperado');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 py-8 px-4'>
			<div className='max-w-4xl mx-auto'>
				<div className='flex flex-col items-center justify-center text-center mb-8'>
					<div className='flex justify-center mb-4'>
						<img src={CONFIG.LOGO_SRC} alt='Logo' className='h-32 w-auto' />
					</div>
					<div className='leading-tight'>
						<span className='text-3xl font-bold text-gray-900 mb-2 tracking-wide'>
							{CONFIG.PROJECT_LABEL}
						</span>
						<p className='text-gray-600'>Preencha os dados abaixo para se cadastrar</p>
					</div>
				</div>

				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8'>
					<form onSubmit={handleSubmit}>
						<section className='grid grid-cols-1 gap-4 mb-6 md:grid-cols-2'>
							<div className='col-span-2'>
								<label
									htmlFor='nome'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Nome *
								</label>
								<Input
									id='nome'
									type='text'
									placeholder='Informe o Nome'
									value={formData.nome}
									onChange={(e) =>
										setFormData({ ...formData, nome: e.target.value })
									}
									disabled={isLoading}
									className='h-11'
								/>
							</div>

							<div className='col-span-2'>
								<label
									htmlFor='dataNascimento'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Data de Nascimento *
								</label>
								<div className='relative'>
									<Calendar
										className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
										size={20}
									/>
									<Input
										id='dataNascimento'
										type='text'
										placeholder='DD/MM/AAAA'
										value={dataNascimentoExibicao}
										onChange={handleDataNascimentoChange}
										disabled={isLoading}
										className='h-11 pl-10'
									/>
								</div>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='cpf'
									className='block mb-2 text-sm font-medium text-gray-700'>
									CPF *
								</label>
								<div className='flex flex-col items-start'>
									<Input
										id='cpf'
										type='text'
										placeholder='000.000.000-00'
										value={formData.cpf}
										onChange={(e) =>
											setFormData({
												...formData,
												cpf: maskCPF(e.target.value),
											})
										}
										onBlur={(e) => verificarCpfExistente(e.target.value)}
										disabled={isLoading}
										className='h-11 w-full'
									/>
									{cpfExistente && (
										<span className='mt-1 text-sm text-red-500'>
											Já existe um usuário cadastrado neste CPF.
										</span>
									)}
								</div>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='telefone'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Telefone *
								</label>
								<Input
									id='telefone'
									type='text'
									placeholder='(00) 00000-0000'
									value={formData.telefone}
									onChange={(e) =>
										setFormData({
											...formData,
											telefone: maskPhone(e.target.value),
										})
									}
									disabled={isLoading}
									className='h-11'
								/>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='cep'
									className='block mb-2 text-sm font-medium text-gray-700'>
									CEP *
								</label>
								<div className='relative'>
									<Input
										id='cep'
										type='text'
										placeholder='00000-000'
										value={formData.cep}
										onChange={(e) =>
											setFormData({
												...formData,
												cep: maskCEP(e.target.value),
											})
										}
										onBlur={(e) => {
											const cep = e.target.value.replace(/\D/g, '');
											if (cep.length === 8) searchCep(cep);
											else if (cep.length > 0)
												toast.error(
													'CEP inválido. Certifique-se de que contém 8 dígitos.'
												);
										}}
										disabled={isLoading || loadingAddress}
										className='h-11'
									/>
									{loadingAddress && (
										<div className='absolute right-3 top-1/2 -translate-y-1/2'>
											<div className='h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
										</div>
									)}
								</div>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='rua'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Rua *
								</label>
								<Input
									id='rua'
									type='text'
									placeholder='Rua'
									value={formData.rua}
									onChange={(e) =>
										setFormData({ ...formData, rua: e.target.value })
									}
									disabled={isLoading || loadingAddress}
									className='h-11'
								/>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='numero'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Número *
								</label>
								<Input
									id='numero'
									type='text'
									placeholder='Número'
									value={formData.numero}
									onChange={(e) =>
										setFormData({ ...formData, numero: e.target.value })
									}
									disabled={isLoading || loadingAddress}
									className='h-11'
								/>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='bairro'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Bairro *
								</label>
								<Input
									id='bairro'
									type='text'
									placeholder='Bairro'
									value={formData.bairro}
									onChange={(e) =>
										setFormData({ ...formData, bairro: e.target.value })
									}
									disabled={isLoading || loadingAddress}
									className='h-11'
								/>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='cidade'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Cidade *
								</label>
								<Input
									id='cidade'
									type='text'
									placeholder='Cidade'
									value={formData.cidade}
									onChange={(e) =>
										setFormData({ ...formData, cidade: e.target.value })
									}
									disabled={isLoading || loadingAddress}
									className='h-11'
								/>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='estado'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Estado *
								</label>
								<Input
									id='estado'
									type='text'
									placeholder='Estado'
									value={formData.estado}
									onChange={(e) =>
										setFormData({ ...formData, estado: e.target.value })
									}
									disabled={isLoading || loadingAddress}
									className='h-11'
									maxLength={2}
								/>
							</div>

							<div className='col-span-2'>
								<label
									htmlFor='email'
									className='block mb-2 text-sm font-medium text-gray-700'>
									E-mail *
								</label>
								<Input
									id='email'
									type='email'
									placeholder='seu@email.com'
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									disabled={isLoading}
									className='h-11'
								/>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='senha'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Senha *
								</label>
								<div className='relative'>
									<Input
										id='senha'
										type={passwordVisible ? 'text' : 'password'}
										placeholder='Informe a Senha'
										value={formData.senha}
										onChange={(e) =>
											setFormData({ ...formData, senha: e.target.value })
										}
										disabled={isLoading}
										className='h-11 pr-10'
									/>
									<button
										type='button'
										onClick={() => setPasswordVisible(!passwordVisible)}
										className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
										disabled={isLoading}>
										{passwordVisible ? (
											<EyeOff className='h-5 w-5' />
										) : (
											<Eye className='h-5 w-5' />
										)}
									</button>
								</div>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='confirmarSenha'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Confirmar Senha *
								</label>
								<div className='relative'>
									<Input
										id='confirmarSenha'
										type={confirmPasswordVisible ? 'text' : 'password'}
										placeholder='Confirme a Senha'
										value={formData.confirmarSenha}
										onChange={(e) =>
											setFormData({
												...formData,
												confirmarSenha: e.target.value,
											})
										}
										disabled={isLoading}
										className='h-11 pr-10'
									/>
									<button
										type='button'
										onClick={() =>
											setConfirmPasswordVisible(!confirmPasswordVisible)
										}
										className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
										disabled={isLoading}>
										{confirmPasswordVisible ? (
											<EyeOff className='h-5 w-5' />
										) : (
											<Eye className='h-5 w-5' />
										)}
									</button>
								</div>
							</div>
						</section>

						<div className='mb-6'>
							<label className='flex items-center gap-2 cursor-pointer'>
								<input
									type='checkbox'
									checked={aceitoTermos}
									onChange={(e) => setAceitoTermos(e.target.checked)}
									disabled={isLoading}
									className='h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
								/>
								<span className='text-sm text-gray-700'>
									Aceito os termos de serviço.{' '}
									<Dialog>
										<DialogTrigger asChild>
											<button
												type='button'
												className='text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer'>
												Ver termos
											</button>
										</DialogTrigger>
										<DialogContent className='max-h-[80vh] overflow-y-auto'>
											<DialogHeader>
												<DialogTitle>Termos de Serviço</DialogTitle>
											</DialogHeader>
											<p className='text-sm text-gray-600 leading-relaxed'>
												Ao aceitar este termo, o usuário declara, sob sua
												inteira responsabilidade, que todas as informações e
												documentos fornecidos no sistema são verdadeiros,
												completos e atualizados. Declara, ainda, estar
												ciente de que seu acesso autenticado ao sistema será
												utilizado como assinatura eletrônica, para fins de
												abertura, validação e tramitação de protocolos,
												produzindo os mesmos efeitos legais de uma
												assinatura manual, nos termos da legislação vigente.
											</p>
										</DialogContent>
									</Dialog>
								</span>
							</label>
						</div>

						<Button
							type='submit'
							className='w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium'
							disabled={isLoading || !aceitoTermos}>
							{isLoading ? (
								<>
									<div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
									Cadastrando...
								</>
							) : (
								'Criar Conta'
							)}
						</Button>
					</form>
				</div>

				<p className='mt-6 text-center text-sm text-gray-600'>
					Já tem uma conta?{' '}
					<Link
						to={signInPath}
						className='text-blue-600 hover:text-blue-700 font-medium transition-colors'>
						Fazer login
					</Link>
				</p>
			</div>
		</div>
	);
};
