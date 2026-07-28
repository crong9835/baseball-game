/*
 * 문제(정답과 설정 두 개)를 친구에게 보낼 링크로 바꾸고, 다시 읽어오는 파일.
 * puzzleLink (퍼즐 링크) — puzzle=문제, link=링크(인터넷 주소)
 *
 * 파일이 두 부분으로 나뉜다. 위쪽은 글자를 바꾸기만 하는 순수 함수라 node로 바로 검증할 수 있고,
 * 아래쪽은 브라우저의 주소창(window)을 만지는 함수들이다. 섞이지 않게 몰아두었다.
 */

import { isPlayableAnswer } from './gameLogic.js';

/*
 * 숫자 한 개를 글자 한 개로 바꾸는 표. 정답이 주소창에 그대로 보이지 않게 하려고 쓴다.
 *
 * 이 표를 gameConstants.js에 두지 않은 이유:
 * 그 파일은 로직과 화면 양쪽이 같은 값을 봐야 해서 따로 뺀 것인데, 이 표는 이 파일 말고는
 * 아무도 쓰지 않는다. 표를 보려고 파일을 옮겨 다니는 것보다 쓰는 자리 바로 위에 있는 편이 낫다.
 *
 * 글자를 아무거나 고르지 않았다. 0과 O, 1과 I처럼 눈으로 헷갈리는 짝은 일부러 뺐다.
 * 링크를 손으로 옮겨 적거나 전화로 불러줄 때 틀리기 때문이다.
 *
 * 이 방식이 막아주는 것과 못 막는 것을 분명히 해두자.
 * 주소창을 흘깃 보거나 카톡에 뜬 링크로는 정답을 알 수 없다. 거기까지가 목적이다.
 * 하지만 이 파일을 읽거나 개발자도구로 answer를 들여다보면 그냥 보인다.
 * 브라우저가 스트라이크·볼을 판정하려면 정답을 알고 있어야 하므로, 서버 없이는 원래 못 막는다.
 */
const DIGIT_TO_LETTER = {
  0: 'K',
  1: 'X',
  2: 'M',
  3: 'Q',
  4: 'R',
  5: 'W',
  6: 'Z',
  7: 'P',
  8: 'H',
  9: 'T',
};

/*
 * 설정이 켜졌는지 꺼졌는지를 나타내는 글자. 정답 글자와 눈으로 구분되도록 소문자를 골랐다.
 * QPWny를 보면 대문자 QPW까지가 정답이고 소문자 ny가 설정이라는 것이 바로 보인다.
 */
const SETTING_ON_LETTER = 'y';
const SETTING_OFF_LETTER = 'n';

// 링크 끝에 붙는 설정 글자의 개수. 무제한 기회와 초보 모드 둘이라 2다.
const SETTING_LETTER_COUNT = 2;

// 주소의 # 뒤에 붙일 이름. #play=QPWny 에서 play가 이것이다.
const PUZZLE_LINK_KEY = 'play';

/**
 * 위의 표를 뒤집어서 "글자 → 숫자" 표를 만든다.
 * createLetterToDigit (크리에이트 레터 투 디짓) — create=만들다, letter=글자, to=~로, digit=숫자 한 자리
 *
 * 표를 손으로 두 개 적지 않는 이유:
 * 나중에 글자 하나를 바꿀 때 한쪽만 고치면, 링크는 멀쩡히 만들어지는데 읽으면 다른 숫자가 나온다.
 * 화면만 봐서는 절대 안 보이는 종류의 버그다.
 */
function createLetterToDigit() {
  const letterToDigit = {};

  // Object.entries는 표를 [열쇠, 값] 쌍의 배열로 바꿔준다. 예: [['0', 'K'], ['1', 'X'], ...]
  // 열쇠는 항상 글자로 나오므로(숫자 0이 아니라 글자 '0') Number로 숫자로 되돌린다.
  for (const [digitText, letter] of Object.entries(DIGIT_TO_LETTER)) {
    letterToDigit[letter] = Number(digitText);
  }

  return letterToDigit;
}

// 파일을 읽을 때 딱 한 번만 만든다. 표는 절대 바뀌지 않으므로 부를 때마다 만들 이유가 없다.
// (NumberPad.jsx의 ALL_DIGITS와 같은 이유다)
const LETTER_TO_DIGIT = createLetterToDigit();

/**
 * 켜짐/꺼짐을 글자 하나로 바꾼다.
 * getSettingLetter (겟 세팅 레터) — get=골라서 돌려준다, setting=설정, letter=글자
 */
function getSettingLetter(isOn) {
  if (isOn) {
    return SETTING_ON_LETTER;
  }

  return SETTING_OFF_LETTER;
}

/**
 * 설정 자리에 올 수 있는 글자인지 확인한다.
 * isSettingLetter (이즈 세팅 레터) — 답이 예/아니오다
 */
function isSettingLetter(letter) {
  return letter === SETTING_ON_LETTER || letter === SETTING_OFF_LETTER;
}

/**
 * 문제를 링크에 담을 글자로 바꾼다.
 * createPuzzleCode (크리에이트 퍼즐 코드) — puzzle=문제, code=약속된 글자
 * 예: { answer: [3, 7, 5], isUnlimitedMode: false, isBeginnerMode: true } -> 'QPWny'
 *
 * 자릿수는 따로 담지 않는다. 정답 글자가 몇 개인지가 곧 자릿수이기 때문이다.
 * 둘 다 담으면 "자릿수는 4라는데 정답은 3자리"처럼 서로 어긋난 링크가 생길 수 있다.
 * 진짜 값은 하나만 두는 편이 항상 안전하다.
 *
 * @param {{ answer: number[], isUnlimitedMode: boolean, isBeginnerMode: boolean }} puzzle
 */
export function createPuzzleCode(puzzle) {
  let code = '';

  for (const digit of puzzle.answer) {
    code += DIGIT_TO_LETTER[digit];
  }

  // 순서를 지킨다. 읽는 쪽(readPuzzleCode)이 같은 순서로 꺼내기 때문이다.
  code += getSettingLetter(puzzle.isUnlimitedMode);
  code += getSettingLetter(puzzle.isBeginnerMode);

  return code;
}

/**
 * 정답 부분의 글자들을 숫자 배열로 되돌린다. 규칙에 안 맞으면 null.
 * readAnswerLetters (리드 앤서 레터스) — read=읽다, answer=정답, letter=글자
 */
function readAnswerLetters(answerLetters) {
  const answer = [];

  for (const letter of answerLetters) {
    const digit = LETTER_TO_DIGIT[letter];

    /*
     * 표에 없는 글자를 찾으면 undefined가 나온다.
     * 여기서 if (!digit) 이라고 쓰면 안 된다. 0은 멀쩡한 정답 숫자인데 !0이 true라서
     * 0이 들어간 정답을 전부 잘못된 링크로 판정해 버린다. 그래서 undefined인지만 묻는다.
     */
    if (digit === undefined) {
      return null;
    }

    answer.push(digit);
  }

  if (!isPlayableAnswer(answer)) {
    return null;
  }

  return answer;
}

/**
 * 링크 글자를 문제로 되돌린다. 규칙에 안 맞으면 null.
 * readPuzzleCode (리드 퍼즐 코드) — read=읽다
 * 예: 'QPWny' -> { answer: [3, 7, 5], isUnlimitedMode: false, isBeginnerMode: true }
 *
 * 잘못된 링크에 오류를 던지지 않고 null을 돌려주는 이유:
 * 부르는 쪽에서 "null이면 평소 게임을 시작한다"고 한 줄로 처리할 수 있다.
 * 링크가 망가지는 것은 드문 일이 아니라 흔한 일이다(카톡에서 잘리고, 복사가 덜 되고).
 */
export function readPuzzleCode(code) {
  if (typeof code !== 'string') {
    return null;
  }

  // slice에 음수를 넣으면 "뒤에서부터"라는 뜻이다.
  // slice(-2)는 마지막 두 글자, slice(0, -2)는 마지막 두 글자를 뺀 나머지다.
  const settingLetters = code.slice(-SETTING_LETTER_COUNT);
  const answerLetters = code.slice(0, -SETTING_LETTER_COUNT);

  const answer = readAnswerLetters(answerLetters);
  if (answer === null) {
    return null;
  }

  // 순서는 createPuzzleCode가 붙인 순서 그대로다. 무제한 기회가 먼저, 초보 모드가 나중.
  const unlimitedLetter = settingLetters[0];
  const beginnerLetter = settingLetters[1];

  const hasValidSettingLetters =
    isSettingLetter(unlimitedLetter) && isSettingLetter(beginnerLetter);

  if (!hasValidSettingLetters) {
    return null;
  }

  return {
    answer,
    isUnlimitedMode: unlimitedLetter === SETTING_ON_LETTER,
    isBeginnerMode: beginnerLetter === SETTING_ON_LETTER,
  };
}

/*
 * ─────────────────────────────────────────────────────────────
 * 여기서부터는 브라우저의 주소창(window)을 만지는 함수들이다.
 * node에는 window가 없으므로, 검증할 때는 위쪽 순수 함수만 부른다.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * 지금 열려 있는 주소를 바탕으로 친구에게 보낼 링크를 만든다.
 * createPuzzleLink (크리에이트 퍼즐 링크) — link=링크(인터넷 주소)
 * 예: 'http://localhost:5173/#play=QPWny'
 *
 * 주소를 코드에 적어두지 않고 지금 주소에서 가져오는 이유:
 * 개발 중에는 localhost고 나중에 배포하면 진짜 주소가 되어야 하는데, 이렇게 하면 고칠 것이 없다.
 * (origin=주소의 앞부분, pathname=그 뒤 경로. 둘을 합치면 #앞까지의 주소가 된다)
 */
export function createPuzzleLink(puzzle) {
  const code = createPuzzleCode(puzzle);
  const addressWithoutPuzzle = window.location.origin + window.location.pathname;

  return `${addressWithoutPuzzle}#${PUZZLE_LINK_KEY}=${code}`;
}

/**
 * 지금 열려 있는 주소에 문제가 담겨 있으면 읽어온다. 없거나 망가졌으면 null.
 * readPuzzleFromLink (리드 퍼즐 프롬 링크) — from=~으로부터
 */
export function readPuzzleFromLink() {
  // window.location.hash는 '#play=QPWny'처럼 # 까지 포함해서 나온다.
  const hash = window.location.hash;
  const prefix = `#${PUZZLE_LINK_KEY}=`;

  if (!hash.startsWith(prefix)) {
    return null;
  }

  const code = hash.slice(prefix.length);

  return readPuzzleCode(code);
}

/**
 * 주소창에서 문제 부분만 지운다.
 * removePuzzleFromLink (리무브 퍼즐 프롬 링크) — remove=없애다
 *
 * 링크를 열어 게임을 시작한 직후에 부른다. 게임하는 내내 주소창에 정답의 흔적이 없어야
 * 무심코 봤다가 힌트를 얻는 일이 없다.
 *
 * location.hash = '' 로 지우지 않는 이유:
 * 그렇게 하면 주소가 바뀐 것이 뒤로가기 기록에 남아서, 뒤로가기 한 번이면 링크가 다시 나타난다.
 * replaceState는 화면을 새로 불러오지도 않고 기록도 남기지 않으면서 주소만 바꾼다.
 */
export function removePuzzleFromLink() {
  const addressWithoutPuzzle = window.location.origin + window.location.pathname;

  window.history.replaceState(null, '', addressWithoutPuzzle);
}
