import { useState, type ReactNode } from 'react';

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
					<span>{isOpen ? 'Hide' : 'Show'}</span>
				</button>
			</header>
			{isOpen && <main style={{ marginTop: '8px' }}>{children}</main>}
		</section>
	);
}
