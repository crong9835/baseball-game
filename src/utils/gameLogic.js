/*
 * 숫자 야구의 게임 로직(계산하는 함수)만 모아둔 파일.
 * 값만 들어있는 constants/gameConstants.js와 짝을 이룬다. 이쪽은 "동작", 저쪽은 "설정값"이다.
 * React를 전혀 쓰지 않아서 브라우저 없이 node로 바로 실행해 검증할 수 있고,
 * 나중에 화면을 통째로 다시 만들어도 이 파일은 그대로 재사용된다.
 */

import { DIGIT_COUNT, MIN_DIGIT, MAX_DIGIT, DIGIT_RESULT } from '../constants/gameConstants.js';

/**
 * 0부터 9까지를 순서대로 담은 배열을 만든다.
 * 결과: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 *
 * 정답을 만들 때뿐 아니라 숫자 버튼 0~9를 그릴 때도 필요해서 export 한다.
 * (같은 for문을 NumberPad에 한 번 더 쓰면, 나중에 범위가 바뀔 때 고칠 곳이 두 군데가 된다)
 */
export function createAllDigits() {
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
 * 입력한 숫자를 한 자리씩 판정한다.
 *
 * 정답도 입력도 중복 숫자가 없기 때문에(입력은 화면에서 중복을 막는다)
 * 한 자리는 스트라이크·볼·아웃 중 정확히 하나에만 해당한다.
 * 그래서 각 자리를 옆자리와 상관없이 따로 판정해도 결과가 어긋나지 않는다.
 *
 * @param {number[]} answer 정답 (예: [1, 2, 3])
 * @param {number[]} guess  사용자 입력 (예: [3, 2, 1])
 * @returns {string[]} 자리 순서대로의 판정 (예: ['ball', 'strike', 'ball'])
 */
export function judgeEachDigit(answer, guess) {
  const digitResults = [];

  // entries()는 [몇 번째 자리인지, 그 자리에 넣은 숫자]를 한 쌍으로 꺼내준다.
  for (const [position, guessedDigit] of guess.entries()) {
    const isSamePosition = answer[position] === guessedDigit;
    const isInAnswer = answer.includes(guessedDigit);

    // 기본값을 먼저 정하고 조건에 맞을 때만 덮어쓴다. 중첩 삼항연산자를 피하기 위해서다.
    let digitResult = DIGIT_RESULT.OUT;
    if (isSamePosition) {
      digitResult = DIGIT_RESULT.STRIKE;
    } else if (isInAnswer) {
      digitResult = DIGIT_RESULT.BALL;
    }

    digitResults.push(digitResult);
  }

  return digitResults;
}

/**
 * 지금 입력이 예전에 낸 조합과 똑같은지 찾는다.
 *
 * 같은 조합을 또 내면 결과가 뻔한데 시도 횟수만 한 번 날아간다.
 * 그래서 확인을 누르기 전에 미리 알려주려고 몇 회에 냈던 조합인지까지 돌려준다.
 *
 * 배열끼리는 ===로 비교할 수 없다(내용이 같아도 다른 배열이면 false).
 * 그래서 [3,4,5]를 '345' 같은 문자열로 바꿔서 비교한다.
 * 숫자가 모두 한 글자(0~9)라서 이어 붙여도 헷갈릴 일이 없다.
 *
 * @returns {number|null} 같은 조합을 냈던 회차, 없으면 null
 */
export function findDuplicateAttemptNumber(history, guess) {
  const guessText = guess.join('');

  for (const record of history) {
    if (record.guess.join('') === guessText) {
      return record.attemptNumber;
    }
  }

  return null;
}

/**
 * 지금까지의 기록을 훑어서 "0~9 각 숫자에 대해 무엇을 알아냈는가"를 모은다.
 *
 * 이것이 초보 모드가 주는 힌트의 알맹이다.
 * 이미 지나간 기록에 색을 칠하는 것만으로는 "다음에 무엇을 누를까"에 도움이 되지 않는다.
 * 숫자 버튼 자체에 표시해야 누르기 직전에 보인다.
 *
 * @param {object[]} history 시도 기록 (각 기록은 guess와 digitResults를 갖는다)
 * @returns {object} 숫자를 열쇠로 하는 판정 (예: { 3: 'strike', 7: 'ball', 1: 'out' })
 */
export function collectDigitHints(history) {
  const digitHints = {};

  for (const record of history) {
    for (const [position, guessedDigit] of record.guess.entries()) {
      // 같은 숫자를 나중에 다른 자리에 넣어 볼로 나올 수 있다.
      // 스트라이크가 더 확실한 정보이므로 한 번 알아낸 스트라이크는 덮어쓰지 않는다.
      const isAlreadyStrike = digitHints[guessedDigit] === DIGIT_RESULT.STRIKE;

      if (!isAlreadyStrike) {
        digitHints[guessedDigit] = record.digitResults[position];
      }
    }
  }

  return digitHints;
}

/**
 * 사용자가 낸 답을 정답과 비교해 채점한다.
 *
 * 채점만 하고 승패는 판단하지 않는다.
 * 이겼는지 졌는지는 이 결과를 받아서 useBaseballGame의 decideNextStatus가 정한다.
 *
 * 판정 규칙을 여기에 다시 쓰지 않고 judgeEachDigit이 낸 결과를 세기만 한다.
 * 같은 규칙이 두 군데 있으면 한쪽만 고쳤을 때 색과 점수가 서로 어긋나기 때문이다.
 * strike + ball + out은 항상 DIGIT_COUNT(3)가 된다.
 *
 * @param {number[]} answer 정답 (예: [1, 2, 3])
 * @param {number[]} guess  사용자 입력 (예: [1, 3, 4])
 * @returns {{ strike: number, ball: number, out: number }} 예: { strike: 1, ball: 1, out: 1 }
 */
export function scoreGuess(answer, guess) {
  const digitResults = judgeEachDigit(answer, guess);

  const strike = digitResults.filter((result) => result === DIGIT_RESULT.STRIKE).length;
  const ball = digitResults.filter((result) => result === DIGIT_RESULT.BALL).length;
  const out = digitResults.filter((result) => result === DIGIT_RESULT.OUT).length;

  return { strike, ball, out };
}
