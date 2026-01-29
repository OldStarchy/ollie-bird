export default function onChange<This, Value>(
	callback: (self: This) => void,
): ClassAccessorDecorator<This, Value> {
	return function (target, _context) {
		const originalSet = target.set;
		const originalGet = target.get;

		return {
			set(this: This, value: Value) {
				const oldValue = originalGet.call(this);

				if (oldValue !== value) {
					originalSet.call(this, value);
					callback(this);
				}
			},
		};
	};
}
