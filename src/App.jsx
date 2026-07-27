/*
 * 숫자 야구 게임의 최상위 컴포넌트.
 * 게임에 필요한 모든 state(정답, 입력 중인 숫자, 시도 기록, 게임 상태)를 여기서 소유하고,
 * 자식 컴포넌트에게는 "보여줄 값"과 "사건을 알리는 함수"를 props로 내려준다.
 */

import { useState } from 'react';

import { DIGIT_COUNT, MAX_ATTEMPTS, GAME_STATUS } from './constants/gameConstants.js';
import { createAnswer, judge } from './utils/gameLogic.js';
import GuessInput from './components/GuessInput.jsx';
import NumberPad from './components/NumberPad.jsx';
import ResultBanner from './components/ResultBanner.jsx';
import HistoryList from './components/HistoryList.jsx';

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

function App() {
  // createAnswer를 그대로 부르지 않고 함수로 감싼 이유:
  // 화면이 다시 그려질 때마다 정답을 새로 만들어 버리는 낭비를 막기 위해서다.
  const [answer, setAnswer] = useState(() => createAnswer());
  const [currentGuess, setCurrentGuess] = useState([]);
  const [history, setHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING);

  // 아래 값들은 state에서 바로 계산할 수 있으므로 state로 만들지 않는다.
  // state가 바뀌면 이 함수가 처음부터 다시 실행되면서 자동으로 다시 계산된다.
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
    const result = judge(answer, currentGuess);
    const newRecord = {
      attemptNumber: attemptCount + 1,
      guess: currentGuess,
      strike: result.strike,
      ball: result.ball,
      out: result.out,
    };

    // 최신 기록이 위에 오도록 새 기록을 배열 맨 앞에 붙인다.
    setHistory([newRecord, ...history]);
    setCurrentGuess([]);
    setGameStatus(decideNextStatus(result.strike, newRecord.attemptNumber));
  }

  function handleRestart() {
    setAnswer(createAnswer());
    setCurrentGuess([]);
    setHistory([]);
    setGameStatus(GAME_STATUS.PLAYING);
  }

  return (
    <main>
      <h1>숫자 야구</h1>
      <p>
        {attemptCount} / {MAX_ATTEMPTS}
      </p>

      <GuessInput currentGuess={currentGuess} />

      <NumberPad
        currentGuess={currentGuess}
        isGameOver={isGameOver}
        onDigitClick={handleDigitClick}
        onBackspace={handleBackspace}
        onClear={handleClear}
      />

      <button
        type="button"
        disabled={!isGuessFull || isGameOver}
        onClick={handleSubmit}
      >
        확인
      </button>

      <ResultBanner
        gameStatus={gameStatus}
        answer={answer}
        onRestart={handleRestart}
      />

      <HistoryList history={history} />
    </main>
  );
}

export default App;
