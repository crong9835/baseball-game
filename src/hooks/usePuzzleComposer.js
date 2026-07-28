/*
 * 친구에게 보낼 문제를 만드는 화면의 상태와 조작 함수를 모은 커스텀 훅.
 * usePuzzleComposer (유즈 퍼즐 컴포저) — puzzle=문제, compose=(작품을) 짓다 → 문제를 짓는 것
 *
 * useBaseballGame과 따로 둔 이유는 하는 일이 아예 다르기 때문이다.
 * 저쪽은 "지금 진행 중인 판"을 맡고, 이쪽은 "아직 시작하지도 않은 남의 판"을 만든다.
 */

import { useState } from 'react';

import { DEFAULT_DIGIT_COUNT } from '../constants/gameConstants.js';
import { toggleDigit } from '../utils/gameLogic.js';
import { createPuzzleLink } from '../utils/puzzleLink.js';

export function usePuzzleComposer() {
  // 출제 화면이 열려 있는가. 게임 화면과 통째로 갈아 끼우는 데 쓴다.
  const [isComposing, setIsComposing] = useState(false);

  /*
   * 친구가 풀 판의 규칙. 게임 쪽의 같은 이름들과는 완전히 별개의 값이다.
   * 내가 3자리 게임을 하는 중에도 친구에게는 5자리 문제를 낼 수 있어야 한다.
   */
  const [digitCount, setDigitCount] = useState(DEFAULT_DIGIT_COUNT);
  const [isUnlimitedMode, setIsUnlimitedMode] = useState(false);
  const [isBeginnerMode, setIsBeginnerMode] = useState(false);

  // 지금까지 고른 정답. 게임의 currentGuess와 같은 방식으로 쌓인다.
  const [pickedAnswer, setPickedAnswer] = useState([]);

  /*
   * 복사 버튼을 누른 결과. 아직 안 눌렀으면 null이고, 모양은 { link, isSuccess }다.
   *
   * 참/거짓이 아니라 어느 링크의 결과인지를 같이 담아두는 이유:
   * 복사한 뒤에 숫자나 설정을 바꾸면 링크가 달라진다. 참/거짓이면 그 사실을 알 수가 없어서
   * "복사했습니다"가 그대로 남고, 옛 링크를 보낸 줄 알게 된다. 링크를 담아두면
   * 지금 링크와 비교만 하면 되고, 값을 바꾸는 조작마다 표시를 꺼주는 코드가 필요 없다.
   *
   * 성공과 실패를 state 둘로 나누면 "복사했습니다"와 "복사가 안 됐습니다"가 같이 떠 있는
   * 어긋난 상태를 만들 수 있다. 한 칸에 담으면 둘 중 하나일 수밖에 없다.
   */
  const [copyResult, setCopyResult] = useState(null);

  const isPickedAnswerFull = pickedAnswer.length === digitCount;

  /*
   * 친구에게 보낼 링크. 정답을 다 고르기 전에는 null이다.
   *
   * state로 두면 숫자를 바꾼 뒤에도 옛 링크가 남아서, 화면에 보이는 링크와
   * 실제로 만들어질 문제가 서로 다른 상태가 된다.
   */
  let puzzleLink = null;
  if (isPickedAnswerFull) {
    puzzleLink = createPuzzleLink({
      answer: pickedAnswer,
      isUnlimitedMode,
      isBeginnerMode,
    });
  }

  // 지금 화면에 보이는 링크를 복사한 결과가 맞는지 따진다.
  // 숫자나 설정을 바꾸면 puzzleLink가 달라지므로 둘 다 저절로 false가 된다.
  let isLinkCopied = false;
  let isCopyFailed = false;
  if (copyResult !== null && copyResult.link === puzzleLink) {
    isLinkCopied = copyResult.isSuccess;
    isCopyFailed = !copyResult.isSuccess;
  }

  /**
   * 출제 화면을 연다. 고르던 숫자를 비우고 시작한다.
   * handleOpen (핸들 오픈) — open=열다
   *
   * 앞 문제의 정답이 남아 있으면 그것을 새 문제로 착각하고 그대로 보내게 된다.
   * 설정 셋은 그대로 둔다. 보통 비슷한 난이도로 연달아 내기 때문이다.
   *
   * copyResult도 같이 비운다. 클립보드는 이 앱 바깥에 있어서, 화면을 닫아둔 사이에
   * 다른 것을 복사했는지 알 방법이 없다. 안 비우면 앞과 똑같은 문제를 다시 만들었을 때
   * 누르지도 않은 "복사했습니다"가 떠서, 엉뚱한 글자를 붙여넣어 보내게 된다.
   */
  function handleOpen() {
    setIsComposing(true);
    setPickedAnswer([]);
    setCopyResult(null);
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

  /**
   * 자릿수를 바꾸면 고르던 숫자를 비운다.
   *
   * 5자리로 다섯 개를 고른 뒤 3자리로 바꾸면 세 개만 필요한데 다섯 개가 남는다.
   * 잘라내는 방법도 있지만 어느 것이 잘려나갈지 눈으로 알 수 없어 아예 비우는 편이 낫다.
   *
   * 같은 자릿수를 다시 누른 것은 아무것도 바꾸지 않는 조작이라 그냥 돌아간다.
   * 이 화면은 확인 창도 되돌리기도 없어서, 사라지면 처음부터 다시 고르는 수밖에 없다.
   */
  function handleChangeDigitCount(nextDigitCount) {
    if (nextDigitCount === digitCount) {
      return;
    }

    setDigitCount(nextDigitCount);
    setPickedAnswer([]);
  }

  /*
   * 설정 둘은 켜고 꺼도 고르던 숫자를 건드리지 않는다.
   * 게임 쪽과 다른 점이다. 여기는 아직 시작하지도 않은 판이라 잃을 기록이 없다.
   */
  function handleToggleUnlimitedMode() {
    setIsUnlimitedMode(!isUnlimitedMode);
  }

  function handleToggleBeginnerMode() {
    setIsBeginnerMode(!isBeginnerMode);
  }

  /**
   * 만들어진 링크를 클립보드에 복사한다.
   * handleCopyLink (핸들 카피 링크) — copy=복사하다
   *
   * navigator.clipboard는 주소가 https가 아니면 브라우저가 아예 주지 않는다
   * (휴대폰으로 개발 서버를 열어보는 http://192.168... 같은 경우).
   *
   * 세 갈래를 모두 결과로 남긴다 — 기능이 없을 때, 성공(then), 실패(catch).
   * catch를 빼면 실패가 아무 데도 잡히지 않아 화면에 아무 말도 안 뜨고,
   * 버튼이 고장 난 것처럼 보인다.
   */
  function handleCopyLink() {
    if (navigator.clipboard === undefined) {
      setCopyResult({ link: puzzleLink, isSuccess: false });
      return;
    }

    navigator.clipboard
      .writeText(puzzleLink)
      .then(() => {
        setCopyResult({ link: puzzleLink, isSuccess: true });
      })
      .catch(() => {
        setCopyResult({ link: puzzleLink, isSuccess: false });
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
    isCopyFailed,
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
