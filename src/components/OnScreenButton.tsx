import type { VirtualButton } from '../ollie-bird/core/input/VirtualButton';

interface OnScreenButtonProps {
	/** The VirtualButton to drive with this UI control. */
	button: VirtualButton;
	children: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
}

/**
 * A touchable on-screen button that drives a VirtualButton in the game's
 * input system.
 *
 * Uses the Pointer Events API so it works with both touch and mouse input.
 * Pointer capture ensures release is always detected even when the pointer
 * leaves the element mid-press.
 *
 * @example
 * ```tsx
 * const flapButton = game.input.createVirtualButton();
 * <OnScreenButton button={flapButton}>Flap</OnScreenButton>
 * ```
 */
export function OnScreenButton({
	button,
	children,
	style,
	className,
}: OnScreenButtonProps) {
	return (
		<button
			className={className}
			style={{
				userSelect: 'none',
				touchAction: 'none',
				...style,
			}}
			onPointerDown={(e) => {
				e.currentTarget.setPointerCapture(e.pointerId);
				button.press();
			}}
			onPointerUp={() => button.release()}
			onPointerCancel={() => button.release()}
		>
			{children}
		</button>
	);
}
