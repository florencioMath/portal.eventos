import { Button } from '@/components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { EventosApi, ImagensApi } from '@/features/eventos/api/eventos-api';
import { ReservasApi } from '@/features/eventos/api/reservas-api';
import type { MinhaReservaItemDto } from '@/features/eventos/types';
import {
	extrairSoDataDesativacao,
	formatarDataPortugues,
	formatarEventoDataPeriodoPt,
} from '@/features/eventos/lib/datas-evento';
import { CardInscricaoReservaAcoes } from '@/features/eventos/components/card-inscricao-reserva-acoes';
import { ListaPontosDeTrocaDetalhe } from '@/features/eventos/components/lista-pontos-de-troca-detalhe';
import { SeletorQuantidadeIngressos } from '@/features/eventos/components/seletor-quantidade-ingressos';
import { calcularMaxIngressosNovaAcao } from '@/features/eventos/lib/reserva-ingressos-calculo';
import { eventoAceitaReservas, inscricoesAindaAbertasPorData } from '@/features/eventos/lib/visibilidade-evento';
import { imagemDtoParaDataUrl } from '@/features/eventos/lib/imagem-data-url';
import {
	ordenarLotes,
	resolverIndiceLoteAtual,
	textoLiberacaoLoteDetalhe,
} from '@/features/eventos/lib/lotes-exibicao';
import type { EventoCadastroDto, EventoImagemDto } from '@/features/eventos/types';
import { signInPath } from '@/features/auth/routes/sign-in/route';
import { inicioPath } from '@/features/inicio/routes/inicio/route';
import { useAutenticacao } from '@/hooks/use-autenticacao';
import { sanitizeDescricaoEventoHtml } from '@/lib/sanitize-descricao-html';
import { cn, getApiError } from '@/lib/utils';
import {
	ArrowLeft,
	Calendar,
	Clock,
	MapPin,
	Tag,
	Ticket,
	UserPlus,
	Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';

const descricaoProseClass =
	'text-sm text-foreground [&_a]:text-primary [&_blockquote]:my-2 [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5';

export const PaginaEventoDetalhe = () => {
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const { isAuthenticated } = useAutenticacao();
	const [evento, setEvento] = useState<EventoCadastroDto | null>(null);
	const [imagens, setImagens] = useState<EventoImagemDto[]>([]);
	const [carregando, setCarregando] = useState(true);
	const [idxImg, setIdxImg] = useState(0);
	const [dialogoAberto, setDialogoAberto] = useState(false);
	const [dialogoSucessoAberto, setDialogoSucessoAberto] = useState(false);
	const [htmlSucessoInscricao, setHtmlSucessoInscricao] = useState('');
	const [reservando, setReservando] = useState(false);
	const [minhaReserva, setMinhaReserva] = useState<MinhaReservaItemDto | null>(null);
	const [tickMinhasReservas, setTickMinhasReservas] = useState(0);
	const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);

	const multi = imagens.length > 1;
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{ loop: multi, align: 'start' },
		multi ? [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })] : []
	);

	useEffect(() => {
		if (!emblaApi) return;
		emblaApi.on('select', () => setIdxImg(emblaApi.selectedScrollSnap()));
		emblaApi.on('reInit', () => setIdxImg(emblaApi.selectedScrollSnap()));
	}, [emblaApi]);

	const carregar = useCallback(async (): Promise<EventoCadastroDto | null> => {
		if (!id) return null;
		setCarregando(true);
		try {
			const [ev, imgs] = await Promise.all([EventosApi.obterPublico(id), ImagensApi.listarPorEvento(id)]);
			setEvento(ev);
			setImagens(imgs);
			setIdxImg(0);
			return ev;
		} catch {
			toast.error('Não foi possível carregar o evento.');
			setEvento(null);
			setImagens([]);
			return null;
		} finally {
			setCarregando(false);
		}
	}, [id]);

	useEffect(() => {
		void carregar();
	}, [carregar]);

	useEffect(() => {
		if (!isAuthenticated || !id) {
			setMinhaReserva(null);
			return;
		}
		let cancelado = false;
		ReservasApi.listarMinhas()
			.then((lista) => {
				if (cancelado) return;
				const m = lista.find(
					(i) =>
						i.reserva.cdEventosCadastro === id && i.reserva.statusReserva !== 'CANCELADA'
				);
				setMinhaReserva(m ?? null);
			})
			.catch(() => {
				if (!cancelado) setMinhaReserva(null);
			});
		return () => {
			cancelado = true;
		};
	}, [isAuthenticated, id, tickMinhasReservas]);

	const lotes = useMemo(() => ordenarLotes(evento?.lotes), [evento?.lotes]);
	const indiceLoteAtual = useMemo(
		() => (evento ? resolverIndiceLoteAtual(evento) : -1),
		[evento]
	);

	const ingressosJaRetirados = minhaReserva?.reserva.quantidadeReservada ?? 0;
	const maxIngressosNestaAcao = useMemo(
		() => (evento ? calcularMaxIngressosNovaAcao(evento, ingressosJaRetirados) : 1),
		[evento, ingressosJaRetirados]
	);

	useEffect(() => {
		setQuantidadeSelecionada((q) =>
			Math.min(maxIngressosNestaAcao, Math.max(1, q))
		);
	}, [maxIngressosNestaAcao]);

	useEffect(() => {
		if (!dialogoAberto || !evento) return;
		setQuantidadeSelecionada((q) =>
			Math.min(maxIngressosNestaAcao, Math.max(1, q))
		);
	}, [dialogoAberto, evento, maxIngressosNestaAcao]);

	const confirmarInscricao = async () => {
		if (!evento) return;
		const q = Math.max(1, Math.min(maxIngressosNestaAcao, Math.floor(quantidadeSelecionada)));
		setReservando(true);
		try {
			await ReservasApi.criar({ cdEventosCadastro: evento.cdEventosCadastro, quantidadeReservada: q });
			setDialogoAberto(false);
			setTickMinhasReservas((t) => t + 1);
			const evAtual = await carregar();
			const texto =
				evAtual?.textoSucessoRegistro?.trim() ??
				'<p>Inscrição registada com sucesso. Apresente o comprovativo no evento.</p>';
			setHtmlSucessoInscricao(texto);
			setDialogoSucessoAberto(true);
		} catch (e) {
			toast.error(getApiError(e, 'Não foi possível concluir a inscrição.'));
		} finally {
			setReservando(false);
		}
	};

	if (carregando) {
		return (
			<div className='container py-16 text-center text-muted-foreground'>Carregando evento…</div>
		);
	}

	if (!evento) {
		return (
			<div className='container py-16 text-center space-y-4'>
				<p className='text-muted-foreground'>Evento não encontrado.</p>
				<Button variant='outline' asChild>
					<Link to={inicioPath}>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Voltar ao início
					</Link>
				</Button>
			</div>
		);
	}

	const temReserva = !!minhaReserva;
	const indiceLoteInscricao = minhaReserva?.reserva.indiceLoteIngresso;
	const limiteIngressosPorCpf = Math.max(1, Math.floor(evento.ingressoPorCpf ?? 2));
	const vagasRestantesParaUsuario = Math.max(0, limiteIngressosPorCpf - ingressosJaRetirados);
	const atingiuLimitePorCpf = vagasRestantesParaUsuario <= 0 && temReserva;

	const podeInscrever =
		isAuthenticated &&
		eventoAceitaReservas(evento) &&
		inscricoesAindaAbertasPorData(evento) &&
		evento.quantidadeIngressosDisponiveis > 0 &&
		vagasRestantesParaUsuario > 0;

	return (
		<div className='min-h-screen bg-background pb-16'>
			<div className='border-b bg-muted/30'>
				<div className='container py-3'>
					<Button variant='ghost' size='sm' className='gap-1 -ml-2' asChild>
						<Link to={inicioPath}>
							<ArrowLeft className='h-4 w-4' />
							Eventos
						</Link>
					</Button>
				</div>
			</div>

			{imagens.length > 0 ? (
				<div className='w-full border-b bg-muted/40'>
					<div className='w-full overflow-hidden' ref={emblaRef}>
						<div className='flex w-full touch-pan-y'>
							{imagens.map((img, i) => {
								const src = imagemDtoParaDataUrl(img);
								return (
									<div
										key={img.cdEventosImagens}
										className='relative min-w-0 shrink-0 grow-0 basis-full flex justify-center bg-muted/40'>
										{src ? (
											<img
												src={src}
												alt={`Imagem ${i + 1}`}
												className='max-h-[min(70vh,600px)] w-full object-contain'
											/>
										) : null}
									</div>
								);
							})}
						</div>
					</div>

					{multi ? (
						<div className='flex justify-center gap-2 py-3'>
							{imagens.map((img, i) => (
								<button
									key={img.cdEventosImagens}
									type='button'
									className={`h-2.5 rounded-full transition-all duration-300 ${i === idxImg
										? 'w-8 bg-primary'
										: 'w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
										}`}
									aria-label={`Imagem ${i + 1}`}
									aria-current={i === idxImg ? 'true' : undefined}
									onClick={() => emblaApi?.scrollTo(i)}
								/>
							))}
						</div>
					) : null}
				</div>
			) : null}

			<div className='container max-w-4xl space-y-4 pt-8 pb-4'>
				<div className='space-y-1'>
					<h1 className='text-2xl font-bold tracking-tight md:text-3xl'>{evento.nomeEvento}</h1>
				</div>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold'>
							<span className='inline-flex items-center gap-2'>
								<Calendar className='h-5 w-5 shrink-0 text-primary' aria-hidden />
								Data
							</span>
							<span className='text-muted-foreground/60 font-normal' aria-hidden>
								·
							</span>
							<span className='inline-flex items-center gap-2'>
								<Users className='h-5 w-5 shrink-0 text-primary' aria-hidden />
								Vagas
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid gap-6 sm:grid-cols-2'>
							<div className='space-y-1'>
								<p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Realização</p>
								<p className='text-base font-medium text-foreground'>
									{formatarEventoDataPeriodoPt(evento)}
								</p>
							</div>
							<div className='space-y-1'>
								<p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
									Disponibilidade
								</p>
								{evento.exibirVagas ? (
									<p className='font-medium text-foreground'>
										{evento.quantidadeIngressosDisponiveis.toLocaleString('pt-BR')} vagas disponíveis
									</p>
								) : (
									<p className='text-sm text-muted-foreground'>
										A quantidade de vagas não é exibida para este evento. Consulte a descrição ou os
										canais oficiais.
									</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold'>
							<span className='inline-flex items-center gap-2'>
								<Clock className='h-5 w-5 shrink-0 text-primary' aria-hidden />
								Exibição / inscrição
							</span>
							<span className='text-muted-foreground/60 font-normal' aria-hidden>
								·
							</span>
							<span className='inline-flex items-center gap-2'>
								<Tag className='h-5 w-5 shrink-0 text-primary' aria-hidden />
								Categoria
							</span>
						</CardTitle>
						<CardDescription>Inscrições e exibição no portal até a data indicada.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='grid gap-6 sm:grid-cols-2'>
							<div className='space-y-1'>
								<p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
									Prazo no portal
								</p>
								<p className='font-medium text-foreground'>
									{formatarDataPortugues(extrairSoDataDesativacao(evento))}
								</p>
								<p className='text-xs text-muted-foreground'>
									Data limite de desativação automática do evento no portal.
								</p>
							</div>
							<div className='space-y-1'>
								<p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
									Categoria
								</p>
								<p className='font-medium text-foreground'>{evento.categoria}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold'>
							<span className='inline-flex items-center gap-2'>
								<MapPin className='h-5 w-5 shrink-0 text-primary' aria-hidden />
								Locais de troca
							</span>
							{lotes.length > 0 ? (
								<>
									<span className='text-muted-foreground/60 font-normal' aria-hidden>
										·
									</span>
									<span className='inline-flex items-center gap-2'>
										<Ticket className='h-5 w-5 shrink-0 text-primary' aria-hidden />
										Lotes
									</span>
								</>
							) : null}
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-8 text-sm'>
						<div className='min-w-0'>
							<ListaPontosDeTrocaDetalhe evento={evento} className='min-w-0' />
						</div>
						{lotes.length > 0 ? (
							<div className='space-y-3 border-t pt-6'>
								<ul className='grid gap-3'>
									{lotes.map((l, i) => {
										const atual = i === indiceLoteAtual;
										const inscritoNesteLote =
											temReserva &&
											indiceLoteInscricao !== undefined &&
											indiceLoteInscricao !== null &&
											indiceLoteInscricao === i;
										return (
											<li
												key={`${l.ordem}-${i}`}
												className={cn(
													'rounded-lg border p-4 transition-colors',
													inscritoNesteLote
														? 'border-primary bg-primary/10 ring-2 ring-primary/30'
														: atual
															? 'border-primary bg-primary/5 ring-2 ring-primary/30'
															: 'border-border bg-muted/30'
												)}>
												<div className='flex flex-wrap items-baseline justify-between gap-2'>
													<p className='font-semibold'>
														{i + 1}. {l.rotulo?.trim() || `Lote ${i + 1}`}
														{inscritoNesteLote ? (
															<span className='ml-2 text-xs font-bold uppercase tracking-wide text-primary'>
																Sua inscrição
																{atual ? (
																	<span className='ml-1.5 font-semibold text-muted-foreground normal-case'>
																		(lote atual)
																	</span>
																) : null}
															</span>
														) : atual ? (
															<span className='ml-2 text-xs font-medium uppercase text-primary'>
																Lote atual
															</span>
														) : null}
													</p>
													<span className='text-sm text-muted-foreground'>
														{l.quantidade} vagas
													</span>
												</div>
												<p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
													<span className='font-medium text-foreground/80'>Liberação: </span>
													{textoLiberacaoLoteDetalhe(l)}
												</p>
											</li>
										);
									})}
								</ul>
							</div>
						) : null}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-base font-semibold'>Sobre o evento</CardTitle>
					</CardHeader>
					<CardContent>
						{evento.descricao?.trim() ? (
							<div
								className={cn(descricaoProseClass)}
								dangerouslySetInnerHTML={{ __html: sanitizeDescricaoEventoHtml(evento.descricao) }}
							/>
						) : (
							<p className='text-sm text-muted-foreground'>Sem descrição cadastrada.</p>
						)}
					</CardContent>
				</Card>

				{minhaReserva ? (
					<CardInscricaoReservaAcoes
						evento={evento}
						reserva={minhaReserva.reserva}
						onAtualizado={() => {
							setTickMinhasReservas((t) => t + 1);
							void carregar();
						}}
					/>
				) : null}

				<Card className='border-primary/20 bg-primary/5'>
					<CardHeader className='pb-2'>
						<CardTitle className='flex items-center gap-2 text-base font-semibold'>
							<UserPlus className='h-5 w-5 shrink-0 text-primary' aria-hidden />
							Inscrição
						</CardTitle>
						<CardDescription>Ingressos e limites por CPF neste evento.</CardDescription>
					</CardHeader>
					<CardContent className='space-y-6'>
						<div className='min-w-0 space-y-2 text-sm text-muted-foreground'>
							{isAuthenticated && podeInscrever ? (
								<p>
									Nesta ação você retira <strong className='text-foreground'>{quantidadeSelecionada}</strong>{' '}
									{quantidadeSelecionada === 1 ? 'ingresso' : 'ingressos'}.
									{ingressosJaRetirados > 0 ? (
										<>
											{' '}
											Após confirmar, ficará com{' '}
											<strong className='text-foreground'>
												{ingressosJaRetirados + quantidadeSelecionada}
											</strong>{' '}
											no total
											{limiteIngressosPorCpf > 1 ? (
												<>
													{' '}
													(máximo <strong className='text-foreground'>{limiteIngressosPorCpf}</strong>{' '}
													por CPF).
												</>
											) : (
												'.'
											)}
										</>
									) : limiteIngressosPorCpf > 1 ? (
										<>
											{' '}
											Limite de <strong className='text-foreground'>{limiteIngressosPorCpf}</strong>{' '}
											ingressos por CPF neste evento.
										</>
									) : null}
								</p>
							) : null}
							{isAuthenticated && temReserva && !atingiuLimitePorCpf && !podeInscrever ? (
								<p className='text-destructive'>
									Não há mais vagas no evento para retirar outro ingresso.
								</p>
							) : null}
							{isAuthenticated && temReserva && ingressosJaRetirados > 0 && !atingiuLimitePorCpf ? (
								<p>
									Você já retirou <strong className='text-foreground'>{ingressosJaRetirados}</strong>{' '}
									{ingressosJaRetirados === 1 ? 'ingresso' : 'ingressos'} neste evento
									{limiteIngressosPorCpf > 1 ? (
										<>
											{' '}
											(de <strong className='text-foreground'>{limiteIngressosPorCpf}</strong> permitidos
											por CPF).
										</>
									) : (
										'.'
									)}
								</p>
							) : null}
							{isAuthenticated && atingiuLimitePorCpf ? (
								<p>
									Você já retirou o máximo de ingressos permitidos para o seu CPF neste evento.
								</p>
							) : null}
							{isAuthenticated && evento.quantidadeIngressosDisponiveis <= 0 ? (
								<p className='text-sm text-destructive'>Não há mais vagas para este evento.</p>
							) : null}
							{isAuthenticated && !eventoAceitaReservas(evento) ? (
								<p className='text-sm'>Evento inativo no momento.</p>
							) : null}
							{isAuthenticated &&
							eventoAceitaReservas(evento) &&
							!inscricoesAindaAbertasPorData(evento) ? (
								<p className='text-sm text-destructive'>
									O prazo de inscrição neste portal já encerrou.
								</p>
							) : null}
						</div>
						<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
							{!isAuthenticated ? (
								<Button size='lg' className='w-full sm:w-auto' asChild>
									<Link to={signInPath} state={{ from: location }}>
										Entrar para se inscrever
									</Link>
								</Button>
							) : atingiuLimitePorCpf ? (
								<Button size='lg' variant='secondary' className='w-full sm:w-auto' disabled>
									Limite atingido
								</Button>
							) : (
								<Button
									size='lg'
									className='w-full sm:w-auto'
									disabled={!podeInscrever}
									onClick={() => setDialogoAberto(true)}>
									{evento.quantidadeIngressosDisponiveis <= 0
										? 'Esgotado'
										: !eventoAceitaReservas(evento)
											? 'Indisponível'
											: !inscricoesAindaAbertasPorData(evento)
												? 'Prazo encerrado'
												: 'Se inscrever'}
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			<Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmar inscrição</DialogTitle>
					</DialogHeader>
					<p className='text-sm text-muted-foreground'>
						Confirma a sua inscrição em <strong>{evento.nomeEvento}</strong>? Será reservado{' '}
						<strong>{quantidadeSelecionada}</strong> {quantidadeSelecionada === 1 ? 'ingresso' : 'ingressos'}.
					</p>
					<div className='flex flex-wrap items-center gap-3 py-1'>
						<span className='text-sm text-muted-foreground'>Quantidade</span>
						<SeletorQuantidadeIngressos
							value={quantidadeSelecionada}
							min={1}
							max={maxIngressosNestaAcao}
							onChange={setQuantidadeSelecionada}
							disabled={reservando}
						/>
					</div>
					<DialogFooter className='gap-2 sm:gap-0'>
						<Button type='button' variant='outline' onClick={() => setDialogoAberto(false)}>
							Cancelar
						</Button>
						<Button type='button' onClick={() => void confirmarInscricao()} disabled={reservando}>
							{reservando ? 'Enviando…' : 'Confirmar'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={dialogoSucessoAberto} onOpenChange={setDialogoSucessoAberto}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Inscrição registada</DialogTitle>
					</DialogHeader>
					<div
						className={cn(descricaoProseClass, 'text-sm')}
						dangerouslySetInnerHTML={{ __html: sanitizeDescricaoEventoHtml(htmlSucessoInscricao) }}
					/>
					<DialogFooter>
						<Button type='button' onClick={() => setDialogoSucessoAberto(false)}>
							Confirmar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
