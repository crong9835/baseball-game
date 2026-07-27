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

판정·힌트처럼 규칙이 걸린 것을 고쳤다면 화면만 보고 넘어가지 말고 이 방식으로 한 번 돌려보세요. 경계 경우(같은 숫자가 볼이었다가 스트라이크가 되는 등)는 화면에서 재현하기 번거롭습니다.

## 아키텍처

의존 방향은 **한 방향**입니다. 역방향 import(예: `gameLogic.js`가 `App.jsx`를 참조)를 만들지 마세요.

```
main.jsx → App.jsx → components/*.jsx
                  ↘  hooks/useBaseballGame.js → utils/gameLogic.js
                                              ↘  constants/gameConstants.js
```

| 위치 | 역할 |
|---|---|
| `src/constants/gameConstants.js` | **값만.** 함수 없음. `DIGIT_COUNT_OPTIONS`, `DEFAULT_DIGIT_COUNT`, `MAX_ATTEMPTS`, `MIN_DIGIT`, `MAX_DIGIT`, `GAME_STATUS`, `NEW_GAME_REASON`, `DIGIT_RESULT` |
| `src/utils/gameLogic.js` | **React와 무관한 순수 함수.** `createAllDigits()`, `createAnswer(digitCount)`, `judgeEachDigit()`, `findDuplicateAttemptNumber()`, `collectDigitHints()`, `scoreGuess()`, `decideNextStatus()` |
| `src/hooks/useBaseballGame.js` | **게임 진행 상태 전부.** state, 파생값, 조작 함수 |
| `src/components/*.jsx` | 화면 조각. 각 파일은 같은 이름의 `*.module.css`와 짝을 이룸 |
| `src/App.jsx` | 훅에서 받은 값을 화면 조각에 배분하기만 함. **여기에 state를 두지 마세요** |

컴포넌트는 `DifficultySelector`, `GuessInput`, `NumberPad`, `SettingToggle`, `ResultBanner`, `HistoryList`, `ConfirmDialog` 일곱 개입니다.

`SettingToggle`만 **같은 컴포넌트를 두 번 씁니다**(초보 모드, 무제한 기회). 생김새와 동작이 똑같고 글자만 달라서, 파일을 복사해 두는 대신 `label`·`description`을 props로 받게 했습니다. 설정이 하나 더 늘어도 `App.jsx`에 다섯 줄만 추가하면 됩니다.

**자릿수는 `gameLogic.js`가 스스로 알지 못합니다.** 자릿수를 쓰는 함수는 인자로 받고(`createAnswer(digitCount)`), 나머지는 넘겨받은 배열의 길이대로 돕니다. 난이도가 3·4·5로 달라져도 이 파일이 고쳐지지 않는 이유입니다.

### state 소유 규칙

**모든 state는 `useBaseballGame` 훅이 소유합니다.** App도 자식 컴포넌트도 `useState`를 갖지 않습니다.
같은 값을 여러 컴포넌트가 봐야 하기 때문입니다(예: `currentGuess`는 `GuessInput`이 표시하고 `NumberPad`가 버튼 비활성화에 사용).

훅이 가진 state는 8개뿐이고, 세 갈래로 나뉩니다:

- **게임 규칙** — `digitCount`, `isUnlimitedMode`, `isBeginnerMode`
- **게임 진행** — `answer`, `currentGuess`, `history`, `gameStatus`
- **확인 대기** — `pendingNewGame`

**규칙 셋은 바뀌는 순간 새 판이 시작됩니다. 예외는 없습니다.** 판 중간에 규칙이 바뀌면 앞의 기록과 뒤의 기록이 서로 다른 조건으로 쌓이기 때문입니다.

> 초보 모드는 예전에 '보기 설정'으로 보고 판을 건드리지 않았습니다. **2026년 7월에 바꿨습니다.** 나중에 순위를 매기는 기능을 붙이려면 한 판이 처음부터 끝까지 같은 조건이어야 하는데, 힌트를 보며 절반을 풀고 중간에 끈 판이 "힌트 없이 6회"로 남으면 그건 기록이 아니라 구멍이기 때문입니다. 되돌리지 마세요.

훅은 값과 핸들러만 돌려주고 **`setCurrentGuess` 같은 setter는 내보내지 않습니다.** 바깥에서 state를 직접 바꿀 수 있으면 게임 규칙을 한곳에서 보장할 수 없기 때문입니다. 새 조작이 필요하면 setter를 노출하지 말고 훅 안에 `handle...` 함수를 추가하세요.

같은 이유로 **화면에서 막은 조작은 훅에서도 막습니다.** 예를 들어 중복 조합은 확인 버튼을 비활성화하는 것과 별개로 `handleSubmit` 안에서도 한 번 더 걸러냅니다. 화면 쪽 조건이 하나 빠져도 규칙이 깨지지 않아야 하기 때문입니다.

**state에서 계산할 수 있는 값은 절대 state로 만들지 마세요.** 매 렌더에서 그냥 계산합니다:

```js
const attemptCount = history.length;
const isGuessFull = currentGuess.length === digitCount;
const isGameOver = gameStatus !== GAME_STATUS.PLAYING;
const digitHints = collectDigitHints(history);                          // 키패드 힌트
const duplicateAttemptNumber = findDuplicateAttemptNumber(history, currentGuess);
```

`digitHints`를 state로 만들면 "기록은 늘었는데 힌트는 그대로"인 버그가 바로 생깁니다. 진짜 값은 `history` 하나뿐입니다.

### `useEffect`를 쓰는 기준

**규칙은 "쓰지 마라"가 아니라 "state에서 계산되는 값을 `useEffect`로 베껴 두지 마라"입니다.**

> 예전에는 "이 프로젝트에는 `useEffect`가 하나도 없고 앞으로도 필요하지 않다"고 적혀 있었습니다. **2026년 7월에 고쳤습니다.** 0개였던 건 규칙을 지켜서가 아니라 React 바깥과 얘기할 일이 없어서였는데, 문장이 그 이유를 감추고 있었습니다. 그대로 두면 브라우저가 공짜로 주는 기능을 손으로 다시 만들게 됩니다.

`useEffect`는 **React가 모르는 바깥 세상과 맞추는** 훅입니다. "state가 바뀌면 뭘 하라"가 아닙니다.

| 상황 | |
|---|---|
| `history`로 힌트 계산 | ❌ 그냥 계산 |
| 버튼 눌렀을 때 뭔가 하기 | ❌ 이벤트 핸들러 |
| props가 바뀌면 state 맞추기 | ❌ 대개 설계가 잘못된 신호 |
| `dialog.showModal()` 호출 | ⭕ DOM API와 동기화 |
| `localStorage`, 타이머, 구독 | ⭕ 정리(cleanup)가 필요 |

지금 `useEffect`는 **`ConfirmDialog.jsx` 한 곳뿐**입니다. `<dialog>`는 `isOpen`이 `true`인 것만으로는 열리지 않고 브라우저의 `showModal()`을 반드시 불러야 열리기 때문입니다. 여기에 하나 더 늘리려면 위 표의 ⭕쪽인지 먼저 확인하세요.

`useRef`도 같은 자리에 있습니다. **`ref`는 state가 아닙니다** — 바뀌어도 화면을 다시 그리지 않으므로 "모든 state는 훅이 소유한다"는 규칙과 어긋나지 않습니다.

### 데이터는 아래로, 사건은 위로

컴포넌트는 값(props)을 받아 표시만 하고, 사용자 조작은 App이 내려준 콜백(`onDigitToggle`, `onBackspace`, `onSubmit`, `onSelect`, `onToggle`)을 호출해 알립니다. 자식이 직접 게임 상태를 바꾸지 않습니다.

`ResultBanner`는 App에서 조건부로 감싸지 않고, 스스로 `gameStatus`를 보고 진행 중이면 `return null` 합니다.

### 판정 규칙

- 정답은 서로 다른 숫자 `digitCount`개(3·4·5), 첫 자리 0 허용
- 정답과 입력 모두 중복이 없으므로 한 자리는 스트라이크·볼·아웃 중 정확히 하나입니다. 그래서 각 자리를 옆자리와 상관없이 따로 판정해도 되고, `strike + ball + out`이 항상 자릿수와 같습니다
- **판정 규칙은 `judgeEachDigit()` 한 곳에만 있습니다.** `scoreGuess()`는 그 결과를 `filter().length`로 세기만 합니다. 규칙을 두 군데 두면 한쪽만 고쳤을 때 화면의 색과 점수가 서로 어긋납니다
- `scoreGuess()`는 **채점만** 합니다. 승패 판단은 같은 파일의 `decideNextStatus()`가 맡습니다. 둘 다 `gameLogic.js`에 있지만 하는 일은 다릅니다. 이 경계를 섞지 마세요
- 화면 표기는 **한글 야구 용어**입니다 (`1스트라이크 1볼 1아웃`). **0개인 것은 적지 않습니다** — 0까지 늘어놓으면 정작 봐야 할 숫자가 묻히기 때문입니다. 셋을 더하면 항상 자릿수라 하나는 반드시 0보다 크고, 그래서 오른쪽이 텅 비는 경우는 없습니다. 예전에는 참고 사이트(https://sciencelove.com/2653)를 따라 `S:1 B:1 OUT:1`로 적었지만 야구 규칙을 모르면 읽을 수 없어서 바꿨습니다

### 게임 규칙 설정 세 가지

`digitCount`(자릿수), `isUnlimitedMode`(무제한 기회), `isBeginnerMode`(초보 모드) 셋은 **전부 같은 취급**입니다. 바꾸면 그 자리에서 새 판이 시작됩니다.

판을 새로 까는 코드는 **`startNewGame(nextSettings)` 하나뿐**입니다. '다시하기'와 설정 셋이 하는 일이 정확히 같기 때문입니다. 넷으로 나눠 쓰면 나중에 초기화할 것이 하나 늘었을 때 한 군데를 빠뜨립니다.

```js
function handleToggleUnlimitedMode() {
  startNewGame({ digitCount, isUnlimitedMode: !isUnlimitedMode, isBeginnerMode });
}
```

**값을 하나씩 나열하지 않고 객체로 받습니다.** `startNewGame(3, false, true)`라고 쓰면 두 번째 `false`가 무엇인지 알 수 없습니다. 부르는 쪽에서 이름이 보여야 무엇이 바뀌는 조작인지 한눈에 읽힙니다.

체크박스 설명에 `· 바꾸면 새 판`을 적어둔 것도 같은 이유입니다. 눌렀을 때 판이 사라지는데 글자에 안 적혀 있으면 눌러보고 나서야 알게 됩니다.

#### 새 판 확인 창 (`ConfirmDialog`)

판을 날리는 조작은 넷입니다 — 난이도 변경, 초보 모드 토글, 무제한 기회 토글, 다시하기. 넷 다 **`requestNewGame(reason, nextSettings)`을 거칩니다.** 물어볼지 말지를 한 곳에서만 판단해야 나중에 조작이 하나 늘었을 때 빠뜨리지 않습니다.

**잃을 게 있을 때만 묻습니다** (`attemptCount > 0 && !isGameOver`). 무조건 물으면 기록이 0개일 때도 창이 떠서, 내용을 안 읽고 확인부터 누르는 습관이 듭니다. 정작 물어봐야 할 때 소용이 없어집니다.

**아무것도 바꾸지 않는 조작은 아예 묻지 않습니다.** 3자리에서 다시 3자리를 누르면 `handleChangeDigitCount`가 그 자리에서 `return`합니다. 그냥 두면 바뀌는 것도 없는데 "기록이 사라집니다"가 뜨고, 그 말을 "3자리로 하겠다"는 뜻으로 읽은 사람이 확인을 눌러 판을 날립니다.

**`pendingNewGame` state 하나로 처리합니다.** `null`이면 묻는 중이 아니고, 모양은 `{ reason, settings }`입니다.

- `settings` — 확인을 누르면 `startNewGame`에 그대로 넘길 값. `startNewGame`이 이미 `{ digitCount, isUnlimitedMode, isBeginnerMode }` 객체를 받으므로 모양이 그대로 맞습니다
- `reason` — 창에 적을 질문을 고르는 데 씁니다 (`NEW_GAME_REASON`)

**`reason`을 빼지 마세요.** 확인을 받기 전에는 state를 바꾸지 않아서 체크박스가 눌리기 전 모습으로 돌아가 있습니다. 창이 "판을 지울까요?"만 물으면 무엇 때문에 뜬 창인지 알 수 없고, 취소한 사람은 설정이 안 켜진 채로 남습니다. `settings`만으로 알아내려면 지금 값과 일일이 비교해야 합니다.

`isConfirmOpen` 같은 불린을 따로 두지 마세요. "열려 있는데 무엇을 확인하려던 건지는 잃어버린" 상태가 만들어집니다.

**취소에는 원상복구 코드가 없습니다.** 체크박스와 난이도 버튼이 state를 그대로 비추는 제어 컴포넌트라, state를 안 바꿨으니 화면도 저절로 그대로입니다.

`setPendingNewGame(null)`은 **`startNewGame` 안에** 있습니다. 판을 까는 길이 그 함수 하나뿐이라, 어느 경로로 들어와도 창이 닫히는 것이 보장됩니다.

**훅으로 분리하지 마세요.** 한때 `useNewGameConfirm`으로 빼려다 철회했습니다. 확인 흐름과 `startNewGame`은 한 몸이라 나누면 배선만 늘어납니다(위 '파일을 나누는 기준' 3번).

`<dialog>` 태그를 쓰므로 Esc 닫기·포커스 가두기·배경 어둡게는 브라우저가 해줍니다. 대신 두 가지를 주의하세요:

- 닫혀 있을 때 `return null` 하지 마세요. 요소가 사라지면 `close()`를 부를 대상이 없어집니다
- **`onClose={onCancel}`이 반드시 있어야 합니다.** Esc를 누르면 브라우저가 창을 혼자 닫는데, 훅에 알리지 않으면 "화면은 닫혔는데 훅은 아직 묻는 중"으로 어긋납니다

확인 버튼은 강조색(파랑)이 아니라 경고색(`--color-strike`)입니다. 되돌릴 수 없는 조작이기 때문입니다. 그리고 취소를 DOM 순서에서 **앞에** 두었습니다 — `showModal()`이 첫 버튼에 포커스를 주므로, 엔터를 잘못 눌렀을 때 취소가 되는 쪽이 안전합니다. 순서를 바꾸지 마세요.

#### 난이도 (자릿수)

`3자리 / 4자리 / 5자리`를 고를 수 있고 **기본값은 3자리**입니다. 버튼은 제목 줄 바로 아래에 있습니다(`DifficultySelector`). 판을 시작하기 전에 고르는 설정이라 위쪽이 자연스럽고, 스크롤 없이 항상 보입니다.

고를 수 있는 값은 `DIGIT_COUNT_OPTIONS`에 있고 버튼도 이 배열을 `map`으로 돌려 그립니다. 난이도를 하나 더 넣고 싶으면 **이 배열에만 추가하면 버튼까지 같이 생깁니다.**

`decideNextStatus()`는 `digitCount`를 **인자로 받습니다.** 순수 함수라 state를 볼 수 없고, 몇 스트라이크면 이기는지는 난이도마다 다르기 때문입니다.

`NumberPad`는 자릿수를 아예 모릅니다. 다 찼는지(`isGuessFull`)만 받으므로 난이도가 늘어도 고칠 것이 없습니다. 이 경계를 무너뜨리지 마세요.

입력 칸(`GuessInput`)은 폭을 고정하지 않고 `flex: 1 1 0` + `max-width: 64px`입니다. 5칸을 64px로 고정하면 좁은 휴대폰 화면에서 가로로 넘칩니다. 3~4칸은 `max-width`에 걸려 예전과 같은 크기입니다.

#### 무제한 기회

켜면 **맞힐 때까지 게임이 끝나지 않습니다.** 오른쪽 위 표시도 `7 / 10`에서 `7회`로 바뀝니다(분모가 없으므로).

`decideNextStatus()` 안에서 **이기는 조건을 무제한 조건보다 먼저 확인해야 합니다.** 순서가 반대면 무제한 모드에서 정답을 맞혀도 게임이 끝나지 않습니다.

**시도 횟수는 난이도와 상관없이 10회입니다.** 자릿수가 늘면 한 번의 판정에서 얻는 정보도 함께 늘기 때문에, 5자리가 3자리보다 크게 어렵지 않습니다. `MAX_ATTEMPTS`를 난이도별 표로 바꾸지 마세요.

#### 초보 모드

체크박스로 켜고 끄며 **기본값은 꺼짐**입니다. 켜면 색으로 힌트를 줍니다.

| 곳 | 표시 |
|---|---|
| **숫자 버튼(핵심)** | 지금까지 알아낸 사실을 배경색으로 — 빨강=스트라이크 확정, 노랑=정답에 있음, 회색=정답에 없음, 흰색=아직 안 써봄 |
| 시도 기록 | 입력한 숫자 자체를 같은 색으로. 스트라이크에는 밑줄도 |

**힌트의 핵심은 숫자 버튼입니다.** 지나간 기록에만 색을 칠하면 "다음에 뭘 누를까"에 도움이 되지 않습니다. 누르기 직전에 보여야 합니다.

힌트는 `collectDigitHints(history)`가 만듭니다. 같은 숫자가 나중에 볼로 다시 나와도 **이미 확정된 스트라이크를 덮어쓰지 않습니다.**

색만으로 구분하면 색을 구별하기 어려운 사람에게는 차이가 없으므로, 스트라이크에는 밑줄을, 못 누르는 버튼에는 `opacity`를 함께 씁니다.

초보 모드도 **켜고 끄면 새 판이 시작됩니다.** 위의 '게임 규칙 설정 세 가지'를 보세요.

### 숫자 버튼은 토글입니다

이미 고른 숫자를 다시 누르면 **뺍니다.** 그래서 고른 숫자를 `disabled`로 막지 않습니다. 자릿수를 다 채운 뒤에는 고르지 않은 숫자만 막습니다.

"초기화" 버튼은 이 토글이 생기면서 없앴습니다. 되살리지 마세요.

화면 위에서부터 `[3자리] [4자리] [5자리]` 한 줄, 입력 칸, 숫자 버튼, `[지우기] [확인]` 한 줄, `[다시하기]` 한 줄입니다. **확인은 `NumberPad` 안에, 난이도와 다시하기는 `App`에 있습니다.** 둘 다 숫자 입력과 무관한 조작이라 숫자 패드에 넣지 않았습니다. 다시하기는 게임 중에도 항상 보이므로 `ResultBanner`에는 따로 버튼을 두지 않습니다(같은 버튼이 두 개가 됩니다).

### 같은 조합은 두 번 못 냅니다

`findDuplicateAttemptNumber()`가 예전에 낸 조합을 찾아내면 안내 문구를 띄우고 확인 버튼을 막습니다. 결과가 뻔한데 시도 횟수만 날아가기 때문입니다. **순서가 다르면 다른 조합입니다** (`123`과 `321`은 별개).

### `setState`는 즉시 반영되지 않습니다

`handleSubmit`에서 `history.length`를 읽으면 아직 갱신 전 값입니다. 그래서 방금 만든 값을 직접 넘깁니다:

```js
setGameStatus(
  decideNextStatus(score.strike, newRecord.attemptNumber, digitCount, isUnlimitedMode),
);
```

`history.length >= MAX_ATTEMPTS` 같은 코드로 바꾸지 마세요. 마지막 시도에서 게임이 끝나지 않는 버그가 됩니다.

`startNewGame`도 같은 이유로 방금 정한 자릿수를 직접 넘깁니다:

```js
setDigitCount(nextSettings.digitCount);
setAnswer(createAnswer(nextSettings.digitCount));   // digitCount를 읽으면 아직 바뀌기 전 값이다
```

`createAnswer(digitCount)`로 바꾸면 5자리를 골랐는데 정답이 3자리로 만들어집니다.

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
6. **파일을 줄 수로 나누지 마세요.** 아래 '파일을 나누는 기준'을 보세요
7. 모든 파일 맨 위에 역할을 설명하는 2~3줄 주석
8. 주석은 "무엇을"이 아니라 **"왜 이렇게 했는지"**를 적을 것
9. 변수·함수 이름은 영어, 주석과 설명은 한국어
10. **함수·컴포넌트를 새로 만들면 이름 읽는 법을 바로 위에 한 줄 적을 것.** 아래 '이름 읽는 법'을 보세요

### 이름 읽는 법 (반드시 같이 적을 것)

이 코드는 한국어로 읽습니다. **이름만 보고 무슨 함수인지 모르면 이 프로젝트는 의미가 없습니다.**

함수·컴포넌트를 새로 만들 때는 하는 일을 적은 줄 **바로 아래에** 한글 발음과 단어 뜻을 붙입니다:

```js
/**
 * 입력한 숫자를 한 자리씩 판정한다.
 * judgeEachDigit (저지 이치 디짓) — judge=판정하다, each=각각, digit=숫자 한 자리
 */
```

**따로 사전 파일을 만들지 마세요.** 코드를 읽다가 막히는 자리에 뜻이 있어야 파일을 옮겨 다니지 않습니다.

이름 앞뒤에 붙는 것들은 뜻이 정해져 있으니 새 이름을 지을 때도 그대로 따르세요:

| 붙는 것 | 뜻 | 예 |
|---|---|---|
| `handle~` | ~을 처리한다 (훅 안에 있는 실제 처리) | `handleSubmit` |
| `on~` | ~하면 불러줘 (자식에게 내려주는 props) | `onDigitToggle` |
| `is~` / `has~` | ~인가? (답이 예/아니오) | `isGameOver` |
| `get~` | ~을 골라서 돌려준다 | `getSlotClassName` |
| `create~` | ~을 새로 만든다 | `createAnswer` |
| `~Count` | ~의 개수 | `attemptCount` |

자주 나오는 단어: `digit`=숫자 한 자리, `guess`=추측(입력한 숫자), `attempt`=시도, `answer`=정답, `history`=기록, `hint`=힌트, `slot`=칸, `pending`=아직 처리 안 된

### 파일을 나누는 기준

**예전에는 "코드 100줄을 넘기면 나눌 것"이라는 규칙이 있었습니다. 2026년 7월에 없앴습니다.**

줄 수는 나눌 이유가 되지 못합니다. 서로 붙어 있어야 할 코드를 숫자에 맞춰 억지로 떼어놓으면, 110줄짜리 파일 하나를 훑는 것보다 55줄 두 개를 오가며 맞춰보는 쪽이 더 힘들어집니다. **찾는 데 드는 품이 늘어나면 나눈 것이 아니라 흩어놓은 것입니다.**

나눌지 말지는 세 가지를 물어서 정합니다. **셋 다 "예"가 아니면 나누지 마세요.**

1. 이 파일이 지금 **두 가지 이상의 일**을 하고 있나?
2. 한쪽을 고칠 때 다른 쪽을 **안 읽어도** 되나?
3. 나눈 둘이 **따로 쓰일 일**이 있나? (항상 같이 import 된다면 나눌 이유가 없습니다)

예를 들어 나중에 순위 기능이 들어와서 `localStorage`에 기록을 저장하고 불러오는 코드가 생기면, 그건 "지금 진행 중인 판"과 상관없는 별개의 일이라 셋 다 "예"가 됩니다. 그때는 줄 수와 무관하게 나눕니다. 반대로 "새 판을 시작할까 물어보기"는 새 판을 시작하는 코드와 한 몸이므로 몇 줄이 되든 같이 둡니다.

같은 이유로 **파일이 길어지는 것 자체는 문제가 아닙니다.** 이 프로젝트는 주석이 두꺼운 것이 의도라서 파일이 원래 깁니다.

### CSS

- 컴포넌트마다 `*.module.css`를 짝지어 배치. 클래스 이름은 `styles.digitButton`으로 꺼내 쓸 수 있도록 **camelCase**로 작성
- 조건부 클래스는 템플릿 문자열 + 삼항연산자 대신 배열에 담았다가 `join(' ')` (`GuessInput.jsx`의 `getSlotClassName` 참고)
- 색상·간격·radius·터치 크기는 `src/index.css`의 CSS 변수 사용. 컴포넌트 CSS에 원시 숫자를 직접 쓰지 않기
- 세로 간격은 `margin`이 아니라 부모의 `gap`으로 관리
- 모바일 우선. 누르는 대상은 `--button-min-size`(48px) 이상
- **나타났다 사라지는 요소는 자리를 미리 비워둘 것** (`NumberPad`의 `.notice`가 `min-height`를 갖는 이유). 문구가 뜰 때 아래 버튼이 밀리면 누르려던 순간에 버튼이 도망갑니다
- **선택 표시는 `border`를 굵히지 말고 `box-shadow: inset`으로.** border는 요소 크기를 바꿔서 누를 때마다 화면이 흔들립니다

#### 규칙 순서에 주의

`NumberPad.module.css`에서 **`.digitButton:disabled`는 반드시 힌트 규칙(`.digitButton.strikeHint` 등)보다 위에 있어야 합니다.** 둘은 조건 개수가 똑같아서 나중에 쓴 쪽이 이깁니다. 순서가 뒤집히면 자릿수를 다 채우는 순간 힌트 색이 전부 회색으로 덮입니다. 실제로 그 버그가 있었습니다.

그래서 "못 누른다"는 표시는 배경색이 아니라 `opacity`로 줍니다. 색과 무관하게 겹쳐지므로 힌트 색을 지우지 않습니다.

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
- 커밋 메시지는 **앞의 종류 표시만 영어**, 나머지는 전부 한국어로 씁니다. 소유자가 나중에 읽고 무슨 작업이었는지 알 수 있어야 하기 때문입니다

  ```
  feat: 초보 모드 켜고 끄는 체크박스 추가

  기록 목록 위에 체크박스를 두고 isBeginnerMode를 useBaseballGame에 넣었다.
  힌트는 지나간 기록이 아니라 숫자 버튼에 칠해야 다음에 뭘 누를지에 도움이 된다.
  ```

  **"무엇을 했는지"보다 "왜 그렇게 했는지"를 적습니다.** 무엇을 했는지는 diff를 보면 알 수 있지만, 왜 그랬는지는 적어두지 않으면 사라집니다.

  종류 표시는 `feat:`(기능 추가), `fix:`(버그 수정), `refactor:`(동작은 그대로, 구조만 정리), `docs:`(문서), `style:`(모양만), `chore:`(설정·잡일)

## 지금 구현하지 않을 것 (요청 전까지 미리 만들지 말 것)

- 숫자 버튼 롱프레스로 X 표시
- 배포, 테스트 프레임워크 도입
- **성능 최적화(`useMemo`, `useCallback`) — 가독성을 해치므로 사용하지 마세요**
