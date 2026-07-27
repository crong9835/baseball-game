/*
 * 숫자 야구 게임의 최상위 컴포넌트.
 * 게임이 어떻게 돌아가는지는 useBaseballGame 훅이 담당하고,
 * 이 파일은 화면 조각을 어떤 순서로 놓고 무엇을 내려줄지만 결정한다.
 */

import { MAX_ATTEMPTS } from './constants/gameConstants.js';
import { useBaseballGame } from './hooks/useBaseballGame.js';
import DifficultySelector from './components/DifficultySelector.jsx';
import GuessInput from './components/GuessInput.jsx';
import NumberPad from './components/NumberPad.jsx';
import ResultBanner from './components/ResultBanner.jsx';
import BeginnerModeToggle from './components/BeginnerModeToggle.jsx';
import HistoryList from './components/HistoryList.jsx';
import styles from './App.module.css';

function App() {
  const {
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
  } = useBaseballGame();

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>숫자 야구</h1>
        <p className={styles.attemptCount}>
          {attemptCount} / {MAX_ATTEMPTS}
        </p>
      </header>

      {/*
        난이도는 판을 시작하기 전에 고르는 것이라 맨 위에 둔다.
        누르면 그 자리에서 새 판이 시작된다(정답·기록·입력이 모두 초기화된다).
      */}
      <DifficultySelector digitCount={digitCount} onSelect={handleChangeDigitCount} />

      <GuessInput currentGuess={currentGuess} digitCount={digitCount} />

      <NumberPad
        currentGuess={currentGuess}
        digitHints={digitHints}
        duplicateAttemptNumber={duplicateAttemptNumber}
        isDuplicateGuess={isDuplicateGuess}
        isBeginnerMode={isBeginnerMode}
        isGuessFull={isGuessFull}
        isGameOver={isGameOver}
        onDigitToggle={handleDigitToggle}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
      />

      {/*
        다시하기는 숫자 입력과 상관없는 조작이라 NumberPad에 넣지 않고 여기에 둔다.
        게임이 끝나기 전에도 언제든 새 판을 시작할 수 있어야 하므로 항상 보여준다.
      */}
      <button type="button" className={styles.restartButton} onClick={handleRestart}>
        다시하기
      </button>

      <ResultBanner gameStatus={gameStatus} answer={answer} />

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
