import { Button } from '@/components/base/button';
import { Card, CardContent } from '@/components/base/card';
import { CONFIG } from '@/config';
import { signInPath } from '@/features/auth/routes/sign-in/route';
import { signUpPath } from '@/features/auth/routes/sign-up/route';
import { painelPath } from '@/features/painel/routes/painel/route';
import { useAutenticacao } from '@/hooks/use-autenticacao';
import { BookOpen, ChevronRight, LayoutDashboard, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';

const exemplosServicos = [
	{
		id: '1',
		titulo: 'Serviço digital A',
		descricao: 'Descrição de exemplo. Substitua pelo serviço real ao estender o portal.',
		icone: LayoutDashboard,
	},
	{
		id: '2',
		titulo: 'Serviço digital B',
		descricao: 'Outro cartão ilustrativo para compor a grade da página inicial.',
		icone: BookOpen,
	},
	{
		id: '3',
		titulo: 'Serviço digital C',
		descricao: 'Após o login, o cidadão acessa o painel com os módulos configurados.',
		icone: LifeBuoy,
	},
];

export const PaginaInicial = () => {
	const { isAuthenticated } = useAutenticacao();

	return (
		<>
			<section className='bg-primary/4 border-b'>
				<section className='relative bg-primary overflow-hidden'>
					<div className='absolute inset-0 bg-linear-to-br from-primary via-primary to-accent opacity-90' />
					<div
						className='absolute inset-0 opacity-10'
						style={{
							backgroundImage:
								"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/G%3E%3C/svg%3E\")",
						}}
					/>
					<div className='w-full max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10 text-center'>
						<h1 className='text-3xl md:text-5xl font-extrabold text-primary-foreground mb-3 tracking-tight'>
							{CONFIG.PROJECT_LABEL}
						</h1>
						<p className='text-primary-foreground/80 text-base md:text-lg max-w-2xl mx-auto mb-8'>
							{CONFIG.PROJECT_SUBTITLE}
						</p>
						<div className='flex flex-wrap gap-3 justify-center'>
							{isAuthenticated ? (
								<Button
									size='lg'
									variant='secondary'
									className='rounded-full font-semibold px-6'
									asChild>
									<Link to={painelPath}>
										<LayoutDashboard className='h-4 w-4 mr-2' />
										Ir para o painel
									</Link>
								</Button>
							) : (
								<>
									<Button
										size='lg'
										variant='secondary'
										className='rounded-full font-semibold px-6'
										asChild>
										<Link to={signInPath}>
											Entrar
										</Link>
									</Button>
									<Button
										size='lg'
										variant='ghost'
										className='rounded-full font-semibold px-6 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10'
										asChild>
										<Link to={signUpPath}>Criar conta</Link>
									</Button>
								</>
							)}
							<Button
								size='lg'
								variant='ghost'
								className='rounded-full font-semibold px-6 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10'
								asChild>
								<a href='#servicos'>Ver serviços</a>
							</Button>
						</div>
					</div>
				</section>
			</section>

			<section id='servicos' className='flex-1'>
				<div className='w-full max-w-7xl mx-auto px-6 py-12 md:py-16'>
					<div className='text-center mb-8'>
						<h2 className='text-xl md:text-2xl font-bold text-foreground mb-1'>
							Serviços (exemplo)
						</h2>
						<p className='text-muted-foreground text-sm'>
							Estes cartões são apenas ilustrativos. Adicione links reais ao implementar
							cada serviço.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
						{exemplosServicos.map((s) => {
							const Icone = s.icone;
							return (
								<div key={s.id} className='group'>
									<Card className='h-full border-0 shadow-md hover:shadow-xl transition-all duration-300'>
										<CardContent className='p-8 text-center space-y-4'>
											<div className='h-14 w-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
												<Icone className='h-7 w-7 text-primary' />
											</div>
											<h3 className='font-bold text-foreground'>{s.titulo}</h3>
											<p className='text-sm text-muted-foreground leading-relaxed'>
												{s.descricao}
											</p>
											<span className='inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground'>
												Exemplo <ChevronRight className='h-3.5 w-3.5' />
											</span>
										</CardContent>
									</Card>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<section id='contato' className='bg-muted/50 border-t'>
				<div className='w-full max-w-7xl mx-auto px-6 py-10'>
					<div className='text-center mb-8'>
						<h2 className='text-xl md:text-2xl font-bold text-foreground mb-1'>
							{CONFIG.CONTATO_TITULO}
						</h2>
						<p className='text-muted-foreground text-sm'>{CONFIG.CONTATO_DESCRICAO}</p>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-w-4xl mx-auto text-center'>
						<div className='flex flex-col items-center gap-2'>
							<div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
								<span className='text-lg'>📞</span>
							</div>
							<span className='font-semibold text-sm text-foreground'>Telefone</span>
							<span className='text-sm text-muted-foreground'>
								{CONFIG.CONTATO_TELEFONE}
							</span>
						</div>
						<div className='flex flex-col items-center gap-2'>
							<div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
								<span className='text-lg'>✉️</span>
							</div>
							<span className='font-semibold text-sm text-foreground'>E-mail</span>
							<span className='text-sm text-muted-foreground'>
								{CONFIG.CONTATO_EMAIL}
							</span>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};
