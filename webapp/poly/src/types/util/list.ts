// 튜플을 유니온으로 변환
export type TupleToUnion<T extends unknown[]> = T[number];

// 재귀적 튜플 정의
export type RecursiveTuple<T, N extends number, A extends unknown[] = []> = A['length'] extends N
	? A
	: RecursiveTuple<T, N, [...A, T]>;

// 타입 레벨 뺄셈 (보조 유틸리티)
export type Subtract<A extends number, B extends number> = A extends B
	? 0
	: A extends B | Subtract<A, 1>
		? never
		: Subtract<A, 1>;

// 최소 길이 튜플
export type MinLengthTuple<
	T extends unknown[],
	N extends number,
	A extends unknown[] = []
> = A['length'] extends N ? A : [...A, T[A['length']] extends undefined ? unknown : T[A['length']]];

// 최대 길이 튜플
export type MaxLengthTuple<T extends unknown[], N extends number> = T extends [...infer U, unknown]
	? U['length'] extends N
		? U
		: T
	: T;

// 튜플의 길이 얻기
export type TupleLength<T extends unknown[]> = T['length'];

// 튜플의 첫 번째 요소 제거
export type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;

// 튜플의 마지막 요소 제거
export type Init<T extends unknown[]> = T extends [...infer R, unknown] ? R : never;

// 튜플 뒤집기
export type Reverse<T extends unknown[]> = T extends [infer F, ...infer R] ? [...Reverse<R>, F] : T;

// 두 튜플 연결
export type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U];

// 튜플의 N번째 요소 얻기
export type Nth<T extends number[], N extends number> = T[N];

// 조건부 타입
export type If<C extends boolean, T, F> = C extends true ? T : F;

// 유니온을 인터섹션으로 변환
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
	k: infer I
) => void
	? I
	: never;

// 객체의 값들을 유니온 타입으로 변환
export type ValueOf<T> = T[keyof T];

// 문자열 리터럴 타입을 파스칼 케이스로 변환
export type ToPascalCase<S extends string> = S extends `${infer F}${infer R}`
	? `${Uppercase<F>}${ToPascalCase<R>}`
	: S;
