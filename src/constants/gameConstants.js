/*
 * 게임 규칙에 등장하는 숫자(설정값)들만 모아둔 파일. 함수는 하나도 없다.
 * 실제 계산은 짝꿍 파일인 utils/gameLogic.js가 담당한다.
 * 로직(utils)과 화면(components) 양쪽에서 같은 값을 봐야 하므로 따로 뺐다.
 * 나중에 "3자리를 4자리로" 같은 변경이 이 파일 한 줄 수정으로 끝나게 하려는 목적이다.
 */

// 정답의 자릿수
export const DIGIT_COUNT = 3;

// 최대 시도 횟수. 이 횟수를 다 쓰면 정답을 공개하고 게임이 끝난다.
export const MAX_ATTEMPTS = 10;

// 정답에 쓸 수 있는 숫자의 범위 (0 ~ 9)
export const MIN_DIGIT = 0;
export const MAX_DIGIT = 9;

/*
 * 게임이 가질 수 있는 상태.
 * 'playing' 같은 글자를 코드 곳곳에 직접 적으면 오타가 나도 아무도 알려주지 않는다.
 * (GAME_STATUS.PLAING 처럼 잘못 쓰면 undefined가 되어 바로 티가 난다)
 */
export const GAME_STATUS = {
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
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
