/*
 * 게임 규칙에 등장하는 숫자(설정값)들만 모아둔 파일. 함수는 하나도 없다.
 * 실제 계산은 짝꿍 파일인 utils/gameLogic.js가 담당한다.
 * 로직(utils)과 화면(components) 양쪽에서 같은 값을 봐야 하므로 따로 뺐다.
 */

/*
 * 고를 수 있는 난이도(정답의 자릿수) 목록.
 * 난이도 버튼도 이 배열을 그대로 돌려서 그리므로, 6자리를 더하고 싶으면
 * 여기에 6만 적으면 버튼까지 같이 생긴다.
 */
export const DIGIT_COUNT_OPTIONS = [3, 4, 5];

// 게임을 처음 켰을 때의 자릿수.
export const DEFAULT_DIGIT_COUNT = 3;

/*
 * 최대 시도 횟수.
 * 자릿수가 늘어도 10회 그대로다. 자릿수가 많아지면 한 번의 판정에서 얻는 정보도
 * 함께 많아지기 때문에, 횟수를 늘리지 않아도 5자리가 3자리보다 크게 어렵지는 않다.
 */
export const MAX_ATTEMPTS = 10;

// 정답에 쓸 수 있는 숫자의 범위 (0 ~ 9)
export const MIN_DIGIT = 0;
export const MAX_DIGIT = 9;

/*
 * 지금 보여줄 화면. 앱을 켜면 START다.
 *
 * 친구가 링크로 보낸 문제도 START를 먼저 거친다. 링크를 눌러 들어온 사람이야말로
 * 이 게임을 처음 보는 사람이라, 규칙을 읽을 기회 없이 판이 시작되면 안 된다.
 */
export const SCREEN = {
  START: 'start',
  HELP: 'help',
  GAME: 'game',
};

// 게임이 가질 수 있는 상태.
export const GAME_STATUS = {
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
};

// 새 판을 시작하려는 이유. 확인 창이 "무엇을 확인하는지" 적으려고 쓴다.
export const NEW_GAME_REASON = {
  RESTART: 'restart',
  DIGIT_COUNT: 'digitCount',
  UNLIMITED_MODE: 'unlimitedMode',
  BEGINNER_MODE: 'beginnerMode',

  /*
   * 친구가 낸 문제를 그만두는 경우.
   * 하는 일은 RESTART와 똑같이 "정답을 새로 뽑아 새 판"이지만 물어볼 말이 다르다.
   * 받은 문제에서 "새 판을 시작할까요?"라고 물으면 같은 문제를 다시 푸는 줄로 읽힌다.
   */
  LEAVE_SHARED_PUZZLE: 'leaveSharedPuzzle',
};

/*
 * 입력한 숫자 한 개가 받을 수 있는 판정.
 * 정답에도 입력에도 중복이 없으므로 한 자리는 항상 이 셋 중 정확히 하나다.
 */
export const DIGIT_RESULT = {
  STRIKE: 'strike',
  BALL: 'ball',
  OUT: 'out',
};
