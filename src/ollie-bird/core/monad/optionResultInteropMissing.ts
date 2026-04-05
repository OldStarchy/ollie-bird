export default function optionResultInteropMissing(): never {
	throw new Error(
		'OptionResult interop has not loaded, to use this method import OptionResultInterop.ts somewhere in your codebase.',
	);
}
