import type { InternalAxiosRequestConfig } from 'axios';
import type { AxiosInstance } from 'axios';
import { limiteIngressosPorCpfNumero } from '@/features/eventos/lib/reserva-ingressos-calculo';
import { ordenarLotes, resolverIndiceLoteAtual } from '@/features/eventos/lib/lotes-exibicao';
import { eventoAceitaReservas, inscricoesAindaAbertasPorData } from '@/features/eventos/lib/visibilidade-evento';
import { aplicarRespostaMockada } from '@/mocks/resposta-mock-axios';
import { MOCK_EVENTOS_LISTA } from '@/mocks/eventos-mock-lista';
import type {
	EventoAnexoDto,
	EventoCadastroDto,
	EventoReservaDto,
	IngressoReservaDto,
	MinhaReservaItemDto,
} from '@/features/eventos/types';

const PNG_1PX =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function novoId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`;
}

function pathNormalizado(config: InternalAxiosRequestConfig): string {
	const raw = (config.url ?? '').split('?')[0];
	let p = raw;
	if (p.startsWith('http')) {
		try {
			p = new URL(p).pathname;
		} catch {
			/* ignore */
		}
	}
	const marcas = ['/eventos', '/imagens', '/reservas', '/ingressos'];
	for (const m of marcas) {
		const i = p.indexOf(m);
		if (i >= 0) return p.slice(i);
	}
	return p.startsWith('/') ? p : `/${p}`;
}

function agoraIso() {
	return new Date().toISOString();
}

function cloneJson<T>(x: T): T {
	return JSON.parse(JSON.stringify(x)) as T;
}

function mimeImagemPorNome(nome: string): string {
	const n = nome.toLowerCase();
	if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
	if (n.endsWith('.webp')) return 'image/webp';
	if (n.endsWith('.gif')) return 'image/gif';
	return 'image/png';
}

let eventos: EventoCadastroDto[] = MOCK_EVENTOS_LISTA.map((item) => cloneJson(item.evento));

const anexosPorEvento = new Map<string, EventoAnexoDto[]>();
for (const item of MOCK_EVENTOS_LISTA) {
	anexosPorEvento.set(item.evento.cdEventosCadastro, cloneJson(item.anexos));
}

function cloneEvento(e: EventoCadastroDto): EventoCadastroDto {
	return JSON.parse(JSON.stringify(e)) as EventoCadastroDto;
}

/** Mock «Cidadão» + tokens QR genéricos em ciclo para qualquer evento (compatível com PNGs / Gestão). */
const NOME_TITULAR_SEED = 'Cidadão';
const DOC_TITULAR_SEED = '75526311201';

const TOKENS_QR_MOCK_CICLO = [
	'QRMOCK-CIDADAO-OZ-1',
	'QRMOCK-CIDADAO-OZ-2',
	'QRMOCK-CIDADAO-ANA-1',
] as const;

/** Repete os três tokens por bilhete (4.º volta ao primeiro). */
function gerarIngressosGenericos(cdEventosReservas: string, quantidade: number): IngressoReservaDto[] {
	const n = Math.max(0, Math.floor(quantidade));
	const out: IngressoReservaDto[] = [];
	for (let i = 0; i < n; i++) {
		const ordem = i + 1;
		const tokenQr = TOKENS_QR_MOCK_CICLO[i % TOKENS_QR_MOCK_CICLO.length]!;
		out.push({
			cdIngresso: novoId(),
			cdEventosReservas,
			ordem,
			tokenQr,
			nomeTitular: NOME_TITULAR_SEED,
			documentoTitular: DOC_TITULAR_SEED,
		});
	}
	return out;
}

let minhasReservasMock: MinhaReservaItemDto[] = (() => {
	const evOz = eventos.find((x) => x.cdEventosCadastro === 'evt-oz-2026');
	const evAna = eventos.find((x) => x.cdEventosCadastro === 'evt-ana-castela');
	if (!evOz || !evAna) return [];
	const dataRes = agoraIso();
	return [
		{
			reserva: {
				cdEventosReservas: 'res-cidadao-oz-2026',
				cdEventosCadastro: 'evt-oz-2026',
				codigoReserva: 'R-OZ-2026-001',
				quantidadeReservada: 2,
				statusReserva: 'CONFIRMADA',
				dataReserva: dataRes,
				indiceLoteIngresso: 0,
			},
			evento: cloneEvento(evOz),
			imagens: cloneJson(anexosPorEvento.get('evt-oz-2026') ?? []),
			ingressos: gerarIngressosGenericos('res-cidadao-oz-2026', 2),
		},
		{
			reserva: {
				cdEventosReservas: 'res-cidadao-ana-pendente',
				cdEventosCadastro: 'evt-ana-castela',
				codigoReserva: 'R-ANA-PEND-001',
				quantidadeReservada: 1,
				statusReserva: 'CONFIRMADA',
				dataReserva: dataRes,
				indiceLoteIngresso: 0,
			},
			evento: cloneEvento(evAna),
			imagens: cloneJson(anexosPorEvento.get('evt-ana-castela') ?? []),
			ingressos: gerarIngressosGenericos('res-cidadao-ana-pendente', 1),
		},
	];
})();

function obterCorpo(config: InternalAxiosRequestConfig): Record<string, unknown> {
	if (config.data == null) return {};
	if (typeof config.data === 'string') {
		try {
			return JSON.parse(config.data) as Record<string, unknown>;
		} catch {
			return {};
		}
	}
	return config.data as Record<string, unknown>;
}

function somaQuantidadeNoLoteExcluindo(
	lista: MinhaReservaItemDto[],
	cdEv: string,
	indiceLote: number,
	excluirCdReserva: string
): number {
	let s = 0;
	for (const it of lista) {
		if (it.reserva.cdEventosCadastro !== cdEv) continue;
		if (it.reserva.statusReserva === 'CANCELADA') continue;
		if (it.reserva.cdEventosReservas === excluirCdReserva) continue;
		if (it.reserva.indiceLoteIngresso !== indiceLote) continue;
		s += it.reserva.quantidadeReservada;
	}
	return s;
}

function propagarEventoNosItens(cdEv: string, ev: EventoCadastroDto) {
	const idxE = eventos.findIndex((x) => x.cdEventosCadastro === cdEv);
	if (idxE >= 0) eventos[idxE] = ev;
	minhasReservasMock = minhasReservasMock.map((m) =>
		m.reserva.cdEventosCadastro === cdEv ? { ...m, evento: cloneEvento(ev) } : m
	);
}

function tratar(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | void {
	const metodo = (config.method ?? 'get').toLowerCase();
	const path = pathNormalizado(config);

	if (metodo === 'get' && path === '/eventos') {
		return aplicarRespostaMockada(config, () => [...eventos]);
	}

	if (metodo === 'get' && path.startsWith('/eventos/')) {
		const id = path.slice('/eventos/'.length);
		if (!id || id.includes('/')) return;
		return aplicarRespostaMockada(config, () => {
			const e = eventos.find((x) => x.cdEventosCadastro === id);
			if (!e) throw { status: 404, message: 'Evento não encontrado.' };
			return e;
		});
	}

	const mImgDownload = path.match(/^\/imagens\/([^/]+)\/download\/([^/]+)$/);
	if (metodo === 'get' && mImgDownload) {
		const [, cdEv, cdImg] = mImgDownload;
		config.adapter = async () => {
			await new Promise((r) => setTimeout(r, 120));
			const lista = anexosPorEvento.get(cdEv) ?? [];
			const im = lista.find((x) => x.id === cdImg);
			const b64 = im?.codigoBase64 ?? PNG_1PX;
			const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
			const mime = im ? mimeImagemPorNome(im.nome) : 'image/png';
			const blob = new Blob([bin], { type: mime });
			return { data: blob, status: 200, statusText: 'OK', headers: {}, config };
		};
		return config;
	}

	const mImgList = path.match(/^\/imagens\/([^/]+)$/);
	if (metodo === 'get' && mImgList) {
		const cdEv = mImgList[1];
		return aplicarRespostaMockada(config, () => {
			const lista = [...(anexosPorEvento.get(cdEv) ?? [])];
			return lista.sort((a, b) => a.posicao - b.posicao);
		});
	}

	if (metodo === 'post' && path === '/reservas') {
		return aplicarRespostaMockada(config, () => {
			const body = obterCorpo(config);
			const cdEv = String(body.cdEventosCadastro ?? '');
			const qtd = Math.max(1, Math.floor(Number(body.quantidadeReservada ?? 1)));
			const idx = eventos.findIndex((x) => x.cdEventosCadastro === cdEv);
			if (idx < 0) throw { status: 404, message: 'Evento não encontrado.' };
			const ev = eventos[idx]!;
			if (!eventoAceitaReservas(ev)) {
				throw { status: 400, message: 'Evento não está ativo para reservas.' };
			}
			if (ev.quantidadeIngressosDisponiveis < qtd) {
				throw { status: 400, message: 'Não há vagas suficientes.' };
			}

			const limite = limiteIngressosPorCpfNumero(ev);
			const existenteIdx = minhasReservasMock.findIndex(
				(m) => m.reserva.cdEventosCadastro === cdEv && m.reserva.statusReserva !== 'CANCELADA'
			);

			if (existenteIdx >= 0) {
				const item = minhasReservasMock[existenteIdx]!;
				const atualQ = item.reserva.quantidadeReservada;
				if (atualQ + qtd > limite) {
					throw {
						status: 400,
						message: `Limite de ${limite} ingresso(s) por CPF neste evento.`,
					};
				}
				const atualizado: EventoCadastroDto = {
					...ev,
					quantidadeIngressosReservados: ev.quantidadeIngressosReservados + qtd,
					quantidadeIngressosDisponiveis: ev.quantidadeIngressosDisponiveis - qtd,
					dataAtualizacao: agoraIso(),
				};
				eventos[idx] = atualizado;
				const indiceLoteIngresso = resolverIndiceLoteAtual(atualizado);
				const reserva: EventoReservaDto = {
					...item.reserva,
					quantidadeReservada: atualQ + qtd,
					indiceLoteIngresso,
					dataReserva: agoraIso(),
				};
				const imgs = cloneJson(anexosPorEvento.get(cdEv) ?? []).sort((a, b) => a.posicao - b.posicao);
				const novoItem: MinhaReservaItemDto = {
					reserva,
					evento: atualizado,
					imagens: imgs,
					ingressos: gerarIngressosGenericos(reserva.cdEventosReservas, reserva.quantidadeReservada),
				};
				minhasReservasMock = minhasReservasMock.map((m, i) => (i === existenteIdx ? novoItem : m));
				return reserva;
			}

			const indiceLoteIngresso = resolverIndiceLoteAtual(ev);
			const atualizado: EventoCadastroDto = {
				...ev,
				quantidadeIngressosReservados: ev.quantidadeIngressosReservados + qtd,
				quantidadeIngressosDisponiveis: ev.quantidadeIngressosDisponiveis - qtd,
				dataAtualizacao: agoraIso(),
			};
			eventos[idx] = atualizado;
			const reserva: EventoReservaDto = {
				cdEventosReservas: novoId(),
				cdEventosCadastro: cdEv,
				codigoReserva: `R-${String(Math.floor(Math.random() * 900000) + 100000)}`,
				quantidadeReservada: qtd,
				statusReserva: 'CONFIRMADA',
				dataReserva: agoraIso(),
				indiceLoteIngresso,
			};
			const imgs = cloneJson(anexosPorEvento.get(cdEv) ?? []).sort((a, b) => a.posicao - b.posicao);
			const item: MinhaReservaItemDto = {
				reserva,
				evento: atualizado,
				imagens: imgs,
				ingressos: gerarIngressosGenericos(reserva.cdEventosReservas, qtd),
			};
			minhasReservasMock = [item, ...minhasReservasMock];
			return reserva;
		});
	}

	const mPatchCancel = path.match(/^\/reservas\/([^/]+)\/cancelar$/);
	if (metodo === 'patch' && mPatchCancel) {
		const idReserva = decodeURIComponent(mPatchCancel[1]!);
		return aplicarRespostaMockada(config, () => {
			const itemIdx = minhasReservasMock.findIndex(
				(m) => m.reserva.cdEventosReservas === idReserva
			);
			if (itemIdx < 0) throw { status: 404, message: 'Reserva não encontrada.' };
			const item = minhasReservasMock[itemIdx]!;
			if (!inscricoesAindaAbertasPorData(item.evento)) {
				throw { status: 400, message: 'O prazo para alterar ou cancelar esta inscrição encerrou.' };
			}
			if (item.reserva.statusReserva === 'CANCELADA') {
				return item.reserva;
			}
			const cdEv = item.reserva.cdEventosCadastro;
			const q = item.reserva.quantidadeReservada;
			const evIdx = eventos.findIndex((x) => x.cdEventosCadastro === cdEv);
			if (evIdx < 0) throw { status: 404, message: 'Evento não encontrado.' };
			const ev = eventos[evIdx]!;
			const atualizado: EventoCadastroDto = {
				...ev,
				quantidadeIngressosReservados: Math.max(0, ev.quantidadeIngressosReservados - q),
				quantidadeIngressosDisponiveis: ev.quantidadeIngressosDisponiveis + q,
				dataAtualizacao: agoraIso(),
			};
			eventos[evIdx] = atualizado;
			const reserva: EventoReservaDto = {
				...item.reserva,
				statusReserva: 'CANCELADA',
				dataCancelamento: agoraIso(),
			};
			minhasReservasMock = minhasReservasMock.map((m, i) =>
				i === itemIdx
					? { ...m, reserva, evento: cloneEvento(atualizado), ingressos: [] }
					: m
			);
			propagarEventoNosItens(cdEv, atualizado);
			return reserva;
		});
	}

	const mPatchQtd = path.match(/^\/reservas\/([^/]+)$/);
	if (metodo === 'patch' && mPatchQtd) {
		const idReserva = decodeURIComponent(mPatchQtd[1]!);
		return aplicarRespostaMockada(config, () => {
			const body = obterCorpo(config);
			const n = Math.max(1, Math.floor(Number(body.quantidadeReservada)));
			const itemIdx = minhasReservasMock.findIndex(
				(m) => m.reserva.cdEventosReservas === idReserva
			);
			if (itemIdx < 0) throw { status: 404, message: 'Reserva não encontrada.' };
			const item = minhasReservasMock[itemIdx]!;
			if (!inscricoesAindaAbertasPorData(item.evento)) {
				throw { status: 400, message: 'O prazo para alterar ou cancelar esta inscrição encerrou.' };
			}
			if (item.reserva.statusReserva === 'CANCELADA') {
				throw { status: 400, message: 'Reserva cancelada.' };
			}
			const cdEv = item.reserva.cdEventosCadastro;
			const evIdx = eventos.findIndex((x) => x.cdEventosCadastro === cdEv);
			if (evIdx < 0) throw { status: 404, message: 'Evento não encontrado.' };
			let ev = eventos[evIdx]!;
			const lim = limiteIngressosPorCpfNumero(ev);
			if (n > lim) {
				throw { status: 400, message: `Limite de ${lim} ingresso(s) por CPF neste evento.` };
			}
			const oldQ = item.reserva.quantidadeReservada;
			const delta = n - oldQ;
			if (delta > 0 && ev.quantidadeIngressosDisponiveis < delta) {
				throw { status: 400, message: 'Não há vagas suficientes.' };
			}
			const lotesOrd = ordenarLotes(ev.lotes);
			const idxLote = item.reserva.indiceLoteIngresso;
			if (lotesOrd.length > 0 && idxLote != null && idxLote >= 0 && idxLote < lotesOrd.length) {
				const lote = lotesOrd[idxLote]!;
				const occOutros = somaQuantidadeNoLoteExcluindo(
					minhasReservasMock,
					cdEv,
					idxLote,
					idReserva
				);
				if (occOutros + n > lote.quantidade) {
					throw { status: 400, message: 'Não há vagas suficientes no lote.' };
				}
			}

			const atualizado: EventoCadastroDto = {
				...ev,
				quantidadeIngressosReservados: Math.max(0, ev.quantidadeIngressosReservados + delta),
				quantidadeIngressosDisponiveis: ev.quantidadeIngressosDisponiveis - delta,
				dataAtualizacao: agoraIso(),
			};
			eventos[evIdx] = atualizado;
			ev = atualizado;
			const indiceLoteIngresso = resolverIndiceLoteAtual(atualizado);
			const reserva: EventoReservaDto = {
				...item.reserva,
				quantidadeReservada: n,
				indiceLoteIngresso,
			};
			minhasReservasMock = minhasReservasMock.map((m, i) =>
				i === itemIdx
					? {
							...m,
							reserva,
							evento: cloneEvento(atualizado),
							ingressos: gerarIngressosGenericos(reserva.cdEventosReservas, n),
						}
					: m
			);
			propagarEventoNosItens(cdEv, atualizado);
			return reserva;
		});
	}

	const mPatchIngresso = path.match(/^\/ingressos\/([^/]+)$/);
	if (metodo === 'patch' && mPatchIngresso) {
		const cdIngresso = decodeURIComponent(mPatchIngresso[1]!);
		return aplicarRespostaMockada(config, () => {
			const body = obterCorpo(config);
			const nomeTitular =
				body.nomeTitular != null && body.nomeTitular !== ''
					? String(body.nomeTitular).trim()
					: undefined;
			const documentoTitularRaw = body.documentoTitular;
			const documentoTitular =
				documentoTitularRaw != null && documentoTitularRaw !== ''
					? String(documentoTitularRaw).replace(/\D/g, '')
					: undefined;

			let encontrado: IngressoReservaDto | undefined;
			minhasReservasMock = minhasReservasMock.map((item) => {
				if (!item.ingressos?.length) return item;
				const idx = item.ingressos.findIndex((i) => i.cdIngresso === cdIngresso);
				if (idx < 0) return item;
				const ing = item.ingressos[idx]!;
				const atualizado: IngressoReservaDto = {
					...ing,
					...(nomeTitular !== undefined ? { nomeTitular } : {}),
					...(documentoTitular !== undefined ? { documentoTitular } : {}),
				};
				encontrado = atualizado;
				const novosIng = [...item.ingressos];
				novosIng[idx] = atualizado;
				return { ...item, ingressos: novosIng };
			});
			if (!encontrado) throw { status: 404, message: 'Ingresso não encontrado.' };
			return encontrado;
		});
	}

	if (metodo === 'get' && path === '/reservas/usuario') {
		return aplicarRespostaMockada(config, () => [...minhasReservasMock]);
	}
}

export function registrarMocksEventosPortal(...clientes: AxiosInstance[]): void {
	for (const cliente of clientes) {
		cliente.interceptors.request.use((config: InternalAxiosRequestConfig) => {
			return tratar(config) ?? config;
		});
	}
}
