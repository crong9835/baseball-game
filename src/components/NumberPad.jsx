/*
 * 0~9 숫자 버튼과 지우기/초기화 버튼을 그리는 컴포넌트.
 * 버튼이 눌려도 스스로 값을 바꾸지 않고, 부모(App)가 준 함수를 호출해서 "눌렸다"고 알리기만 한다.
 * 게임 상태는 App이 갖고 있으므로 실제 처리는 App이 한다.
 */

import { DIGIT_COUNT } from '../constants/gameConstants.js';
import { createAllDigits } from '../utils/gameLogic.js';
import styles from './NumberPad.module.css';

// 0~9는 게임이 진행되는 동안 절대 변하지 않으므로 파일을 읽을 때 딱 한 번만 만든다.
// 컴포넌트 안에서 만들면 화면이 다시 그려질 때마다 똑같은 배열을 새로 만들게 된다.
const ALL_DIGITS = createAllDigits();

/**
 * 숫자 버튼 하나에 붙일 CSS 클래스 이름을 정한다.
 * 이미 고른 숫자는 "지금 눌려 있다"가 눈에 보여야 다시 눌러 뺄 수 있다는 것도 짐작이 된다.
 */
function getDigitButtonClassName(isPicked) {
  const classNames = [styles.digitButton];

  if (isPicked) {
    classNames.push(styles.pickedDigitButton);
  }

  return classNames.join(' ');
}

function NumberPad({ currentGuess, isGameOver, onDigitToggle, onBackspace, onClear }) {
  const isGuessFull = currentGuess.length === DIGIT_COUNT;
  const hasNoInput = currentGuess.length === 0;

  return (
    <div className={styles.numberPad}>
      <div className={styles.digitGrid}>
        {ALL_DIGITS.map((digit) => {
          const isPicked = currentGuess.includes(digit);

          // 이미 고른 숫자는 막지 않는다. 다시 눌러서 빼는 것이 이 버튼의 또 다른 역할이기 때문이다.
          // 세 자리를 다 채운 뒤에는 "빼기"만 남으므로 고르지 않은 숫자만 막는다.
          const isDisabled = isGameOver || (isGuessFull && !isPicked);

          return (
            <button
              key={digit}
              type="button"
              className={getDigitButtonClassName(isPicked)}
              disabled={isDisabled}
              /*
               * onClick={onDigitToggle(digit)}이라고 쓰면 화면을 그리는 순간 실행돼 버린다.
               * 값을 넘겨야 하므로 화살표 함수로 한 겹 감싸 "나중에 부를 함수"를 만든다.
               */
              onClick={() => onDigitToggle(digit)}
            >
              {digit}
            </button>
          );
        })}
      </div>

      <div className={styles.editRow}>
        <button
          type="button"
          className={styles.editButton}
          disabled={hasNoInput || isGameOver}
          onClick={onBackspace}
        >
          지우기
        </button>
        <button
          type="button"
          className={styles.editButton}
          disabled={hasNoInput || isGameOver}
          onClick={onClear}
        >
          초기화
        </button>
      </div>
    </div>
  );
}

export default NumberPad;
