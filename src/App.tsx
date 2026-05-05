import { ProvedorAutenticacao } from '@/hooks/use-autenticacao';
import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from './components/providers/toast-provider';
import { router } from './routes';

function App() {
	return (
		<ProvedorAutenticacao>
			<ToastProvider />
			<RouterProvider router={router} />
		</ProvedorAutenticacao>
	);
}

export default App;
