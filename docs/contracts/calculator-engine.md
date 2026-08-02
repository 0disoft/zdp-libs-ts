# Calculator Engine

`zdp-libs-ts/calculator-engine`은 국가 정책과 제품 화면에 의존하지 않는 순수 계산 함수만 제공한다. 계산기 ID, 입력·출력 의미, 오류, 정밀도와 반올림 정책, 공통 적합성 벡터의 원천은 sibling `zdp-api-contracts/contracts/calculators/**`다.

## 구현된 계산기

- `calculatePercentageChange`
- `calculateMarginMarkup`
- `calculateBreakEvenPoint`
- `calculateDataTransferTime`
- `calculateDateDifference`
- `calculateCompoundInterest`

입력 숫자는 로케일 구분자가 없는 canonical ASCII decimal string이다. 내부 계산은 `BigInt` 정수 비율로 수행하고 결과 문자열을 만들 때만 호출자가 지정한 0-100 소수 자리에서 half-away-from-zero 반올림한다. 엔진은 `number` 부동소수점이나 화면용 `toLocaleString`을 계산 경계에 사용하지 않는다.

손익분기점은 단위당 판매가에서 단위당 변동비를 뺀 기여이익이 양수일 때만 계산한다. 결과 수량은 계약의 이론적 손익분기 수량이며 엔진이 임의로 정수 단위까지 올림하지 않는다.

데이터 전송 시간은 SI 단위를 1000 배율, IEC byte 단위를 1024 배율로 bits에 정규화하고 전송률을 bits per second로 정규화한 뒤 나눈다. byte는 8 bits이며 결과는 seconds다. 엔진은 네트워크 오버헤드나 실제 회선 효율을 추측하지 않는다.

날짜 차이는 `YYYY-MM-DD` 형식의 연도 0001~9999만 받고, 시간대 없는 역산 그레고리력의 달력 일수로 계산한다. `exclusive`는 시작일을 포함하고 종료일을 제외하며, `inclusive`는 양쪽 날짜를 모두 포함한다. JavaScript `Date`와 현지 시간대 변환은 사용하지 않는다.

복리는 원금, 명목 연이율, 복리 횟수와 연간 빈도를 정확한 유리수로 계산한다. 중간값은 반올림하지 않고 미래 가치와 이자만 마지막에 각각 반올림한다. 기간은 빈도별 100년 이내이며, 정확 계산의 피연산자 자릿수 추정치가 250,000을 넘으면 `limit_exceeded`로 중단한다.

## 오류

함수는 예외 대신 `ok` 판별자를 가진 결과를 반환한다. 안정 오류 코드는 API 계산기 계약에서 가져오며 입력 원문이나 번역 문장을 오류에 싣지 않는다.

## 제품 경계

제품은 locale 숫자 입력을 표준 decimal string으로 바꾸고 엔진 결과를 다시 locale에 맞게 표시한다. 계산 엔진은 페이지 route, 번역, SEO, 광고, 크레딧, 로그인, 저장 기록, 세금·노동·금융 규제를 소유하지 않는다.
