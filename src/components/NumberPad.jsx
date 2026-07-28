/*
 * 0~9 숫자 버튼과 그 아래 지우기/확인 버튼을 그리는 컴포넌트.
 * NumberPad (넘버 패드) — number=숫자, pad=버튼이 여러 개 붙은 판
 *
 * 스스로 값을 바꾸지 않고, 부모가 준 함수를 불러 "눌렸다"고 알리기만 한다.
 */

import { DIGIT_RESULT } from '../constants/gameConstants.js';
import { createAllDigits } from '../utils/gameLogic.js';
import styles from './NumberPad.module.css';

// 0~9는 절대 변하지 않으므로 파일을 읽을 때 딱 한 번만 만든다.
const ALL_DIGITS = createAllDigits();

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
  submitLabel,
  onDigitToggle,
  onBackspace,
  onSubmit,
}) {
  const hasNoInput = currentGuess.length === 0;
  const canSubmit = isGuessFull && !isDuplicateGuess && !isGameOver;

  return (
    <div className={styles.numberPad}>
      <div className={styles.digitGrid}>
        {ALL_DIGITS.map((digit) => {
          const isPicked = currentGuess.includes(digit);

          // 이미 고른 숫자는 막지 않는다. 다시 눌러서 빼는 것이 이 버튼의 또 다른 역할이다.
          // 다 채운 뒤에는 "빼기"만 남으므로 고르지 않은 숫자만 막는다.
          //
          // 이 컴포넌트는 자릿수가 몇인지 전혀 모른다. 다 찼는지만 받으므로
          // 난이도가 늘어도 여기는 고칠 것이 없다. 이 경계를 무너뜨리지 마라.
          const isDisabled = isGameOver || (isGuessFull && !isPicked);

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
          disabled={hasNoInput || isGameOver}
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
