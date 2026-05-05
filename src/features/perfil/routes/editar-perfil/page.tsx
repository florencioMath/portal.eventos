import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { buscarCep } from '@/lib/cep';
import { Calendar, Eye, EyeOff, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ServicoPerfil } from '../../api/service';
import type { IPerfilData } from '../../types';

export const PaginaEditarPerfil = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingSenha, setIsLoadingSenha] = useState(false);
	const [loadingData, setLoadingData] = useState(true);
	const [senhaAtual, setSenhaAtual] = useState('');
	const [senhaAtualVisible, setSenhaAtualVisible] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	const [loadingAddress, setLoadingAddress] = useState(false);
	const [senhaData, setSenhaData] = useState({ novaSenha: '', confirmarSenha: '' });

	const [formData, setFormData] = useState<IPerfilData>({
		idUsuario: '',
		nome: '',
		dataNascimento: null,
		cpf: '',
		telefone: '',
		cep: '',
		rua: '',
		numero: '',
		bairro: '',
		cidade: '',
		estado: '',
		email: '',
		senha: null,
		confirmarSenha: null,
	});

	useEffect(() => {
		loadUserData();
	}, []);

	const loadUserData = async () => {
		setLoadingData(true);
		try {
			const response = await ServicoPerfil.obterPerfil();
			setFormData({
				...response,
				senha: null,
				confirmarSenha: null,
				telefone: response.telefone ?? '',
				cep: response.cep ?? '',
				rua: response.rua ?? '',
				numero: response.numero ?? '',
				bairro: response.bairro ?? '',
				cidade: response.cidade ?? '',
				estado: response.estado ?? '',
			});
		} catch (error) {
			toast.error('Erro ao carregar dados do usuário');
		} finally {
			setLoadingData(false);
		}
	};

	const applyPhoneMask = (value: string) => {
		const numbers = value.replace(/\D/g, '');
		return numbers
			.replace(/(\d{2})(\d)/, '($1) $2')
			.replace(/(\d{5})(\d)/, '$1-$2')
			.slice(0, 15);
	};

	const applyCEPMask = (value: string) => {
		const numbers = value.replace(/\D/g, '');
		return numbers.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
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

	const validateForm = () => {
		if (!formData.nome.trim()) {
			toast.error('Nome é obrigatório');
			return false;
		}
		const telefoneLimpo = formData.telefone.replace(/\D/g, '');
		if (telefoneLimpo.length !== 11) {
			toast.error('Telefone inválido');
			return false;
		}
		const cepLimpo = formData.cep?.replace(/\D/g, '') ?? '';
		if (cepLimpo.length !== 8) {
			toast.error('CEP inválido');
			return false;
		}
		if (!formData.rua?.trim()) {
			toast.error('Rua é obrigatória');
			return false;
		}
		if (!String(formData.numero ?? '').trim()) {
			toast.error('Número é obrigatório');
			return false;
		}
		if (!formData.bairro?.trim()) {
			toast.error('Bairro é obrigatório');
			return false;
		}
		if (!formData.cidade?.trim()) {
			toast.error('Cidade é obrigatória');
			return false;
		}
		if (!formData.estado?.trim()) {
			toast.error('Estado é obrigatório');
			return false;
		}
		if (!formData.email.trim() || !formData.email.includes('@')) {
			toast.error('E-mail inválido');
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);
		try {
			const payload: IPerfilData = {
				idUsuario: formData.idUsuario,
				nome: formData.nome,
				cpf: formData.cpf,
				dataNascimento: formData.dataNascimento,
				telefone: formData.telefone.replace(/\D/g, ''),
				cep: formData.cep?.replace(/\D/g, '') ?? null,
				rua: formData.rua,
				numero: formData.numero,
				bairro: formData.bairro,
				cidade: formData.cidade,
				estado: formData.estado,
				email: formData.email,
				senha: null,
				confirmarSenha: null,
			};

			await ServicoPerfil.atualizarPerfil(payload);
			toast.success('Cadastro atualizado com sucesso!');
			navigate(-1);
		} catch (error) {
			toast.error('Erro ao atualizar cadastro. Tente novamente.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmitSenha = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.idUsuario) {
			return;
		}

		if (!senhaAtual.trim()) {
			toast.error('Informe a senha atual');
			return;
		}
		if (!senhaData.novaSenha || senhaData.novaSenha.length < 6) {
			toast.error('A nova senha deve ter no mínimo 6 caracteres');
			return;
		}
		if (senhaData.novaSenha !== senhaData.confirmarSenha) {
			toast.error('As senhas não coincidem');
			return;
		}

		setIsLoadingSenha(true);
		try {
			await ServicoPerfil.trocarSenha({
				idUsuario: formData.idUsuario,
				senhaAtual,
				novaSenha: senhaData.novaSenha,
				confirmacaoNovaSenha: senhaData.confirmarSenha,
			});
			toast.success('Senha alterada com sucesso!');
			setSenhaAtual('');
			setSenhaData({ novaSenha: '', confirmarSenha: '' });
		} catch (error) {
			toast.error('Erro ao alterar senha. Verifique a senha atual.');
		} finally {
			setIsLoadingSenha(false);
		}
	};

	if (loadingData) {
		return (
			<div className='min-h-screen bg-gray-50 py-8 px-4'>
				<div className='max-w-4xl mx-auto'>
					<div className='flex flex-col items-center justify-center text-center mb-8'>
						<div className='h-16 w-16 rounded-lg bg-gray-200 animate-pulse mb-4'></div>
						<div className='h-8 w-64 bg-gray-200 rounded animate-pulse mb-2'></div>
						<div className='h-4 w-48 bg-gray-200 rounded animate-pulse'></div>
					</div>
					<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8'>
						<section className='grid grid-cols-1 gap-4 mb-6 md:grid-cols-2'>
							{[...Array(14)].map((_, i) => (
								<div
									key={i}
									className={
										i === 0 || i === 1 || i === 12 || i === 13
											? 'col-span-2'
											: 'col-span-2 sm:col-span-1'
									}>
									<div className='h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse'></div>
									<div className='h-11 bg-gray-200 rounded w-full animate-pulse'></div>
								</div>
							))}
						</section>
						<div className='flex gap-4'>
							<div className='flex-1 h-11 bg-gray-200 rounded animate-pulse'></div>
							<div className='flex-1 h-11 bg-gray-200 rounded animate-pulse'></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-8 px-4'>
			<div className='max-w-4xl mx-auto'>
				<div className='flex flex-col items-center justify-center text-center mb-8'>
					<div className='h-16 w-16 rounded-lg bg-primary flex items-center justify-center mb-4'>
						<Shield className='h-14 w-14 text-primary-foreground' />
					</div>
					<div className='leading-tight'>
						<span className='text-3xl font-bold text-gray-900 mb-2 tracking-wide'>
							EDITAR CADASTRO
						</span>
						<p className='text-gray-600'>Atualize suas informações pessoais</p>
					</div>
				</div>

				{/* ─── Form Dados do Perfil ─── */}
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
									Data de Nascimento
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
										value={
											formData.dataNascimento
												? formData.dataNascimento
														.split('T')[0]
														.split('-')
														.reverse()
														.join('/')
												: '—'
										}
										disabled
										className='h-11 pl-10 bg-gray-100 cursor-not-allowed'
									/>
								</div>
								<p className='mt-1 text-xs text-gray-500'>
									A data de nascimento não pode ser alterada
								</p>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='cpf'
									className='block mb-2 text-sm font-medium text-gray-700'>
									CPF *
								</label>
								<Input
									id='cpf'
									type='text'
									placeholder='000.000.000-00'
									value={formData.cpf}
									disabled
									className='h-11 bg-gray-100 cursor-not-allowed'
								/>
								<p className='mt-1 text-xs text-gray-500'>
									O CPF não pode ser alterado
								</p>
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
									value={applyPhoneMask(formData.telefone)}
									onChange={(e) =>
										setFormData({
											...formData,
											telefone: applyPhoneMask(e.target.value),
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
										value={applyCEPMask(formData.cep ?? '')}
										onChange={(e) =>
											setFormData({
												...formData,
												cep: applyCEPMask(e.target.value),
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
									value={formData.rua ?? ''}
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
									value={formData.numero ?? ''}
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
									value={formData.bairro ?? ''}
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
									value={formData.cidade ?? ''}
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
									value={formData.estado ?? ''}
									onChange={(e) =>
										setFormData({ ...formData, estado: e.target.value })
									}
									disabled={isLoading || loadingAddress}
									className='h-11'
									maxLength={2}
								/>
							</div>

							<div className='col-span-2 sm:col-span-1'>
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
						</section>

						<div className='flex gap-4'>
							<Button
								type='button'
								onClick={() => navigate(-1)}
								className='flex-1 h-11 bg-gray-500 hover:bg-gray-600 text-white font-medium'
								disabled={isLoading}>
								Cancelar
							</Button>
							<Button
								type='submit'
								className='flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium'
								disabled={isLoading}>
								{isLoading ? (
									<>
										<div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
										Salvando...
									</>
								) : (
									'Salvar Alterações'
								)}
							</Button>
						</div>
					</form>
				</div>

				{/* ─── Form Alterar Senha ─── */}
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-6'>
					<h3 className='text-lg font-medium text-gray-900 mb-1'>Alterar Senha</h3>
					<p className='text-sm text-gray-600 mb-6'>
						Preencha os campos abaixo para alterar sua senha
					</p>

					<form onSubmit={handleSubmitSenha}>
						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							<div className='col-span-2'>
								<label
									htmlFor='senhaAtual'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Senha Atual
								</label>
								<div className='relative'>
									<Input
										id='senhaAtual'
										type={senhaAtualVisible ? 'text' : 'password'}
										placeholder='Informe a Senha Atual'
										value={senhaAtual}
										onChange={(e) => setSenhaAtual(e.target.value)}
										disabled={isLoadingSenha}
										className='h-11 pr-10'
									/>
									<button
										type='button'
										onClick={() => setSenhaAtualVisible(!senhaAtualVisible)}
										className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
										disabled={isLoadingSenha}>
										{senhaAtualVisible ? (
											<EyeOff className='h-5 w-5' />
										) : (
											<Eye className='h-5 w-5' />
										)}
									</button>
								</div>
							</div>

							<div className='col-span-2 sm:col-span-1'>
								<label
									htmlFor='novaSenha'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Nova Senha
								</label>
								<div className='relative'>
									<Input
										id='novaSenha'
										type={passwordVisible ? 'text' : 'password'}
										placeholder='Informe a Nova Senha'
										value={senhaData.novaSenha}
										onChange={(e) =>
											setSenhaData({
												...senhaData,
												novaSenha: e.target.value,
											})
										}
										disabled={isLoadingSenha}
										className='h-11 pr-10'
									/>
									<button
										type='button'
										onClick={() => setPasswordVisible(!passwordVisible)}
										className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
										disabled={isLoadingSenha}>
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
									htmlFor='confirmarNovaSenha'
									className='block mb-2 text-sm font-medium text-gray-700'>
									Confirmar Nova Senha
								</label>
								<div className='relative'>
									<Input
										id='confirmarNovaSenha'
										type={confirmPasswordVisible ? 'text' : 'password'}
										placeholder='Confirme a Nova Senha'
										value={senhaData.confirmarSenha}
										onChange={(e) =>
											setSenhaData({
												...senhaData,
												confirmarSenha: e.target.value,
											})
										}
										disabled={isLoadingSenha}
										className='h-11 pr-10'
									/>
									<button
										type='button'
										onClick={() =>
											setConfirmPasswordVisible(!confirmPasswordVisible)
										}
										className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
										disabled={isLoadingSenha}>
										{confirmPasswordVisible ? (
											<EyeOff className='h-5 w-5' />
										) : (
											<Eye className='h-5 w-5' />
										)}
									</button>
								</div>
							</div>
						</div>

						<div className='mt-6'>
							<Button
								type='submit'
								className='w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium'
								disabled={isLoadingSenha}>
								{isLoadingSenha ? (
									<>
										<div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
										Alterando...
									</>
								) : (
									'Alterar Senha'
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
