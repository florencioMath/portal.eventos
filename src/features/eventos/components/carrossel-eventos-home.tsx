import { eventoDetalhePath } from '@/features/eventos/routes/evento-detalhe/route';
import { formatarEventoDataPeriodoPt } from '@/features/eventos/lib/datas-evento';
import { resumoLocalEvento } from '@/features/eventos/lib/visibilidade-evento';
import type { EventoCadastroDto } from '@/features/eventos/types';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { CalendarDays, ChevronRight, MapPin, Users } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export type SlideEvento = {
	evento: EventoCadastroDto;
	capaUrl: string | null;
};

type Props = {
	itens: SlideEvento[];
};

export function CarrosselEventosHome({ itens }: Props) {
	/** Com faixa mais estreita que a viewport: flex centraliza; Embla não pode usar `center` senão o slide ativo “flutua” com muito vazio à esquerda. */
	const [faixaCentralizada, setFaixaCentralizada] = useState(true);

	const [emblaRef, emblaApi] = useEmblaCarousel(
		{
			loop: itens.length > 1 && !faixaCentralizada,
			align: faixaCentralizada ? 'start' : 'center',
			skipSnaps: false,
			dragFree: false,
		},
		[
			Autoplay({
				delay: 4800,
				stopOnInteraction: false,
				stopOnMouseEnter: true,
			}),
		]
	);

	const [indiceSelecionado, setIndiceSelecionado] = useState(0);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setIndiceSelecionado(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		emblaApi.on('select', onSelect);
		emblaApi.on('reInit', onSelect);
		return () => {
			emblaApi.off('select', onSelect);
			emblaApi.off('reInit', onSelect);
		};
	}, [emblaApi, onSelect]);

	useEffect(() => {
		if (!emblaApi) return;
		emblaApi.reInit();
	}, [emblaApi, itens]);

	const roRef = useRef<ResizeObserver | null>(null);

	useLayoutEffect(() => {
		if (!emblaApi) return;

		const atualizar = () => {
			const root = emblaApi.rootNode();
			const inner = emblaApi.containerNode();
			if (!root || !inner) return;
			const vw = root.clientWidth;
			const cw = inner.scrollWidth;
			setFaixaCentralizada(cw <= vw + 2);
		};

		atualizar();
		const root = emblaApi.rootNode();
		const inner = emblaApi.containerNode();
		if (!root || !inner) return;

		roRef.current?.disconnect();
		roRef.current = new ResizeObserver(() => atualizar());
		roRef.current.observe(root);
		roRef.current.observe(inner);

		emblaApi.on('reInit', atualizar);
		emblaApi.on('resize', atualizar);

		return () => {
			emblaApi.off('reInit', atualizar);
			emblaApi.off('resize', atualizar);
			roRef.current?.disconnect();
			roRef.current = null;
		};
	}, [emblaApi, itens]);

	const cabiaAnteriorRef = useRef<boolean | null>(null);
	useEffect(() => {
		if (!emblaApi) return;
		const cabia = faixaCentralizada;
		if (cabiaAnteriorRef.current === false && cabia) {
			emblaApi.scrollTo(0, true);
		}
		cabiaAnteriorRef.current = cabia;
	}, [emblaApi, faixaCentralizada]);

	if (itens.length === 0) return null;

	return (
		<div className='relative w-full'>
			<div className='overflow-hidden pl-3 sm:pl-4' ref={emblaRef}>
				<div
					className={`box-border min-w-full ${faixaCentralizada ? 'flex justify-center' : 'flex'
						}`}>
					{itens.map(({ evento, capaUrl }) => {
						const disp = evento.quantidadeIngressosDisponiveis;
						return (
							<div
								key={evento.cdEventosCadastro}
								className='min-w-0 shrink-0 grow-0 basis-[min(92vw,560px)] sm:basis-[min(88vw,620px)] md:basis-[min(82vw,720px)] lg:basis-[min(72vw,800px)] pl-3 sm:pl-4'>
								<Link
									to={eventoDetalhePath(evento.cdEventosCadastro)}
									className='block h-full'>
									<article className='group flex h-80 sm:h-[22rem] md:h-96 flex-col overflow-hidden rounded-2xl border-2 border-border/80 bg-card shadow-xl ring-1 ring-black/5 transition-all duration-300 hover:border-primary hover:shadow-2xl md:flex-row'>
										<div className='relative h-[46%] min-h-[11rem] bg-muted md:h-auto md:w-[48%] md:min-h-0'>
											{capaUrl ? (
												<img
													src={capaUrl}
													alt=''
													className='absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]'
												/>
											) : (
												<div className='flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground'>
													Sem imagem
												</div>
											)}
											<div className='absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/50 to-transparent md:hidden' />
										</div>
										<div className='flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-3 p-5 sm:p-7 md:py-10 md:pr-10 md:pl-8'>
											<h3 className='text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl md:text-3xl line-clamp-3'>
												{evento.nomeEvento}
											</h3>
											<div className='flex flex-col gap-2 text-sm text-muted-foreground'>
												<span className='inline-flex items-center gap-2'>
													<CalendarDays className='h-4 w-4 shrink-0 text-primary' />
													<span className='font-medium text-foreground'>
														{formatarEventoDataPeriodoPt(evento)}
													</span>
												</span>
												<span className='inline-flex items-center gap-2'>
													<MapPin className='h-4 w-4 shrink-0' />
													<span className='line-clamp-2'>{resumoLocalEvento(evento)}</span>
												</span>
												<span className='inline-flex items-center gap-2'>
													<Users className='h-4 w-4 shrink-0 text-primary' />
													<span className='text-base font-semibold text-foreground'>
														{disp} vagas disponíveis
													</span>
												</span>
											</div>
											<span className='mt-1 inline-flex items-center gap-1 text-sm font-bold text-primary'>
												Ver detalhes e inscrever-se
												<ChevronRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
											</span>
										</div>
									</article>
								</Link>
							</div>
						);
					})}
				</div>
			</div>

			{itens.length > 1 ? (
				<div className='mt-6 flex justify-center gap-2'>
					{itens.map((s, i) => (
						<button
							key={s.evento.cdEventosCadastro}
							type='button'
							className={`h-2.5 rounded-full transition-all duration-300 ${i === indiceSelecionado ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/35 hover:bg-muted-foreground/55'
								}`}
							aria-label={`Ir para evento ${i + 1}`}
							onClick={() => emblaApi?.scrollTo(i)}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}
