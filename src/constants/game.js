/*
 * 게임 규칙에 등장하는 숫자들을 한곳에 모아둔 파일.
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
