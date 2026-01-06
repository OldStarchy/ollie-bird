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
						}
					: {
							width: '1px',
							height: '100%',
							border: 'none',
							backgroundColor: 'white',
						}
			}
		/>
	);
}
