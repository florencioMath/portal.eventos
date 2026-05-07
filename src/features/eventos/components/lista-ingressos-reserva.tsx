import { Button } from '@/components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogIngressosApresentacao } from '@/features/eventos/components/dialog-ingressos-apresentacao';
import { IngressoCompartilharMenu } from '@/features/eventos/components/ingresso-compartilhar-menu';
import { IngressosApi } from '@/features/eventos/api/ingressos-api';
import { cpfTitularEhValido } from '@/features/eventos/lib/cpf-titular';
import { formatarEventoDataPeriodoPt } from '@/features/eventos/lib/datas-evento';
import type { IngressoReservaDto, MinhaReservaItemDto } from '@/features/eventos/types';
import { obterImagemQrPorToken } from '@/mocks/qr-code-imagens-mock';
import { maskCPF, onlyDigits } from '@/lib/utils';
import { Expand, QrCode, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
	item: MinhaReservaItemDto;
	onAtualizado: () => void;
};

function IngressoCartao({
	ingresso,
	item,
	totalOrdens,
	onSalvo,
	realizacaoLabel,
}: {
	ingresso: IngressoReservaDto;
	item: MinhaReservaItemDto;
	totalOrdens: number;
	onSalvo: () => void;
	realizacaoLabel: string;
}) {
	const [nome, setNome] = useState(ingresso.nomeTitular);
	const [cpfMascarado, setCpfMascarado] = useState(maskCPF(onlyDigits(ingresso.documentoTitular)));
	const [gravando, setGravando] = useState(false);

	useEffect(() => {
		setNome(ingresso.nomeTitular);
		setCpfMascarado(maskCPF(onlyDigits(ingresso.documentoTitular)));
	}, [ingresso.cdIngresso, ingresso.nomeTitular, ingresso.documentoTitular]);

	const salvar = async () => {
		const doc = onlyDigits(cpfMascarado);
		if (!nome.trim()) {
			toast.error('Informe o nome do titular.');
			return;
		}
		if (!cpfTitularEhValido(doc)) {
			toast.error('CPF inválido.');
			return;
		}
		setGravando(true);
		try {
			await IngressosApi.atualizarTitular(ingresso.cdIngresso, {
				nomeTitular: nome.trim(),
				documentoTitular: doc,
			});
			toast.success('Dados do ingresso atualizados.');
			onSalvo();
		} catch {
			toast.error('Não foi possível salvar os dados do ingresso.');
		} finally {
			setGravando(false);
		}
	};

	const imgQr = obterImagemQrPorToken(ingresso.tokenQr);

	return (
		<Card className='border-border/80'>
			<CardHeader className='pb-2'>
				<CardTitle className='flex flex-wrap items-center gap-2 text-base font-semibold'>
					<span className='inline-flex items-center gap-2'>
						<Ticket className='h-5 w-5 shrink-0 text-primary' aria-hidden />
						Ingresso {ingresso.ordem} de {totalOrdens}
					</span>
				</CardTitle>
				<CardDescription>
					Código da reserva{' '}
					<span className='font-mono font-medium text-foreground'>{item.reserva.codigoReserva}</span>
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex flex-col gap-4 sm:flex-row sm:items-start'>
					<div className='mx-auto flex h-44 w-44 shrink-0 items-center justify-center rounded-lg border bg-white p-2 sm:mx-0'>
						{imgQr ? (
							<img src={imgQr} alt='' className='max-h-full max-w-full object-contain' />
						) : (
							<QrCode className='h-16 w-16 text-muted-foreground' aria-hidden />
						)}
					</div>
					<div className='min-w-0 flex-1 space-y-3'>
						<div>
							<p className='text-xs font-medium text-muted-foreground'>Código do ingresso (QR)</p>
							<p className='break-all font-mono text-sm text-foreground'>{ingresso.tokenQr}</p>
						</div>
						<p className='text-xs text-muted-foreground'>
							Este código identifica o ingresso na retirada. Guarde-o e partilhe apenas por canais de
							confiança.
						</p>
						<div className='grid gap-3 sm:grid-cols-2'>
							<div className='space-y-1.5'>
								<Label htmlFor={`titular-${ingresso.cdIngresso}`}>Nome do titular</Label>
								<Input
									id={`titular-${ingresso.cdIngresso}`}
									value={nome}
									onChange={(e) => setNome(e.target.value)}
									autoComplete='name'
									disabled={gravando}
								/>
							</div>
							<div className='space-y-1.5'>
								<Label htmlFor={`cpf-${ingresso.cdIngresso}`}>CPF</Label>
								<Input
									id={`cpf-${ingresso.cdIngresso}`}
									value={cpfMascarado}
									onChange={(e) => setCpfMascarado(maskCPF(e.target.value))}
									inputMode='numeric'
									autoComplete='off'
									disabled={gravando}
								/>
							</div>
						</div>
						<div className='flex flex-wrap items-center gap-2'>
							<Button type='button' size='sm' onClick={() => void salvar()} disabled={gravando}>
								{gravando ? 'Alterando…' : 'Alterar dados'}
							</Button>
							<IngressoCompartilharMenu
								dados={{
									nomeEvento: item.evento.nomeEvento,
									realizacaoLabel,
									codigoReserva: item.reserva.codigoReserva,
									ordem: ingresso.ordem,
									nomeTitular: nome.trim() || ingresso.nomeTitular,
									tokenQr: ingresso.tokenQr,
								}}
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function reservaEstaCancelada(statusReserva: string | undefined): boolean {
	return String(statusReserva ?? '').toUpperCase() === 'CANCELADA';
}

export function ListaIngressosReserva({ item, onAtualizado }: Props) {
	const ingressos = item.ingressos;
	const [dialogoApresentacao, setDialogoApresentacao] = useState(false);

	if (reservaEstaCancelada(item.reserva.statusReserva)) return null;
	if (!ingressos?.length) return null;

	const realizacaoLabel = formatarEventoDataPeriodoPt(item.evento);
	const totalOrdens = ingressos.length;

	return (
		<>
			<Card className='border-primary/15'>
				<CardHeader className='pb-2'>
					<CardTitle className='flex flex-wrap items-center gap-2 text-base font-semibold'>
						<QrCode className='h-5 w-5 shrink-0 text-primary' aria-hidden />
						Ingressos e QR Code
					</CardTitle>
					<CardDescription>
						Cada bilhete tem um código único. Pode ajustar o titular até à validação da retirada (conforme
						regras do evento).
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex flex-wrap justify-end'>
						<Button type='button' variant='secondary' onClick={() => setDialogoApresentacao(true)}>
							<Expand className='mr-2 h-4 w-4' aria-hidden />
							Tela cheia
						</Button>
					</div>
					<div className='space-y-4'>
						{ingressos.map((ing) => (
							<IngressoCartao
								key={ing.cdIngresso}
								ingresso={ing}
								item={item}
								totalOrdens={totalOrdens}
								onSalvo={onAtualizado}
								realizacaoLabel={realizacaoLabel}
							/>
						))}
					</div>
				</CardContent>
			</Card>

			<DialogIngressosApresentacao
				item={item}
				open={dialogoApresentacao}
				onOpenChange={setDialogoApresentacao}
			/>
		</>
	);
}
