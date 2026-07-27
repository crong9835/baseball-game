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

function NumberPad({ currentGuess, isGameOver, onDigitClick, onBackspace, onClear }) {
  const isGuessFull = currentGuess.length === DIGIT_COUNT;
  const hasNoInput = currentGuess.length === 0;

  return (
    <div className={styles.numberPad}>
      <div className={styles.digitGrid}>
        {ALL_DIGITS.map((digit) => {
          // 같은 숫자를 두 번 넣을 수 없다는 규칙을 버튼 단계에서 막는다.
          // 잘못된 입력을 아예 못 하게 만드는 편이, 입력 후 오류를 알려주는 것보다 쓰기 편하다.
          const isAlreadyUsed = currentGuess.includes(digit);
          const isDisabled = isAlreadyUsed || isGuessFull || isGameOver;

          return (
            <button
              key={digit}
              type="button"
              className={styles.digitButton}
              disabled={isDisabled}
              onClick={() => onDigitClick(digit)}
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
