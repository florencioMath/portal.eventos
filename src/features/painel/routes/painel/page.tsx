import { Card, CardContent } from '@/components/base/card';
import { itensModuloPainel } from '../../constants';
import { Link } from 'react-router-dom';

export const PaginaPainel = () => {
	return (
		<section className='container'>
			<h2 className='text-xl font-bold mb-6'>Meus serviços</h2>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{itensModuloPainel.map((item) => {
					const Icone = item.icone;

					if (item.tipo === 'em_breve') {
						return (
							<div key={item.id} className='block'>
								<Card
									ativo={false}
									mensagem='Em breve'
									className='h-full border-l-4 border-l-muted-foreground'>
									<CardContent className='p-6 space-y-3'>
										<Icone className='h-8 w-8 text-muted-foreground' />
										<h3 className='font-semibold'>{item.titulo}</h3>
										<p className='text-sm text-muted-foreground'>{item.descricao}</p>
									</CardContent>
								</Card>
							</div>
						);
					}

					if (item.tipo === 'externo' && item.url) {
						return (
							<a key={item.id} href={item.url} target='_blank' rel='noopener noreferrer'>
								<Card className='hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-primary'>
									<CardContent className='p-6 space-y-3'>
										<Icone className='h-8 w-8 text-primary' />
										<h3 className='font-semibold'>{item.titulo}</h3>
										<p className='text-sm text-muted-foreground'>{item.descricao}</p>
									</CardContent>
								</Card>
							</a>
						);
					}

					if (item.tipo === 'interno' && item.path) {
						return (
							<Link key={item.id} to={item.path}>
								<Card className='hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-cyan-600'>
									<CardContent className='p-6 space-y-3'>
										<Icone className='h-8 w-8 text-cyan-600' />
										<h3 className='font-semibold'>{item.titulo}</h3>
										<p className='text-sm text-muted-foreground'>{item.descricao}</p>
									</CardContent>
								</Card>
							</Link>
						);
					}

					return null;
				})}
			</div>
		</section>
	);
};
