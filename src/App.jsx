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
import SettingToggle from './components/SettingToggle.jsx';
import HistoryList from './components/HistoryList.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import styles from './App.module.css';

function App() {
  const {
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
  } = useBaseballGame();

  // 무제한 모드에서는 분모가 없으므로 "7회"라고만 적는다.
  // 중첩 삼항연산자 대신 기본값을 먼저 정하고 조건에 맞으면 덮어쓴다.
  let attemptText = `${attemptCount} / ${MAX_ATTEMPTS}`;
  if (isUnlimitedMode) {
    attemptText = `${attemptCount}회`;
  }

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>숫자 야구</h1>
        <p className={styles.attemptCount}>{attemptText}</p>
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
        초보 모드 체크박스가 바꾸는 대상이 바로 아래 목록이라는 것을 간격으로 보여주기 위해서다.

        같은 SettingToggle을 두 번 쓴다. 생김새와 동작이 똑같고 글자만 다르기 때문이다.
        둘 다 "바꾸면 새 판"을 적어둔다. 눌렀을 때 진행 중이던 판이 사라지는데
        그것이 글자에 안 적혀 있으면 눌러보고 나서야 알게 된다.
      */}
      <section className={styles.historySection}>
        <SettingToggle
          label="초보 모드"
          description="알아낸 숫자를 버튼에 색으로 · 바꾸면 새 판"
          isOn={isBeginnerMode}
          onToggle={handleToggleBeginnerMode}
        />
        <SettingToggle
          label="무제한 기회"
          description="맞힐 때까지 시도 · 바꾸면 새 판"
          isOn={isUnlimitedMode}
          onToggle={handleToggleUnlimitedMode}
        />
        <HistoryList history={history} isBeginnerMode={isBeginnerMode} />
      </section>

      {/*
        진행 중이던 판이 사라지는 조작(난이도·설정 둘·다시하기)을 눌렀을 때 뜨는 확인 창.
        네 조작 모두 훅 안에서 같은 길을 지나므로 여기에는 창 하나만 두면 된다.
        화면 어디에 적어도 위에 겹쳐 뜨지만, 다른 조각을 다 그린 뒤인 맨 아래에 두어
        "평소에는 없는 것"임을 코드 순서로도 보이게 했다.
      */}
      <ConfirmDialog
        isOpen={isConfirmingNewGame}
        attemptCount={attemptCount}
        onConfirm={handleConfirmNewGame}
        onCancel={handleCancelNewGame}
      />
    </main>
  );
}

export default App;
