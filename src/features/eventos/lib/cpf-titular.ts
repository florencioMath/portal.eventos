import { onlyDigits } from '@/lib/utils';

/** Valida dígitos verificadores do CPF brasileiro (11 dígitos). */
export function cpfTitularEhValido(valor: string): boolean {
	const d = onlyDigits(valor);
	if (d.length !== 11) return false;
	if (/^(\d)\1{10}$/.test(d)) return false;
	let soma = 0;
	for (let i = 0; i < 9; i++) soma += Number(d[i]) * (10 - i);
	let rest = (soma * 10) % 11;
	if (rest === 10 || rest === 11) rest = 0;
	if (rest !== Number(d[9])) return false;
	soma = 0;
	for (let i = 0; i < 10; i++) soma += Number(d[i]) * (11 - i);
	rest = (soma * 10) % 11;
	if (rest === 10 || rest === 11) rest = 0;
	return rest === Number(d[10]);
}
