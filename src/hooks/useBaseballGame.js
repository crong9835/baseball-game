/*
 * 숫자 야구의 진행 상태와 조작 함수를 한곳에 모은 커스텀 훅.
 * App.jsx가 화면 조립에만 집중할 수 있도록 "게임이 어떻게 돌아가는가"를 이 파일로 옮겼다.
 * 이름이 use로 시작해야 React가 훅으로 인식하고 규칙 검사를 해준다.
 */

import { useState } from 'react';

import { DIGIT_COUNT, MAX_ATTEMPTS, GAME_STATUS } from '../constants/gameConstants.js';
import { createAnswer, scoreGuess } from '../utils/gameLogic.js';

/**
 * 이번 시도 결과로 게임이 어떤 상태가 되는지 정한다.
 *
 * state를 바꾸는 함수(setHistory 등)는 그 자리에서 즉시 반영되지 않기 때문에,
 * 방금 계산한 값을 직접 인자로 받아서 판단한다. history.length를 읽으면 아직 옛날 값이다.
 */
function decideNextStatus(strike, attemptNumber) {
  const hasWon = strike === DIGIT_COUNT;
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
  // createAnswer를 그대로 부르지 않고 함수로 감싼 이유:
  // 화면이 다시 그려질 때마다 정답을 새로 만들어 버리는 낭비를 막기 위해서다.
  const [answer, setAnswer] = useState(() => createAnswer());
  const [currentGuess, setCurrentGuess] = useState([]);
  const [history, setHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING);

  // 아래 값들은 state에서 바로 계산할 수 있으므로 state로 만들지 않는다.
  // state가 바뀌면 이 훅을 쓰는 컴포넌트가 다시 실행되면서 자동으로 다시 계산된다.
  const attemptCount = history.length;
  const isGuessFull = currentGuess.length === DIGIT_COUNT;
  const isGameOver = gameStatus !== GAME_STATUS.PLAYING;

  function handleDigitClick(digit) {
    // push로 배열을 직접 바꾸면 React가 변화를 알아채지 못하므로 항상 새 배열을 만든다.
    setCurrentGuess([...currentGuess, digit]);
  }

  function handleBackspace() {
    setCurrentGuess(currentGuess.slice(0, -1));
  }

  function handleClear() {
    setCurrentGuess([]);
  }

  function handleSubmit() {
    const score = scoreGuess(answer, currentGuess);
    const newRecord = {
      attemptNumber: attemptCount + 1,
      guess: currentGuess,
      strike: score.strike,
      ball: score.ball,
      out: score.out,
    };

    // 최신 기록이 위에 오도록 새 기록을 배열 맨 앞에 붙인다.
    setHistory([newRecord, ...history]);
    setCurrentGuess([]);
    setGameStatus(decideNextStatus(score.strike, newRecord.attemptNumber));
  }

  function handleRestart() {
    setAnswer(createAnswer());
    setCurrentGuess([]);
    setHistory([]);
    setGameStatus(GAME_STATUS.PLAYING);
  }

  // setCurrentGuess 같은 setter는 일부러 내보내지 않는다.
  // 바깥에서 state를 마음대로 바꿀 수 있으면 이 훅이 게임 규칙을 보장할 수 없기 때문이다.
  return {
    answer,
    currentGuess,
    history,
    gameStatus,
    attemptCount,
    isGuessFull,
    isGameOver,
    handleDigitClick,
    handleBackspace,
    handleClear,
    handleSubmit,
    handleRestart,
  };
}
