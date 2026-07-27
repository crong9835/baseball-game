/*
 * 진행 중인 판이 사라지기 전에 한 번 물어보는 확인 창.
 * 브라우저의 <dialog> 태그를 쓰면 Esc로 닫기, 뒤쪽 요소로 Tab이 새지 않게 가두기,
 * 배경 어둡게(::backdrop)를 직접 만들지 않아도 브라우저가 해준다.
 */

import { useRef, useEffect } from 'react';

import styles from './ConfirmDialog.module.css';

function ConfirmDialog({ isOpen, attemptCount, onConfirm, onCancel }) {
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
      <h2 className={styles.title}>지금 판을 지우고 새로 시작할까요?</h2>
      <p className={styles.description}>{attemptCount}번 시도한 기록이 사라집니다.</p>

      {/*
        취소를 앞에 두었다. showModal()은 창 안의 첫 버튼에 포커스를 주므로,
        엔터를 잘못 눌렀을 때 판이 날아가지 않고 취소가 되는 쪽이 안전하다.
      */}
      <div className={styles.buttonRow}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          취소
        </button>
        <button type="button" className={styles.confirmButton} onClick={onConfirm}>
          새 판 시작
        </button>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
