import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Outlet } from 'react-router-dom';

export const PrivateLayout = () => {
	return (
		<main className='min-h-screen flex flex-col justify-between bg-gray-50'>
			<Navbar />
			<section className='flex-1 flex flex-col'>
				<Outlet />
			</section>
			<Footer />
		</main>
	);
};
