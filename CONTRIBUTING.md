# CONTRIBUTING.md

## 변경 원칙

- 새 package 경계는 `contracts/package-boundaries.yaml`에 먼저 추가한다.
- public TypeScript API는 package consumer와 SDK 생성 경로를 고려한다.
- 제품 전용 타입은 이 저장소가 아니라 제품 또는 API contract에 둔다.
- package metadata 변경은 `CHANGELOG.md`에 기록한다.

## 검증

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소 루트를 대상으로 실행한다. TypeScript 검증은 실제 source가 생긴 뒤 추가한다.

## 릴리스

현재는 private skeleton이다. publish는 package API와 compatibility policy가 닫힌 뒤에만 고려한다.
