import type { EventoCadastroDto } from '@/features/eventos/types';
import { obterPontosDeTroca } from '@/features/eventos/lib/visibilidade-evento';

type Props = {
	evento: EventoCadastroDto;
	className?: string;
};

/** Nome + endereço por ponto (detalhe do evento, minhas reservas). */
export function ListaPontosDeTrocaDetalhe({ evento, className }: Props) {
	const pts = obterPontosDeTroca(evento);
	if (evento.semPontoDeTroca) {
		return <span className={className}>Troca conforme descrição do evento</span>;
	}
	if (pts.length === 0) {
		return <span className={className}>Locais conforme descrição</span>;
	}
	return (
		<span className={className}>
			<span className='flex flex-col gap-2'>
				{pts.map((p, i) => (
					<span key={`${p.id}-${i}`} className='block'>
						<span className='font-medium text-foreground'>{p.nome}</span>
						{p.endereco.trim() ? (
							<span className='mt-0.5 block text-muted-foreground'>{p.endereco.trim()}</span>
						) : null}
					</span>
				))}
			</span>
		</span>
	);
}
