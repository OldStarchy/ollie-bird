import 'rxjs';

declare module 'rxjs' {
	export interface Subscription extends Disposable {}
}
