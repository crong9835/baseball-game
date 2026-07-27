/*
 * 게임이 끝났을 때 승패 메시지와 정답, "다시 시작" 버튼을 보여주는 컴포넌트.
 * 게임이 진행 중일 때는 아무것도 그리지 않는다.
 */

import { GAME_STATUS } from '../constants/gameConstants.js';
import styles from './ResultBanner.module.css';

function ResultBanner({ gameStatus, answer, onRestart }) {
  const isPlaying = gameStatus === GAME_STATUS.PLAYING;

  // 진행 중이면 배너 자체가 필요 없다.
  // null을 return하면 React는 "그릴 것이 없다"로 이해하고 화면에 아무것도 만들지 않는다.
  // App 쪽에서 조건을 붙이지 않고 이 컴포넌트가 스스로 판단하게 두면 App의 JSX가 단순해진다.
  if (isPlaying) {
    return null;
  }

  const answerText = answer.join(' ');
  const hasWon = gameStatus === GAME_STATUS.WON;

  // 중첩 삼항연산자 대신, 기본값을 먼저 정하고 조건에 맞으면 덮어쓰는 방식으로 풀어 썼다.
  let message = `아쉽네요. 정답은 ${answerText} 였습니다.`;
  if (hasWon) {
    message = `정답입니다! ${answerText}`;
  }

  return (
    <div className={styles.resultBanner}>
      <p className={styles.message}>{message}</p>
      <button type="button" className={styles.restartButton} onClick={onRestart}>
        다시 시작
      </button>
    </div>
  );
}

export default ResultBanner;
