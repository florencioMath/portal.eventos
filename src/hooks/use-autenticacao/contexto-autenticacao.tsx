import { createContext } from 'react';
import type { ValorContextoAutenticacao } from './types';

export const ContextoAutenticacao = createContext<ValorContextoAutenticacao | undefined>(
	undefined
);
