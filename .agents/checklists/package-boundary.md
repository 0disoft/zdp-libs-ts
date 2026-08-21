# 패키지 경계 체크리스트

- Public entrypoint는 root, schema, env-contract, event-contracts, error, i18n-contract, glossary-contract, calculator-engine으로 제한한다.
- Root entry는 공통 계약 metadata만 export한다. 계산기 타입, 상수, 함수는 `./calculator-engine` 전용으로 유지한다.
- 제품별 domain model, provider SDK wrapper, framework adapter, runtime validator를 추가하지 않는다.
- `package.json`, source export, 생성된 `dist/`, 테스트, 패키지 경계 문서가 서로 일치해야 한다.
- Package file allowlist에 민감한 fixture나 source 전용 검증 입력을 포함하지 않는다.
- 패키지 파일이나 public entrypoint가 바뀌면 version impact와 migration note를 검토한다.
