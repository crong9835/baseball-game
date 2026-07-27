# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 이 프로젝트의 목적

React를 처음 배우는 개발자의 **학습용** 숫자 야구 게임입니다. (JavaScript는 익숙하지만 React는 초보)

**가장 중요한 원칙: 소유자가 코드를 읽고 이해할 수 없으면 이 프로젝트는 의미가 없습니다.**
"짧고 영리한 코드"보다 **"길더라도 한 번에 읽히는 코드"**를 항상 선택하세요. 줄 수가 늘어나는 것은 전혀 문제가 되지 않습니다.

## 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:5173)
npm run lint     # oxlint 검사
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

**테스트 프레임워크는 의도적으로 도입하지 않았습니다.** `src/utils/gameLogic.js`는 React에 의존하지 않는 순수 함수라서, 검증이 필요하면 임시 `.mjs` 스크립트에서 `import` 해 `node`로 직접 실행하고 결과를 확인한 뒤 스크립트는 커밋하지 않습니다. (`package.json`에 `"type": "module"`이 있어 `import` 구문이 그대로 동작합니다)

## 아키텍처

의존 방향은 **한 방향**입니다. 역방향 import(예: `gameLogic.js`가 `App.jsx`를 참조)를 만들지 마세요.

```
main.jsx → App.jsx → components/*.jsx
                  ↘  hooks/useBaseballGame.js → utils/gameLogic.js
                                              ↘  constants/gameConstants.js
```

| 위치 | 역할 |
|---|---|
| `src/constants/gameConstants.js` | **값만.** 함수 없음. `DIGIT_COUNT`, `MAX_ATTEMPTS`, `MIN_DIGIT`, `MAX_DIGIT`, `GAME_STATUS` |
| `src/utils/gameLogic.js` | **React와 무관한 순수 함수.** `createAnswer()`, `scoreGuess()`, `createAllDigits()` |
| `src/hooks/useBaseballGame.js` | **게임 진행 상태 전부.** state, 파생값, 조작 함수 |
| `src/components/*.jsx` | 화면 조각. 각 파일은 같은 이름의 `*.module.css`와 짝을 이룸 |
| `src/App.jsx` | 훅에서 받은 값을 화면 조각에 배분하기만 함. **여기에 state를 두지 마세요** |

### state 소유 규칙

**모든 state는 `useBaseballGame` 훅이 소유합니다.** App도 자식 컴포넌트도 `useState`를 갖지 않습니다.
같은 값을 여러 컴포넌트가 봐야 하기 때문입니다(예: `currentGuess`는 `GuessInput`이 표시하고 `NumberPad`가 버튼 비활성화에 사용).

훅이 가진 state는 4개뿐입니다: `answer`, `currentGuess`, `history`, `gameStatus`.

훅은 값과 핸들러만 돌려주고 **`setCurrentGuess` 같은 setter는 내보내지 않습니다.** 바깥에서 state를 직접 바꿀 수 있으면 게임 규칙을 한곳에서 보장할 수 없기 때문입니다. 새 조작이 필요하면 setter를 노출하지 말고 훅 안에 `handle...` 함수를 추가하세요.

**state에서 계산할 수 있는 값은 절대 state로 만들지 마세요.** 매 렌더에서 그냥 계산합니다:

```js
const attemptCount = history.length;
const isGuessFull = currentGuess.length === DIGIT_COUNT;
const isGameOver = gameStatus !== GAME_STATUS.PLAYING;
```

**이 프로젝트에는 `useEffect`가 하나도 없고, 앞으로도 필요하지 않습니다.** 파생값을 `useEffect`로 동기화하려는 코드를 추가하지 마세요.

### 데이터는 아래로, 사건은 위로

컴포넌트는 값(props)을 받아 표시만 하고, 사용자 조작은 App이 내려준 콜백(`onDigitClick`, `onBackspace`, `onClear`, `onRestart`)을 호출해 알립니다. 자식이 직접 게임 상태를 바꾸지 않습니다.

`ResultBanner`는 App에서 조건부로 감싸지 않고, 스스로 `gameStatus`를 보고 진행 중이면 `return null` 합니다.

### 판정 규칙

- 정답은 서로 다른 숫자 3개, 첫 자리 0 허용
- 정답과 입력 모두 중복이 없으므로 `strike + ball + out === DIGIT_COUNT`가 항상 성립합니다. `scoreGuess()`의 단순한 자리별 비교가 성립하는 근거입니다
- `scoreGuess()`는 **채점만** 합니다. 승패 판단은 `useBaseballGame`의 `decideNextStatus()`가 맡습니다. 이 경계를 섞지 마세요
- 화면 표기는 참고 사이트(https://sciencelove.com/2653)를 그대로 따라 **`S:1 B:1 OUT:1`** 형식으로 셋을 항상 모두 표시합니다

### `setState`는 즉시 반영되지 않습니다

`handleSubmit`에서 `history.length`를 읽으면 아직 갱신 전 값입니다. 그래서 방금 만든 값을 직접 넘깁니다:

```js
setGameStatus(decideNextStatus(result.strike, newRecord.attemptNumber));
```

`history.length >= MAX_ATTEMPTS` 같은 코드로 바꾸지 마세요. 마지막 시도에서 게임이 끝나지 않는 버그가 됩니다.

## 코드 작성 규칙 (반드시 지킬 것)

1. 함수는 한 가지 일만, 되도록 20줄 이내
2. **압축 문법 금지**
   - 중첩 삼항연산자 금지 → `if`로 풀어쓰기 (기본값을 먼저 정하고 조건에 맞으면 덮어쓰는 방식 선호)
   - `reduce` 금지 → `for...of` 또는 `filter().length`
   - 한 줄에 체이닝하지 말고 중간 결과에 이름을 붙여 변수로 분리
3. 변수명을 줄이지 않기. `i`, `e`, `v`, `arr`, `tmp` 금지 → `index`, `event`, `digit`, `guessList`
   - 불린은 `is`/`has`로 시작 (`isGameOver`, `hasWon`, `isGuessFull`)
4. 매직 넘버·매직 문자열 금지. 상수는 `gameConstants.js`에, CSS 값은 `index.css`의 CSS 변수에 모읍니다
5. 복잡한 조건식은 이름 붙인 변수로 감싸기
6. **파일이 100줄을 넘기면 먼저 알리고 분리 방안을 제안할 것** (현재 모든 파일이 100줄 이하)
7. 모든 파일 맨 위에 역할을 설명하는 2~3줄 주석
8. 주석은 "무엇을"이 아니라 **"왜 이렇게 했는지"**를 적을 것
9. 변수·함수 이름은 영어, 주석과 설명은 한국어

### CSS

- 컴포넌트마다 `*.module.css`를 짝지어 배치. 클래스 이름은 `styles.digitButton`으로 꺼내 쓸 수 있도록 **camelCase**로 작성
- 조건부 클래스는 템플릿 문자열 + 삼항연산자 대신 배열에 담았다가 `join(' ')` (`GuessInput.jsx`의 `getSlotClassName` 참고)
- 색상·간격·radius·터치 크기는 `src/index.css`의 CSS 변수 사용. 컴포넌트 CSS에 원시 숫자를 직접 쓰지 않기
- 세로 간격은 `margin`이 아니라 부모의 `gap`으로 관리
- 모바일 우선. 누르는 대상은 `--button-min-size`(48px) 이상

## 설명 방식 (소유자가 학습 중이므로 중요)

- 코드를 보여준 뒤 실행 흐름을 **번호 순서로 한국어로** 풀어 설명
- 새로 등장하는 React 개념·JS 문법은 한국어 발음 + 한 줄 설명 (예: "`useState` (유즈스테이트) — 컴포넌트가 기억할 값을 만드는 훅")
- state를 어느 컴포넌트가 소유하는지와 그 이유를 설명
- props로 내려주는 **값**과 **함수**를 구분해서 설명
- React 초보가 자주 하는 실수(state 직접 수정, `key` 누락, 불필요한 `useEffect`, `onClick={fn(arg)}`)가 코드에 나타나면 그때 짚어서 설명
- 작업 마지막에 "이해가 안 되는 부분이 있는지" 물어보기

## 작업 진행 방식

- **한 번에 한 단계씩.** 단계가 끝나면 무엇을 만들었는지 요약하고, 소유자가 확인할 때까지 다음으로 넘어가지 않습니다
- 각 단계가 끝날 때마다 커밋합니다. **`push`는 명시적으로 요청받았을 때만**
- 커밋 메시지는 영어 Conventional 형식 (`feat:`, `chore:`, `style:`, `refactor:`)

## 지금 구현하지 않을 것 (요청 전까지 미리 만들지 말 것)

- 4자리/5자리 난이도 선택
- 초보 모드(스트라이크 빨강 / 볼 노랑 색상 표시)
- 숫자 버튼 롱프레스로 X 표시
- 시도 횟수 무제한 모드
- 배포, 테스트 프레임워크 도입
- **성능 최적화(`useMemo`, `useCallback`) — 가독성을 해치므로 사용하지 마세요**
