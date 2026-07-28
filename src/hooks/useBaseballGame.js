/*
 * 숫자 야구의 진행 상태와 조작 함수를 한곳에 모은 커스텀 훅.
 * useBaseballGame (유즈 베이스볼 게임) — use=쓰다(훅이라는 표시), baseball=야구
 *
 * App.jsx는 여기서 받은 값을 화면 조각에 배분하기만 한다.
 */

import { useState } from 'react';

import { DEFAULT_DIGIT_COUNT, GAME_STATUS, NEW_GAME_REASON } from '../constants/gameConstants.js';
import {
  createAnswer,
  toggleDigit,
  scoreGuess,
  judgeEachDigit,
  collectDigitHints,
  findDuplicateAttemptNumber,
  decideNextStatus,
} from '../utils/gameLogic.js';
import { readPuzzleFromLink, hasPuzzleInLink, removePuzzleFromLink } from '../utils/puzzleLink.js';

/**
 * 앱을 처음 켤 때 어떤 판으로 시작할지 정한다. 주소에 친구 문제가 있으면 그 문제로 시작한다.
 * createInitialGame (크리에이트 이니셜 게임) — create=만들다, initial=처음의
 *
 * 훅 안이 아니라 파일 맨 위에서 부른다. 주소는 앱을 켤 때 한 번만 읽으면 되는데
 * 훅 안에 두면 화면이 다시 그려질 때마다 실행된다.
 */
function createInitialGame() {
  const sharedPuzzle = readPuzzleFromLink();

  if (sharedPuzzle === null) {
    /*
     * 주소에 #play=가 있었는데도 못 읽었다면 링크가 망가진 것이다.
     * 아무 말 없이 무작위 판을 시작하면 친구 문제를 푸는 줄 알고 다른 문제를 풀게 되므로,
     * 화면에 알려주려고 여기서 갈라 둔다.
     *
     * 못 쓰는 주소는 지운다. 남겨둬도 다시 읽을 수 없어서 새로고침할 때마다 같은 안내만 뜬다.
     */
    const isBrokenPuzzleLink = hasPuzzleInLink();
    if (isBrokenPuzzleLink) {
      removePuzzleFromLink();
    }

    return {
      digitCount: DEFAULT_DIGIT_COUNT,
      isUnlimitedMode: false,
      isBeginnerMode: false,
      answer: createAnswer(DEFAULT_DIGIT_COUNT),
      isSharedPuzzle: false,
      isBrokenPuzzleLink,
    };
  }

  /*
   * 읽었다고 주소창에서 지우지 않는다. 한때 여기서 곧바로 지웠는데, 그러면 정답이 화면
   * 메모리에만 남아서 새로고침 한 번에 친구 문제가 통째로 사라진다. 되돌리지 마라.
   * 지우는 일은 그 문제에서 나갈 때 startNewGame이 한다.
   */

  return {
    // 자릿수는 링크에 따로 담겨 있지 않다. 정답이 몇 자리인지가 곧 자릿수다.
    digitCount: sharedPuzzle.answer.length,
    isUnlimitedMode: sharedPuzzle.isUnlimitedMode,
    isBeginnerMode: sharedPuzzle.isBeginnerMode,
    answer: sharedPuzzle.answer,
    isSharedPuzzle: true,
    isBrokenPuzzleLink: false,
  };
}

const INITIAL_GAME = createInitialGame();

export function useBaseballGame() {
  // 게임 규칙. 셋 다 바꾸는 순간 새 판이 시작된다. 예외는 없다.
  const [digitCount, setDigitCount] = useState(INITIAL_GAME.digitCount);
  const [isUnlimitedMode, setIsUnlimitedMode] = useState(INITIAL_GAME.isUnlimitedMode);
  const [isBeginnerMode, setIsBeginnerMode] = useState(INITIAL_GAME.isBeginnerMode);

  // 지금 푸는 것이 친구가 링크로 보낸 문제인가.
  // answer만 봐서는 무작위로 뽑힌 것인지 친구가 골라준 것인지 알 수 없어서 state다.
  const [isSharedPuzzle, setIsSharedPuzzle] = useState(INITIAL_GAME.isSharedPuzzle);

  // 받은 링크가 망가져 있었는가. 화면에 그렇다고 알려주는 데만 쓴다.
  // 주소는 이미 지웠으므로 이것도 계산해 낼 수 없다.
  const [isBrokenPuzzleLink, setIsBrokenPuzzleLink] = useState(INITIAL_GAME.isBrokenPuzzleLink);

  // 게임 진행. 처음 정답은 위의 INITIAL_GAME이 이미 정해두었다.
  const [answer, setAnswer] = useState(INITIAL_GAME.answer);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [history, setHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING);

  // 확인 창이 물어보는 중인 것. null이면 묻는 중이 아니고, 모양은 { reason, settings }다.
  const [pendingNewGame, setPendingNewGame] = useState(null);

  /*
   * 아래 값들은 state에서 바로 계산되므로 state로 만들지 않는다.
   *
   * attemptCount (어템프트 카운트) — attempt=시도, count=개수 → 몇 번 시도했는가
   * isGuessFull (이즈 게스 풀) — guess=추측, full=가득 찬 → 자릿수를 다 채웠는가
   * isGameOver (이즈 게임 오버) — game over=게임 끝 → 게임이 끝났는가
   */
  const attemptCount = history.length;
  const isGuessFull = currentGuess.length === digitCount;
  const isGameOver = gameStatus !== GAME_STATUS.PLAYING;
  const isConfirmingNewGame = pendingNewGame !== null;

  // 아직 한 번도 안 냈거나 이미 끝난 판은 새로 시작해도 잃을 것이 없다.
  const hasProgressToLose = attemptCount > 0 && !isGameOver;

  const digitHints = collectDigitHints(history);

  // 자릿수를 다 채우기 전에는 예전 조합과 길이가 달라 절대 같아지지 않으므로,
  // "입력이 다 찼는지"를 따로 확인하지 않아도 된다.
  const duplicateAttemptNumber = findDuplicateAttemptNumber(history, currentGuess);
  const isDuplicateGuess = duplicateAttemptNumber !== null;

  /**
   * 같은 숫자를 한 번 더 누르면 넣지 않고 뺀다.
   * handleDigitToggle (핸들 디짓 토글) — digit=숫자 한 자리, toggle=눌러서 켰다 껐다 하기
   */
  function handleDigitToggle(digit) {
    setCurrentGuess(toggleDigit(currentGuess, digit));
  }

  // handleBackspace (핸들 백스페이스) — backspace=키보드의 한 글자 지우기 키
  function handleBackspace() {
    setCurrentGuess(currentGuess.slice(0, -1));
  }

  // 낸 답을 채점해 기록에 쌓는다.
  // handleSubmit (핸들 서브밋) — submit=제출하다
  function handleSubmit() {
    // 확인 버튼도 막아두지만, 화면 쪽 조건이 하나 빠져도 규칙이 깨지지 않아야 한다.
    if (isDuplicateGuess) {
      return;
    }

    const score = scoreGuess(answer, currentGuess);

    // 자리별 판정을 기록에 같이 담아둔다.
    // 정답은 새 판에서 바뀌므로, 나중에 다시 계산하면 옛 기록이 엉뚱하게 칠해진다.
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

    // history.length는 아직 갱신 전 값이므로 방금 만든 회차를 직접 넘긴다.
    // 그러지 않으면 마지막 시도에서 게임이 끝나지 않는다.
    setGameStatus(
      decideNextStatus(score.strike, newRecord.attemptNumber, digitCount, isUnlimitedMode),
    );
  }

  /**
   * 판을 새로 깐다. 정답은 늘 새로 뽑는다.
   * startNewGame (스타트 뉴 게임) — start=시작하다, new=새로운
   *
   * 설정을 바꾸는 세 가지와 '다시하기'가 하는 일이 정확히 같아서 한곳에 모았다.
   *
   * 한때 sharedAnswer 인자를 받아 "받은 정답이 있으면 그것을 쓴다"고 해두었는데,
   * 부르는 네 곳이 전부 null을 넘겨서 한 번도 쓰이지 않는 갈래였다. 그래서 지웠다.
   * 친구가 낸 문제는 앱을 켤 때 createInitialGame이 딱 한 번 깐다.
   */
  function startNewGame(nextSettings) {
    // 받은 문제에서 나가는 길은 이 함수뿐이다. 안 지우면 나간 뒤에 새로고침했을 때
    // 친구 문제로 다시 끌려 들어간다.
    if (isSharedPuzzle) {
      removePuzzleFromLink();
    }

    setDigitCount(nextSettings.digitCount);
    setIsUnlimitedMode(nextSettings.isUnlimitedMode);
    setIsBeginnerMode(nextSettings.isBeginnerMode);

    // digitCount를 읽으면 아직 바뀌기 전 값이라 정답 길이가 어긋난다.
    setAnswer(createAnswer(nextSettings.digitCount));

    setIsSharedPuzzle(false);
    setCurrentGuess([]);
    setHistory([]);
    setGameStatus(GAME_STATUS.PLAYING);

    // 새 판을 깔았는데 "링크가 망가졌습니다"가 남아 있으면 이 판에 문제가 있는 것으로 읽힌다.
    setIsBrokenPuzzleLink(false);

    // 확인 버튼 쪽에서 닫지 않고 여기서 닫는다. 판을 까는 길이 이 함수 하나뿐이라
    // 어느 경로로 들어와도 창이 닫히는 것이 보장된다.
    setPendingNewGame(null);
  }

  /**
   * 새 판을 시작하고 싶다고 말한다. 잃을 것이 있으면 곧바로 시작하지 않고 확인 창에 담아둔다.
   * requestNewGame (리퀘스트 뉴 게임) — request=요청하다
   *
   * 판을 날리는 네 조작이 모두 이 함수를 거친다. 각자 판단하게 두면 나중에 조작이
   * 하나 늘었을 때 한 군데를 빠뜨린다.
   *
   * 받은 문제를 그만두는 것만은 기록이 하나도 없어도 물어본다.
   * 잃는 것이 기록이 아니라 문제 자체이고, 한 번 나가면 친구에게 다시 받는 수밖에 없다.
   */
  function requestNewGame(reason, nextSettings) {
    const isLeavingSharedPuzzle = reason === NEW_GAME_REASON.LEAVE_SHARED_PUZZLE;
    const hasSomethingToLose = hasProgressToLose || isLeavingSharedPuzzle;

    if (hasSomethingToLose) {
      setPendingNewGame({ reason, settings: nextSettings });
      return;
    }

    startNewGame(nextSettings);
  }

  /**
   * 설정은 그대로 두고 정답만 새로 뽑는다.
   * handleRestart (핸들 리스타트) — re=다시, start=시작하다
   *
   * 받은 문제를 푸는 중에도 이 함수를 그대로 쓴다. 하는 일이 정확히 같고
   * 확인 창에 물어볼 말만 다르다.
   */
  function handleRestart() {
    let reason = NEW_GAME_REASON.RESTART;
    if (isSharedPuzzle) {
      reason = NEW_GAME_REASON.LEAVE_SHARED_PUZZLE;
    }

    requestNewGame(reason, {
      digitCount,
      isUnlimitedMode,
      isBeginnerMode,
    });
  }

  /*
   * 아래 셋은 규칙을 하나씩만 바꿔서 새 판을 시작한다.
   * handleChangeDigitCount (핸들 체인지 디짓 카운트) — change=바꾸다, count=개수
   * handleToggleUnlimitedMode (핸들 토글 언리미티드 모드) — unlimited=무제한의, mode=모드
   * handleToggleBeginnerMode (핸들 토글 비기너 모드) — beginner=초보자
   *
   * 셋 다 맨 위에서 isSharedPuzzle을 확인하고 그냥 돌아간다. 화면에서도 못 누르게 막지만,
   * 화면 쪽 조건이 하나 빠지더라도 받은 문제가 도중에 뒤바뀌지 않아야 한다.
   */
  function handleChangeDigitCount(nextDigitCount) {
    if (isSharedPuzzle) {
      return;
    }

    // 이미 고른 자릿수를 다시 누른 것은 아무것도 바꾸지 않는 조작이다.
    // 그냥 두면 "기록이 사라집니다"를 묻는 창이 뜨고, 그 말을 "3자리로 하겠다"는 뜻으로
    // 읽은 사람이 확인을 누르면 바뀐 것도 없이 판만 날아간다.
    if (nextDigitCount === digitCount) {
      return;
    }

    requestNewGame(NEW_GAME_REASON.DIGIT_COUNT, {
      digitCount: nextDigitCount,
      isUnlimitedMode,
      isBeginnerMode,
    });
  }

  function handleToggleUnlimitedMode() {
    if (isSharedPuzzle) {
      return;
    }

    requestNewGame(NEW_GAME_REASON.UNLIMITED_MODE, {
      digitCount,
      isUnlimitedMode: !isUnlimitedMode,
      isBeginnerMode,
    });
  }

  function handleToggleBeginnerMode() {
    if (isSharedPuzzle) {
      return;
    }

    requestNewGame(NEW_GAME_REASON.BEGINNER_MODE, {
      digitCount,
      isUnlimitedMode,
      isBeginnerMode: !isBeginnerMode,
    });
  }

  // 담아둔 설정을 그대로 넘긴다. 무엇을 확인했는지가 그 객체에 다 들어 있다.
  // handleConfirmNewGame (핸들 컨펌 뉴 게임) — confirm=확인하다, 승낙하다
  function handleConfirmNewGame() {
    startNewGame(pendingNewGame.settings);
  }

  /**
   * 담아둔 것을 버린다. 원상복구 코드가 없어도 되는 이유는 체크박스와 난이도 버튼이
   * state를 그대로 비추는 제어 컴포넌트라, state를 안 바꿨으니 화면도 저절로 그대로이기 때문이다.
   * handleCancelNewGame (핸들 캔슬 뉴 게임) — cancel=취소하다
   */
  function handleCancelNewGame() {
    setPendingNewGame(null);
  }

  // setCurrentGuess 같은 setter는 일부러 내보내지 않는다.
  // 바깥에서 state를 마음대로 바꿀 수 있으면 이 훅이 게임 규칙을 보장할 수 없다.
  return {
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
  };
}
