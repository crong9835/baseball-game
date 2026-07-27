# 숫자 야구 (Number Baseball)

React 학습용으로 만드는 숫자 야구 게임입니다.

## 게임 규칙

1. 컴퓨터가 **서로 다른 숫자 3개**로 이루어진 3자리 정답을 랜덤으로 만듭니다.
   - 숫자는 0~9, 중복 없음 (`1 2 3` OK / `1 1 2` 불가)
   - 첫 자리에 0이 와도 됩니다 (`0 5 7` OK)
2. 3자리를 입력하면 결과를 알려줍니다.
   - **스트라이크(S)**: 숫자와 자리가 모두 일치한 개수
   - **볼(B)**: 숫자는 있지만 자리가 다른 개수
   - **아웃(OUT)**: 정답에 아예 없는 숫자의 개수
   - 예) 정답 `1 2 3`, 입력 `1 3 4` → `S:1 B:1 OUT:1`
3. `S:3`이 되면 승리입니다.
4. 최대 **10번**까지 시도할 수 있고, 다 실패하면 정답을 공개합니다.

## 기술 스택

- Vite + React (JavaScript)
- CSS Modules (`*.module.css`)
- 상태 관리 라이브러리 없이 React 기본 훅만 사용

## 실행 방법

```bash
npm install     # 최초 1회
npm run dev     # 개발 서버 실행
npm run lint    # 코드 검사
npm run build   # 배포용 빌드
```

## 폴더 구조

```
src/
├─ main.jsx                        React 진입점
├─ App.jsx                         게임 상태를 소유하는 최상위 컴포넌트
├─ index.css                       전역 스타일
├─ constants/
│  └─ gameConstants.js             설정값 (자릿수 3, 최대 시도 10번)
├─ utils/
│  └─ gameLogic.js                 게임 계산 (정답 생성, 판정)
└─ components/                     화면 조각들 (.jsx와 .module.css를 나란히 배치)
```

## 참고

- 게임 규칙 출처: https://sciencelove.com/2653
