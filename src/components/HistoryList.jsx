/*
 * 지금까지의 시도 기록을 최신순(최근 것이 위)으로 보여주는 컴포넌트.
 * GuessInput과 마찬가지로 받은 값을 그리기만 하는 표시 전용 컴포넌트다.
 */

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

function HistoryList({ history }) {
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
          <span className={styles.guess}>{record.guess.join(' ')}</span>
          <span className={styles.result}>{formatResult(record)}</span>
        </li>
      ))}
    </ul>
  );
}

export default HistoryList;
