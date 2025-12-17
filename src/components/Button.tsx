import { styled } from '@stitches/react';

const Button = styled('button', {
	// backgroundImage: 'linear-gradient(135deg, #3c728388 0%, #25373bff 100%)',
	backgroundColor: '#3c728388',
	backgroundImage: 'linear-gradient(135deg, #fff2 0%, #0004 100%)',
	borderRadius: '0.25rem',
	boxShadow:
		'2px 2px 5px rgba(0,0,0,0.4), -1px -1px 4px rgba(255, 255, 255,0.3)',
	padding: '0 0.25rem',
	cursor: 'pointer',

	variants: {
		variant: {
			destructive: {
				// backgroundImage:
				// 	'linear-gradient(135deg, #8b2e2eff 0%, #5a1a1aff 100%)',
				backgroundColor: '#722525ff',
			},
		},
	},

	'&:hover, &:focus': {
		outline: '2px solid rgba(255, 255, 255, 0.5)',
	},

	'&:active': {
		boxShadow:
			'2px 2px 5px rgba(0,0,0,0.2), -1px -1px 4px rgba(255, 255, 255, 0.1)',
		backgroundImage: 'linear-gradient(135deg, #0002 0%, #fff2 100%)',
		outline: 'none',
	},
});

export default Button;
