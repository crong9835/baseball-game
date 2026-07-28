/*
 * 게임이 끝났을 때 승패 메시지와 정답을 보여주는 컴포넌트.
 * ResultBanner (리절트 배너) — result=결과, banner=눈에 띄게 걸어두는 띠 모양 알림
 *
 * 예전에는 여기에도 "다시 시작" 버튼이 있었지만, 화면에 항상 보이는 "다시하기" 버튼이
 * 생겨서 같은 버튼이 두 개가 되므로 뺐다.
 */

import { GAME_STATUS } from '../constants/gameConstants.js';
import styles from './ResultBanner.module.css';

function ResultBanner({ gameStatus, answer }) {
  const isPlaying = gameStatus === GAME_STATUS.PLAYING;

  // App에서 조건부로 감싸지 않고 이 컴포넌트가 스스로 판단한다. App의 JSX가 단순해진다.
  if (isPlaying) {
    return null;
  }

  const answerText = answer.join(' ');
  const hasWon = gameStatus === GAME_STATUS.WON;

  let message = `아쉽네요. 정답은 ${answerText} 였습니다.`;
  if (hasWon) {
    message = `정답입니다! ${answerText}`;
  }

  return (
    <div className={styles.resultBanner}>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export default ResultBanner;
