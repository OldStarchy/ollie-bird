import { styled, type CSS } from '@stitches/react';
import { useEffect, useRef, type ComponentProps } from 'react';

const InputWrapper = styled('div', {
	padding: '0.25rem',
	lineHeight: '1',
	borderRadius: '0.25rem',
	backgroundColor: '#aeaeae',
	color: 'black',
	boxShadow:
		' -1px -1px 4px rgba(0,0,0,0.8),2px 2px 5px rgba(255, 255, 255,0.3)',
	overflow: 'hidden',

	variants: {
		type_: {
			color: {
				padding: '0',
			},
			checkbox: {
				aspectRatio: '1 / 1',
				width: 'min-content',
			},
		} as Record<string, CSS>,
	},
});

const InputInner = styled('input', {
	width: '100%',
	backgroundColor: 'transparent',
	borderBottom: '1px solid black',

	'&:focus': {
		outline: '0.25rem solid rgba(255, 255, 255, 0.5)',
	},

	variants: {
		type_: {
			color: {
				// opacity: 0,
				padding: '2px',
				margin: 0,
				height: '100%',
				width: '100%',
				cursor: 'pointer',
				border: 'none',
				appearance: 'none',
			},
			checkbox: {
				width: '100%',
				height: '100%',
				borderBottom: 'none',
				backgroundColor: 'transparent',
				cursor: 'pointer',

				'&:checked': {
					backgroundColor: 'black',
				},
			},
		} as Record<string, CSS>,
	},
});

export default function Input(
	props: Omit<ComponentProps<typeof InputInner>, 'type_'>,
) {
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (props.type !== 'number') return;

		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		const abort = new AbortController();
		wrapper.addEventListener(
			'wheel',
			(e) => {
				if (document.activeElement === wrapper) e.stopPropagation();
			},
			{ signal: abort.signal, passive: false },
		);
		return () => abort.abort();
	}, []);

	return (
		<InputWrapper
			type_={props.type}
			css={
				props.type === 'color'
					? {
							backgroundColor: props.value as string,
						}
					: undefined
			}
			ref={wrapperRef}
		>
			<InputInner type_={props.type} {...props} />
		</InputWrapper>
	);
}
