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
export declare function defineI18nMessageContract<const Contract extends I18nMessageContract>(contract: Contract): Contract;
//# sourceMappingURL=index.d.ts.map