import { Button } from '@/components/base/button';
import { eventoDetalhePath } from '@/features/eventos/routes/evento-detalhe/route';
import { formatarEventoDataPeriodoPt } from '@/features/eventos/lib/datas-evento';
import { resumoLocalEvento } from '@/features/eventos/lib/visibilidade-evento';
import type { EventoCadastroDto } from '@/features/eventos/types';
import { signInPath } from '@/features/auth/routes/sign-in/route';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { CalendarDays, ChevronDown, MapPin, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export type HeroDestaqueSlide = {
	evento: EventoCadastroDto;
	capaUrl: string | null;
};

type Props = {
	slides: HeroDestaqueSlide[];
	isAuthenticated: boolean;
	/** Para o botão «Ver eventos»: total de eventos listados no portal (não só os do hero). */
	totalListadosNoPortal: number;
};

function ConteudoSlide({
	item,
	isAuthenticated,
	mostrarVerEventos,
	rotuloDestaque,
	extraPaddingInferior,
}: {
	item: HeroDestaqueSlide;
	isAuthenticated: boolean;
	mostrarVerEventos: boolean;
	rotuloDestaque: string;
	extraPaddingInferior: boolean;
}) {
	const { evento, capaUrl } = item;
	return (
		<>
			{capaUrl ? (
				<>
					{/* Fundo desfocado para preencher os lados */}
					<div
						className='absolute inset-0 scale-110 bg-cover bg-center blur-2xl brightness-50'
						style={{ backgroundImage: `url(${capaUrl})` }}
					/>
					{/* Imagem real centralizada, sem cortar */}
					<img
						src={capaUrl}
						alt=''
						className='absolute inset-0 h-full w-full object-contain'
					/>
				</>
			) : (
				<div className='absolute inset-0 bg-gradient-to-br from-primary/30 via-muted to-background' />
			)}
			<div className='absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/25' />
			<div className='absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent' />

			<div
				className={`relative z-10 mx-auto flex min-h-[min(42vh,900px)] w-full flex-col justify-end px-5 pt-28 sm:px-8 md:pt-28 ${extraPaddingInferior ? 'pb-24 md:pb-32' : 'pb-14 md:pb-20'
					}`}>
				<div className='max-w-3xl space-y-5'>
					<p className='text-xs font-bold uppercase tracking-[0.2em] text-primary sm:text-sm'>{rotuloDestaque}</p>
					<h1 className='text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-xl md:text-2xl lg:text-4xl'>
						{evento.nomeEvento}
					</h1>
					<div className='flex flex-col gap-2 text-base text-muted-foreground sm:text-lg'>
						<span className='inline-flex items-center gap-2 text-foreground'>
							<CalendarDays className='h-5 w-5 shrink-0 text-primary' />
							<span className='font-semibold'>{formatarEventoDataPeriodoPt(evento)}</span>
						</span>
						<span className='inline-flex items-center gap-2'>
							<MapPin className='h-5 w-5 shrink-0 text-primary' />
							{resumoLocalEvento(evento)}
						</span>
						<span className='inline-flex items-center gap-2 font-semibold text-foreground'>
							<Users className='h-5 w-5 shrink-0 text-primary' />
							{evento.quantidadeIngressosDisponiveis} vagas disponíveis
						</span>
					</div>
					<div className='flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center'>
						<Button
							size='default'
							className='h-14 rounded-full px-10 text-base font-bold shadow-lg sm:text-lg'
							asChild>
							<Link to={eventoDetalhePath(evento.cdEventosCadastro)}>Ver detalhes</Link>
						</Button>
						{mostrarVerEventos ? (
							<Button
								size='default'
								variant='outline'
								className='h-14 rounded-full border-2 bg-background/80 px-8 text-base backdrop-blur-sm'
								asChild>
								<a href='#eventos' className='inline-flex items-center gap-2'>
									Ver eventos
									<ChevronDown className='h-5 w-5' />
								</a>
							</Button>
						) : null}
					</div>
					{!isAuthenticated ? (
						<p className='pt-2 text-sm text-muted-foreground'>
							<Link
								to={signInPath}
								className='font-semibold text-primary underline-offset-4 hover:underline'>
								Entre na sua conta
							</Link>{' '}
							para se inscrever nos eventos.
						</p>
					) : null}
				</div>
			</div>
		</>
	);
}

export function CarrosselHeroDestaque({ slides, isAuthenticated, totalListadosNoPortal }: Props) {
	const multi = slides.length > 1;
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{ loop: multi, align: 'start' },
		multi
			? [
				Autoplay({
					delay: 6500,
					stopOnInteraction: false,
					stopOnMouseEnter: true,
				}),
			]
			: []
	);
	const [indice, setIndice] = useState(0);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setIndice(emblaApi.selectedScrollSnap());
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
	}, [emblaApi, slides]);

	if (slides.length === 0) return null;

	const mostrarVerEventos = totalListadosNoPortal > 1;

	const rotulo = multi ? 'Eventos em destaque' : 'Evento em destaque';

	if (!multi) {
		const one = slides[0]!;
		return (
			<section className='relative min-h-[min(42vh,900px)] w-full overflow-hidden bg-background'>
				<ConteudoSlide
					item={one}
					isAuthenticated={isAuthenticated}
					mostrarVerEventos={mostrarVerEventos}
					rotuloDestaque={rotulo}
					extraPaddingInferior={false}
				/>
			</section>
		);
	}

	return (
		<section className='relative min-h-[min(42vh,900px)] w-full overflow-hidden bg-background'>
			<div className='overflow-hidden' ref={emblaRef}>
				<div className='flex'>
					{slides.map((item) => (
						<div
							key={item.evento.cdEventosCadastro}
							className='relative min-h-[min(42vh,900px)] min-w-0 shrink-0 grow-0 basis-full'>
							<ConteudoSlide
								item={item}
								isAuthenticated={isAuthenticated}
								mostrarVerEventos={mostrarVerEventos}
								rotuloDestaque={rotulo}
								extraPaddingInferior={false}
							/>
						</div>
					))}
				</div>
			</div>
			<div className='absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2 px-4 md:bottom-10'>
				{slides.map((s, i) => (
					<button
						key={s.evento.cdEventosCadastro}
						type='button'
						className={`h-2.5 rounded-full transition-all duration-300 ${i === indice ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
							}`}
						aria-label={`Ir para destaque ${i + 1}`}
						aria-current={i === indice ? 'true' : undefined}
						onClick={() => emblaApi?.scrollTo(i)}
					/>
				))}
			</div>
		</section>
	);
}
