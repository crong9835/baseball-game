/*
 * 설정 하나를 켜고 끄는 체크박스 한 줄.
 * SettingToggle (세팅 토글) — setting=설정, toggle=눌러서 켰다 껐다 하기
 *
 * 초보 모드와 무제한 기회가 생김새도 동작도 똑같아서, 글자만 props로 받는 하나로 합쳤다.
 * 값을 기억하는 곳은 useBaseballGame 훅이고 여기는 받은 값을 비추기만 한다.
 */

import styles from './SettingToggle.module.css';

/*
 * label(설정 이름)과 description(부연 설명)을 값으로 받는다.
 * 같은 모양을 쓰는 곳이 둘이므로, 다른 것만 밖에서 넣어주는 편이
 * 파일을 두 개로 복사해 두는 것보다 나중에 모양을 바꾸기 쉽다.
 */
function SettingToggle({ label, description, isOn, onToggle }) {
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
        checked={isOn}
        onChange={onToggle}
      />
      {label}
      <span className={styles.description}>{description}</span>
    </label>
  );
}

export default SettingToggle;
