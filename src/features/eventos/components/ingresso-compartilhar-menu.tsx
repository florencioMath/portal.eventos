import { Button } from '@/components/base/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { copiarTextoParaClipboard } from '@/features/eventos/lib/copiar-texto';
import {
	montarAssuntoCompartilhamentoIngresso,
	montarMensagemCompartilhamentoIngresso,
	type DadosMensagemIngresso,
} from '@/features/eventos/lib/ingresso-compartilhamento-mensagem';
import { ChevronDown, Copy, Mail, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export type IngressoCompartilharMenuProps = {
	dados: DadosMensagemIngresso;
	className?: string;
};

export function IngressoCompartilharMenu({ dados, className }: IngressoCompartilharMenuProps) {
	const mensagem = montarMensagemCompartilhamentoIngresso(dados);
	const assunto = montarAssuntoCompartilhamentoIngresso(dados);
	const tituloShare = assunto;

	const copiar = async () => {
		const ok = await copiarTextoParaClipboard(dados.tokenQr);
		if (ok) toast.success('Código copiado para a área de transferência.');
		else toast.error('Não foi possível copiar. Copie manualmente o código.');
	};

	const copiarMensagemCompleta = async () => {
		const ok = await copiarTextoParaClipboard(mensagem);
		if (ok) toast.success('Mensagem copiada.');
		else toast.error('Não foi possível copiar a mensagem.');
	};

	const whatsapp = () => {
		const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
		window.open(url, '_blank', 'noopener,noreferrer');
	};

	const email = () => {
		const url = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;
		window.location.href = url;
	};

	const sms = () => {
		const url = `sms:?body=${encodeURIComponent(mensagem)}`;
		window.location.href = url;
	};

	const compartilharNativo = async () => {
		if (!navigator.share) return;
		try {
			await navigator.share({ title: tituloShare, text: mensagem });
		} catch (e) {
			const err = e as Error;
			if (err?.name !== 'AbortError') toast.error('Não foi possível abrir o compartilhamento.');
		}
	};

	const podeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button type='button' variant='outline' size='sm' className={className}>
					<Share2 className='mr-1.5 h-4 w-4' aria-hidden />
					Compartilhar
					<ChevronDown className='ml-1 h-3 w-3 opacity-70' aria-hidden />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='min-w-[14rem]'>
				<DropdownMenuItem onClick={() => void copiar()}>
					<Copy className='mr-2 h-4 w-4' aria-hidden />
					Copiar só o código
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => void copiarMensagemCompleta()}>
					<Copy className='mr-2 h-4 w-4' aria-hidden />
					Copiar mensagem completa
				</DropdownMenuItem>
				{podeShare ? (
					<DropdownMenuItem onClick={() => void compartilharNativo()}>
						<Share2 className='mr-2 h-4 w-4' aria-hidden />
						Compartilhar…
					</DropdownMenuItem>
				) : null}
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={whatsapp}>
					<MessageCircle className='mr-2 h-4 w-4' aria-hidden />
					WhatsApp
				</DropdownMenuItem>
				<DropdownMenuItem onClick={email}>
					<Mail className='mr-2 h-4 w-4' aria-hidden />
					E-mail
				</DropdownMenuItem>
				<DropdownMenuItem onClick={sms}>SMS</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
