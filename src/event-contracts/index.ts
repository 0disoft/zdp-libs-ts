export interface EventTraceContext {
  readonly requestId: string;
  readonly traceId: string;
}

export interface EventContractMetadata {
  readonly eventId: string;
  readonly schemaRef: string;
  readonly source: string;
  readonly privacyClass: string;
  readonly replaySafe: boolean;
  readonly trace: EventTraceContext;
}

export function defineEventContractMetadata(
  metadata: EventContractMetadata
): EventContractMetadata {
  return metadata;
}
