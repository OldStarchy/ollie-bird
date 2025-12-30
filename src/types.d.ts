type Tail<T extends any[]> = T extends [any, ...infer U] ? U : [];

type ClassDecorator<
	This,
	Class extends abstract new (...args: any[]) => This,
> = void | ((Class: Class, context: ClassDecoratorContext<Class>) => Class);

type ClassFieldDecorator<This, Value> = (
	target: undefined,
	context: ClassFieldDecoratorContext<This, Value>,
) => void | ((this: This, initialValue: Value) => Value);

type ClassMethodDecorator<
	This,
	Method extends (this: This, ...args: any[]) => any,
> = (
	target: Method,
	context: ClassMethodDecoratorContext<This, Method>,
) => void | Method;

type ClassSetterDecorator<This, Value> = (
	target: (this: This, value: Value) => void,
	context: ClassSetterDecoratorContext<This, Value>,
) => void | ((this: This, value: Value) => void);

type ClassGetterDecorator<This, Value> = (
	target: (this: This) => Value,
	context: ClassGetterDecoratorContext<This, Value>,
) => void | ((this: This) => Value);

type ClassAccessorDecorator<This, Value> = (
	target: ClassAccessorDecoratorTarget<This, Value>,
	context: ClassAccessorDecoratorContext<This, Value>,
) => void | ClassAccessorDecoratorResult<This, Value>;
