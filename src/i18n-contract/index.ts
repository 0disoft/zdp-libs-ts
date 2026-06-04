export interface I18nMessageArgument {
  readonly name: string;
  readonly type: 'string' | 'number' | 'boolean' | 'date';
  readonly required: boolean;
}

export type I18nMessageKey = `${string}.${string}`;

export interface I18nMessageContract {
  readonly key: I18nMessageKey;
  readonly defaultLocale: string;
  readonly arguments: readonly I18nMessageArgument[];
  readonly owner: string;
  readonly fallbackPolicy: string;
}

export function defineI18nMessageContract(
  contract: I18nMessageContract
): I18nMessageContract {
  return contract;
}
