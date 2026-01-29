import { useState, type ReactNode } from 'react';
import Button from './Button';

export default function Spoiler({
	children,
	title,
}: {
	children: ReactNode;
	title: string;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<section>
			<header>
				<button
					onClick={() => setIsOpen(!isOpen)}
					style={{ display: 'inline' }}
				>
					<h3 style={{ display: 'inline' }}>{title}</h3>{' '}
					<Button>{isOpen ? 'Hide' : 'Show'}</Button>
				</button>
			</header>
			{isOpen && <main style={{ marginTop: '8px' }}>{children}</main>}
		</section>
	);
}
