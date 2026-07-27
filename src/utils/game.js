/*
 * 숫자 야구의 게임 로직만 모아둔 파일.
 * React를 전혀 쓰지 않아서 브라우저 없이 node로 바로 실행해 검증할 수 있고,
 * 나중에 화면을 통째로 다시 만들어도 이 파일은 그대로 재사용된다.
 */

import { DIGIT_COUNT, MIN_DIGIT, MAX_DIGIT } from '../constants/game.js';

/**
 * 0부터 9까지를 순서대로 담은 배열을 만든다.
 * 결과: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 */
function createAllDigits() {
  const digitList = [];

  for (let digit = MIN_DIGIT; digit <= MAX_DIGIT; digit += 1) {
    digitList.push(digit);
  }

  return digitList;
}

/**
 * 배열의 순서를 무작위로 섞은 "새 배열"을 돌려준다.
 *
 * 원본을 직접 바꾸지 않고 복사본을 만드는 이유:
 * 앞으로 React state를 다룰 때와 같은 습관을 들이기 위해서다.
 * (React는 값을 직접 바꾸면 바뀐 사실을 알아채지 못한다)
 */
function shuffleArray(originalList) {
  const shuffledList = [...originalList];

  // 뒤에서부터 한 칸씩 내려오며, 자기 앞쪽의 아무 위치와 자리를 맞바꾼다.
  // 매 위치가 정확히 한 번씩 정해지므로 언제 끝나는지가 명확하다.
  for (let index = shuffledList.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    const currentValue = shuffledList[index];
    const randomValue = shuffledList[randomIndex];

    shuffledList[index] = randomValue;
    shuffledList[randomIndex] = currentValue;
  }

  return shuffledList;
}

/**
 * 중복 없는 DIGIT_COUNT개의 숫자로 정답을 만든다.
 * 예: [0, 5, 7]
 *
 * "랜덤으로 하나 뽑고 겹치면 다시 뽑기" 방식 대신
 * "0~9를 전부 섞은 뒤 앞에서 3개를 가져오기" 방식을 골랐다.
 * 다시 뽑는 방식은 운이 나쁘면 몇 번을 도는지 알 수 없지만, 이 방식은 항상 한 번에 끝난다.
 */
export function createAnswer() {
  const allDigits = createAllDigits();
  const shuffledDigits = shuffleArray(allDigits);
  const answer = shuffledDigits.slice(0, DIGIT_COUNT);

  return answer;
}

/**
 * 정답과 입력을 비교해 { strike, ball, out }을 돌려준다.
 *
 * 정답도 입력도 중복 숫자가 없기 때문에(입력은 화면에서 중복을 막는다)
 * 한 자리는 스트라이크·볼·아웃 중 정확히 하나에만 해당한다.
 * 그래서 strike + ball + out은 항상 DIGIT_COUNT(3)가 된다.
 *
 * @param {number[]} answer 정답 (예: [1, 2, 3])
 * @param {number[]} guess  사용자 입력 (예: [1, 3, 4])
 * @returns {{ strike: number, ball: number, out: number }} 예: { strike: 1, ball: 1, out: 1 }
 */
export function judge(answer, guess) {
  let strike = 0;
  let ball = 0;
  let out = 0;

  // entries()는 [몇 번째 자리인지, 그 자리에 넣은 숫자]를 한 쌍으로 꺼내준다.
  for (const [position, guessedDigit] of guess.entries()) {
    const isSamePosition = answer[position] === guessedDigit;
    const isInAnswer = answer.includes(guessedDigit);

    if (isSamePosition) {
      strike += 1;
    } else if (isInAnswer) {
      ball += 1;
    } else {
      out += 1;
    }
  }

  return { strike, ball, out };
}
