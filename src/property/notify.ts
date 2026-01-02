import type { NotifyPropertyChanged } from './NotifyPropertyChanged';

export default function notify<This extends NotifyPropertyChanged, Value>(
	propertyName: string,
): ClassAccessorDecorator<This, Value> {
	return (target, context) => {
		if (context.kind !== 'accessor') {
			throw new TypeError(
				`@notify can only be applied to accessors, but was applied to a ${context.kind}.`,
			);
		}

		return {
			set(this: This, value: Value) {
				target.set.call(this, value);

				this.propertyChanged.emit('change', {
					name: propertyName,
				});
			},
		};
	};
}
