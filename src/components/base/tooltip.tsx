import {
	Tooltip as TooltipBase,
	TooltipContent as TooltipContentBase,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

export const Tooltip = ({
	children,
	content,
	...props
}: React.ComponentProps<typeof TooltipBase> & {
	content: string;
}) => {
	return (
		<TooltipProvider>
			<TooltipBase {...props}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContentBase>
					<p>{content}</p>
				</TooltipContentBase>
			</TooltipBase>
		</TooltipProvider>
	);
};
