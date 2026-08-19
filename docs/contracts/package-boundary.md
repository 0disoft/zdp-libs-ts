# 패키지 경계 계약

패키지 표면은 의도적으로 분리한다. 루트 `zdp-libs-ts` entry는 빌드된 ESM과 declaration 중 공통 계약 metadata만 노출한다. schema, env contract, event contract, error, i18n contract, glossary contract는 루트와 각각의 전용 subpath에서 사용할 수 있다. 계산기 타입, 상수, 함수는 `zdp-libs-ts/calculator-engine`에서만 제공하며 루트에서는 다시 export하지 않는다.

이 패키지는 제품별 domain model, runtime validator, framework adapter, provider SDK wrapper, 인증 정책, 결제 정책, 권한 정책, 원장 정책, privacy 정책을 소유하지 않는다.

패키지에 포함되는 파일은 downstream SDK와 API contract가 public export 계약에 의존할 수 있으므로 version impact 검토가 필요하다. npm packaging은 `prepack`에서 `dist/`를 다시 생성한다. commit SHA로 고정한 Git dependency는 소비자 측 컴파일 없이 검증 후 커밋된 같은 `dist/`를 사용한다. Tarball smoke는 빈 Node 소비자에 패키지를 설치하고, 계산기 export가 루트로 새지 않는지 확인하며, 전용 subpath를 통해 계산기 API를 실행해야 한다. 이 검증을 통과하지 못한 source layout 의존이나 Bun 전용 runtime 누출은 유효한 release로 보지 않는다.

계산기 소비자는 import를 다음과 같이 옮긴다.

```ts
import {
  CALCULATOR_CONTRACT_VERSION,
  calculatePercentageChange
} from 'zdp-libs-ts/calculator-engine';
```
