# CONTRIBUTING.md

## 변경 원칙

- 새 package 경계는 `contracts/package-boundaries.yaml`에 먼저 추가한다.
- public TypeScript API는 package consumer와 SDK 생성 경로를 고려한다.
- 제품 전용 타입은 이 저장소가 아니라 제품 또는 API contract에 둔다.
- package metadata 변경은 `CHANGELOG.md`에 기록한다.

## 검증

아키텍처 검증은 `zdp-architecture-linter`에서 이 저장소 루트를 대상으로 실행한다. TypeScript 검증은 실제 source가 생긴 뒤 추가한다.

## 릴리스

package metadata와 file whitelist는 public npm package 후보 기준으로 유지한다. 실제 `npm publish` 실행은 package API와 compatibility policy가 닫히고 별도 승인이 있을 때만 진행한다.
