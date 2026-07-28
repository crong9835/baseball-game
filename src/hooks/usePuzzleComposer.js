/*
 * 친구에게 보낼 문제를 만드는 화면의 상태와 조작 함수를 모은 커스텀 훅.
 * usePuzzleComposer (유즈 퍼즐 컴포저) — puzzle=문제, compose=(작품을) 짓다 → 문제를 짓는 것
 *
 * useBaseballGame과 따로 둔 이유는 하는 일이 아예 다르기 때문이다.
 * 저쪽은 "지금 진행 중인 판"을 맡고, 이쪽은 "아직 시작하지도 않은 남의 판"을 만든다.
 * 한 훅에 합치면 state 다섯 개가 더 붙는데, 그 다섯은 게임이 도는 것과 아무 상관이 없다.
 * (CLAUDE.md '파일을 나누는 기준' 세 가지에 모두 해당한다)
 */

import { useState } from 'react';

import { DEFAULT_DIGIT_COUNT } from '../constants/gameConstants.js';
import { toggleDigit } from '../utils/gameLogic.js';
import { createPuzzleLink } from '../utils/puzzleLink.js';

export function usePuzzleComposer() {
  // 출제 화면이 열려 있는가. 게임 화면과 통째로 갈아 끼우는 데 쓴다.
  const [isComposing, setIsComposing] = useState(false);

  /*
   * 여기 셋은 "친구가 풀 판을 어떤 규칙으로 할 것인가"다.
   * 게임 쪽의 같은 이름들과는 완전히 별개의 값이다. 내가 3자리 게임을 하는 중에도
   * 친구에게는 5자리 문제를 낼 수 있어야 하기 때문이다.
   */
  const [digitCount, setDigitCount] = useState(DEFAULT_DIGIT_COUNT);
  const [isUnlimitedMode, setIsUnlimitedMode] = useState(false);
  const [isBeginnerMode, setIsBeginnerMode] = useState(false);

  // 지금까지 고른 정답. 게임의 currentGuess와 같은 방식으로 쌓인다.
  const [pickedAnswer, setPickedAnswer] = useState([]);

  /*
   * 마지막으로 복사한 링크. 아직 한 번도 복사하지 않았으면 null이다.
   *
   * "복사했다"를 참/거짓으로 두지 않고 링크 자체를 담아두는 이유:
   * 복사한 뒤에 숫자나 설정을 바꾸면 링크가 달라진다. 참/거짓이면 그 사실을 알 수가 없어서
   * "복사했습니다"가 그대로 남고, 옛 링크를 보낸 줄 알게 된다.
   * 링크를 담아두면 지금 링크와 같은지 비교만 하면 되고, 값을 바꾸는 조작마다
   * 표시를 꺼주는 코드를 넣지 않아도 된다.
   */
  const [copiedLink, setCopiedLink] = useState(null);

  // 아래 둘은 위의 state에서 그대로 계산되는 값이라 state로 만들지 않는다.
  const isPickedAnswerFull = pickedAnswer.length === digitCount;

  /*
   * 친구에게 보낼 링크.
   *
   * 이것도 state가 아니다. 고른 숫자와 설정이 정해지면 링크는 하나로 정해지기 때문이다.
   * state로 두면 숫자를 바꾼 뒤에도 옛 링크가 남아서, 화면에 보이는 링크와
   * 실제로 만들어질 문제가 서로 다른 상태가 만들어진다.
   *
   * 정답을 다 고르기 전에는 만들 수 없으므로 null이다.
   */
  let puzzleLink = null;
  if (isPickedAnswerFull) {
    puzzleLink = createPuzzleLink({
      answer: pickedAnswer,
      isUnlimitedMode,
      isBeginnerMode,
    });
  }

  // 지금 화면에 보이는 링크를 복사한 것이 맞는지. 숫자를 바꾸면 저절로 false가 된다.
  const isLinkCopied = puzzleLink !== null && copiedLink === puzzleLink;

  /*
   * 출제 화면을 연다.
   * handleOpen (핸들 오픈) — open=열다
   *
   * 고르던 숫자를 비우고 시작한다. 문제를 하나 만들어 보낸 뒤 다시 열었을 때
   * 앞 문제의 정답이 남아 있으면, 그것을 새 문제로 착각하고 그대로 보내게 된다.
   * 설정 셋은 그대로 둔다. 보통 비슷한 난이도로 연달아 내기 때문이다.
   */
  function handleOpen() {
    setIsComposing(true);
    setPickedAnswer([]);
  }

  // handleClose (핸들 클로즈) — close=닫다. 게임 화면으로 돌아간다.
  function handleClose() {
    setIsComposing(false);
  }

  // 게임 화면의 숫자 버튼과 정확히 같은 규칙으로 넣고 뺀다.
  function handleDigitToggle(digit) {
    setPickedAnswer(toggleDigit(pickedAnswer, digit));
  }

  function handleBackspace() {
    setPickedAnswer(pickedAnswer.slice(0, -1));
  }

  /*
   * 자릿수를 바꾸면 고르던 숫자를 비운다.
   *
   * 5자리로 다섯 개를 고른 뒤 3자리로 바꾸면 세 개만 필요한데 다섯 개가 남는다.
   * 남은 것을 잘라내는 방법도 있지만, 어느 것이 잘려나갈지 눈으로 알 수 없어서
   * 아예 비우는 편이 예측하기 쉽다.
   */
  function handleChangeDigitCount(nextDigitCount) {
    setDigitCount(nextDigitCount);
    setPickedAnswer([]);
  }

  /*
   * 설정 둘은 켜고 꺼도 고르던 숫자를 건드리지 않는다.
   *
   * 게임 쪽과 다른 점이다. 저쪽은 판이 진행 중이라 규칙이 바뀌면 기록이 어긋나지만,
   * 여기는 아직 시작하지도 않은 판이라 잃을 기록이 없다. 그래서 확인 창도 뜨지 않는다.
   */
  function handleToggleUnlimitedMode() {
    setIsUnlimitedMode(!isUnlimitedMode);
  }

  function handleToggleBeginnerMode() {
    setIsBeginnerMode(!isBeginnerMode);
  }

  /*
   * 만들어진 링크를 클립보드에 복사한다.
   * handleCopyLink (핸들 카피 링크) — copy=복사하다
   *
   * navigator.clipboard는 브라우저가 주는 기능이고, 복사가 끝나는 데 시간이 조금 걸려서
   * then으로 "끝나면 이것을 하라"를 붙인다. 복사가 실패할 수도 있는데(권한을 막아둔 경우 등)
   * 그때는 then 안이 실행되지 않아 "복사했습니다"가 뜨지 않는다.
   * 화면에 링크 글자를 그대로 보여주는 이유가 이것이다. 복사가 안 되면 손으로 긁어 갈 수 있다.
   */
  function handleCopyLink() {
    navigator.clipboard.writeText(puzzleLink).then(() => {
      setCopiedLink(puzzleLink);
    });
  }

  // 게임 훅과 같은 이유로 setter는 내보내지 않는다.
  return {
    isComposing,
    digitCount,
    isUnlimitedMode,
    isBeginnerMode,
    pickedAnswer,
    isPickedAnswerFull,
    puzzleLink,
    isLinkCopied,
    handleOpen,
    handleClose,
    handleDigitToggle,
    handleBackspace,
    handleChangeDigitCount,
    handleToggleUnlimitedMode,
    handleToggleBeginnerMode,
    handleCopyLink,
  };
}
