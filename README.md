# zdp-libs-ts

ZDP TypeScript 공통 계약 패키지 저장소다. 초기 목적은 schema, env-contract, event-contracts, error, i18n-contract의 경계와 금지선을 먼저 고정하는 것이다.

## 현재 범위

- 공통 schema metadata 자리
- 환경변수 계약 기준
- 이벤트 계약 기준
- 표준 error helper 경계
- i18n message key와 argument contract 기준

## 현재 제외

- 제품별 domain model
- provider SDK wrapper
- 인증, 권한, 결제, 원장 정책 구현
- 실제 package publish
- runtime framework adapter

## 계약

루트 `service.yaml`이 이 저장소의 서비스 계약이다. `contracts/` 아래 파일은 실제 TypeScript 코드가 생기기 전에 패키지 경계를 고정하는 skeleton이다.

## 검증

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소를 대상으로 실행한다.

```bash
bun src/cli.ts validate --architecture ..\..\docs\zdp-architecture --repository ..\..\contracts\zdp-libs-ts --json
```
