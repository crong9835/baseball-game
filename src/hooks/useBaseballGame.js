/*
 * 숫자 야구의 진행 상태와 조작 함수를 한곳에 모은 커스텀 훅.
 * useBaseballGame (유즈 베이스볼 게임) — use=쓰다(훅이라는 표시), baseball=야구
 *
 * App.jsx가 화면 조립에만 집중할 수 있도록 "게임이 어떻게 돌아가는가"를 이 파일로 옮겼다.
 * 이름이 use로 시작해야 React가 훅으로 인식하고 규칙 검사를 해준다.
 *
 * 이 파일의 함수 이름은 대부분 handle~로 시작한다. handle(핸들)은 "처리한다"는 뜻이고,
 * 사용자가 무언가를 눌렀을 때 실행되는 함수라는 표시다.
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
import { readPuzzleFromLink, removePuzzleFromLink } from '../utils/puzzleLink.js';

/**
 * 앱을 처음 켤 때 어떤 판으로 시작할지 정한다.
 * createInitialGame (크리에이트 이니셜 게임) — create=만들다, initial=처음의
 *
 * 주소에 친구가 보낸 문제가 담겨 있으면 그 문제로, 아니면 평소대로 무작위 판으로 시작한다.
 *
 * 이 함수를 훅 안이 아니라 파일 맨 위에서 부르는 이유:
 * 주소는 앱을 켤 때 한 번만 읽으면 되는데, 훅 안에 두면 화면이 다시 그려질 때마다 실행된다.
 * 파일 맨 위의 줄은 파일을 읽어들일 때 딱 한 번만 실행된다.
 *
 * useEffect를 쓰지 않는 이유도 같다. useEffect는 "state가 바뀔 때마다 바깥 세상과 계속 맞추는"
 * 훅인데, 이건 시작할 때 한 번 읽고 끝나는 일이라 맞출 것이 없다.
 */
function createInitialGame() {
  const sharedPuzzle = readPuzzleFromLink();

  if (sharedPuzzle === null) {
    return {
      digitCount: DEFAULT_DIGIT_COUNT,
      isUnlimitedMode: false,
      isBeginnerMode: false,
      answer: createAnswer(DEFAULT_DIGIT_COUNT),
      isSharedPuzzle: false,
    };
  }

  /*
   * 문제를 읽었으면 곧바로 주소창에서 지운다.
   * 게임하는 내내 주소창에 정답의 흔적이 없어야 무심코 봤다가 힌트를 얻는 일이 없다.
   */
  removePuzzleFromLink();

  return {
    // 자릿수는 링크에 따로 담겨 있지 않다. 정답이 몇 자리인지가 곧 자릿수다.
    digitCount: sharedPuzzle.answer.length,
    isUnlimitedMode: sharedPuzzle.isUnlimitedMode,
    isBeginnerMode: sharedPuzzle.isBeginnerMode,
    answer: sharedPuzzle.answer,
    isSharedPuzzle: true,
  };
}

const INITIAL_GAME = createInitialGame();

export function useBaseballGame() {
  /*
   * 여기 세 개는 "이 판을 어떤 규칙으로 하는가"다.
   * 셋 다 바꾸는 순간 새 판이 시작된다. 예외는 없다.
   *
   * 판 중간에 규칙이 바뀌면 앞의 기록과 뒤의 기록이 서로 다른 조건으로 쌓인다.
   * 나중에 순위를 매기는 기능을 붙일 때, 힌트를 보며 절반을 풀고 중간에 끈 판이
   * "힌트 없이 6회"로 남으면 그건 기록이 아니라 구멍이다.
   */
  const [digitCount, setDigitCount] = useState(INITIAL_GAME.digitCount);
  const [isUnlimitedMode, setIsUnlimitedMode] = useState(INITIAL_GAME.isUnlimitedMode);
  const [isBeginnerMode, setIsBeginnerMode] = useState(INITIAL_GAME.isBeginnerMode);

  /*
   * 지금 푸는 것이 친구가 링크로 보낸 문제인가.
   *
   * 이 값은 계산해 낼 수가 없다. answer만 봐서는 그것이 무작위로 뽑힌 것인지
   * 친구가 골라준 것인지 구분할 방법이 없기 때문이다. 그래서 state로 둔다.
   *
   * 위의 규칙 셋과 같은 갈래다. 바뀌는 순간 새 판이 시작된다.
   */
  const [isSharedPuzzle, setIsSharedPuzzle] = useState(INITIAL_GAME.isSharedPuzzle);

  // 처음 정답은 위의 INITIAL_GAME이 이미 정해두었다(받은 문제면 그 정답, 아니면 무작위).
  // 그 값은 파일을 읽을 때 한 번만 만들어지므로 여기서 다시 만들 일이 없다.
  const [answer, setAnswer] = useState(INITIAL_GAME.answer);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [history, setHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.PLAYING);

  /*
   * 확인 창이 물어보는 중인 것을 담아 둔다. null이면 묻는 중이 아니다.
   * 모양은 { reason, settings } 두 칸이다.
   *
   * - settings: 확인을 누르면 startNewGame에 그대로 넘길 값
   * - reason: 무엇 때문에 뜬 창인지. 창에 적을 문구를 고르는 데 쓴다
   *
   * reason이 따로 필요한 이유는, 확인을 받기 전에는 state를 바꾸지 않아서
   * 체크박스가 눌리기 전 모습으로 되돌아가 있기 때문이다. settings만 보고
   * "초보 모드를 켜려는 중"인지 알아내려면 지금 값과 일일이 비교해야 한다.
   *
   * isConfirmOpen 같은 불린을 따로 두지 않은 이유:
   * 열려 있다는 사실은 여기에 값이 들어 있는지로 이미 알 수 있는데 둘로 나누면
   * "열려 있는데 무엇을 확인하려던 건지는 잃어버린" 어긋난 상태가 만들어질 수 있다.
   */
  const [pendingNewGame, setPendingNewGame] = useState(null);

  /*
   * 아래 값들은 state에서 바로 계산할 수 있으므로 state로 만들지 않는다.
   * state가 바뀌면 이 훅을 쓰는 컴포넌트가 다시 실행되면서 자동으로 다시 계산된다.
   *
   * 이름 읽는 법:
   * - attemptCount (어템프트 카운트) — attempt=시도, count=개수 → 몇 번 시도했는가
   * - isGuessFull (이즈 게스 풀) — guess=추측, full=가득 찬 → 자릿수를 다 채웠는가
   * - isGameOver (이즈 게임 오버) — game over=게임 끝 → 게임이 끝났는가
   *
   * is로 시작하는 이름은 답이 "예/아니오" 둘 중 하나라는 표시다.
   */
  const attemptCount = history.length;
  const isGuessFull = currentGuess.length === digitCount;
  const isGameOver = gameStatus !== GAME_STATUS.PLAYING;

  // 확인 창이 열렸는지도 pendingNewGame에서 바로 나오는 값이라 state로 만들지 않는다.
  const isConfirmingNewGame = pendingNewGame !== null;

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
   * handleDigitToggle (핸들 디짓 토글) — digit=숫자 한 자리, toggle=눌러서 켰다 껐다 하기
   *
   * 넣고 빼는 규칙 자체는 gameLogic의 toggleDigit이 갖고 있다.
   * 문제를 낼 때 정답을 고르는 화면도 똑같이 움직여야 하는데, 규칙을 두 군데 적어두면
   * 한쪽만 고쳤을 때 두 화면의 버튼이 다르게 동작한다.
   */
  function handleDigitToggle(digit) {
    setCurrentGuess(toggleDigit(currentGuess, digit));
  }

  // handleBackspace (핸들 백스페이스) — backspace=키보드의 한 글자 지우기 키
  function handleBackspace() {
    setCurrentGuess(currentGuess.slice(0, -1));
  }

  // handleSubmit (핸들 서브밋) — submit=제출하다. "확인" 버튼을 눌렀을 때 하는 일이다.
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
   * startNewGame (스타트 뉴 게임) — start=시작하다, new=새로운
   *
   * 설정을 바꾸는 세 가지와 "다시하기"가 하는 일이 정확히 같기 때문이다.
   * 넷으로 나눠 쓰면 나중에 초기화할 것이 하나 늘었을 때 한 군데를 빠뜨리기 쉽다.
   *
   * 값을 하나씩 나열하지 않고 객체 하나로 받는 이유:
   * startNewGame(3, false, true)라고 쓰면 두 번째 false가 무엇인지 알 수 없다.
   * 부르는 쪽에서 이름이 보여야 무엇이 바뀌는 조작인지 한눈에 읽힌다.
   *
   * setDigitCount는 즉시 반영되지 않으므로, 방금 정한 값을 createAnswer에 직접 넘긴다.
   * digitCount를 읽으면 아직 바뀌기 전 자릿수라 정답 길이가 어긋난다.
   *
   * nextSettings.sharedAnswer는 "친구가 골라준 정답"이다. 평소 판에서는 null이고,
   * 그때만 정답을 새로 뽑는다. 받은 문제도 이 함수를 거치게 한 이유는 앞과 같다.
   * 판을 까는 길이 둘이 되면 나중에 초기화할 것이 하나 늘었을 때 한쪽을 빠뜨린다.
   */
  function startNewGame(nextSettings) {
    // 받은 정답이 있으면 그것을 쓰고, 없을 때만 새로 뽑는다.
    let nextAnswer = nextSettings.sharedAnswer;
    if (nextAnswer === null) {
      nextAnswer = createAnswer(nextSettings.digitCount);
    }

    setDigitCount(nextSettings.digitCount);
    setIsUnlimitedMode(nextSettings.isUnlimitedMode);
    setIsBeginnerMode(nextSettings.isBeginnerMode);
    setAnswer(nextAnswer);
    setIsSharedPuzzle(nextSettings.sharedAnswer !== null);
    setCurrentGuess([]);
    setHistory([]);
    setGameStatus(GAME_STATUS.PLAYING);

    // 판이 새로 깔렸으면 물어볼 것도 없어졌다.
    // 확인 버튼 쪽에서 따로 닫지 않고 여기서 닫는 이유는, 판을 까는 길이 이 함수 하나뿐이라
    // 여기에 두면 어느 경로로 들어와도 창이 닫히는 것이 보장되기 때문이다.
    setPendingNewGame(null);
  }

  /*
   * 판을 날리는 조작(다시하기와 설정 셋)이 모두 이 함수를 거친다.
   * requestNewGame (리퀘스트 뉴 게임) — request=요청하다.
   * 위의 startNewGame이 "정말로 시작한다"면, 이쪽은 "시작하고 싶다고 말한다"는 뜻이다.
   * 잃을 기록이 있으면 바로 시작하지 않고 물어보기 때문에 이름을 다르게 지었다.
   *
   * 잃을 것이 있으면 곧바로 시작하지 않고 확인 창에 물어볼 것을 담아 둔다.
   *
   * 물어볼지 말지를 여기서 한 번만 판단하는 이유:
   * 네 조작이 각자 판단하면 나중에 조작이 하나 늘었을 때 한 군데를 빠뜨린다.
   */
  function requestNewGame(reason, nextSettings) {
    if (hasProgressToLose) {
      setPendingNewGame({ reason, settings: nextSettings });
      return;
    }

    startNewGame(nextSettings);
  }

  /*
   * 설정은 그대로 두고 정답만 새로 뽑는다.
   * handleRestart (핸들 리스타트) — re=다시, start=시작하다
   *
   * 받은 문제를 푸는 중에도 이 함수를 그대로 쓴다. 하는 일이 정확히 같기 때문이다.
   * 정답을 새로 뽑으면(sharedAnswer가 null이므로) 그 순간 받은 문제에서 벗어나 평소 판이 된다.
   * 같은 정답으로 다시 시작하는 선택지는 두지 않았다. 답을 이미 알거나 봤을 텐데
   * 같은 문제를 다시 까는 것은 기록만 날리는 일이기 때문이다.
   *
   * 다른 것은 확인 창에 물어볼 말뿐이라, 그것만 골라서 넘긴다.
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
      sharedAnswer: null,
    });
  }

  /*
   * 아래 셋은 규칙을 하나씩만 바꿔서 새 판을 시작한다.
   * handleChangeDigitCount (핸들 체인지 디짓 카운트) — change=바꾸다, count=개수
   * handleToggleUnlimitedMode (핸들 토글 언리미티드 모드) — unlimited=무제한의, mode=모드
   * handleToggleBeginnerMode (핸들 토글 비기너 모드) — beginner=초보자
   *
   * 나머지 둘을 그대로 넘기는 것이 눈에 보이므로 무엇이 바뀌는지 헷갈리지 않는다.
   *
   * 이미 고른 자릿수를 다시 누른 것은 아무것도 바꾸지 않는 조작이다.
   * 그냥 두면 "기록이 사라집니다"를 묻는 창이 뜨고, 그 말을 "3자리로 하겠다"는 뜻으로
   * 읽은 사람이 확인을 누르면 바뀐 것도 없이 판만 날아간다.
   *
   * 셋 다 맨 위에서 isSharedPuzzle을 확인하고 그냥 돌아간다.
   * 친구가 정한 조건은 그 문제의 일부라서 푸는 사람이 바꾸면 안 되기 때문이다.
   * 화면에서도 버튼과 체크박스를 못 누르게 막지만, 규칙을 지키는 책임은 이 훅에 있다.
   * 화면 쪽 조건이 하나 빠지더라도 받은 문제가 도중에 뒤바뀌지 않아야 한다.
   */
  function handleChangeDigitCount(nextDigitCount) {
    if (isSharedPuzzle) {
      return;
    }

    if (nextDigitCount === digitCount) {
      return;
    }

    requestNewGame(NEW_GAME_REASON.DIGIT_COUNT, {
      digitCount: nextDigitCount,
      isUnlimitedMode,
      isBeginnerMode,
      sharedAnswer: null,
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
      sharedAnswer: null,
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
      sharedAnswer: null,
    });
  }

  // 담아둔 설정을 그대로 넘긴다. 무엇을 확인했는지가 그 객체에 다 들어 있다.
  // handleConfirmNewGame (핸들 컨펌 뉴 게임) — confirm=확인하다, 승낙하다
  function handleConfirmNewGame() {
    startNewGame(pendingNewGame.settings);
  }

  /*
   * 취소는 담아둔 것을 버리기만 하면 끝이다.
   * handleCancelNewGame (핸들 캔슬 뉴 게임) — cancel=취소하다
   *
   * 체크박스와 난이도 버튼이 state를 그대로 비추는 제어 컴포넌트라,
   * state를 안 바꿨으니 화면도 저절로 원래대로다. 되돌리는 코드가 따로 필요 없다.
   */
  function handleCancelNewGame() {
    setPendingNewGame(null);
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
  };
}
