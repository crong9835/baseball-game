/*
 * 숫자 야구 게임의 최상위 컴포넌트.
 * App (앱) — application의 줄임말. 화면 전체를 감싸는 가장 바깥 조각이다.
 *
 * 게임이 어떻게 돌아가는지는 훅이 담당하고, 이 파일은 화면 조각을 어떤 순서로 놓고
 * 무엇을 내려줄지만 결정한다.
 */

import { MAX_ATTEMPTS, SCREEN } from './constants/gameConstants.js';
import { useBaseballGame } from './hooks/useBaseballGame.js';
import { usePuzzleComposer } from './hooks/usePuzzleComposer.js';
import { useScreen } from './hooks/useScreen.js';
import DifficultySelector from './components/DifficultySelector.jsx';
import GuessInput from './components/GuessInput.jsx';
import NumberPad from './components/NumberPad.jsx';
import ResultBanner from './components/ResultBanner.jsx';
import SettingToggle from './components/SettingToggle.jsx';
import HistoryList from './components/HistoryList.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import PuzzleComposer from './components/PuzzleComposer.jsx';
import StartScreen from './components/StartScreen.jsx';
import HelpScreen from './components/HelpScreen.jsx';
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
    isBrokenPuzzleLink,
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
   * 출제 화면의 값들은 통째로 composer 하나에 담아서 받는다.
   *
   * 두 훅에 digitCount, handleChangeDigitCount처럼 이름이 똑같은 것이 여럿 있어서
   * 둘 다 풀어서 받으면 이름이 부딪힌다. composer.digitCount라고 쓰면 그 값이
   * 내 판의 것인지 친구에게 낼 문제의 것인지가 이름에 그대로 보인다.
   */
  const composer = usePuzzleComposer();

  // 지금 어느 화면을 보여줄지만 갖고 있는 훅. 게임 진행과는 상관없다.
  const { screen, handleStart, handleOpenHelp, handleCloseHelp, handleGoToStart } = useScreen();

  /*
   * 시작 화면과 설명 화면을 게임보다 먼저 갈라놓는다.
   *
   * 훅 셋은 이 위에서 전부 불러둔다. 조기 return 아래에 훅을 두면 어떤 때는 불리고
   * 어떤 때는 안 불려서 React가 값을 잃어버린다.
   *
   * 친구 링크로 들어온 사람도 시작 화면을 거친다. 링크를 누른 사람이야말로 이 게임을
   * 처음 보는 사람이라, 규칙을 읽을 기회 없이 판이 시작되면 안 된다. 정답은 앱을 켤 때
   * 이미 뽑혀 있으므로(useBaseballGame의 createInitialGame) 늦게 시작해도 문제가 없다.
   */
  if (screen === SCREEN.START) {
    return (
      <StartScreen
        isSharedPuzzle={isSharedPuzzle}
        hasPreviousGame={attemptCount > 0}
        isBrokenPuzzleLink={isBrokenPuzzleLink}
        onStart={handleStart}
        onOpenHelp={handleOpenHelp}
      />
    );
  }

  if (screen === SCREEN.HELP) {
    return <HelpScreen onClose={handleCloseHelp} />;
  }

  /*
   * 출제 화면이 열려 있으면 게임 화면 대신 그것만 그린다.
   * 두 화면은 겹쳐 보이는 것이 아니라 통째로 갈아 끼워지는 것이라, 코드에서도
   * "여기서 갈라진다"가 한눈에 보이는 편이 읽기 쉽다.
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
        isCopyFailed={composer.isCopyFailed}
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
  let attemptText = `${attemptCount} / ${MAX_ATTEMPTS}`;
  if (isUnlimitedMode) {
    attemptText = `${attemptCount}회`;
  }

  /*
   * 받은 문제에서는 이 버튼이 "그 문제를 그만두고 정답을 새로 뽑는" 일을 한다.
   * "다시하기"라고 적혀 있으면 같은 문제를 처음부터 다시 푸는 줄 알고 누르게 된다.
   *
   * "기존 게임으로"나 "평소 게임으로"처럼 돌아간다는 말을 쓰지 마라. 돌아갈 판이 없다.
   * 버튼과 확인 창의 질문·답이 전부 '그만둔다'는 같은 말로 이어져야 한다.
   */
  let restartLabel = '다시하기';
  if (isSharedPuzzle) {
    restartLabel = '그만두고 새 게임';
  }

  return (
    <main className={styles.app}>
      {/*
        제목을 누르면 시작 화면으로 나간다. 오락기에서 타이틀 화면으로 돌아가는 것과 같다.
        하던 판은 그대로 남으므로 물어보지 않는다(useScreen의 handleGoToStart 설명을 보라).

        h1 안에 button을 넣었다. 제목이라는 것과 눌린다는 것이 둘 다 필요해서다.
        h1을 없애고 button만 두면 화면을 읽어주는 프로그램에게 이 화면의 제목이 사라진다.
      */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          <button type="button" className={styles.titleButton} onClick={handleGoToStart}>
            숫자 야구
          </button>
        </h1>
        <p className={styles.attemptCount}>{attemptText}</p>
      </header>

      {/*
        설정 버튼들이 왜 안 눌리는지를 여기서 말해줘야 한다.
        이유 없이 회색으로 잠겨 있으면 고장 난 화면으로 보인다.
      */}
      {isSharedPuzzle && (
        <p className={styles.sharedPuzzleNotice}>
          친구가 낸 문제입니다 · 조건은 낸 사람이 정했습니다
        </p>
      )}

      {/*
        링크는 왔는데 글자가 망가져 있던 경우.
        이 말을 안 해주면 친구 문제인 줄 알고 엉뚱한 무작위 판을 풀게 된다.
        무엇을 하면 되는지(링크를 다시 받기)까지 적어야 막다른 길이 아니다.

        위의 안내와 자리를 나눠 쓰지 않는다. 링크를 제대로 읽었으면 망가진 것이 아니므로
        둘은 애초에 같이 뜰 수 없다.
      */}
      {isBrokenPuzzleLink && (
        <p className={styles.brokenLinkNotice}>
          링크가 망가져 있어 평소 게임으로 시작했습니다 · 친구에게 링크를 다시 받으세요
        </p>
      )}

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
        둘 다 "숫자를 맞히는 일" 바깥의 조작이라 NumberPad에 넣지 않고 한 덩어리로 묶어둔다.
        다시하기는 게임이 끝나기 전에도 언제든 눌러야 하므로 항상 보여준다.
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
        체크박스와 기록 목록을 한 덩어리로 묶는다. 초보 모드 체크박스가 바꾸는 대상이
        바로 아래 목록이라는 것을 간격으로 보여주기 위해서다.

        둘 다 "바꾸면 새 게임"을 적어둔다. 눌렀을 때 하던 판이 사라지는데
        그것이 글자에 안 적혀 있으면 눌러보고 나서야 알게 된다.

        '판'이 아니라 '게임'이라고 적는다. 확인 창과 '그만두고 새 게임' 버튼도 같은 말을 쓴다.
        한 화면에서 같은 것을 두 이름으로 부르면 서로 다른 것인 줄 알고 읽는다.
      */}
      <section className={styles.historySection}>
        <SettingToggle
          label="초보 모드"
          description="알아낸 숫자를 버튼에 색으로 · 바꾸면 새 게임"
          isOn={isBeginnerMode}
          isLocked={isSharedPuzzle}
          onToggle={handleToggleBeginnerMode}
        />
        <SettingToggle
          label="무제한 기회"
          description="맞힐 때까지 시도 · 바꾸면 새 게임"
          isOn={isUnlimitedMode}
          isLocked={isSharedPuzzle}
          onToggle={handleToggleUnlimitedMode}
        />
        <HistoryList history={history} isBeginnerMode={isBeginnerMode} />
      </section>

      {/*
        판이 사라지는 네 조작이 훅 안에서 같은 길을 지나므로 여기에는 창 하나만 두면 된다.
        화면 어디에 적어도 위에 겹쳐 뜨지만, 맨 아래에 두어 "평소에는 없는 것"임을
        코드 순서로도 보이게 했다.
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
