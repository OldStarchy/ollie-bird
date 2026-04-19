import { styled } from '@stitches/react';

export const NoPrint = styled('div', {
	'@media print': {
		display: 'none',
	},
});
