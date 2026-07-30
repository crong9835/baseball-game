/*
 * 무엇을 하기 전에 한 번 물어보는 확인 창. 물어볼 말은 밖에서 받는다.
 * ConfirmDialog (컨펌 다이얼로그) — confirm=확인하다, dialog=주고받는 창
 *
 * 브라우저의 <dialog> 태그를 쓰면 Esc로 닫기, Tab이 뒤로 새지 않게 가두기,
 * 배경 어둡게(::backdrop)를 직접 만들지 않아도 된다.
 *
 * 예전에는 이 파일이 "새 판을 시작할까요?"라는 문구까지 직접 골랐다.
 * 출제 화면으로 넘어갈 때도 물어보게 되면서 문구 고르는 쪽만 NewGameConfirmDialog로 뺐다.
 * 창을 여닫는 배선은 까다로운 데가 여럿이라(아래 주석들) 한 곳에만 두는 편이 안전하다.
 */

import { useRef, useEffect } from 'react';

import styles from './ConfirmDialog.module.css';

function ConfirmDialog({
  isOpen,
  question,
  description,
  confirmLabel,
  isDestructive,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  /*
   * 이 프로젝트에서 useEffect를 쓰는 곳은 여기 하나뿐이다.
   * <dialog>는 isOpen이 true인 것만으로는 열리지 않고 브라우저의 showModal()을
   * 반드시 불러야 열리기 때문이다. 하나 더 늘리려면 CLAUDE.md의 기준을 먼저 확인하라.
   */
  useEffect(() => {
    if (isOpen) {
      dialogRef.current.showModal();
      return;
    }

    dialogRef.current.close();
  }, [isOpen]);

  /*
   * 되돌릴 수 없는 조작만 경고색(빨강)이고, 나머지는 강조색(형광 초록)이다.
   * 잃는 것이 하나도 없는데 빨간 버튼을 보여주면 무언가 지워지는 줄 알고 취소를 누른다.
   */
  const confirmButtonClassNames = [styles.confirmButton];
  if (isDestructive) {
    confirmButtonClassNames.push(styles.destructiveConfirmButton);
  }

  return (
    /*
     * 닫혀 있을 때 null을 돌려주지 마라. 요소가 사라져서 위의 close()를 부를 대상이 없어진다.
     *
     * onClose가 반드시 있어야 한다. Esc를 누르면 브라우저가 창을 혼자 닫는데,
     * 훅에 알리지 않으면 "화면은 닫혔는데 훅은 아직 묻는 중"으로 어긋난다.
     */
    <dialog ref={dialogRef} className={styles.dialog} onClose={onCancel}>
      <h2 className={styles.title}>{question}</h2>
      <p className={styles.description}>{description}</p>

      {/*
        취소를 앞에 두었다. showModal()은 창 안의 첫 버튼에 포커스를 주므로,
        엔터를 잘못 눌렀을 때 판이 날아가지 않고 취소가 되는 쪽이 안전하다.
        순서를 바꾸지 마라.
      */}
      <div className={styles.buttonRow}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          취소
        </button>
        <button
          type="button"
          className={confirmButtonClassNames.join(' ')}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
