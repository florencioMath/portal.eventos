import { Button } from '@/components/base/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardInscricaoReservaAcoes } from '@/features/eventos/components/card-inscricao-reserva-acoes';
import { ListaPontosDeTrocaDetalhe } from '@/features/eventos/components/lista-pontos-de-troca-detalhe';
import { ReservasApi } from '@/features/eventos/api/reservas-api';
import {
	extrairSoDataDesativacao,
	formatarDataPortugues,
	formatarEventoDataPeriodoPt,
} from '@/features/eventos/lib/datas-evento';
import { imagemDtoParaDataUrl } from '@/features/eventos/lib/imagem-data-url';
import {
	ordenarLotes,
	resolverIndiceLoteAtual,
	textoLiberacaoLoteDetalhe,
} from '@/features/eventos/lib/lotes-exibicao';
import type { MinhaReservaItemDto } from '@/features/eventos/types';
import { painelPath } from '@/features/painel/routes/painel/route';
import { sanitizeDescricaoEventoHtml } from '@/lib/sanitize-descricao-html';
import { cn, formatDateTime } from '@/lib/utils';
import {
	ArrowLeft,
	Calendar,
	Clock,
	MapPin,
	Tag,
	Ticket,
	Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const descricaoProseClass =
	'text-sm text-foreground [&_a]:text-primary [&_blockquote]:my-2 [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5';

export const PaginaMinhasReservas = () => {
	const [itens, setItens] = useState<MinhaReservaItemDto[]>([]);
	const [carregando, setCarregando] = useState(true);

	const recarregar = useCallback(async () => {
		try {
			const data = await ReservasApi.listarMinhas();
			setItens(data);
		} catch {
			toast.error('Não foi possível carregar suas reservas.');
			setItens([]);
		}
	}, []);

	useEffect(() => {
		let cancelado = false;
		(async () => {
			try {
				const data = await ReservasApi.listarMinhas();
				if (!cancelado) setItens(data);
			} catch {
				if (!cancelado) {
					toast.error('Não foi possível carregar suas reservas.');
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

	return (
		<section className='container max-w-4xl py-8'>
			<Button variant='ghost' size='sm' className='mb-6 gap-1 -ml-2' asChild>
				<Link to={painelPath}>
					<ArrowLeft className='h-4 w-4' />
					Voltar ao painel
				</Link>
			</Button>

			<h1 className='text-2xl font-bold mb-6'>Minhas reservas</h1>

			{carregando ? (
				<p className='text-muted-foreground text-sm'>Carregando…</p>
			) : itens.length === 0 ? (
				<p className='text-muted-foreground text-sm'>
					Você ainda não possui reservas. Explore os eventos na página inicial.
				</p>
			) : (
				<Accordion type='single' collapsible className='w-full space-y-2'>
					{itens.map((item) => {
						const { evento, reserva, imagens } = item;
						const ordemImg = [...(imagens ?? [])].sort((a, b) => a.posicao - b.posicao);
						const primeira = ordemImg[0];
						const capa = imagemDtoParaDataUrl(primeira);
						const lotes = ordenarLotes(evento.lotes);
						const indiceLoteAtual = resolverIndiceLoteAtual(evento);

						return (
							<AccordionItem
								key={reserva.cdEventosReservas}
								value={reserva.cdEventosReservas}
								className='rounded-lg border bg-card px-4'>
								<AccordionTrigger className='hover:no-underline py-4 text-left'>
									<div className='flex w-full min-w-0 items-center gap-4 pr-2'>
										<div className='h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted'>
											{capa ? (
												<img src={capa} alt='' className='h-full w-full object-cover' />
											) : (
												<div className='flex h-full items-center justify-center text-[10px] text-muted-foreground px-1 text-center'>
													Sem imagem
												</div>
											)}
										</div>
										<div className='min-w-0 flex-1 space-y-1'>
											<p className='font-semibold leading-snug truncate'>{evento.nomeEvento}</p>
											<p className='text-xs text-muted-foreground'>
												{formatarEventoDataPeriodoPt(evento)} · Reserva{' '}
												{formatDateTime(reserva.dataReserva)}
											</p>
											<p className='text-xs text-muted-foreground'>
												<span className='font-mono text-foreground'>{reserva.codigoReserva}</span>
												<span className='mx-1.5'>·</span>
												<span className='font-medium text-foreground'>{reserva.statusReserva}</span>
											</p>
										</div>
									</div>
								</AccordionTrigger>
								<AccordionContent>
									<div className='space-y-4 border-t pt-4 pb-2'>
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
														<p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
															Realização
														</p>
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
																{evento.quantidadeIngressosDisponiveis.toLocaleString('pt-BR')} vagas
																disponíveis
															</p>
														) : (
															<p className='text-sm text-muted-foreground'>
																A quantidade de vagas não é exibida para este evento.
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
												<CardDescription>Inscrições no portal até a data indicada.</CardDescription>
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
																	reserva.indiceLoteIngresso != null &&
																	reserva.indiceLoteIngresso === i;
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
																			<span className='font-medium text-foreground/80'>
																				Liberação:{' '}
																			</span>
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
														dangerouslySetInnerHTML={{
															__html: sanitizeDescricaoEventoHtml(evento.descricao),
														}}
													/>
												) : (
													<p className='text-sm text-muted-foreground'>Sem descrição cadastrada.</p>
												)}
											</CardContent>
										</Card>

										<CardInscricaoReservaAcoes
											evento={evento}
											reserva={reserva}
											onAtualizado={() => void recarregar()}
										/>
									</div>
								</AccordionContent>
							</AccordionItem>
						);
					})}
				</Accordion>
			)}
		</section>
	);
};
