import { CONFIG } from '@/config';
import { CarrosselEventosHome } from '@/features/eventos/components/carrossel-eventos-home';
import { CarrosselHeroDestaque } from '@/features/eventos/components/carrossel-hero-destaque';
import { EventosApi, ImagensApi } from '@/features/eventos/api/eventos-api';
import { imagemDtoParaDataUrl } from '@/features/eventos/lib/imagem-data-url';
import { eventoListadoNoPortal } from '@/features/eventos/lib/visibilidade-evento';
import type { EventoCadastroDto } from '@/features/eventos/types';
import { useAutenticacao } from '@/hooks/use-autenticacao';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type ItemCarrossel = {
	evento: EventoCadastroDto;
	capaUrl: string | null;
};

export const PaginaInicial = () => {
	const { isAuthenticated } = useAutenticacao();
	const [itens, setItens] = useState<ItemCarrossel[]>([]);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let cancelado = false;
		(async () => {
			try {
				const todos = await EventosApi.listarPublicos();
				const caps = await Promise.all(
					todos.map(async (e) => {
						const imgs = await ImagensApi.listarPorEvento(e.cdEventosCadastro);
						const ord = [...imgs].sort((a, b) => a.ordemExibicao - b.ordemExibicao);
						const cap = ord.find((i) => i.imagemPrincipal) ?? ord[0];
						return imagemDtoParaDataUrl(cap);
					})
				);
				if (!cancelado) {
					setItens(todos.map((evento, i) => ({ evento, capaUrl: caps[i] ?? null })));
				}
			} catch {
				if (!cancelado) {
					toast.error('Não foi possível carregar os eventos.');
					setItens([]);
				}
			} finally {
				if (!cancelado) setCarregando(false);
			}
		})();
		return () => {
			cancelado = true;
		};
	}, []);

	const listadosPortal = useMemo(
		() => itens.filter((x) => eventoListadoNoPortal(x.evento)),
		[itens]
	);

	const heroSlides = useMemo(() => {
		const marcados = listadosPortal.filter((x) => Boolean(x.evento.eventoEmDestaque));
		if (marcados.length > 0) return marcados;
		return listadosPortal.slice(0, 1);
	}, [listadosPortal]);

	return (
		<>
			{carregando ? (
				<section className='relative min-h-[min(92vh,900px)] w-full overflow-hidden bg-background'>
					<div className='flex min-h-[min(92vh,900px)] items-center justify-center bg-muted/40'>
						<div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent' />
					</div>
				</section>
			) : heroSlides.length > 0 ? (
				<CarrosselHeroDestaque
					slides={heroSlides}
					isAuthenticated={isAuthenticated}
					totalListadosNoPortal={listadosPortal.length}
				/>
			) : (
				<section className='relative min-h-[min(92vh,900px)] w-full overflow-hidden bg-background'>
					<div className='flex min-h-[min(70vh,640px)] flex-col items-center justify-center gap-6 px-6 text-center'>
						<h1 className='text-3xl font-bold text-foreground md:text-4xl'>{CONFIG.PROJECT_LABEL}</h1>
						<p className='max-w-md text-muted-foreground'>{CONFIG.PROJECT_SUBTITLE}</p>
						<p className='text-sm text-muted-foreground'>Nenhum evento cadastrado no momento.</p>
					</div>
				</section>
			)}

			<section id='eventos' className='scroll-mt-24 border-t bg-muted/25 py-12 md:py-16'>
				<div className='mx-auto mb-10 max-w-6xl px-5 sm:px-8'>
					<h2 className='text-2xl font-black tracking-tight text-foreground md:text-3xl'>Todos os eventos</h2>
					<p className='mt-2 max-w-2xl text-sm text-muted-foreground md:text-base'>
						Passe pelos cards automaticamente ou arraste para explorar. Cada evento abre a página de detalhes
						com inscrição.
					</p>
				</div>

				<div className='w-full px-3 sm:px-5 md:px-6'>
					{carregando ? null : listadosPortal.length > 0 ? (
						<CarrosselEventosHome itens={listadosPortal} />
					) : null}
				</div>
			</section>

			<section id='contato' className='scroll-mt-24 border-t bg-muted/50'>
				<div className='mx-auto max-w-7xl px-6 py-10'>
					<div className='mb-8 text-center'>
						<h2 className='mb-1 text-xl font-bold text-foreground md:text-2xl'>{CONFIG.CONTATO_TITULO}</h2>
						<p className='text-sm text-muted-foreground'>{CONFIG.CONTATO_DESCRICAO}</p>
					</div>
					<div className='mx-auto grid max-w-4xl grid-cols-1 gap-2 text-center md:grid-cols-2'>
						<div className='flex flex-col items-center gap-2'>
							<div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
								<span className='text-lg'>📞</span>
							</div>
							<span className='text-sm font-semibold text-foreground'>Telefone</span>
							<span className='text-sm text-muted-foreground'>{CONFIG.CONTATO_TELEFONE}</span>
						</div>
						<div className='flex flex-col items-center gap-2'>
							<div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
								<span className='text-lg'>✉️</span>
							</div>
							<span className='text-sm font-semibold text-foreground'>E-mail</span>
							<span className='text-sm text-muted-foreground'>{CONFIG.CONTATO_EMAIL}</span>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};
