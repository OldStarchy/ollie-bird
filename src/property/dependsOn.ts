import { DisposeFlag } from '../DisposeFlag';
import type { NotifyPropertyChanged } from './NotifyPropertyChanged';

export default function dependsOn<This extends NotifyPropertyChanged, Value>(
	propertyName: keyof This,
): ClassGetterDecorator<This, Value> {
	return (_target, context) => {
		if (context.name === propertyName) {
			throw new Error(
				`@notify dependency cannot refer to itself on property '${String(
					context.name,
				)}'.`,
			);
		}

		if (context.kind !== 'getter') {
			throw new TypeError(
				`@notify can only be applied to getters, but was applied to a ${context.kind}.`,
			);
		}

		context.addInitializer(function (this: This) {
			queueMicrotask(() => {
				const dedupEvent = new DisposeFlag();

				this.propertyChanged.on('change', (e) => {
					if (e.name === propertyName) {
						if (dedupEvent.active) return;

						using _ = dedupEvent.activate();

						this.propertyChanged.emit('change', {
							name: context.name,
						});
					}
				});
			});
		});
	};
}
