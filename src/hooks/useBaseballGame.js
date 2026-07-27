/*
 * 숫자 야구의 진행 상태와 조작 함수를 한곳에 모은 커스텀 훅.
 * App.jsx가 화면 조립에만 집중할 수 있도록 "게임이 어떻게 돌아가는가"를 이 파일로 옮겼다.
 * 이름이 use로 시작해야 React가 훅으로 인식하고 규칙 검사를 해준다.
 */

import { useState } from 'react';

import { DEFAULT_DIGIT_COUNT, GAME_STATUS } from '../constants/gameConstants.js';
import {
  createAnswer,
  scoreGuess,
  judgeEachDigit,
  collectDigitHints,
  findDuplicateAttemptNumber,
  decideNextStatus,
} from '../utils/gameLogic.js';

export function useBaseballGame() {
  /*
   * 여기 세 개는 "이 판을 어떤 규칙으로 하는가"다.
   * 셋 다 바꾸는 순간 새 판이 시작된다. 예외는 없다.
   *
   * 판 중간에 규칙이 바뀌면 앞의 기록과 뒤의 기록이 서로 다른 조건으로 쌓인다.
   * 나중에 순위를 매기는 기능을 붙일 때, 힌트를 보며 절반을 풀고 중간에 끈 판이
   * "힌트 없이 6회"로 남으면 그건 기록이 아니라 구멍이다.
   */
  const [digitCount, setDigitCount] = useState(DEFAULT_DIGIT_COUNT);
  const [isUnlimitedMode, setIsUnlimitedMode] = useState(false);
  const [isBeginnerMode, setIsBeginnerMode] = useState(false);

  // createAnswer를 그대로 부르지 않고 함수로 감싼 이유:
  // 화면이 다시 그려질 때마다 정답을 새로 만들어 버리는 낭비를 막기 위해서다.
  // 여기서 digitCount 대신 DEFAULT_DIGIT_COUNT를 쓰는 것은, 이 줄이 딱 한 번만
  // 실행되는 "맨 처음 값"이라서다. 처음에는 둘이 같은 값이고, 상수를 쓰는 편이 읽기 쉽다.
  const [answer, setAnswer] = useState(() => createAnswer(DEFAULT_DIGIT_COUNT));
  const [currentGuess, setCurrentGuess] = useState([]);
  const [history, setHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING);

  /*
   * 확인 창이 "물어보는 중인 설정"을 담아 둔다. null이면 묻는 중이 아니다.
   *
   * isConfirmOpen 같은 불린을 따로 두지 않은 이유:
   * 열려 있다는 사실은 여기에 값이 들어 있는지로 이미 알 수 있는데 둘로 나누면
   * "열려 있는데 무엇을 확인하려던 건지는 잃어버린" 어긋난 상태가 만들어질 수 있다.
   *
   * startNewGame이 이미 { digitCount, isUnlimitedMode, isBeginnerMode } 객체를 받으므로,
   * 여기에 담아둔 것을 확인 버튼에서 그대로 넘기면 된다.
   */
  const [pendingSettings, setPendingSettings] = useState(null);

  // 아래 값들은 state에서 바로 계산할 수 있으므로 state로 만들지 않는다.
  // state가 바뀌면 이 훅을 쓰는 컴포넌트가 다시 실행되면서 자동으로 다시 계산된다.
  const attemptCount = history.length;
  const isGuessFull = currentGuess.length === digitCount;
  const isGameOver = gameStatus !== GAME_STATUS.PLAYING;

  // 확인 창이 열렸는지도 pendingSettings에서 바로 나오는 값이라 state로 만들지 않는다.
  const isConfirmingNewGame = pendingSettings !== null;

  /*
   * 아직 한 번도 안 냈거나 이미 끝난 판은 새로 시작해도 잃을 것이 없다.
   * 그럴 때까지 물어보면 기록이 0개일 때도 창이 뜨고, 그러면 내용을 읽지 않고
   * 확인부터 누르는 습관이 든다. 정작 물어봐야 할 때 아무 소용이 없어진다.
   */
  const hasProgressToLose = attemptCount > 0 && !isGameOver;

  // 힌트도 history에서 계산되는 값이라 state로 만들지 않는다.
  // history가 바뀌면 이 훅이 다시 실행되면서 저절로 다시 계산된다.
  const digitHints = collectDigitHints(history);

  // 자릿수를 다 채우기 전에는 예전 조합과 길이가 달라 절대 같아지지 않으므로,
  // "입력이 다 찼는지"를 따로 확인하지 않아도 된다.
  const duplicateAttemptNumber = findDuplicateAttemptNumber(history, currentGuess);
  const isDuplicateGuess = duplicateAttemptNumber !== null;

  /*
   * 같은 숫자를 한 번 더 누르면 넣지 않고 뺀다.
   * 잘못 누른 숫자를 고치려고 "지우기"까지 손을 옮기지 않아도 되게 하려는 것이다.
   */
  function handleDigitToggle(digit) {
    const isAlreadyPicked = currentGuess.includes(digit);

    if (isAlreadyPicked) {
      // filter는 조건에 맞는 것만 남긴 "새 배열"을 돌려준다. 원본은 그대로다.
      setCurrentGuess(currentGuess.filter((pickedDigit) => pickedDigit !== digit));
      return;
    }

    // push로 배열을 직접 바꾸면 React가 변화를 알아채지 못하므로 항상 새 배열을 만든다.
    setCurrentGuess([...currentGuess, digit]);
  }

  function handleBackspace() {
    setCurrentGuess(currentGuess.slice(0, -1));
  }

  function handleSubmit() {
    // 확인 버튼도 막아두지만, 규칙을 지키는 책임은 이 훅에 있다.
    // 화면 쪽 조건이 하나 빠지더라도 같은 조합이 기록에 두 번 들어가지 않게 한다.
    if (isDuplicateGuess) {
      return;
    }

    const score = scoreGuess(answer, currentGuess);

    // 자리별 판정을 기록에 같이 담아둔다.
    // 정답은 "다시 시작"에서 바뀌므로, 나중에 다시 계산하면 옛 기록이 엉뚱하게 칠해진다.
    const digitResults = judgeEachDigit(answer, currentGuess);

    const newRecord = {
      attemptNumber: attemptCount + 1,
      guess: currentGuess,
      digitResults,
      strike: score.strike,
      ball: score.ball,
      out: score.out,
    };

    // 최신 기록이 위에 오도록 새 기록을 배열 맨 앞에 붙인다.
    setHistory([newRecord, ...history]);
    setCurrentGuess([]);
    setGameStatus(
      decideNextStatus(score.strike, newRecord.attemptNumber, digitCount, isUnlimitedMode),
    );
  }

  /*
   * 판을 새로 까는 일을 한곳에 모았다.
   * 설정을 바꾸는 세 가지와 "다시하기"가 하는 일이 정확히 같기 때문이다.
   * 넷으로 나눠 쓰면 나중에 초기화할 것이 하나 늘었을 때 한 군데를 빠뜨리기 쉽다.
   *
   * 값을 하나씩 나열하지 않고 객체 하나로 받는 이유:
   * startNewGame(3, false, true)라고 쓰면 두 번째 false가 무엇인지 알 수 없다.
   * 부르는 쪽에서 이름이 보여야 무엇이 바뀌는 조작인지 한눈에 읽힌다.
   *
   * setDigitCount는 즉시 반영되지 않으므로, 방금 정한 값을 createAnswer에 직접 넘긴다.
   * digitCount를 읽으면 아직 바뀌기 전 자릿수라 정답 길이가 어긋난다.
   */
  function startNewGame(nextSettings) {
    setDigitCount(nextSettings.digitCount);
    setIsUnlimitedMode(nextSettings.isUnlimitedMode);
    setIsBeginnerMode(nextSettings.isBeginnerMode);
    setAnswer(createAnswer(nextSettings.digitCount));
    setCurrentGuess([]);
    setHistory([]);
    setGameStatus(GAME_STATUS.PLAYING);

    // 판이 새로 깔렸으면 물어볼 것도 없어졌다.
    // 확인 버튼 쪽에서 따로 닫지 않고 여기서 닫는 이유는, 판을 까는 길이 이 함수 하나뿐이라
    // 여기에 두면 어느 경로로 들어와도 창이 닫히는 것이 보장되기 때문이다.
    setPendingSettings(null);
  }

  /*
   * 판을 날리는 조작(다시하기와 설정 셋)이 모두 이 함수를 거친다.
   * 잃을 것이 있으면 곧바로 시작하지 않고 확인 창에 물어볼 설정을 담아 둔다.
   *
   * 물어볼지 말지를 여기서 한 번만 판단하는 이유:
   * 네 조작이 각자 판단하면 나중에 조작이 하나 늘었을 때 한 군데를 빠뜨린다.
   */
  function requestNewGame(nextSettings) {
    if (hasProgressToLose) {
      setPendingSettings(nextSettings);
      return;
    }

    startNewGame(nextSettings);
  }

  // 설정은 그대로 두고 정답만 새로 뽑는다.
  function handleRestart() {
    requestNewGame({ digitCount, isUnlimitedMode, isBeginnerMode });
  }

  // 아래 셋은 규칙을 하나씩만 바꿔서 새 판을 시작한다.
  // 나머지 둘을 그대로 넘기는 것이 눈에 보이므로 무엇이 바뀌는지 헷갈리지 않는다.
  function handleChangeDigitCount(nextDigitCount) {
    requestNewGame({ digitCount: nextDigitCount, isUnlimitedMode, isBeginnerMode });
  }

  function handleToggleUnlimitedMode() {
    requestNewGame({ digitCount, isUnlimitedMode: !isUnlimitedMode, isBeginnerMode });
  }

  function handleToggleBeginnerMode() {
    requestNewGame({ digitCount, isUnlimitedMode, isBeginnerMode: !isBeginnerMode });
  }

  // 담아둔 설정을 그대로 넘긴다. 무엇을 확인했는지가 그 객체에 다 들어 있다.
  function handleConfirmNewGame() {
    startNewGame(pendingSettings);
  }

  /*
   * 취소는 담아둔 것을 버리기만 하면 끝이다.
   * 체크박스와 난이도 버튼이 state를 그대로 비추는 제어 컴포넌트라,
   * state를 안 바꿨으니 화면도 저절로 원래대로다. 되돌리는 코드가 따로 필요 없다.
   */
  function handleCancelNewGame() {
    setPendingSettings(null);
  }

  // setCurrentGuess 같은 setter는 일부러 내보내지 않는다.
  // 바깥에서 state를 마음대로 바꿀 수 있으면 이 훅이 게임 규칙을 보장할 수 없기 때문이다.
  return {
    answer,
    digitCount,
    currentGuess,
    history,
    gameStatus,
    isUnlimitedMode,
    isBeginnerMode,
    attemptCount,
    isGuessFull,
    isGameOver,
    isConfirmingNewGame,
    digitHints,
    duplicateAttemptNumber,
    isDuplicateGuess,
    handleDigitToggle,
    handleBackspace,
    handleSubmit,
    handleRestart,
    handleChangeDigitCount,
    handleToggleUnlimitedMode,
    handleToggleBeginnerMode,
    handleConfirmNewGame,
    handleCancelNewGame,
  };
}
