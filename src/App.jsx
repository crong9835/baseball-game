/*
 * 숫자 야구 게임의 최상위 컴포넌트.
 * 게임이 어떻게 돌아가는지는 useBaseballGame 훅이 담당하고,
 * 이 파일은 화면 조각을 어떤 순서로 놓고 무엇을 내려줄지만 결정한다.
 */

import { MAX_ATTEMPTS } from './constants/gameConstants.js';
import { useBaseballGame } from './hooks/useBaseballGame.js';
import GuessInput from './components/GuessInput.jsx';
import NumberPad from './components/NumberPad.jsx';
import ResultBanner from './components/ResultBanner.jsx';
import BeginnerModeToggle from './components/BeginnerModeToggle.jsx';
import HistoryList from './components/HistoryList.jsx';
import styles from './App.module.css';

function App() {
  const {
    answer,
    currentGuess,
    history,
    gameStatus,
    isBeginnerMode,
    attemptCount,
    isGuessFull,
    isGameOver,
    handleDigitClick,
    handleBackspace,
    handleClear,
    handleSubmit,
    handleRestart,
    handleToggleBeginnerMode,
  } = useBaseballGame();

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>숫자 야구</h1>
        <p className={styles.attemptCount}>
          {attemptCount} / {MAX_ATTEMPTS}
        </p>
      </header>

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
        className={styles.submitButton}
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

      {/*
        체크박스와 기록 목록을 한 덩어리로 묶는다.
        체크박스가 바꾸는 대상이 바로 아래 목록이라는 것을 간격으로 보여주기 위해서다.
      */}
      <section className={styles.historySection}>
        <BeginnerModeToggle
          isBeginnerMode={isBeginnerMode}
          onToggle={handleToggleBeginnerMode}
        />
        <HistoryList history={history} isBeginnerMode={isBeginnerMode} />
      </section>
    </main>
  );
}

export default App;
