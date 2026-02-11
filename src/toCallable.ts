export default function toCallable(disposable: Disposable): () => void {
	return () => {
		disposable[Symbol.dispose]();
	};
}
