/*
 * 숫자 야구의 게임 로직(계산하는 함수)만 모아둔 파일.
 * 값만 들어있는 constants/gameConstants.js와 짝을 이룬다. 이쪽은 "동작", 저쪽은 "설정값"이다.
 * React를 전혀 쓰지 않아서 브라우저 없이 node로 바로 실행해 검증할 수 있다.
 */

import {
  MIN_DIGIT,
  MAX_DIGIT,
  MAX_ATTEMPTS,
  DIGIT_COUNT_OPTIONS,
  DIGIT_RESULT,
  GAME_STATUS,
} from '../constants/gameConstants.js';

/**
 * 0부터 9까지를 순서대로 담은 배열을 만든다.
 * createAllDigits (크리에이트 올 디짓츠) — create=만들다, all=전부, digit=숫자 한 자리
 *
 * 정답을 만들 때뿐 아니라 숫자 버튼 0~9를 그릴 때도 필요해서 export 한다.
 * 같은 for문을 NumberPad에 한 번 더 쓰면 범위가 바뀔 때 고칠 곳이 두 군데가 된다.
 */
export function createAllDigits() {
  const digitList = [];

  for (let digit = MIN_DIGIT; digit <= MAX_DIGIT; digit += 1) {
    digitList.push(digit);
  }

  return digitList;
}

/**
 * 배열의 순서를 무작위로 섞은 새 배열을 돌려준다.
 * shuffleArray (셔플 어레이) — shuffle=섞다, array=배열
 */
function shuffleArray(originalList) {
  const shuffledList = [...originalList];

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
 * 중복 없는 digitCount개의 숫자로 정답을 만든다.
 * createAnswer (크리에이트 앤서) — create=만들다, answer=정답
 * 예: createAnswer(3) -> [0, 5, 7]
 *
 * "랜덤으로 하나 뽑고 겹치면 다시 뽑기" 방식 대신
 * "0~9를 전부 섞은 뒤 앞에서 필요한 개수만 가져오기" 방식을 골랐다.
 * 다시 뽑는 방식은 운이 나쁘면 몇 번을 도는지 알 수 없지만, 이 방식은 항상 한 번에 끝난다.
 *
 * @param {number} digitCount 정답의 자릿수 (3, 4, 5)
 */
export function createAnswer(digitCount) {
  const allDigits = createAllDigits();
  const shuffledDigits = shuffleArray(allDigits);
  const answer = shuffledDigits.slice(0, digitCount);

  return answer;
}

/**
 * 고른 숫자 목록에서 한 숫자를 넣거나 뺀다. 이미 고른 숫자를 다시 누르면 뺀다.
 * toggleDigit (토글 디짓) — toggle=눌러서 켰다 껐다 하기, digit=숫자 한 자리
 *
 * 게임에서 답을 입력할 때와 문제를 낼 때 정답을 고를 때가 이 함수를 같이 쓴다.
 */
export function toggleDigit(pickedDigits, digit) {
  const isAlreadyPicked = pickedDigits.includes(digit);

  if (isAlreadyPicked) {
    return pickedDigits.filter((pickedDigit) => pickedDigit !== digit);
  }

  return [...pickedDigits, digit];
}

/**
 * 배열 안에 같은 숫자가 두 번 들어 있는지 확인한다.
 * hasDuplicateDigit (해즈 듀플리케이트 디짓) — has=가지고 있다, duplicate=중복된
 */
function hasDuplicateDigit(digitList) {
  for (const [position, digit] of digitList.entries()) {
    const laterDigits = digitList.slice(position + 1);

    if (laterDigits.includes(digit)) {
      return true;
    }
  }

  return false;
}

/**
 * 이 배열을 정답으로 써도 되는지 확인한다.
 * isPlayableAnswer (이즈 플레이어블 앤서) — playable=게임을 할 수 있는, answer=정답
 *
 * createAnswer가 만든 정답은 늘 규칙에 맞으므로, 필요한 곳은 밖에서 들어온 정답이다.
 * 친구가 보낸 링크는 카톡에서 잘렸을 수도 있고 누가 글자를 고쳐놨을 수도 있다.
 *
 * 특히 중복을 막는 것이 중요하다. "한 자리는 스트라이크·볼·아웃 중 정확히 하나"라는
 * 이 게임의 판정 전제가 통째로 중복이 없다는 데서 나오기 때문이다.
 */
export function isPlayableAnswer(answer) {
  if (!Array.isArray(answer)) {
    return false;
  }

  const isAllowedDigitCount = DIGIT_COUNT_OPTIONS.includes(answer.length);
  if (!isAllowedDigitCount) {
    return false;
  }

  for (const digit of answer) {
    const isInRange = digit >= MIN_DIGIT && digit <= MAX_DIGIT;

    if (!isInRange) {
      return false;
    }
  }

  return !hasDuplicateDigit(answer);
}

/**
 * 입력한 숫자를 한 자리씩 판정한다.
 * judgeEachDigit (저지 이치 디짓) — judge=판정하다, each=각각, digit=숫자 한 자리
 *
 * 정답도 입력도 중복 숫자가 없어서 한 자리는 셋 중 정확히 하나에만 해당한다.
 * 그래서 각 자리를 옆자리와 상관없이 따로 판정해도 결과가 어긋나지 않는다.
 *
 * @param {number[]} answer 정답 (예: [1, 2, 3])
 * @param {number[]} guess  사용자 입력 (예: [3, 2, 1])
 * @returns {string[]} 자리 순서대로의 판정 (예: ['ball', 'strike', 'ball'])
 */
export function judgeEachDigit(answer, guess) {
  const digitResults = [];

  for (const [position, guessedDigit] of guess.entries()) {
    const isSamePosition = answer[position] === guessedDigit;
    const isInAnswer = answer.includes(guessedDigit);

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
 * findDuplicateAttemptNumber (파인드 듀플리케이트 어템프트 넘버)
 *   — find=찾다, duplicate=중복된, attempt=시도, number=번호
 *
 * 몇 회에 냈던 조합인지까지 돌려주는 이유는 확인을 누르기 전에 그 회차를 알려주기 위해서다.
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
 * collectDigitHints (컬렉트 디짓 힌츠) — collect=모으다, digit=숫자 한 자리, hint=힌트
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
 * 사용자가 낸 답을 정답과 비교해 채점한다. 승패 판단은 decideNextStatus가 한다.
 * scoreGuess (스코어 게스) — score=점수를 매기다, guess=추측(여기서는 입력한 숫자)
 *
 * 판정 규칙을 여기에 다시 쓰지 않고 judgeEachDigit이 낸 결과를 세기만 한다.
 * 같은 규칙이 두 군데 있으면 한쪽만 고쳤을 때 화면의 색과 점수가 서로 어긋난다.
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

/**
 * 이번 시도 결과로 게임이 어떤 상태가 되는지 정한다.
 * decideNextStatus (디사이드 넥스트 스테이터스) — decide=정하다, next=다음, status=상태
 *
 * @param {number} strike        이번 시도의 스트라이크 개수
 * @param {number} attemptNumber 이번이 몇 번째 시도인지
 * @param {number} digitCount    자릿수. 몇 스트라이크면 이기는지가 난이도마다 다르다
 * @param {boolean} isUnlimitedMode 무제한 기회 모드인지
 */
export function decideNextStatus(strike, attemptNumber, digitCount, isUnlimitedMode) {
  const hasWon = strike === digitCount;
  if (hasWon) {
    return GAME_STATUS.WON;
  }

  // 이기는 조건을 먼저 확인한 뒤에 이 줄이 와야 한다.
  // 순서가 반대면 무제한 모드에서 정답을 맞혀도 게임이 안 끝난다.
  if (isUnlimitedMode) {
    return GAME_STATUS.PLAYING;
  }

  const isOutOfAttempts = attemptNumber >= MAX_ATTEMPTS;
  if (isOutOfAttempts) {
    return GAME_STATUS.LOST;
  }

  return GAME_STATUS.PLAYING;
}
