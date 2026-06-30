# SECURITY.md

## 보안 경계

`zdp-libs-ts`는 schema, env-contract, event-contracts, error, i18n-contract, glossary-contract의 얇은 공통 계약을 소유한다. 이 저장소는 제품별 domain model, 인증 정책, 결제 정책, 권한 판단, provider SDK wrapper의 소유자가 아니다.

## 금지 항목

다음 값은 source, 계약, glossary, 테스트 fixture, 문서, package output에 넣지 않는다.

- 실제 secret, token, API key, webhook secret
- 실제 고객 식별자, 이메일, 전화번호, 결제 식별자
- provider raw response 전문
- 내부 운영 URL, private dashboard URL, secret-bearing callback URL
- 공개 error contract에 들어가면 안 되는 stack trace, SQL, 내부 exception body
- 제품별 권한, 결제, 원장 정책을 숨긴 helper 함수

## 신고 기준

아래 변경은 보안 리뷰가 필요하다.

- env contract가 secret value 자체를 허용하거나 노출 대상으로 바꾸는 경우
- error contract가 raw provider error, stack trace, 내부 URL을 공개 응답으로 허용하는 경우
- event contract가 `request_id`, `trace_id`, audit reference 같은 추적 필드를 잃는 경우
- glossary나 i18n contract가 내부 시스템 URL, secret 이름, 운영 절차를 공개 문구로 노출하는 경우
- 공통 package boundary가 제품별 인증, 권한, 결제, 원장 정책을 helper로 흡수하는 경우

## 신고 방법

공개 issue에는 secret이나 실제 고객 데이터를 쓰지 않는다. 재현에는 synthetic value를 사용하고, 민감값이 포함된 사고는 maintainer에게 비공개 채널로 먼저 전달한다.

