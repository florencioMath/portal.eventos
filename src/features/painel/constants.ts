import { perfilPath } from '@/features/perfil/routes/perfil/route';
import type { LucideIcon } from 'lucide-react';
import { Ticket, UserRound } from 'lucide-react';
import { minhasReservasPath } from './routes/minhas-reservas/route';

export type TipoItemPainel = 'interno' | 'externo' | 'em_breve';

export type ItemModuloPainel = {
	id: string;
	titulo: string;
	descricao: string;
	icone: LucideIcon;
	tipo: TipoItemPainel;
	path?: string;
	url?: string;
};

export const itensModuloPainel: ItemModuloPainel[] = [
	{
		id: 'minhas-reservas',
		titulo: 'Minhas reservas',
		descricao: 'Consulte eventos nos quais você se inscreveu.',
		icone: Ticket,
		tipo: 'interno',
		path: minhasReservasPath,
	},
	{
		id: 'perfil',
		titulo: 'Meu perfil',
		descricao: 'Visualize e atualize seus dados cadastrais.',
		icone: UserRound,
		tipo: 'interno',
		path: perfilPath,
	},
];
