export const CONFIG = {
	PROJECT_NAME: 'portal-base',
	PROJECT_LABEL: 'Portal de Eventos',
	PROJECT_SUBTITLE: 'Acesso aos serviços digitais',
	/** Texto curto ao lado do logo (navbar) */
	BRAND_TITLE: 'Portal',
	BRAND_SUBTITLE: 'De Eventos',
	/** Caminho público ou importável do logo (navbar/footer) */
	LOGO_SRC: `${import.meta.env.BASE_URL}logo-osasco.png`,
	CONTATO_TITULO: 'Contato',
	CONTATO_DESCRICAO: 'Canais de atendimento do órgão responsável por este portal.',
	CONTATO_TELEFONE: '(00) 0000-0000',
	CONTATO_EMAIL: 'contato@exemplo.gov.br',
	RODAPE_RESUMO:
		'Este é um portal base. Personalize textos, logos e links de acordo com o seu órgão.',
} as const;

export const USER_KEY = `${CONFIG.PROJECT_NAME}-user`;
export const TOKEN_KEY = `${CONFIG.PROJECT_NAME}-token`;
