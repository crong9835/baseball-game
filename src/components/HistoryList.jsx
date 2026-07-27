/*
 * 지금까지의 시도 기록을 최신순(최근 것이 위)으로 보여주는 컴포넌트.
 * GuessInput과 마찬가지로 받은 값을 그리기만 하는 표시 전용 컴포넌트다.
 */

import { DIGIT_RESULT } from '../constants/gameConstants.js';
import styles from './HistoryList.module.css';

/**
 * 판정 결과를 화면에 쓸 조각들로 바꾼다.
 * 예: { strike: 1, ball: 1, out: 1 } -> 1스트라이크 / 1볼 / 1아웃
 *
 * 예전에는 "S:1 B:1 OUT:1"처럼 적었지만 야구 규칙을 모르면 읽을 수 없었다.
 * 그래서 한글로 풀어쓰고, 0개인 것은 아예 적지 않는다.
 * (0인 값까지 늘어놓으면 정작 봐야 할 숫자가 묻힌다)
 *
 * 조각을 나누는 이유는 스트라이크와 볼에 서로 다른 색을 입혀야 하기 때문이다.
 * 문자열 하나로 만들면 그 안에서 일부만 색을 바꿀 수 없다.
 */
function createResultParts(record) {
  const parts = [];

  if (record.strike > 0) {
    parts.push({ text: `${record.strike}스트라이크`, digitResult: DIGIT_RESULT.STRIKE });
  }

  if (record.ball > 0) {
    parts.push({ text: `${record.ball}볼`, digitResult: DIGIT_RESULT.BALL });
  }

  if (record.out > 0) {
    parts.push({ text: `${record.out}아웃`, digitResult: DIGIT_RESULT.OUT });
  }

  // 셋을 더하면 항상 자릿수와 같으므로 하나는 반드시 0보다 크다.
  // 그래서 parts가 빈 배열이 되는 경우는 없고, 빈 칸을 채울 예외 처리도 필요 없다.
  return parts;
}

/**
 * 판정에 맞는 색 클래스 하나를 고른다.
 * 숫자에도 오른쪽 글자에도 같은 색 규칙을 써야 해서 한 곳에 모아뒀다.
 */
function getColorClassName(digitResult) {
  if (digitResult === DIGIT_RESULT.STRIKE) {
    return styles.strikeColor;
  }

  if (digitResult === DIGIT_RESULT.BALL) {
    return styles.ballColor;
  }

  return styles.outColor;
}

/**
 * 화면 조각 하나에 붙일 CSS 클래스 이름을 정한다.
 *
 * 초보 모드가 꺼져 있으면 색 클래스를 아예 붙이지 않아 전부 같은 검정으로 보인다.
 * (GuessInput의 getSlotClassName과 같은 방식 — 배열에 담았다가 마지막에 합친다)
 */
function getPartClassName(baseClassName, digitResult, isBeginnerMode) {
  const classNames = [baseClassName];

  if (isBeginnerMode) {
    classNames.push(getColorClassName(digitResult));
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
            (key로 position을 써도 되는 이유: 한 기록 안의 자리들은 순서가 바뀌거나 중간에 끼어들지 않는다)
          */}
          <span className={styles.guess}>
            {record.guess.map((digit, position) => (
              <span
                key={position}
                className={getPartClassName(styles.digit, record.digitResults[position], isBeginnerMode)}
              >
                {digit}
              </span>
            ))}
          </span>

          <span className={styles.result}>
            {createResultParts(record).map((part) => (
              <span
                key={part.text}
                className={getPartClassName(styles.resultPart, part.digitResult, isBeginnerMode)}
              >
                {part.text}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default HistoryList;
