/*
 * 0~9 숫자 버튼과 그 아래 지우기/확인 버튼을 그리는 컴포넌트.
 * NumberPad (넘버 패드) — number=숫자, pad=버튼이 여러 개 붙은 판
 *
 * 스스로 값을 바꾸지 않고, 부모가 준 함수를 불러 "눌렸다"고 알리기만 한다.
 * 손가락으로 누르는 것과 키보드로 치는 것을 여기서 같이 받는다.
 */

import { useEffect } from 'react';

import { DIGIT_RESULT } from '../constants/gameConstants.js';
import { createAllDigits } from '../utils/gameLogic.js';
import styles from './NumberPad.module.css';

// 0~9는 절대 변하지 않으므로 파일을 읽을 때 딱 한 번만 만든다.
const ALL_DIGITS = createAllDigits();

/**
 * 이 숫자를 지금 누를 수 있는지 정한다.
 * isDigitDisabled (이즈 디짓 디스에이블드) — disabled=못 쓰게 막힌
 *
 * 이미 고른 숫자는 막지 않는다. 다시 눌러서 빼는 것이 이 버튼의 또 다른 역할이다.
 * 다 채운 뒤에는 "빼기"만 남으므로 고르지 않은 숫자만 막는다.
 *
 * 화면 버튼과 키보드가 이 함수 하나를 같이 본다. 규칙을 두 군데 적어두면 한쪽만 고쳤을 때
 * 화면에서는 막힌 숫자가 키보드로는 들어간다.
 *
 * 값을 하나씩 나열하지 않고 객체로 받는다. 불린 둘이 나란히 붙으면
 * 부르는 쪽에서 두 번째 false가 무엇인지 알 수 없다.
 */
function isDigitDisabled({ digit, currentGuess, isGuessFull, isGameOver }) {
  const isPicked = currentGuess.includes(digit);

  return isGameOver || (isGuessFull && !isPicked);
}

/**
 * 눌린 키가 0~9 숫자 키면 그 숫자를, 아니면 null을 돌려준다.
 * readDigitKey (리드 디짓 키) — read=읽다, key=자판의 키
 *
 * Number()로 바로 바꾸면 안 된다. 스페이스바(' ')와 빈 글자가 0이 되어서,
 * 스페이스를 누를 때마다 0이 들어간다.
 */
function readDigitKey(key) {
  const isDigitKey = key.length === 1 && key >= '0' && key <= '9';
  if (!isDigitKey) {
    return null;
  }

  return Number(key);
}

/**
 * 지금 키를 받는 자리가 눌러서 쓰는 요소(버튼·체크박스) 위인지 본다.
 * isFocusOnControl (이즈 포커스 온 컨트롤) — focus=지금 키를 받는 자리, control=눌러서 쓰는 요소
 *
 * 엔터를 가로채기 전에 이것부터 확인해야 한다. Tab으로 '다시하기'까지 가서 엔터를 눌렀는데
 * 답이 제출되어 버리면, 키보드만 쓰는 사람은 그 버튼을 영영 누를 수 없다.
 *
 * 아무 데도 포커스가 없으면 <body>가 넘어온다. 그때는 화면 전체가 게임이므로 엔터가 확인이다.
 */
function isFocusOnControl(element) {
  return element.tagName === 'BUTTON' || element.tagName === 'INPUT';
}

/**
 * 힌트에 맞는 색 클래스 하나를 고른다. 아직 안 써본 숫자는 아무 색도 주지 않는다.
 * getHintClassName (겟 힌트 클래스 네임) — hint=힌트
 */
function getHintClassName(digitHint) {
  if (digitHint === DIGIT_RESULT.STRIKE) {
    return styles.strikeHint;
  }

  if (digitHint === DIGIT_RESULT.BALL) {
    return styles.ballHint;
  }

  if (digitHint === DIGIT_RESULT.OUT) {
    return styles.outHint;
  }

  return '';
}

/**
 * 숫자 버튼 하나에 붙일 CSS 클래스 이름을 정한다.
 * getDigitButtonClassName (겟 디짓 버튼 클래스 네임) — digit=숫자 한 자리
 *
 * 힌트 색과 "지금 골랐다" 표시는 서로를 가리면 안 된다.
 * 그래서 힌트는 배경색으로, 고른 표시는 형광 초록 테두리로 나눠서 둘 다 보이게 한다.
 */
function getDigitButtonClassName(isPicked, digitHint, isBeginnerMode) {
  const classNames = [styles.digitButton];

  if (isBeginnerMode) {
    classNames.push(getHintClassName(digitHint));
  }

  if (isPicked) {
    classNames.push(styles.pickedDigitButton);
  }

  return classNames.join(' ');
}

function NumberPad({
  currentGuess,
  digitHints,
  duplicateAttemptNumber,
  isDuplicateGuess,
  isBeginnerMode,
  isGuessFull,
  isGameOver,
  isBlockedByDialog,
  submitLabel,
  onDigitToggle,
  onBackspace,
  onSubmit,
}) {
  const hasNoInput = currentGuess.length === 0;
  const canSubmit = isGuessFull && !isDuplicateGuess && !isGameOver;
  const canBackspace = !hasNoInput && !isGameOver;

  /*
   * 키보드로도 게임을 할 수 있게 한다 — 숫자 키는 버튼과 같고, Backspace는 지우기,
   * Enter는 확인이다.
   *
   * 이 프로젝트에서 useEffect를 쓰는 둘째 곳이다. 브라우저에게 "키가 눌리면 알려달라"고
   * 신청하는 일(구독)이라 CLAUDE.md 표의 ⭕쪽에 해당한다. 신청을 거두는 코드(return)가
   * 없으면 화면이 바뀌어도 신청이 쌓여서, 한 번 누른 키가 여러 번으로 센다.
   *
   * window에 다는 이유는 어디에도 포커스가 없을 때(화면을 켜고 아무것도 안 눌렀을 때)도
   * 키를 받아야 하기 때문이다. 조각 안에만 달면 그 조각을 먼저 눌러줘야 한다.
   *
   * 두 번째 인자(의존성 배열)를 일부러 두지 않았다. 여기서 보는 값이 여덟 개라 배열로
   * 적으면 하나를 빠뜨리기 쉽고, 빠뜨리면 "지운 숫자가 아직 남아 있는" 옛 값을 보고 만다.
   * 매 렌더마다 신청을 다시 하는 대신 늘 지금 값을 본다.
   */
  useEffect(() => {
    function handleKeyDown(event) {
      // 확인 창이 떠 있는 동안에는 뒤에 있는 이 패드가 키를 받으면 안 된다.
      // 창 안에서 엔터를 눌렀는데 뒤에서 답이 제출되면 무엇이 일어난 것인지 알 수 없다.
      if (isBlockedByDialog) {
        return;
      }

      // Ctrl+1(탭 바꾸기)처럼 브라우저에게 시키는 조작이다. 여기서 가로채면 안 된다.
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      // 키를 누르고 있으면 브라우저가 같은 사건을 계속 보낸다.
      // 그냥 두면 숫자가 들어갔다 빠지기를 되풀이한다.
      if (event.repeat) {
        return;
      }

      if (event.key === 'Enter') {
        /*
         * 버튼 위에서 누른 엔터는 그 버튼을 누르라는 뜻이다. 브라우저에게 맡기고 물러난다.
         * 여기서 가로채면 '다시하기'에 가서 엔터를 눌러도 답이 제출된다.
         *
         * 숫자 키는 이렇게 물러나지 않는다. 마우스로 숫자를 몇 개 누른 뒤 이어서
         * 키보드로 치는 것이 흔한데, 그때 포커스는 방금 누른 숫자 버튼에 남아 있다.
         */
        if (isFocusOnControl(event.target)) {
          return;
        }

        // 화면에서 확인 버튼이 막혀 있으면 키보드로도 막는다.
        if (canSubmit) {
          onSubmit();
        }
        return;
      }

      if (event.key === 'Backspace') {
        // 옛 브라우저는 Backspace를 뒤로가기로 받아들인다. 게임 중에 화면이 떠나면 안 된다.
        event.preventDefault();

        if (canBackspace) {
          onBackspace();
        }
        return;
      }

      const digit = readDigitKey(event.key);
      if (digit === null) {
        return;
      }

      if (isDigitDisabled({ digit, currentGuess, isGuessFull, isGameOver })) {
        return;
      }

      onDigitToggle(digit);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div className={styles.numberPad}>
      <div className={styles.digitGrid}>
        {ALL_DIGITS.map((digit) => {
          const isPicked = currentGuess.includes(digit);

          // 이 컴포넌트는 자릿수가 몇인지 전혀 모른다. 다 찼는지만 받으므로
          // 난이도가 늘어도 여기는 고칠 것이 없다. 이 경계를 무너뜨리지 마라.
          const isDisabled = isDigitDisabled({ digit, currentGuess, isGuessFull, isGameOver });

          return (
            <button
              key={digit}
              type="button"
              className={getDigitButtonClassName(isPicked, digitHints[digit], isBeginnerMode)}
              disabled={isDisabled}
              onClick={() => onDigitToggle(digit)}
            >
              {digit}
            </button>
          );
        })}
      </div>

      {/*
        문구가 나타났다 사라질 때 아래 버튼이 움직이면 누르려던 순간에 확인 버튼이 도망간다.
        그래서 문구가 없어도 CSS에서 자리를 늘 비워둔다.
      */}
      <p className={styles.notice}>
        {isDuplicateGuess && `${duplicateAttemptNumber}회에 이미 낸 조합입니다`}
      </p>

      {/*
        "초기화"는 없앴다. 숫자를 다시 눌러 뺄 수 있게 되면서 쓸 일이 없어졌고,
        그 자리에 손가락이 가장 자주 가는 "확인"을 두는 편이 편하다. 되살리지 마라.
      */}
      <div className={styles.editRow}>
        <button
          type="button"
          className={styles.editButton}
          disabled={!canBackspace}
          onClick={onBackspace}
        >
          지우기
        </button>
        {/*
          버튼 글자를 밖에서 받는다. 이 패드를 게임 화면과 문제 내는 화면이 같이 쓰는데,
          다 채웠을 때 하는 일이 "확인"과 "링크 복사하기"로 다르기 때문이다.
        */}
        <button
          type="button"
          className={styles.submitButton}
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export default NumberPad;
