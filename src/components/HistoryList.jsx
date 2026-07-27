/*
 * 지금까지의 시도 기록을 최신순(최근 것이 위)으로 보여주는 컴포넌트.
 * GuessInput과 마찬가지로 받은 값을 그리기만 하는 표시 전용 컴포넌트다.
 */

import { DIGIT_RESULT } from '../constants/gameConstants.js';
import styles from './HistoryList.module.css';

/**
 * 판정 결과를 화면에 쓸 글자로 바꾼다.
 * 예: { strike: 1, ball: 1, out: 1 } -> "S:1 B:1 OUT:1"
 *
 * 이 표기는 참고 사이트(sciencelove.com/2653)의 표시 방식을 그대로 따랐다.
 */
function formatResult(record) {
  return `S:${record.strike} B:${record.ball} OUT:${record.out}`;
}

/**
 * 입력한 숫자 한 개에 붙일 CSS 클래스 이름을 정한다.
 *
 * 초보 모드가 꺼져 있으면 색 클래스를 아예 붙이지 않아 예전과 똑같이 보인다.
 * (GuessInput의 getSlotClassName과 같은 방식 — 배열에 담았다가 마지막에 합친다)
 */
function getDigitClassName(digitResult, isBeginnerMode) {
  const classNames = [styles.digit];

  if (!isBeginnerMode) {
    return classNames.join(' ');
  }

  if (digitResult === DIGIT_RESULT.STRIKE) {
    classNames.push(styles.strikeDigit);
  } else if (digitResult === DIGIT_RESULT.BALL) {
    classNames.push(styles.ballDigit);
  } else {
    classNames.push(styles.outDigit);
  }

  return classNames.join(' ');
}

function HistoryList({ history, isBeginnerMode }) {
  const hasNoHistory = history.length === 0;

  // 기록이 없을 때 빈 목록을 그리면 화면이 허전하고 무엇을 해야 할지 알기 어렵다.
  // 조건을 중첩 삼항연산자로 처리하지 않고, 여기서 일찍 return 해서 흐름을 단순하게 만든다.
  if (hasNoHistory) {
    return <p className={styles.emptyMessage}>아직 시도한 기록이 없습니다.</p>;
  }

  return (
    <ul className={styles.historyList}>
      {history.map((record) => (
        <li key={record.attemptNumber} className={styles.historyItem}>
          <span className={styles.attemptNumber}>{record.attemptNumber}회</span>

          {/*
            숫자를 join(' ')으로 이어 붙이면 문자열 하나가 되어 한 자리만 색을 다르게 할 수 없다.
            그래서 자리마다 span을 따로 그리고, 같은 자리의 판정으로 색을 정한다.
            (key로 position을 써도 되는 이유: 세 자리는 순서가 바뀌거나 중간에 끼어들지 않는다)
          */}
          <span className={styles.guess}>
            {record.guess.map((digit, position) => (
              <span
                key={position}
                className={getDigitClassName(record.digitResults[position], isBeginnerMode)}
              >
                {digit}
              </span>
            ))}
          </span>

          <span className={styles.result}>{formatResult(record)}</span>
        </li>
      ))}
    </ul>
  );
}

export default HistoryList;
