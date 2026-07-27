/*
 * 지금까지의 시도 기록을 최신순(최근 것이 위)으로 보여주는 컴포넌트.
 * GuessInput과 마찬가지로 받은 값을 그리기만 하는 표시 전용 컴포넌트다.
 */

import styles from './HistoryList.module.css';

/**
 * 판정 결과 한 조각(S / B / OUT)에 붙일 CSS 클래스 이름을 정한다.
 *
 * 초보 모드가 꺼져 있으면 색 클래스를 아예 붙이지 않는다.
 * 그래야 예전과 똑같이 셋 다 같은 검정 글자로 보인다.
 * (GuessInput의 getSlotClassName과 같은 방식 — 배열에 담았다가 마지막에 합친다)
 */
function getScoreClassName(colorClassName, isBeginnerMode) {
  const classNames = [styles.scorePart];

  if (isBeginnerMode) {
    classNames.push(colorClassName);
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
          <span className={styles.guess}>{record.guess.join(' ')}</span>
          {/*
            "S:1 B:1 OUT:1" 표기는 참고 사이트(sciencelove.com/2653)를 그대로 따랐다.
            한 문자열로 만들면 일부만 색을 다르게 할 수 없어서 세 조각으로 나눠 그린다.
          */}
          <span className={styles.result}>
            <span className={getScoreClassName(styles.strike, isBeginnerMode)}>
              S:{record.strike}
            </span>
            <span className={getScoreClassName(styles.ball, isBeginnerMode)}>
              B:{record.ball}
            </span>
            <span className={getScoreClassName(styles.out, isBeginnerMode)}>
              OUT:{record.out}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default HistoryList;
