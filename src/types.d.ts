type Tail<T extends any[]> = T extends [any, ...infer U] ? U : [];

type ClassDecorator<
	This,
	Class extends abstract new (...args: any[]) => This,
> = (Class: Class, context: ClassDecoratorContext<Class>) => void | Class;

type ClassFieldDecoratorResult<This, Value> = (
	this: This,
	initialValue: Value,
) => Value;
type ClassFieldDecorator<This, Value> = (
	target: undefined,
	context: ClassFieldDecoratorContext<This, Value>,
) => void | ClassFieldDecoratorResult<This, Value>;

type ClassMethodDecorator<
	This,
	Method extends (this: This, ...args: any[]) => any,
> = (
	target: Method,
	context: ClassMethodDecoratorContext<This, Method>,
) => void | Method;

type ClassSetterDecoratorTarget<This, Value> = (
	this: This,
	value: Value,
) => void;
type ClassSetterDecoratorResult<This, Value> = ClassSetterDecoratorTarget<
	This,
	Value
>;
type ClassSetterDecorator<This, Value> = {
	(
		target: ClassSetterDecoratorTarget<This, Value>,
		context: ClassSetterDecoratorContext<This, Value>,
	): void | ClassSetterDecoratorResult<This, Value>;
};

type ClassGetterDecoratorTarget<This, Value> = (this: This) => Value;
type ClassGetterDecoratorResult<This, Value> = ClassGetterDecoratorTarget<
	This,
	Value
>;
type ClassGetterDecorator<This, Value> = {
	(
		target: ClassGetterDecoratorTarget<This, Value>,
		context: ClassGetterDecoratorContext<This, Value>,
	): void | ClassGetterDecoratorResult<This, Value>;
};

type ClassAccessorDecorator<This, Value> = {
	(
		target: ClassAccessorDecoratorTarget<This, Value>,
		context: ClassAccessorDecoratorContext<This, Value>,
	): void | ClassAccessorDecoratorResult<This, Value>;
};
