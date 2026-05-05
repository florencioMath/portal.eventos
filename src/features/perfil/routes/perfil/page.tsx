import { Button } from '@/components/base/button';
import {
	ArrowLeft,
	Calendar,
	CreditCard,
	Edit,
	Mail,
	MapPin,
	Phone,
	Shield,
	User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ServicoPerfil } from '../../api/service';
import type { IPerfilData } from '../../types';

export const PaginaPerfil = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [userData, setUserData] = useState<IPerfilData | null>(null);

	useEffect(() => {
		carregarPerfil();
	}, []);

	const carregarPerfil = async () => {
		setLoading(true);
		try {
			const response = await ServicoPerfil.obterPerfil();
			setUserData(response);
		} catch (error) {
			toast.error('Erro ao carregar perfil');
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (date: string | null) => {
		if (!date) return '—';
		return date.split('T')[0].split('-').reverse().join('/');
	};

	const hasAddress =
		userData?.rua ||
		userData?.numero ||
		userData?.bairro ||
		userData?.cidade ||
		userData?.estado ||
		userData?.cep;

	if (loading) {
		return (
			<div className='min-h-screen bg-gray-50 py-8 px-4'>
				<div className='max-w-4xl mx-auto'>
					<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
						<div className='bg-linear-to-r from-primary to-primary/90 px-6 py-4'>
							<div className='h-6 bg-white/20 rounded w-48 animate-pulse'></div>
						</div>
						<div className='p-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								{[...Array(6)].map((_, i) => (
									<div key={i} className='space-y-2'>
										<div className='h-4 bg-gray-200 rounded w-24 animate-pulse'></div>
										<div className='h-5 bg-gray-300 rounded w-full animate-pulse'></div>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6'>
						<div className='bg-linear-to-r from-primary to-primary/90 px-6 py-4'>
							<div className='h-6 bg-white/20 rounded w-32 animate-pulse'></div>
						</div>
						<div className='p-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								{[...Array(5)].map((_, i) => (
									<div key={i} className='space-y-2'>
										<div className='h-4 bg-gray-200 rounded w-20 animate-pulse'></div>
										<div className='h-5 bg-gray-300 rounded w-full animate-pulse'></div>
									</div>
								))}
								<div className='md:col-span-2 mt-4'>
									<div className='h-16 bg-gray-200 rounded animate-pulse'></div>
								</div>
							</div>
						</div>
					</div>

					<div className='mt-6 flex justify-center'>
						<div className='h-11 bg-gray-300 rounded w-48 animate-pulse'></div>
					</div>
				</div>
			</div>
		);
	}

	if (!userData) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-gray-600'>Erro ao carregar dados do perfil</p>
				</div>
			</div>
		);
	}

	return (
		<section className='container'>
			<Button variant='ghost' size='sm' className='mb-4' onClick={() => navigate('/painel')}>
				<ArrowLeft className='h-4 w-4 mr-2' />
				Voltar
			</Button>

			<section>
				<div className='max-w-4xl mx-auto'>
					{/* Informações Pessoais */}
					<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
						<div className='bg-linear-to-r from-primary to-primary/90 px-6 py-4 flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<Shield className='h-6 w-6 text-white' />
								<h2 className='text-xl font-semibold text-white'>
									Informações Pessoais
								</h2>
							</div>
							<Button
								onClick={() => navigate('/perfil/editar-perfil')}
								className='bg-white text-blue-600 hover:bg-gray-100 font-medium h-9'>
								<Edit className='h-4 w-4 mr-2' />
								Editar Cadastro
							</Button>
						</div>

						<div className='p-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div className='space-y-1'>
									<div className='flex items-center gap-2 text-sm text-gray-500 mb-1'>
										<User className='h-4 w-4' />
										<span className='font-medium'>Nome Completo</span>
									</div>
									<p className='text-gray-900 font-medium pl-6'>
										{userData.nome}
									</p>
								</div>

								<div className='space-y-1'>
									<div className='flex items-center gap-2 text-sm text-gray-500 mb-1'>
										<CreditCard className='h-4 w-4' />
										<span className='font-medium'>CPF</span>
									</div>
									<p className='text-gray-900 font-medium pl-6'>{userData.cpf}</p>
								</div>

								<div className='space-y-1'>
									<div className='flex items-center gap-2 text-sm text-gray-500 mb-1'>
										<Calendar className='h-4 w-4' />
										<span className='font-medium'>Data de Nascimento</span>
									</div>
									<p className='text-gray-900 font-medium pl-6'>
										{formatDate(userData.dataNascimento)}
									</p>
								</div>

								<div className='space-y-1'>
									<div className='flex items-center gap-2 text-sm text-gray-500 mb-1'>
										<Phone className='h-4 w-4' />
										<span className='font-medium'>Telefone</span>
									</div>
									<p className='text-gray-900 font-medium pl-6'>
										{userData.telefone || '—'}
									</p>
								</div>

								<div className='space-y-1 md:col-span-2'>
									<div className='flex items-center gap-2 text-sm text-gray-500 mb-1'>
										<Mail className='h-4 w-4' />
										<span className='font-medium'>E-mail Principal</span>
									</div>
									<p className='text-gray-900 font-medium pl-6'>
										{userData.email}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Endereço */}
					<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6'>
						<div className='bg-linear-to-r from-primary to-primary/90 px-6 py-4 flex items-center gap-3'>
							<MapPin className='h-6 w-6 text-white' />
							<h2 className='text-xl font-semibold text-white'>Endereço</h2>
						</div>

						<div className='p-6'>
							{hasAddress ? (
								<>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<div className='space-y-1'>
											<p className='text-sm text-gray-500 font-medium'>CEP</p>
											<p className='text-gray-900 font-medium'>
												{userData.cep ?? '—'}
											</p>
										</div>

										<div className='space-y-1'>
											<p className='text-sm text-gray-500 font-medium'>
												Cidade/Estado
											</p>
											<p className='text-gray-900 font-medium'>
												{userData.cidade ?? '—'}/{userData.estado ?? '—'}
											</p>
										</div>

										<div className='space-y-1 md:col-span-2'>
											<p className='text-sm text-gray-500 font-medium'>Rua</p>
											<p className='text-gray-900 font-medium'>
												{userData.rua ?? '—'}
											</p>
										</div>

										<div className='space-y-1'>
											<p className='text-sm text-gray-500 font-medium'>
												Número
											</p>
											<p className='text-gray-900 font-medium'>
												{userData.numero ?? '—'}
											</p>
										</div>

										<div className='space-y-1'>
											<p className='text-sm text-gray-500 font-medium'>
												Bairro
											</p>
											<p className='text-gray-900 font-medium'>
												{userData.bairro ?? '—'}
											</p>
										</div>
									</div>

									<div className='mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
										<p className='text-sm text-gray-700'>
											<span className='font-semibold'>
												Endereço Completo:
											</span>{' '}
											{userData.rua}, {userData.numero} - {userData.bairro},{' '}
											{userData.cidade}/{userData.estado} - CEP:{' '}
											{userData.cep}
										</p>
									</div>
								</>
							) : (
								<p className='text-gray-500 text-sm'>Nenhum endereço cadastrado.</p>
							)}
						</div>
					</div>
				</div>
			</section>
		</section>
	);
};
