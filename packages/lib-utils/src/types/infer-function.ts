// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferFunction<TArgs extends any[] = any[], TReturn = any> = (
  ...args: TArgs
) => TReturn;
