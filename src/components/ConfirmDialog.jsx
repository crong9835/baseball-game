/*
 * 진행 중인 판이 사라지기 전에 한 번 물어보는 확인 창.
 * ConfirmDialog (컨펌 다이얼로그) — confirm=확인하다, dialog=주고받는 창
 *
 * 브라우저의 <dialog> 태그를 쓰면 Esc로 닫기, 뒤쪽 요소로 Tab이 새지 않게 가두기,
 * 배경 어둡게(::backdrop)를 직접 만들지 않아도 브라우저가 해준다.
 */

import { useRef, useEffect } from 'react';

import { NEW_GAME_REASON } from '../constants/gameConstants.js';
import styles from './ConfirmDialog.module.css';

/*
 * 무엇 때문에 뜬 창인지를 그대로 질문으로 만든다.
 * getQuestion (겟 퀘스천) — get=가져오다, question=질문
 *
 * "지금 판을 지우고 새로 시작할까요?"만 물으면 안 되는 이유:
 * 확인을 받기 전에는 state를 바꾸지 않으므로 체크박스가 눌리기 전 모습으로 돌아가 있다.
 * 초보 모드를 켜려고 눌렀는데 창에 그 말이 없으면, 취소한 사람은 설정이 안 켜진 채로 남고
 * 확인한 사람은 생각지도 못한 힌트 색을 보게 된다.
 *
 * 중첩 삼항연산자 대신 if로 하나씩 풀어 썼다.
 */
function getQuestion(pendingNewGame) {
  const { reason, settings } = pendingNewGame;

  if (reason === NEW_GAME_REASON.DIGIT_COUNT) {
    return `${settings.digitCount}자리로 바꿀까요?`;
  }

  if (reason === NEW_GAME_REASON.BEGINNER_MODE) {
    if (settings.isBeginnerMode) {
      return '초보 모드를 켤까요?';
    }
    return '초보 모드를 끌까요?';
  }

  if (reason === NEW_GAME_REASON.UNLIMITED_MODE) {
    if (settings.isUnlimitedMode) {
      return '무제한 기회를 켤까요?';
    }
    return '무제한 기회를 끌까요?';
  }

  /*
   * 받은 문제에서는 "새 판을 시작할까요?"라고 물으면 안 된다.
   * 같은 문제를 처음부터 다시 푸는 줄로 읽히는데, 실제로는 그 문제에서 아주 나가는 조작이다.
   */
  if (reason === NEW_GAME_REASON.LEAVE_SHARED_PUZZLE) {
    return '친구가 낸 문제를 그만둘까요?';
  }

  // 남은 하나는 '다시하기'다. 바뀌는 설정이 없으므로 판을 새로 깐다는 말만 하면 된다.
  return '새 판을 시작할까요?';
}

/*
 * 확인 버튼에 적을 글자를 고른다.
 * getConfirmLabel (겟 컨펌 레이블) — get=골라서 돌려준다, confirm=확인하다, label=붙이는 글자
 *
 * 질문과 버튼이 맞물려야 한다. "친구가 낸 문제를 그만둘까요?"라고 묻고 버튼에
 * "새 판 시작"이라고 적혀 있으면, 묻는 말과 답하는 말이 서로 다른 이야기를 한다.
 *
 * getQuestion과 나란히 두었다. 질문을 고치는 사람이 버튼도 같이 보게 하려는 것이다.
 */
function getConfirmLabel(pendingNewGame) {
  if (pendingNewGame.reason === NEW_GAME_REASON.LEAVE_SHARED_PUZZLE) {
    return '그만두기';
  }

  // 나머지 넷(다시하기와 설정 셋)은 전부 판을 새로 까는 조작이라 이 말이 그대로 맞다.
  return '새 판 시작';
}

function ConfirmDialog({ isOpen, pendingNewGame, attemptCount, onConfirm, onCancel }) {
  /*
   * useRef (유즈레프) — 화면에 그려진 실제 DOM 요소를 붙잡아 두는 훅.
   * state와 달리 값이 바뀌어도 화면을 다시 그리지 않는다. 여기서는 아래 <dialog>에
   * ref={dialogRef}를 달아, 그 요소의 showModal() 함수를 부르려고 쓴다.
   */
  const dialogRef = useRef(null);

  /*
   * useEffect (유즈이펙트) — 화면을 다 그린 뒤, React 바깥 세상과 맞추는 훅.
   *
   * 이 프로젝트에서 useEffect를 쓰는 곳은 여기 하나뿐이고 그럴 만한 이유가 있다.
   * <dialog>는 "isOpen이 true다"만으로는 열리지 않고 showModal()이라는 함수를 반드시 불러야
   * 열리는데, 그 함수는 React가 아니라 브라우저의 것이다. state에서 계산되는 값을
   * useEffect로 베껴 두는 것(그건 하면 안 되는 일)과는 전혀 다른 용도다.
   *
   * 마지막 [isOpen]은 "이 값이 달라졌을 때만 다시 실행하라"는 뜻이다.
   */
  useEffect(() => {
    if (isOpen) {
      dialogRef.current.showModal();
      return;
    }

    dialogRef.current.close();
  }, [isOpen]);

  /*
   * 닫혀 있는 동안에는 pendingNewGame이 null이라 질문을 만들 수 없다.
   * 그때는 어차피 화면에 안 보이므로 빈 글자를 넣어 둔다.
   */
  let question = '';
  let confirmLabel = '';
  if (pendingNewGame !== null) {
    question = getQuestion(pendingNewGame);
    confirmLabel = getConfirmLabel(pendingNewGame);
  }

  return (
    /*
     * 닫혀 있을 때도 <dialog> 자체는 계속 그려 둔다.
     * 여기서 null을 돌려주면 요소가 사라져서 위의 close()를 부를 대상이 없어진다.
     * (닫힌 <dialog>는 브라우저가 알아서 감추므로 화면에는 아무것도 보이지 않는다)
     *
     * onClose를 단 이유: Esc를 누르면 브라우저가 창을 혼자 닫아 버린다.
     * 그때 훅에게 알리지 않으면 "화면은 닫혔는데 훅은 아직 묻는 중"으로 어긋난다.
     */
    <dialog ref={dialogRef} className={styles.dialog} onClose={onCancel}>
      <h2 className={styles.title}>{question}</h2>
      <p className={styles.description}>
        지금 판이 지워집니다. {attemptCount}번 시도한 기록이 사라집니다.
      </p>

      {/*
        취소를 앞에 두었다. showModal()은 창 안의 첫 버튼에 포커스를 주므로,
        엔터를 잘못 눌렀을 때 판이 날아가지 않고 취소가 되는 쪽이 안전하다.
      */}
      <div className={styles.buttonRow}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          취소
        </button>
        <button type="button" className={styles.confirmButton} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
