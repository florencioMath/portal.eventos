import type { EventoCadastroDto } from '@/features/eventos/types';

export function normalizarHoraHm(hora: string | undefined): string {
	if (!hora?.trim()) return '00:00';
	const m = hora.trim().match(/^(\d{1,2}):(\d{2})/);
	if (!m) return '09:00';
	const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
	const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
	return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/** `YYYY-MM-DD` + `HH:mm` → `YYYY-MM-DDTHH:mm:00` (ISO local, alinhado à gestão / Spring). */
export function combinarDataHoraIsoLocal(dataYmd: string, horaHm: string): string {
	const d = (dataYmd ?? '').trim().slice(0, 10);
	const t = normalizarHoraHm(horaHm);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${new Date().toISOString().slice(0, 10)}T${t}:00`;
	return `${d}T${t}:00`;
}

export function extrairDataEHoraDoDto(d: EventoCadastroDto): {
	dataDia: string;
	dataFimDia: string;
	horaInicio: string;
	horaFim: string;
} {
	const de = d.dataEvento ?? '';
	const df = d.dataFimEvento ?? '';

	if (de.includes('T')) {
		const dataDia = de.slice(0, 10);
		const hi = de.length >= 16 ? de.slice(11, 16) : normalizarHoraHm(d.horaInicio);
		let dataFimDia = dataDia;
		let hf = normalizarHoraHm(d.horaFim);
		if (df.includes('T') && df.length >= 10) {
			dataFimDia = df.slice(0, 10);
			if (df.length >= 16) hf = df.slice(11, 16);
		}
		return { dataDia, dataFimDia, horaInicio: hi, horaFim: hf };
	}

	const dataDia = de.slice(0, 10);
	const hi = normalizarHoraHm(d.horaInicio);
	let dataFimDia = dataDia;
	let hf = normalizarHoraHm(d.horaFim);
	if (df.includes('T') && df.length >= 10) {
		dataFimDia = df.slice(0, 10);
		if (df.length >= 16) hf = df.slice(11, 16);
	} else {
		const raw = df.trim().slice(0, 10);
		if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) dataFimDia = raw;
	}

	return { dataDia, dataFimDia, horaInicio: hi, horaFim: hf };
}

export function extrairSoDataDesativacao(d: EventoCadastroDto): string {
	const s = d.dataDesativacaoAutomatica ?? '';
	if (s.includes('T')) return s.slice(0, 10);
	return s.slice(0, 10);
}

export function formatarDataPortugues(dataYmdOuIso: string): string {
	const s = dataYmdOuIso?.trim() ?? '';
	if (!s) return '—';
	const ymd = s.includes('T') ? s.slice(0, 10) : s.slice(0, 10);
	const parts = ymd.split('-').map(Number);
	if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return s;
	const [y, m, d] = parts;
	const dt = new Date(y, m - 1, d);
	if (Number.isNaN(dt.getTime())) return s;
	return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatarHoraPortugues24(horaHm: string | undefined): string {
	return normalizarHoraHm(horaHm);
}

export function formatarEventoDataPeriodoPt(e: EventoCadastroDto): string {
	const { dataDia, dataFimDia, horaInicio, horaFim } = extrairDataEHoraDoDto(e);
	const datas =
		dataFimDia !== dataDia
			? `${formatarDataPortugues(dataDia)} a ${formatarDataPortugues(dataFimDia)}`
			: formatarDataPortugues(dataDia);
	return `${datas} · ${formatarHoraPortugues24(horaInicio)}–${formatarHoraPortugues24(horaFim)}`;
}
