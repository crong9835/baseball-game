/*
 * 숫자 야구 게임의 최상위 컴포넌트.
 * App (앱) — application의 줄임말. 화면 전체를 감싸는 가장 바깥 조각이라는 뜻이다.
 *
 * 게임이 어떻게 돌아가는지는 useBaseballGame 훅이 담당하고,
 * 이 파일은 화면 조각을 어떤 순서로 놓고 무엇을 내려줄지만 결정한다.
 */

import { MAX_ATTEMPTS } from './constants/gameConstants.js';
import { useBaseballGame } from './hooks/useBaseballGame.js';
import { usePuzzleComposer } from './hooks/usePuzzleComposer.js';
import DifficultySelector from './components/DifficultySelector.jsx';
import GuessInput from './components/GuessInput.jsx';
import NumberPad from './components/NumberPad.jsx';
import ResultBanner from './components/ResultBanner.jsx';
import SettingToggle from './components/SettingToggle.jsx';
import HistoryList from './components/HistoryList.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import PuzzleComposer from './components/PuzzleComposer.jsx';
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
    isSharedPuzzle,
    attemptCount,
    isGuessFull,
    isGameOver,
    isConfirmingNewGame,
    pendingNewGame,
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

  /*
   * 출제 화면의 값들은 통째로 composer라는 이름 하나에 담아서 받는다.
   *
   * 위처럼 하나씩 풀어서 받지 않은 이유:
   * 두 훅에 digitCount, handleChangeDigitCount처럼 이름이 똑같은 것이 여럿 있다.
   * 둘 다 풀어서 받으면 이름이 부딪혀서 한쪽을 억지로 바꿔야 하고,
   * 코드를 읽을 때도 이 digitCount가 내 판의 것인지 친구에게 낼 문제의 것인지 알 수 없다.
   * composer.digitCount라고 쓰면 어느 쪽인지가 이름에 그대로 보인다.
   */
  const composer = usePuzzleComposer();

  /*
   * 출제 화면이 열려 있으면 게임 화면 대신 그것만 그린다.
   *
   * 아래 게임 화면을 감싸서 조건을 붙이지 않고 여기서 바로 돌려주는 이유:
   * 두 화면은 겹쳐 보이는 것이 아니라 통째로 갈아 끼워지는 것이라, 코드에서도
   * "여기서 갈라진다"가 한눈에 보이는 편이 읽기 쉽다.
   *
   * 게임의 state는 하나도 건드리지 않으므로, 문제를 만들고 닫으면
   * 진행 중이던 판이 그대로 남아 있다.
   */
  if (composer.isComposing) {
    return (
      <PuzzleComposer
        digitCount={composer.digitCount}
        isUnlimitedMode={composer.isUnlimitedMode}
        isBeginnerMode={composer.isBeginnerMode}
        pickedAnswer={composer.pickedAnswer}
        isPickedAnswerFull={composer.isPickedAnswerFull}
        puzzleLink={composer.puzzleLink}
        isLinkCopied={composer.isLinkCopied}
        onClose={composer.handleClose}
        onDigitToggle={composer.handleDigitToggle}
        onBackspace={composer.handleBackspace}
        onChangeDigitCount={composer.handleChangeDigitCount}
        onToggleUnlimitedMode={composer.handleToggleUnlimitedMode}
        onToggleBeginnerMode={composer.handleToggleBeginnerMode}
        onCopyLink={composer.handleCopyLink}
      />
    );
  }

  // 무제한 모드에서는 분모가 없으므로 "7회"라고만 적는다.
  // 중첩 삼항연산자 대신 기본값을 먼저 정하고 조건에 맞으면 덮어쓴다.
  let attemptText = `${attemptCount} / ${MAX_ATTEMPTS}`;
  if (isUnlimitedMode) {
    attemptText = `${attemptCount}회`;
  }

  /*
   * 받은 문제에서는 이 버튼이 "그 문제를 그만두고 평소 게임으로 나가는" 일을 한다.
   * 하는 일이 달라졌으니 글자도 달라야 한다. "다시하기"라고 적혀 있으면
   * 같은 문제를 처음부터 다시 푸는 줄 알고 누르게 된다.
   *
   * 부르는 함수는 그대로 handleRestart 하나다. 훅 안에서 알아서 갈라진다.
   * 위의 attemptText와 같은 방식으로, 기본값을 먼저 정하고 조건에 맞으면 덮어쓴다.
   */
  let restartLabel = '다시하기';
  if (isSharedPuzzle) {
    restartLabel = '평소 게임으로';
  }

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>숫자 야구</h1>
        <p className={styles.attemptCount}>{attemptText}</p>
      </header>

      {/*
        친구가 링크로 보낸 문제를 푸는 중일 때만 나타나는 안내.

        &&는 왼쪽이 참일 때만 오른쪽을 그린다는 뜻이다. 거짓이면 아무것도 그리지 않는다.
        (NumberPad의 중복 안내 문구와 같은 방식이다)

        설정 버튼들이 왜 안 눌리는지를 여기서 말해줘야 한다.
        이유 없이 회색으로 잠겨 있으면 고장 난 화면으로 보인다.
      */}
      {isSharedPuzzle && (
        <p className={styles.sharedPuzzleNotice}>
          친구가 낸 문제입니다 · 조건은 낸 사람이 정했습니다
        </p>
      )}

      {/*
        난이도는 판을 시작하기 전에 고르는 것이라 맨 위에 둔다.
        누르면 새 판이 시작된다(정답·기록·입력이 모두 초기화된다).
        단, 잃을 기록이 있으면 곧바로 시작하지 않고 아래 ConfirmDialog가 먼저 물어본다.
      */}
      <DifficultySelector
        digitCount={digitCount}
        isLocked={isSharedPuzzle}
        onSelect={handleChangeDigitCount}
      />

      <GuessInput currentGuess={currentGuess} digitCount={digitCount} />

      <NumberPad
        currentGuess={currentGuess}
        digitHints={digitHints}
        duplicateAttemptNumber={duplicateAttemptNumber}
        isDuplicateGuess={isDuplicateGuess}
        isBeginnerMode={isBeginnerMode}
        isGuessFull={isGuessFull}
        isGameOver={isGameOver}
        submitLabel="확인"
        onDigitToggle={handleDigitToggle}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
      />

      {/*
        다시하기는 숫자 입력과 상관없는 조작이라 NumberPad에 넣지 않고 여기에 둔다.
        게임이 끝나기 전에도 언제든 새 판을 시작할 수 있어야 하므로 항상 보여준다.
      */}
      {/*
        둘 다 "숫자를 맞히는 일" 바깥의 조작이라 한 덩어리로 묶어둔다.
        문제 내기는 지금 판을 건드리지 않는다. 만들고 닫으면 판이 그대로 남아 있다.
      */}
      <div className={styles.actionRow}>
        <button type="button" className={styles.restartButton} onClick={handleRestart}>
          {restartLabel}
        </button>
        <button type="button" className={styles.composeButton} onClick={composer.handleOpen}>
          친구에게 문제 내기
        </button>
      </div>

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
          isLocked={isSharedPuzzle}
          onToggle={handleToggleBeginnerMode}
        />
        <SettingToggle
          label="무제한 기회"
          description="맞힐 때까지 시도 · 바꾸면 새 판"
          isOn={isUnlimitedMode}
          isLocked={isSharedPuzzle}
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
        pendingNewGame={pendingNewGame}
        attemptCount={attemptCount}
        onConfirm={handleConfirmNewGame}
        onCancel={handleCancelNewGame}
      />
    </main>
  );
}

export default App;
