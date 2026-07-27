/*
 * 숫자 야구의 진행 상태와 조작 함수를 한곳에 모은 커스텀 훅.
 * App.jsx가 화면 조립에만 집중할 수 있도록 "게임이 어떻게 돌아가는가"를 이 파일로 옮겼다.
 * 이름이 use로 시작해야 React가 훅으로 인식하고 규칙 검사를 해준다.
 */

import { useState } from 'react';

import { DEFAULT_DIGIT_COUNT, MAX_ATTEMPTS, GAME_STATUS } from '../constants/gameConstants.js';
import {
  createAnswer,
  scoreGuess,
  judgeEachDigit,
  collectDigitHints,
  findDuplicateAttemptNumber,
} from '../utils/gameLogic.js';

/**
 * 이번 시도 결과로 게임이 어떤 상태가 되는지 정한다.
 *
 * state를 바꾸는 함수(setHistory 등)는 그 자리에서 즉시 반영되지 않기 때문에,
 * 방금 계산한 값을 직접 인자로 받아서 판단한다. history.length를 읽으면 아직 옛날 값이다.
 *
 * digitCount까지 인자로 받는 이유:
 * 이 함수는 훅 바깥에 있어서 state를 볼 수 없다. 몇 스트라이크면 이기는지는
 * 난이도에 따라 달라지므로(3자리면 3스트라이크, 5자리면 5스트라이크) 넘겨받아야 한다.
 */
function decideNextStatus(strike, attemptNumber, digitCount) {
  const hasWon = strike === digitCount;
  if (hasWon) {
    return GAME_STATUS.WON;
  }

  const isOutOfAttempts = attemptNumber >= MAX_ATTEMPTS;
  if (isOutOfAttempts) {
    return GAME_STATUS.LOST;
  }

  return GAME_STATUS.PLAYING;
}

export function useBaseballGame() {
  // 정답의 자릿수(난이도). 사용자가 게임 중에 바꿀 수 있으므로 state로 둔다.
  const [digitCount, setDigitCount] = useState(DEFAULT_DIGIT_COUNT);

  // createAnswer를 그대로 부르지 않고 함수로 감싼 이유:
  // 화면이 다시 그려질 때마다 정답을 새로 만들어 버리는 낭비를 막기 위해서다.
  // 여기서 digitCount 대신 DEFAULT_DIGIT_COUNT를 쓰는 것은, 이 줄이 딱 한 번만
  // 실행되는 "맨 처음 값"이라서다. 처음에는 둘이 같은 값이고, 상수를 쓰는 편이 읽기 쉽다.
  const [answer, setAnswer] = useState(() => createAnswer(DEFAULT_DIGIT_COUNT));
  const [currentGuess, setCurrentGuess] = useState([]);
  const [history, setHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING);

  // 이것만 성격이 다르다. 나머지 5개는 "게임이 어디까지 진행됐는가"이고,
  // 이 값은 "결과를 어떻게 보여줄까"라는 보기 설정이다.
  // 그래서 handleRestart에서도 일부러 되돌리지 않는다. (아래 주석 참고)
  const [isBeginnerMode, setIsBeginnerMode] = useState(false);

  // 아래 값들은 state에서 바로 계산할 수 있으므로 state로 만들지 않는다.
  // state가 바뀌면 이 훅을 쓰는 컴포넌트가 다시 실행되면서 자동으로 다시 계산된다.
  const attemptCount = history.length;
  const isGuessFull = currentGuess.length === digitCount;
  const isGameOver = gameStatus !== GAME_STATUS.PLAYING;

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
    setGameStatus(decideNextStatus(score.strike, newRecord.attemptNumber, digitCount));
  }

  function handleToggleBeginnerMode() {
    setIsBeginnerMode(!isBeginnerMode);
  }

  /*
   * 판을 새로 까는 일을 한곳에 모았다.
   * "다시하기"와 "난이도 바꾸기"가 하는 일이 자릿수만 빼면 똑같기 때문이다.
   * 둘로 나눠 쓰면 나중에 초기화할 것이 하나 늘었을 때 한쪽만 고치기 쉽다.
   *
   * setDigitCount는 즉시 반영되지 않으므로, 방금 정한 값을 createAnswer에 직접 넘긴다.
   * digitCount를 읽으면 아직 바뀌기 전 자릿수라 정답 길이가 어긋난다.
   *
   * 여기서 setIsBeginnerMode(false)를 부르지 않는 것은 실수가 아니다.
   * 새 게임을 시작했다고 켜둔 초보 모드가 꺼지면 사용자는 버그라고 느낀다.
   */
  function startNewGame(nextDigitCount) {
    setDigitCount(nextDigitCount);
    setAnswer(createAnswer(nextDigitCount));
    setCurrentGuess([]);
    setHistory([]);
    setGameStatus(GAME_STATUS.PLAYING);
  }

  // 자릿수는 그대로 두고 정답만 새로 뽑는다.
  function handleRestart() {
    startNewGame(digitCount);
  }

  // 난이도를 바꾸면 정답의 길이가 달라지므로 진행 중인 판을 이어갈 수 없다.
  // 그래서 "난이도 바꾸기"는 곧 "그 자릿수로 새 판 시작하기"다.
  function handleChangeDigitCount(nextDigitCount) {
    startNewGame(nextDigitCount);
  }

  // setCurrentGuess 같은 setter는 일부러 내보내지 않는다.
  // 바깥에서 state를 마음대로 바꿀 수 있으면 이 훅이 게임 규칙을 보장할 수 없기 때문이다.
  return {
    answer,
    digitCount,
    currentGuess,
    history,
    gameStatus,
    isBeginnerMode,
    attemptCount,
    isGuessFull,
    isGameOver,
    digitHints,
    duplicateAttemptNumber,
    isDuplicateGuess,
    handleDigitToggle,
    handleBackspace,
    handleSubmit,
    handleRestart,
    handleChangeDigitCount,
    handleToggleBeginnerMode,
  };
}
