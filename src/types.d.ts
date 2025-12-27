type Tail<T extends any[]> = T extends [any, ...infer U] ? U : [];
