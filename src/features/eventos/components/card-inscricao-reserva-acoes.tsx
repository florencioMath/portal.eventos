import { Button } from '@/components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ReservasApi } from '@/features/eventos/api/reservas-api';
import {
	calcularMaxQuantidadeAlteracao,
	limiteIngressosPorCpfNumero,
} from '@/features/eventos/lib/reserva-ingressos-calculo';
import { inscricoesAindaAbertasPorData } from '@/features/eventos/lib/visibilidade-evento';
import type { EventoCadastroDto, EventoReservaDto } from '@/features/eventos/types';
import { SeletorQuantidadeIngressos } from '@/features/eventos/components/seletor-quantidade-ingressos';
import { getApiError } from '@/lib/utils';
import { UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type Props = {
	evento: EventoCadastroDto;
	reserva: EventoReservaDto;
	onAtualizado: () => void;
};

function reservaAtiva(r: EventoReservaDto): boolean {
	return r.statusReserva !== 'CANCELADA';
}

export function CardInscricaoReservaAcoes({ evento, reserva, onAtualizado }: Props) {
	const [dialogoAlterar, setDialogoAlterar] = useState(false);
	const [dialogoCancelar, setDialogoCancelar] = useState(false);
	const [qAlterar, setQAlterar] = useState(reserva.quantidadeReservada);
	const [processando, setProcessando] = useState(false);

	const podeGerir = reservaAtiva(reserva) && inscricoesAindaAbertasPorData(evento);
	const limite = limiteIngressosPorCpfNumero(evento);
	const maxAlterar = useMemo(
		() => calcularMaxQuantidadeAlteracao(evento, reserva.quantidadeReservada),
		[evento, reserva.quantidadeReservada]
	);

	useEffect(() => {
		if (dialogoAlterar) {
			setQAlterar((q) => Math.min(maxAlterar, Math.max(1, q)));
		}
	}, [dialogoAlterar, maxAlterar]);

	useEffect(() => {
		setQAlterar(reserva.quantidadeReservada);
	}, [reserva.quantidadeReservada]);

	const confirmarAlterar = async () => {
		const n = Math.max(1, Math.min(maxAlterar, Math.floor(qAlterar)));
		if (n === reserva.quantidadeReservada) {
			setDialogoAlterar(false);
			return;
		}
		setProcessando(true);
		try {
			await ReservasApi.atualizarQuantidade(reserva.cdEventosReservas, n);
			toast.success('Quantidade atualizada.');
			setDialogoAlterar(false);
			onAtualizado();
		} catch (e) {
			toast.error(getApiError(e, 'Não foi possível alterar a quantidade.'));
		} finally {
			setProcessando(false);
		}
	};

	const confirmarCancelar = async () => {
		setProcessando(true);
		try {
			await ReservasApi.cancelar(reserva.cdEventosReservas);
			toast.success('Inscrição cancelada.');
			setDialogoCancelar(false);
			onAtualizado();
		} catch (e) {
			toast.error(getApiError(e, 'Não foi possível cancelar a inscrição.'));
		} finally {
			setProcessando(false);
		}
	};

	if (!reservaAtiva(reserva)) {
		return (
			<Card className='border-muted'>
				<CardHeader className='pb-2'>
					<CardTitle className='flex items-center gap-2 text-base font-semibold'>
						<UserPlus className='h-5 w-5 shrink-0 text-muted-foreground' aria-hidden />
						Inscrição
					</CardTitle>
					<CardDescription>Esta reserva foi cancelada.</CardDescription>
				</CardHeader>
				<CardContent className='text-sm text-muted-foreground'>
					<p>
						Código <span className='font-mono font-medium text-foreground'>{reserva.codigoReserva}</span> ·
						Status <span className='font-medium text-foreground'>{reserva.statusReserva}</span>
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card className='border-primary/20 bg-primary/5'>
				<CardHeader className='pb-2'>
					<CardTitle className='flex items-center gap-2 text-base font-semibold'>
						<UserPlus className='h-5 w-5 shrink-0 text-primary' aria-hidden />
						A sua inscrição
					</CardTitle>
					<CardDescription>Gerir ingressos enquanto o prazo de inscrição estiver aberto.</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<dl className='grid gap-2 text-sm sm:grid-cols-2'>
						<div>
							<dt className='text-xs text-muted-foreground'>Código da reserva</dt>
							<dd className='font-mono font-medium'>{reserva.codigoReserva}</dd>
						</div>
						<div>
							<dt className='text-xs text-muted-foreground'>Status</dt>
							<dd className='font-medium'>{reserva.statusReserva}</dd>
						</div>
						<div>
							<dt className='text-xs text-muted-foreground'>Quantidade</dt>
							<dd className='font-medium'>{reserva.quantidadeReservada}</dd>
						</div>
						<div>
							<dt className='text-xs text-muted-foreground'>Limite por CPF</dt>
							<dd className='font-medium'>{limite}</dd>
						</div>
					</dl>
					{podeGerir ? (
						<div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end'>
							<Button type='button' variant='outline' onClick={() => setDialogoAlterar(true)}>
								Alterar quantidade
							</Button>
							<Button type='button' variant='destructive' onClick={() => setDialogoCancelar(true)}>
								Cancelar inscrição
							</Button>
						</div>
					) : (
						<p className='text-sm text-muted-foreground'>
							O prazo para alterar ou cancelar esta inscrição no portal encerrou.
						</p>
					)}
				</CardContent>
			</Card>

			<Dialog open={dialogoAlterar} onOpenChange={setDialogoAlterar}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Alterar quantidade</DialogTitle>
					</DialogHeader>
					<p className='text-sm text-muted-foreground'>
						Nova quantidade de ingressos para <strong>{evento.nomeEvento}</strong> (mínimo 1, máximo{' '}
						{maxAlterar}).
					</p>
					<div className='flex flex-wrap items-center gap-3'>
						<SeletorQuantidadeIngressos
							value={qAlterar}
							min={1}
							max={maxAlterar}
							onChange={setQAlterar}
							disabled={processando}
						/>
					</div>
					<DialogFooter className='gap-2 sm:gap-0'>
						<Button type='button' variant='outline' onClick={() => setDialogoAlterar(false)}>
							Voltar
						</Button>
						<Button type='button' onClick={() => void confirmarAlterar()} disabled={processando}>
							{processando ? 'A guardar…' : 'Confirmar'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={dialogoCancelar} onOpenChange={setDialogoCancelar}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cancelar inscrição</DialogTitle>
					</DialogHeader>
					<p className='text-sm text-muted-foreground'>
						Tem a certeza de que deseja cancelar a inscrição em <strong>{evento.nomeEvento}</strong>? A
						reserva <span className='font-mono'>{reserva.codigoReserva}</span> deixará de estar ativa.
					</p>
					<DialogFooter className='gap-2 sm:gap-0'>
						<Button type='button' variant='outline' onClick={() => setDialogoCancelar(false)}>
							Não
						</Button>
						<Button
							type='button'
							variant='destructive'
							onClick={() => void confirmarCancelar()}
							disabled={processando}>
							{processando ? 'A cancelar…' : 'Sim, cancelar'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
