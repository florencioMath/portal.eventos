import type { LucideIcon } from 'lucide-react';
import { Blocks, ExternalLink, Layers, UserRound } from 'lucide-react';

export type TipoItemPainel = 'interno' | 'externo' | 'em_breve';

export type ItemModuloPainel = {
	id: string;
	titulo: string;
	descricao: string;
	icone: LucideIcon;
	tipo: TipoItemPainel;
	/** Rota interna (ex.: /perfil) */
	path?: string;
	/** URL absoluta para link externo */
	url?: string;
};

/**
 * Lista de módulos exibidos no painel. Ao adicionar uma nova feature ao portal,
 * inclua um item aqui (e a rota correspondente no router).
 */
export const itensModuloPainel: ItemModuloPainel[] = [
	{
		id: 'catalogo-componentes',
		titulo: 'Catálogo de componentes',
		descricao:
			'Demonstração dos blocos base (Gestão + Portal): endereço, anexos, histórico, badges e UI.',
		icone: Blocks,
		tipo: 'interno',
		path: '/painel/componentes',
	},
	{
		id: 'perfil',
		titulo: 'Meu perfil',
		descricao: 'Visualize e atualize seus dados cadastrais.',
		icone: UserRound,
		tipo: 'interno',
		path: '/perfil',
	},
	{
		id: 'exemplo-externo',
		titulo: 'Serviço externo (exemplo)',
		descricao: 'Link para um sistema externo — substitua pela URL do seu órgão.',
		icone: ExternalLink,
		tipo: 'externo',
		url: 'https://www.gov.br/pt-br',
	},
	{
		id: 'em-breve',
		titulo: 'Novo módulo',
		descricao: 'Reservado para um serviço que será publicado em breve.',
		icone: Layers,
		tipo: 'em_breve',
	},
];
