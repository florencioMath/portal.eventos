import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { CONFIG } from '@/config';
import { signInPath } from '@/features/auth/routes/sign-in/route';
import { signUpPath } from '@/features/auth/routes/sign-up/route';
import { inicioPath } from '@/features/inicio/routes/inicio/route';
import { painelPath } from '@/features/painel/routes/painel/route';
import { perfilPath } from '@/features/perfil/routes/perfil/route';
import { useAutenticacao } from '@/hooks/use-autenticacao';
import { useClaims } from '@/hooks/use-claims';
import { cn } from '@/lib/utils';
import { ChevronDown, LogIn, LogOut, Menu, User, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../base/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../base/dropdown-menu';

type NavLink = {
	path: string;
	label: string;
	claim?: string;
	href?: string;
	external?: boolean;
};

export const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navigate = useNavigate();
	const { user, sair, isAuthenticated } = useAutenticacao();
	const { hasClaim } = useClaims();
	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const publicNav: NavLink[] = [
		{ label: 'Início', path: inicioPath },
		{ label: 'Eventos', path: inicioPath, href: '#eventos' },
		{ label: 'Contato', path: inicioPath, href: '#contato' },
	];

	const authNav: NavLink[] = [{ path: painelPath, label: 'Painel' }];

	const authMenu = [
		{ path: painelPath, label: 'Painel' },
		{ path: perfilPath, label: 'Perfil' },
	];

	const links: NavLink[] = useMemo(() => {
		if (isAuthenticated) {
			return authNav;
		}
		return publicNav;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated]);

	const visibleLinks = useMemo(
		() =>
			links.filter((link) => {
				if (!link.claim) return true;
				return hasClaim(link.claim);
			}),
		[links, hasClaim]
	);

	return (
		<nav className='w-full'>
			<div className='bg-white border-b border-gray-200 shadow-sm'>
				<div className='max-w-350 mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center h-20'>
						<div className='flex items-center gap-8'>
							<Link to='/' className='flex items-center gap-2.5 shrink-0'>
								<img src={CONFIG.LOGO_SRC} alt='Logo' className='h-7 w-auto' />

								<div className='leading-tight hidden sm:block'>
									<span className='font-bold text-foreground text-sm tracking-wide'>
										{CONFIG.BRAND_TITLE}
									</span>
									<span className='block text-[10px] text-muted-foreground leading-none'>
										{CONFIG.BRAND_SUBTITLE}
									</span>
								</div>
							</Link>

							<div className='hidden lg:block'>
								<NavigationMenu>
									<NavigationMenuList>
										{visibleLinks.map((link, i) => (
											<NavigationMenuItem key={i}>
												<NavigationMenuLink asChild>
													{link.external ? (
														<a
															href={link.path}
															target='_blank'
															rel='noopener noreferrer'
															className={cn(
																navigationMenuTriggerStyle(),
																'text-gray-700 hover:text-primary font-medium'
															)}>
															{link.label}
														</a>
													) : link.href ? (
														<a
															href={`${link.path}${link.href}`}
															className={cn(
																navigationMenuTriggerStyle(),
																'text-gray-700 hover:text-primary font-medium'
															)}>
															{link.label}
														</a>
													) : (
														<Link
															to={link.path}
															className={cn(
																navigationMenuTriggerStyle(),
																'text-gray-700 hover:text-primary font-medium'
															)}>
															{link.label}
														</Link>
													)}
												</NavigationMenuLink>
											</NavigationMenuItem>
										))}
									</NavigationMenuList>
								</NavigationMenu>
							</div>
						</div>

						<div className='hidden lg:flex items-center gap-3'>
							{isAuthenticated ? (
								<DropdownMenu>
									<DropdownMenuTrigger className='flex items-center gap-2 p-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer'>
										<span className='font-medium'>{user?.name}</span>
										<ChevronDown className='h-4 w-4' />
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align='start'
										className='flex flex-col gap-3'>
										{authMenu.map((link, i) => (
											<DropdownMenuItem key={i} asChild>
												<Link
													to={link.path}
													className={cn(
														navigationMenuTriggerStyle(),
														'text-gray-700 hover:text-primary font-medium text-start w-full items-start justify-start cursor-pointer'
													)}
													onClick={toggleMenu}>
													{link.label}
												</Link>
											</DropdownMenuItem>
										))}
										<DropdownMenuItem>
											<Button
												onClick={sair}
												variant='outline'
												size='default'
												className='flex items-center gap-2 w-full'>
												<LogOut className='h-4 w-4' />
												Sair
											</Button>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<>
									<Button onClick={() => navigate(signUpPath)}>
										<UserPlus className='h-4 w-4 mr-2' />
										Cadastrar
									</Button>
									<Button onClick={() => navigate(signInPath)}>
										<LogIn className='h-4 w-4 mr-2' />
										Entrar
									</Button>
								</>
							)}
						</div>

						<div className='lg:hidden'>
							<Button
								variant='ghost'
								size='icon'
								onClick={toggleMenu}
								aria-label='Toggle menu'
								className='text-gray-700'>
								{isMenuOpen ? (
									<X className='h-6 w-6' />
								) : (
									<Menu className='h-6 w-6' />
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{isMenuOpen && (
				<div className='lg:hidden border-t border-gray-200 bg-white'>
					<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
						{isAuthenticated ? (
							<>
								{authMenu.map((link) => (
									<Link
										key={link.path}
										to={link.path}
										className='block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
										onClick={toggleMenu}>
										{link.label}
									</Link>
								))}
							</>
						) : (
							<>
								{visibleLinks.map((link) =>
									link.external ? (
										<a
											key={link.path}
											href={link.path}
											target='_blank'
											rel='noopener noreferrer'
											className='block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
											onClick={toggleMenu}>
											{link.label}
										</a>
									) : (
										<Link
											key={`${link.path}${link.href ?? ''}`}
											to={link.href ? `${link.path}${link.href}` : link.path}
											className='block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
											onClick={toggleMenu}>
											{link.label}
										</Link>
									)
								)}
							</>
						)}
					</div>

					<div className='border-t border-gray-200 pt-4 pb-3'>
						<div className='mt-3 px-2 space-y-2'>
							{isAuthenticated ? (
								<>
									<div className='flex items-center gap-2 text-gray-700 px-3 py-2 bg-gray-50 rounded-md'>
										<User className='h-4 w-4' />
										<span className='font-medium'>{user?.name}</span>
									</div>
									<Button
										variant='outline'
										className='w-full'
										onClick={() => {
											sair();
											navigate(signInPath);
											toggleMenu();
										}}>
										<LogOut className='h-4 w-4 mr-2' />
										Sair
									</Button>
								</>
							) : (
								<>
									<Button
										className='w-full'
										onClick={() => {
											navigate(signUpPath);
											toggleMenu();
										}}>
										<UserPlus className='h-4 w-4 mr-2' />
										Cadastrar
									</Button>
									<Button
										className='w-full'
										onClick={() => {
											navigate(signInPath);
											toggleMenu();
										}}>
										<LogIn className='h-4 w-4 mr-2' />
										Entrar
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};
