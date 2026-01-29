export default function Rule({
	orientation = 'horizontal',
}: {
	orientation?: 'horizontal' | 'vertical';
}) {
	return (
		<hr
			style={
				orientation === 'horizontal'
					? {
						width: '100%',
						height: '1px',
						border: 'none',
						backgroundColor: 'white',
						margin: '0.5rem 0',
					}
					: {
						width: '1px',
						height: '100%',
						border: 'none',
						backgroundColor: 'white',
						margin: '0 0.5rem',
					}
			}
		/>
	);
}
