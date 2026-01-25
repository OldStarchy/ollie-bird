import { styled } from '@stitches/react';
import type { ComponentProps } from 'react';

const SelectWrapper = styled('div', {
	padding: '0.25rem',
	lineHeight: '1',
	borderRadius: '0.25rem',
	backgroundColor: '#aeaeae',
	color: 'black',
	boxShadow:
		' -1px -1px 4px rgba(0,0,0,0.8),2px 2px 5px rgba(255, 255, 255,0.3)',
	overflow: 'hidden',
	display: 'grid',
	gridTemplateColumns: '1fr',
	gridTemplateRows: '1fr',

	variants: {
		arrow: {
			true: {
				'&::after': {
					content: 'v',
					pointerEvents: 'none',
					gridColumn: '1',
					gridRow: '1',
					justifySelf: 'end',
				},
			},
		},
	},
});

const SelectInner = styled('select', {
	gridColumn: '1',
	gridRow: '1',
	width: '100%',
	backgroundColor: 'transparent',

	variants: {
		arrow: {
			true: {
				borderBottom: '1px solid black',
			},
		},
	},

	'&:focus': {
		outline: '0.25rem solid rgba(255, 255, 255, 0.5)',
	},
});

export default function Select(props: ComponentProps<typeof SelectInner>) {
	return (
		<SelectWrapper arrow={!props.multiple}>
			<SelectInner arrow={!props.multiple} {...props} />
		</SelectWrapper>
	);
}
