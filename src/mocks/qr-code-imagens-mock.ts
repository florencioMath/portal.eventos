import qrOz1 from '@/mocks/qrCode/QRMOCK-CIDADAO-OZ-1.png?url';
import qrOz2 from '@/mocks/qrCode/QRMOCK-CIDADAO-OZ-2.png?url';
import qrAna1 from '@/mocks/qrCode/QRMOCK-CIDADAO-ANA-1.png?url';

const TOKEN_QR_PARA_URL_IMAGEM: Record<string, string> = {
	'QRMOCK-CIDADAO-OZ-1': qrOz1,
	'QRMOCK-CIDADAO-OZ-2': qrOz2,
	'QRMOCK-CIDADAO-ANA-1': qrAna1,
};

/** URL do PNG gerado em desenvolvimento para o token do QR (mock). */
export function obterImagemQrPorToken(token: string): string | undefined {
	return TOKEN_QR_PARA_URL_IMAGEM[token.trim()];
}
