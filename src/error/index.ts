export type ZdpErrorCategory =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'conflict'
  | 'rate_limit'
  | 'upstream'
  | 'internal';

export interface ZdpErrorContract {
  readonly code: string;
  readonly category: ZdpErrorCategory;
  readonly retryable: boolean;
  readonly publicMessageKey: string;
  readonly requestId: string;
  readonly traceId: string;
}

export function defineZdpErrorContract(
  contract: ZdpErrorContract
): ZdpErrorContract {
  return contract;
}
