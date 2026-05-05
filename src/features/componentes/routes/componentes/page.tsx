import { Button } from '@/components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/base/card';
import {
	ENDERECO_VAZIO_PADRAO,
	FormularioEndereco,
	type ValorFormularioEndereco,
} from '@/components/base/formulario-endereco';
import { DialogoHistorico } from '@/components/base/dialogo-historico';
import { DialogoUploadAnexo } from '@/components/base/dialogo-upload-anexo';
import { ListaAnexos } from '@/components/base/lista-anexos';
import { ModalVisualizadorAnexo } from '@/components/base/modal-visualizador-anexo';
import { StatusBadgeVeiculoRemovido } from '@/components/base/status-badge-veiculo-removido';
import { UploadArquivos, type AnexoEmUpload } from '@/components/base/upload-arquivos';
import { Can } from '@/components/can';
import { Input } from '@/components/base/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/base/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/base/select';
import { CONFIG } from '@/config';
import type { ArquivoAnexo } from '@/lib/download-anexo';
import { painelPath } from '@/features/painel/routes/painel/route';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const CAMINHO_HISTORICO_DEMO = '/componentes/historico-demo';

const CHAVES_STATUS_DEMO = [
	'AGUARDANDO_REVISAO_DEPARTAMENTO',
	'AGUARDANDO_REVISAO_PATIO',
	'NO_PATIO',
	'RETIRADO',
	'RECUSADO_DEPARTAMENTO',
	'DEVOLVIDO_PATIO',
	'PENDENTE',
	'APROVADO',
	'CONCLUIDO',
	'PRAZO_ENCERRADO',
	'REPROVADO',
] as const;

const PNG_MINIMO_BASE64 =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export function PaginaCatalogoComponentes() {
	const navigate = useNavigate();
	const [endereco, setEndereco] = useState<ValorFormularioEndereco>({ ...ENDERECO_VAZIO_PADRAO });
	const [statusGps, setStatusGps] = useState('');
	const [uploads, setUploads] = useState<AnexoEmUpload[]>([]);
	const [dialogoUploadAberto, setDialogoUploadAberto] = useState(false);
	const [historicoAberto, setHistoricoAberto] = useState(false);

	const [anexoVisualizar, setAnexoVisualizar] = useState<ArquivoAnexo | null>(null);
	const [modalAnexoAberto, setModalAnexoAberto] = useState(false);

	const anexosExemplo = useMemo<ArquivoAnexo[]>(
		() => [
			{
				id: 'ex-img',
				nome: 'pixel-demo.png',
				tipoMime: 'image/png',
				tamanhoBytes: 70,
				conteudoBase64: PNG_MINIMO_BASE64,
			},
			{
				id: 'ex-url',
				nome: 'logo-osasco.png',
				tipoMime: 'image/png',
				tamanhoBytes: undefined,
				url:
					typeof window !== 'undefined'
						? `${window.location.origin}${CONFIG.LOGO_SRC}`
						: CONFIG.LOGO_SRC,
			},
		],
		[]
	);

	const patchEndereco = (patch: Partial<ValorFormularioEndereco>) => {
		setEndereco((prev) => ({ ...prev, ...patch }));
	};

	return (
		<section className='container'>
			<div className='flex justify-start mb-6'>
				<Button variant='ghost' size='sm' onClick={() => navigate(painelPath)}>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Voltar
				</Button>
			</div>

			<div className='space-y-8 max-w-4xl mx-auto'>
				<div>
					<h1 className='text-2xl font-bold'>Catálogo de componentes</h1>
					<p className='text-sm text-muted-foreground mt-1'>
						Blocos alinhados ao projeto <strong>Gestão</strong> (pasta{' '}
						<code className='text-xs'>components/base</code>) e exemplos dos componentes base
						deste <strong>Portal</strong>. Com <code className='text-xs'>VITE_MOCK_API=true</code>, CEP,
						logradouro e histórico usam respostas fictícias.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Componentes do Portal (UI base)</CardTitle>
						<CardDescription>
							<code className='text-xs'>Input</code>, <code className='text-xs'>Label</code>,{' '}
							<code className='text-xs'>Select</code> e <code className='text-xs'>Can</code> (claims).
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-2 max-w-sm'>
							<Label htmlFor='demo-input'>Campo de texto</Label>
							<Input id='demo-input' placeholder='Placeholder' />
						</div>
						<div className='grid gap-2 max-w-sm'>
							<Label>Seleção</Label>
							<Select defaultValue='a'>
								<SelectTrigger>
									<SelectValue placeholder='Escolha' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='a'>Opção A</SelectItem>
									<SelectItem value='b'>Opção B</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2 max-w-sm'>
							<Label>Skeleton (shadcn)</Label>
							<div className='flex items-center gap-4'>
								<Skeleton className='h-12 w-12 rounded-full' />
								<div className='space-y-2 flex-1'>
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-3/4' />
								</div>
							</div>
						</div>
						<div className='rounded-md border p-3 text-sm'>
							<p className='font-medium mb-2'>Can (exemplo)</p>
							<Can claim='portal.catalogo.view' fallback={<span className='text-muted-foreground'>Sem a claim `portal.catalogo.view` — texto alternativo.</span>}>
								<span className='text-green-700'>Você possui a claim `portal.catalogo.view`.</span>
							</Can>
						</div>
						<p className='text-xs text-muted-foreground'>
							Voltar ao painel:{' '}
							<Link to={painelPath} className='text-primary underline'>
								Painel
							</Link>
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>FormularioEndereco</CardTitle>
						<CardDescription>
							CEP e logradouro (API / mock), modal &quot;Não sei o CEP&quot;, GPS e endereço completo.
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<FormularioEndereco
							value={endereco}
							onChange={patchEndereco}
							statusGps={statusGps}
							onStatusGpsChange={setStatusGps}
							cidadeBuscaLogradouro='São Paulo'
							ufBuscaLogradouro='SP'
						/>
						<p className='text-xs text-muted-foreground font-mono break-all'>
							{JSON.stringify(endereco)}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>StatusBadgeVeiculoRemovido</CardTitle>
						<CardDescription>
							Rótulos e cores a partir de <code className='text-xs'>veiculo-removido-status</code>.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='flex flex-wrap gap-2'>
							{CHAVES_STATUS_DEMO.map((chave) => (
								<StatusBadgeVeiculoRemovido key={chave} status={chave} />
							))}
							<StatusBadgeVeiculoRemovido />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>UploadArquivos</CardTitle>
						<CardDescription>Lista local com remoção; arraste arquivos ou use o botão.</CardDescription>
					</CardHeader>
					<CardContent>
						<UploadArquivos anexos={uploads} onAnexosChange={setUploads} multiplo />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>DialogoUploadAnexo</CardTitle>
						<CardDescription>Diálogo pronto com upload e confirmação.</CardDescription>
					</CardHeader>
					<CardContent>
						<Button type='button' onClick={() => setDialogoUploadAberto(true)}>
							Abrir diálogo de upload
						</Button>
						<DialogoUploadAnexo
							aberto={dialogoUploadAberto}
							onAbertoChange={setDialogoUploadAberto}
							titulo='Enviar anexos (demo)'
							descricao='Os arquivos não são enviados a lugar nenhum nesta demonstração.'
							onConfirmar={async (arquivos) => {
								toast.success(`${arquivos.length} arquivo(s) selecionado(s).`);
							}}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>ListaAnexos + ModalVisualizadorAnexo</CardTitle>
						<CardDescription>
							Lista com ações; o ícone de olho abre o modal (PNG em base64 e imagem por URL).
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ListaAnexos
							anexos={anexosExemplo}
							onVisualizar={(a) => {
								setAnexoVisualizar(a);
								setModalAnexoAberto(true);
							}}
						/>
						<ModalVisualizadorAnexo
							aberto={modalAnexoAberto}
							onAbertoChange={setModalAnexoAberto}
							anexo={anexoVisualizar}
							titulo='Visualizar anexo (demo)'
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>DialogoHistorico</CardTitle>
						<CardDescription>
							Carrega via <code className='text-xs'>HistoricoService.listar</code>. Com{' '}
							<code className='text-xs'>VITE_MOCK_API=true</code>, o caminho{' '}
							<code className='text-xs'>{CAMINHO_HISTORICO_DEMO}</code> retorna exemplos.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button type='button' variant='outline' onClick={() => setHistoricoAberto(true)}>
							Abrir histórico de exemplo
						</Button>
						<DialogoHistorico
							aberto={historicoAberto}
							onAbertoChange={setHistoricoAberto}
							titulo='Histórico (demo)'
							caminhoApi={CAMINHO_HISTORICO_DEMO}
							referencia='PROT-MOCK-001'
						/>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
