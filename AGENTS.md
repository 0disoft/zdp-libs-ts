# AGENTS.md

## 역할

이 저장소는 ZDP TypeScript 공통 계약 패키지를 소유한다. 초기 범위는 schema, env-contract, event-contracts, error, i18n-contract, glossary-contract의 얇은 경계다.

## 작업 원칙

- 문서는 한국어로 작성한다.
- 범용 Zod/TypeBox 경쟁자를 만들지 않는다.
- 런타임 편의 함수보다 JSON Schema/OpenAPI/SDK/Rust/Dart 모델 생성으로 이어지는 메타데이터를 우선한다.
- 패키지 API는 downstream SDK와 API contracts에 영향을 주므로 변경 내역을 기록한다.
- `service.yaml`이 이 저장소의 운영 계약이며 변경 시 `zdp-architecture` catalog와 함께 맞춘다.

## 금지

- 제품별 domain model을 공통 패키지에 넣지 않는다.
- 인증, 결제, 권한, 원장 정책을 helper 함수로 숨기지 않는다.
- provider SDK wrapper를 공통 계약 패키지처럼 노출하지 않는다.
- 실제 비밀값, 고객 데이터, provider response 원문 예시를 넣지 않는다.

## 검증

초기 검증은 `zdp-architecture-linter`에서 이 저장소 루트를 대상으로 수행한다. TypeScript build/test는 실제 패키지 코드가 추가될 때 연결한다.
