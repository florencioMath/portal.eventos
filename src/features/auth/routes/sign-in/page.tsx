import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { CONFIG } from '@/config';
import { useAutenticacao } from '@/hooks/use-autenticacao';
import { getApiError } from '@/lib/utils';
import { SENHA_MOCK, USUARIOS_MOCK } from '@/mocks/users';
import { Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ServicoAutenticacao } from '../../api/service';
import { signUpPath } from '../sign-up/route';

type LoginMode = 'password' | 'whatsapp';
type WhatsappStep = 'input' | 'verify';

const MOCK_API_ATIVO = import.meta.env.VITE_MOCK_API === 'true';

const COOLDOWN_SECONDS = 60;
const STORAGE_KEY_WPP = `${CONFIG.PROJECT_NAME}-wpp_login_state`;
const STORAGE_KEY_MODE = `${CONFIG.PROJECT_NAME}-login_mode`;

interface WhatsappPersistedState {
	login: string;
	cooldownUntil: number;
}

// --- helpers de storage ---
const saveLoginMode = (mode: LoginMode) => {
	localStorage.setItem(STORAGE_KEY_MODE, mode);
};

const loadLoginMode = (): LoginMode => {
	const raw = localStorage.getItem(STORAGE_KEY_MODE);
	return raw === 'whatsapp' ? 'whatsapp' : 'password';
};

const saveWhatsappState = (login: string) => {
	const state: WhatsappPersistedState = {
		login,
		cooldownUntil: Date.now() + COOLDOWN_SECONDS * 1000,
	};
	localStorage.setItem(STORAGE_KEY_WPP, JSON.stringify(state));
};

const loadWhatsappState = (): WhatsappPersistedState | null => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_WPP);
		if (!raw) return null;
		return JSON.parse(raw) as WhatsappPersistedState;
	} catch {
		return null;
	}
};

const clearWhatsappState = () => {
	localStorage.removeItem(STORAGE_KEY_WPP);
};

export const PaginaEntrar = () => {
	const [loginMode, setLoginMode] = useState<LoginMode>(loadLoginMode);
	const [login, setLogin] = useState('');
	const [senha, setSenha] = useState('');
	const [showSenha, setShowSenha] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [whatsappStep, setWhatsappStep] = useState<WhatsappStep>('input');
	const [codigoWhatsapp, setCodigoWhatsapp] = useState('');
	const [cooldownSeconds, setCooldownSeconds] = useState(0);

	const codeInputRef = useRef<HTMLInputElement>(null);
	const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const { entrar: registrarSessao } = useAutenticacao();
	const navigate = useNavigate();
	const location = useLocation();

	const destinoAposLogin = () => {
		const st = location.state as { from?: { pathname?: string; search?: string } } | null;
		const p = st?.from?.pathname;
		if (p && p.length > 0) return `${p}${st?.from?.search ?? ''}`;
		return '/painel';
	};

	// Restaura estado persistido ao montar (reload de página)
	useEffect(() => {
		const saved = loadWhatsappState();
		if (!saved) return;

		const remaining = Math.ceil((saved.cooldownUntil - Date.now()) / 1000);

		setLogin(saved.login);
		setLoginMode('whatsapp');
		saveLoginMode('whatsapp');
		setWhatsappStep('verify');
		setCooldownSeconds(remaining > 0 ? remaining : 0);
	}, []);

	// Gerencia o interval do countdown
	useEffect(() => {
		if (cooldownSeconds <= 0) {
			if (cooldownIntervalRef.current) {
				clearInterval(cooldownIntervalRef.current);
				cooldownIntervalRef.current = null;
			}
			return;
		}

		cooldownIntervalRef.current = setInterval(() => {
			setCooldownSeconds((prev) => {
				if (prev <= 1) {
					clearInterval(cooldownIntervalRef.current!);
					cooldownIntervalRef.current = null;
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (cooldownIntervalRef.current) {
				clearInterval(cooldownIntervalRef.current);
			}
		};
	}, [cooldownSeconds]);

	const startCooldown = () => setCooldownSeconds(COOLDOWN_SECONDS);

	const formatCooldown = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
	};

	const applyCPFMask = (value: string) => {
		const numbers = value.replace(/\D/g, '');

		if (numbers.length <= 11) {
			return numbers
				.replace(/(\d{3})(\d)/, '$1.$2')
				.replace(/(\d{3})(\d)/, '$1.$2')
				.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
		}

		return numbers
			.slice(0, 11)
			.replace(/(\d{3})(\d)/, '$1.$2')
			.replace(/(\d{3})(\d)/, '$1.$2')
			.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
	};

	const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;

		if (value.includes('@') || /[a-zA-Z]/.test(value)) {
			setLogin(value);
		} else {
			setLogin(applyCPFMask(value));
		}
	};

	const getCleanLogin = () => {
		if (login.includes('@')) return login;
		return login.replace(/\D/g, '');
	};

	const handleSwitchMode = (mode: LoginMode) => {
		setLoginMode(mode);
		saveLoginMode(mode);
		setWhatsappStep('input');
		setCodigoWhatsapp('');
		setSenha('');
		setShowSenha(false);
	};

	const handleSendWhatsappCode = async () => {
		if (!login) {
			toast.error('Preencha o CPF ou Email');
			return;
		}

		setIsLoading(true);

		try {
			const cleanLogin = getCleanLogin();
			const result = await ServicoAutenticacao.enviarCodigoWhatsapp({ login: cleanLogin });

			saveWhatsappState(login);
			setWhatsappStep('verify');
			startCooldown();
			toast.success(result.mensagem ?? 'Código reenviado!');
			setTimeout(() => codeInputRef.current?.focus(), 100);
		} catch (error) {
			toast.error(
				getApiError(error, 'Não foi possível enviar o código. Verifique seu CPF ou Email.')
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendCode = async () => {
		if (cooldownSeconds > 0 || isLoading) return;

		setIsLoading(true);

		try {
			const cleanLogin = getCleanLogin();
			const result = await ServicoAutenticacao.enviarCodigoWhatsapp({ login: cleanLogin });

			saveWhatsappState(login);
			startCooldown();
			setCodigoWhatsapp('');
			toast.success(result.mensagem ?? 'Código reenviado!');
			setTimeout(() => codeInputRef.current?.focus(), 100);
		} catch (error) {
			toast.error(getApiError(error, 'Não foi possível reenviar o código. Tente novamente.'));
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelVerify = () => {
		clearWhatsappState();
		setWhatsappStep('input');
		setCodigoWhatsapp('');
		setCooldownSeconds(0);
	};

	const handleWhatsappLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!codigoWhatsapp) {
			toast.error('Informe o código recebido no WhatsApp');
			return;
		}

		setIsLoading(true);

		try {
			const cleanLogin = getCleanLogin();
			const response = await ServicoAutenticacao.entrarComCodigoWhatsapp({
				login: cleanLogin,
				codigo: codigoWhatsapp,
			});
			clearWhatsappState();
			registrarSessao(response.token, response.user);
			toast.success('Bem-vindo de volta!');
			navigate(destinoAposLogin(), { replace: true });
		} catch (error) {
			toast.error(getApiError(error, 'Código inválido ou expirado. Tente novamente.'));
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasswordLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!login || !senha) {
			toast.error('Preencha todos os campos');
			return;
		}

		setIsLoading(true);

		try {
			const cleanLogin = getCleanLogin();
			const response = await ServicoAutenticacao.entrar({ login: cleanLogin, senha });
			registrarSessao(response.token, response.user);
			toast.success('Bem-vindo de volta!');
			navigate(destinoAposLogin(), { replace: true });
		} catch (error) {
			toast.error(getApiError(error, 'CPF/Email ou senha incorretos. Tente novamente.'));
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		if (loginMode === 'whatsapp') {
			if (whatsappStep === 'input') {
				e.preventDefault();
				handleSendWhatsappCode();
			} else {
				handleWhatsappLogin(e);
			}
		} else {
			handlePasswordLogin(e);
		}
	};

	const isWhatsapp = loginMode === 'whatsapp';
	const isVerifyStep = isWhatsapp && whatsappStep === 'verify';
	const isCoolingDown = cooldownSeconds > 0;

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 mt-1'>
			<div className='w-full max-w-md'>
				<div className='flex justify-center mb-8'>
					<img src={CONFIG.LOGO_SRC} alt='Logo' className='h-32 w-auto' />
				</div>

				<div className='text-center mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>
						Bem-vindo ao {CONFIG.PROJECT_LABEL}
					</h1>
					<p className='text-gray-600'>Acesse sua conta com CPF ou Email</p>
				</div>

				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8'>
					{/* Seletor de modo de login */}
					<div className='flex rounded-lg border border-gray-200 p-1 mb-6 gap-1'>
						<button
							type='button'
							onClick={() => handleSwitchMode('password')}
							disabled={isLoading}
							className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
								loginMode === 'password'
									? 'bg-blue-600 text-white shadow-sm'
									: 'text-gray-500 hover:text-gray-700'
							}`}>
							Senha
						</button>
						<button
							type='button'
							onClick={() => handleSwitchMode('whatsapp')}
							disabled={isLoading}
							className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
								loginMode === 'whatsapp'
									? 'bg-green-600 text-white shadow-sm'
									: 'text-gray-500 hover:text-gray-700'
							}`}>
							<MessageCircle className='h-4 w-4' />
							WhatsApp
						</button>
					</div>

					<form onSubmit={handleSubmit} className='space-y-5'>
						{/* Campo de login */}
						<div className='space-y-2'>
							<label
								htmlFor='login'
								className='block text-sm font-medium text-gray-700'>
								CPF ou Email
							</label>
							<Input
								id='login'
								type='text'
								value={login}
								onChange={handleLoginChange}
								placeholder='000.000.000-00 ou seu@email.com'
								className='h-11'
								disabled={isLoading || isVerifyStep}
								autoComplete='username'
							/>
						</div>

						{/* Campo de senha — apenas no modo senha */}
						{loginMode === 'password' && (
							<div className='space-y-2'>
								<label
									htmlFor='senha'
									className='block text-sm font-medium text-gray-700'>
									Senha
								</label>
								<div className='relative'>
									<Input
										id='senha'
										type={showSenha ? 'text' : 'password'}
										value={senha}
										onChange={(e) => setSenha(e.target.value)}
										placeholder='••••••••'
										className='h-11 pr-10'
										disabled={isLoading}
										autoComplete='current-password'
									/>
									<button
										type='button'
										onClick={() => setShowSenha(!showSenha)}
										className='absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
										disabled={isLoading}
										aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}>
										{showSenha ? (
											<EyeOff className='h-5 w-5' />
										) : (
											<Eye className='h-5 w-5' />
										)}
									</button>
								</div>
							</div>
						)}

						{/* Campo de código + controles de reenvio */}
						{isVerifyStep && (
							<div className='space-y-2'>
								<label
									htmlFor='codigo'
									className='block text-sm font-medium text-gray-700'>
									Código do WhatsApp
								</label>
								<p className='text-xs text-gray-500'>
									Enviamos um código para o WhatsApp cadastrado no seu perfil.
								</p>
								<Input
									ref={codeInputRef}
									id='codigo'
									type='text'
									value={codigoWhatsapp}
									onChange={(e) =>
										setCodigoWhatsapp(
											e.target.value.replace(/\D/g, '').slice(0, 6)
										)
									}
									placeholder='000000'
									className='h-11 text-center tracking-widest text-lg font-mono'
									disabled={isLoading}
									maxLength={6}
									autoComplete='one-time-code'
									inputMode='numeric'
								/>

								{/* Reenvio + cancelar */}
								<div className='flex items-center justify-between pt-1'>
									{isCoolingDown ? (
										<span className='text-xs text-gray-400'>
											Reenviar em{' '}
											<span className='font-mono font-medium text-gray-600 tabular-nums'>
												{formatCooldown(cooldownSeconds)}
											</span>
										</span>
									) : (
										<button
											type='button'
											onClick={handleResendCode}
											disabled={isLoading}
											className='text-xs text-green-700 hover:text-green-800 font-medium transition-colors cursor-pointer disabled:opacity-50'>
											Reenviar código
										</button>
									)}
									<button
										type='button'
										onClick={handleCancelVerify}
										disabled={isLoading}
										className='text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50'>
										Alterar CPF/Email
									</button>
								</div>
							</div>
						)}

						{/* Lembrar de mim + Esqueceu a senha — apenas no modo senha */}
						{loginMode === 'password' && (
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<input
										type='checkbox'
										id='remember'
										checked={rememberMe}
										onChange={(e) => setRememberMe(e.target.checked)}
										className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
									/>
									<label
										htmlFor='remember'
										className='text-sm text-gray-600 select-none cursor-pointer'>
										Lembrar de mim
									</label>
								</div>
								<Link
									to={signUpPath}
									className='text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors'>
									Esqueceu a senha?
								</Link>
							</div>
						)}

						{MOCK_API_ATIVO && loginMode === 'password' && (
							<div className='rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950'>
								<p className='font-semibold text-amber-900 mb-2'>
									Acesso mock (somente desenvolvimento)
								</p>
								<ul className='space-y-1.5 font-mono text-xs sm:text-sm'>
									{Object.keys(USUARIOS_MOCK).map((email) => (
										<li key={email}>
											<span className='text-amber-800/90'>Login: </span>
											<span className='font-medium select-all'>{email}</span>
										</li>
									))}
									<li>
										<span className='text-amber-800/90'>Senha: </span>
										<span className='font-medium select-all'>{SENHA_MOCK}</span>
									</li>
								</ul>
							</div>
						)}

						<Button
							type='submit'
							className={`w-full h-11 font-medium text-white ${
								isWhatsapp
									? 'bg-green-600 hover:bg-green-700'
									: 'bg-blue-600 hover:bg-blue-700'
							}`}
							disabled={isLoading || (isVerifyStep && codigoWhatsapp.length < 6)}>
							{isLoading ? (
								<>
									<div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
									{isVerifyStep
										? 'Verificando...'
										: isWhatsapp
											? 'Enviando...'
											: 'Entrando...'}
								</>
							) : isVerifyStep ? (
								'Entrar'
							) : isWhatsapp ? (
								<>
									<MessageCircle className='mr-2 h-4 w-4' />
									Enviar código pelo WhatsApp
								</>
							) : (
								'Entrar'
							)}
						</Button>
					</form>
				</div>

				<p className='mt-6 text-center text-sm text-gray-600'>
					Não tem uma conta?{' '}
					<Link
						to={signUpPath}
						className='text-blue-600 hover:text-blue-700 font-medium transition-colors'>
						Criar conta
					</Link>
				</p>
			</div>
		</div>
	);
};
