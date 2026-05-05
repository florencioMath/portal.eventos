import { useContext } from 'react';
import { ContextoAutenticacao } from './contexto-autenticacao';

export const useAutenticacao = () => {
	const context = useContext(ContextoAutenticacao);

	if (!context) {
		throw new Error('useAutenticacao deve ser usado dentro de ProvedorAutenticacao');
	}

	return context;
};
