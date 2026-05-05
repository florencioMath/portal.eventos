import { Button } from '@/components/base/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

type Props = {
	id?: string;
	value: number;
	min: number;
	max: number;
	onChange: (n: number) => void;
	disabled?: boolean;
};

function clamp(n: number, min: number, max: number) {
	return Math.min(max, Math.max(min, n));
}

export function SeletorQuantidadeIngressos({ id, value, min, max, onChange, disabled }: Props) {
	const aplicar = (raw: number) => {
		if (!Number.isFinite(raw)) return;
		onChange(clamp(Math.floor(raw), min, max));
	};

	return (
		<div className='flex items-center gap-2'>
			<Button
				type='button'
				variant='outline'
				size='icon'
				className='h-9 w-9 shrink-0'
				disabled={disabled || value <= min}
				aria-label='Diminuir quantidade'
				onClick={() => aplicar(value - 1)}>
				<Minus className='h-4 w-4' />
			</Button>
			<Input
				id={id}
				type='number'
				min={min}
				max={max}
				className='h-9 w-16 text-center tabular-nums'
				disabled={disabled}
				value={value}
				onChange={(e) => aplicar(Number(e.target.value))}
			/>
			<Button
				type='button'
				variant='outline'
				size='icon'
				className='h-9 w-9 shrink-0'
				disabled={disabled || value >= max}
				aria-label='Aumentar quantidade'
				onClick={() => aplicar(value + 1)}>
				<Plus className='h-4 w-4' />
			</Button>
		</div>
	);
}
