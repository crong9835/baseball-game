/*
 * 초보 모드를 켜고 끄는 체크박스.
 * 값을 기억하는 곳은 useBaseballGame 훅이고, 이 컴포넌트는 받은 값을 비추고
 * 사용자가 눌렀다는 사실만 위로 알린다.
 */

import styles from './BeginnerModeToggle.module.css';

function BeginnerModeToggle({ isBeginnerMode, onToggle }) {
  return (
    /*
     * input을 label로 감싸면 글자를 눌러도 체크가 바뀐다.
     * 손가락으로 누르는 화면에서는 작은 네모만 노려서 누르기 어렵기 때문이다.
     */
    <label className={styles.toggle}>
      <input
        type="checkbox"
        className={styles.checkbox}
        /*
         * checked가 state를 그대로 가리키므로 화면은 항상 state와 같다.
         * (체크박스가 스스로 상태를 갖지 않는 "제어 컴포넌트")
         *
         * onChange={onToggle}에 괄호가 없는 것에 주의.
         * onToggle()이라고 쓰면 화면을 그리는 순간 함수가 실행돼 버린다.
         */
        checked={isBeginnerMode}
        onChange={onToggle}
      />
      초보 모드
      <span className={styles.description}>알아낸 숫자를 버튼에 색으로 표시</span>
    </label>
  );
}

export default BeginnerModeToggle;
