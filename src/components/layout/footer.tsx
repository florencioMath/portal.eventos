import { CONFIG } from '@/config';
import { inicioPath } from '@/features/inicio/routes/inicio/route';
import { painelPath } from '@/features/painel/routes/painel/route';
import { Tooltip } from '@/components/base/tooltip';
import { Link } from 'react-router-dom';

export const Footer = () => {
	return (
		<footer className='bg-primary text-primary-foreground'>
			<div className='w-full max-w-7xl mx-auto px-6 py-10'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					<div className='space-y-3'>
						<div className='flex items-center gap-2.5'>
							<img src={CONFIG.LOGO_SRC} alt='Logo' className='h-7 w-auto' />

							<div>
								<span className='font-bold text-sm tracking-wide'>
									{CONFIG.BRAND_TITLE}
								</span>
								<span className='block text-[10px] opacity-70'>{CONFIG.PROJECT_SUBTITLE}</span>
							</div>
						</div>
						<p className='text-xs opacity-70 leading-relaxed max-w-xs'>
							{CONFIG.RODAPE_RESUMO}
						</p>
					</div>

					<div className='space-y-3'>
						<h4 className='font-semibold text-sm'>Navegação</h4>
						<ul className='space-y-2 text-xs opacity-80'>
							<li>
								<Link
									to={inicioPath}
									className='hover:opacity-100 hover:underline transition-opacity'>
									Início
								</Link>
							</li>
							<li>
								<Link
									to={painelPath}
									className='hover:opacity-100 hover:underline transition-opacity'>
									Painel
								</Link>
							</li>
							<li>
								<Tooltip content='Personalize os links no componente Footer'>
									<span className='cursor-default'>Mais serviços</span>
								</Tooltip>
							</li>
						</ul>
					</div>

					<div className='space-y-3'>
						<h4 className='font-semibold text-sm'>{CONFIG.CONTATO_TITULO}</h4>
						<ul className='space-y-2 text-xs opacity-80'>
							<li>📞 {CONFIG.CONTATO_TELEFONE}</li>
							<li>✉️ {CONFIG.CONTATO_EMAIL}</li>
						</ul>
					</div>
				</div>

				<div className='border-t border-primary-foreground/20 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3'>
					<span className='text-xs opacity-60'>
						© {new Date().getFullYear()} {CONFIG.PROJECT_LABEL} — Todos os direitos
						reservados
					</span>
					<span className='text-xs opacity-60'>{CONFIG.BRAND_SUBTITLE}</span>
				</div>
			</div>
		</footer>
	);
};
