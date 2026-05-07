import { Button } from '@/components/base/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { IngressoCompartilharMenu } from '@/features/eventos/components/ingresso-compartilhar-menu';
import { formatarEventoDataPeriodoPt } from '@/features/eventos/lib/datas-evento';
import type { MinhaReservaItemDto } from '@/features/eventos/types';
import { maskCPF, onlyDigits } from '@/lib/utils';
import { obterImagemQrPorToken } from '@/mocks/qr-code-imagens-mock';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Props = {
	item: MinhaReservaItemDto;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialIndex?: number;
};

function cpfParaExibicao(documento: string): string {
	const d = onlyDigits(documento);
	return d.length === 11 ? maskCPF(d) : documento;
}

export function DialogIngressosApresentacao({ item, open, onOpenChange, initialIndex = 0 }: Props) {
	const ingressos = item.ingressos ?? [];
	const total = ingressos.length;
	const [indice, setIndice] = useState(initialIndex);

	useEffect(() => {
		if (open) setIndice(Math.min(Math.max(0, initialIndex), Math.max(0, total - 1)));
	}, [open, initialIndex, total]);

	const atual = total > 0 ? ingressos[indice] : undefined;
	const evento = item.evento;
	const reserva = item.reserva;

	const irAnterior = useCallback(() => {
		setIndice((i) => (i <= 0 ? total - 1 : i - 1));
	}, [total]);

	const irProximo = useCallback(() => {
		setIndice((i) => (i >= total - 1 ? 0 : i + 1));
	}, [total]);

	useEffect(() => {
		if (!open || total <= 0) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') irAnterior();
			if (e.key === 'ArrowRight') irProximo();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, total, irAnterior, irProximo]);

	if (total === 0 || !atual) {
		return null;
	}

	const imgQr = obterImagemQrPorToken(atual.tokenQr);
	const realizacaoLabel = formatarEventoDataPeriodoPt(evento);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={
					'fixed inset-0 left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 bg-background p-4 shadow-none duration-200 sm:max-w-none sm:rounded-none ' +
					'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0'
				}
				onPointerDownOutside={(e) => e.preventDefault()}>
				<DialogHeader className='shrink-0 space-y-1 border-b pb-3 text-left'>
					<DialogTitle className='text-xl sm:text-2xl'>Apresentar ingresso</DialogTitle>
					<DialogDescription className='text-base'>
						Modo para o atendente ler o QR ou usar o código. Ingresso {indice + 1} de {total}.
					</DialogDescription>
				</DialogHeader>

				<div className='flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-auto py-4'>
					<p className='text-center text-lg font-semibold leading-tight sm:text-2xl'>{evento.nomeEvento}</p>
					<p className='text-center text-sm text-muted-foreground sm:text-base'>{realizacaoLabel}</p>
					<p className='text-center text-sm'>
						Reserva{' '}
						<span className='font-mono font-semibold text-foreground'>{reserva.codigoReserva}</span>
					</p>

					<div className='flex max-h-[min(50vh,420px)] w-full max-w-[min(90vw,420px)] items-center justify-center rounded-xl border bg-white p-4'>
						{imgQr ? (
							<img src={imgQr} alt='' className='max-h-full max-w-full object-contain' />
						) : (
							<p className='text-center text-muted-foreground'>Imagem do QR indisponível.</p>
						)}
					</div>

					<div className='w-full max-w-lg space-y-2 text-center'>
						<p className='text-sm font-medium text-muted-foreground'>Titular</p>
						<p className='text-2xl font-bold tracking-tight sm:text-4xl'>{atual.nomeTitular}</p>
						<p className='font-mono text-xl text-foreground sm:text-3xl'>{cpfParaExibicao(atual.documentoTitular)}</p>
						<p className='break-all font-mono text-xs text-muted-foreground sm:text-sm'>{atual.tokenQr}</p>
					</div>

					<div className='flex w-full max-w-lg flex-wrap items-center justify-center gap-2'>
						<IngressoCompartilharMenu
							dados={{
								nomeEvento: evento.nomeEvento,
								realizacaoLabel,
								codigoReserva: reserva.codigoReserva,
								ordem: atual.ordem,
								nomeTitular: atual.nomeTitular,
								tokenQr: atual.tokenQr,
							}}
						/>
					</div>
				</div>

				<div className='flex shrink-0 flex-wrap items-center justify-between gap-3 border-t pt-4'>
					<Button type='button' variant='outline' size='lg' onClick={irAnterior} className='gap-2'>
						<ChevronLeft className='h-5 w-5' aria-hidden />
						Anterior
					</Button>
					<span className='text-sm font-medium text-muted-foreground'>
						{indice + 1} / {total}
					</span>
					<Button type='button' variant='outline' size='lg' onClick={irProximo} className='gap-2'>
						Próximo
						<ChevronRight className='h-5 w-5' aria-hidden />
					</Button>
				</div>

				<p className='mt-2 text-center text-xs text-muted-foreground'>
					O código identifica o ingresso. Partilhe apenas por canais confiáveis.
				</p>
			</DialogContent>
		</Dialog>
	);
}
