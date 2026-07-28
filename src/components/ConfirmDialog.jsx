/*
 * 진행 중인 판이 사라지기 전에 한 번 물어보는 확인 창.
 * ConfirmDialog (컨펌 다이얼로그) — confirm=확인하다, dialog=주고받는 창
 *
 * 브라우저의 <dialog> 태그를 쓰면 Esc로 닫기, Tab이 뒤로 새지 않게 가두기,
 * 배경 어둡게(::backdrop)를 직접 만들지 않아도 된다.
 */

import { useRef, useEffect } from 'react';

import { NEW_GAME_REASON } from '../constants/gameConstants.js';
import styles from './ConfirmDialog.module.css';

/**
 * 무엇 때문에 뜬 창인지를 그대로 질문으로 만든다.
 * getQuestion (겟 퀘스천) — get=가져오다, question=질문
 *
 * "지금 판을 지우고 새로 시작할까요?"만 물으면 안 되는 이유:
 * 확인을 받기 전에는 state를 바꾸지 않으므로 체크박스가 눌리기 전 모습으로 돌아가 있다.
 * 초보 모드를 켜려고 눌렀는데 창에 그 말이 없으면 무엇 때문에 뜬 창인지 알 수 없다.
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

  // "새 판을 시작할까요?"라고 물으면 같은 문제를 다시 푸는 줄로 읽히는데,
  // 실제로는 그 문제에서 아주 나가는 조작이다.
  if (reason === NEW_GAME_REASON.LEAVE_SHARED_PUZZLE) {
    return '친구가 낸 문제를 그만둘까요?';
  }

  // 남은 하나는 '다시하기'다. 바뀌는 설정이 없으므로 판을 새로 깐다는 말만 하면 된다.
  return '새 판을 시작할까요?';
}

/**
 * 확인 버튼에 적을 글자를 고른다.
 * getConfirmLabel (겟 컨펌 레이블) — get=골라서 돌려준다, label=붙이는 글자
 *
 * "친구가 낸 문제를 그만둘까요?"라고 묻고 버튼에 "새 판 시작"이라고 적혀 있으면,
 * 묻는 말과 답하는 말이 서로 다른 이야기를 한다.
 * getQuestion 바로 아래에 두었으니 질문을 고칠 때 이것도 같이 보라.
 */
function getConfirmLabel(pendingNewGame) {
  if (pendingNewGame.reason === NEW_GAME_REASON.LEAVE_SHARED_PUZZLE) {
    return '그만두기';
  }

  return '새 판 시작';
}

/**
 * 확인을 누르면 무엇을 잃는지 적는다.
 * getDescription (겟 디스크립션) — description=설명
 *
 * 잃는 것을 기록 개수로만 적으면 안 된다. 받은 문제를 그만둘 때는 아직 한 번도 안 냈어도
 * 창이 뜨는데, 그때 "0번 시도한 기록이 사라집니다"는 잃을 것이 없다는 말로 읽힌다.
 * 실제로 잃는 것은 기록이 아니라 문제 자체다.
 */
function getDescription(pendingNewGame, attemptCount) {
  const hasRecord = attemptCount > 0;

  if (pendingNewGame.reason === NEW_GAME_REASON.LEAVE_SHARED_PUZZLE) {
    if (hasRecord) {
      return `이 문제는 다시 열 수 없습니다. ${attemptCount}번 시도한 기록도 사라집니다.`;
    }
    return '이 문제는 다시 열 수 없습니다. 다시 풀려면 친구에게 링크를 새로 받아야 합니다.';
  }

  // 나머지는 기록이 있을 때만 창이 뜨므로 개수를 그대로 적으면 된다.
  return `지금 판이 지워집니다. ${attemptCount}번 시도한 기록이 사라집니다.`;
}

function ConfirmDialog({ isOpen, pendingNewGame, attemptCount, onConfirm, onCancel }) {
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

  // 닫혀 있는 동안에는 pendingNewGame이 null이라 질문을 만들 수 없다.
  // 그때는 어차피 화면에 안 보이므로 빈 글자를 넣어 둔다.
  let question = '';
  let confirmLabel = '';
  let description = '';
  if (pendingNewGame !== null) {
    question = getQuestion(pendingNewGame);
    confirmLabel = getConfirmLabel(pendingNewGame);
    description = getDescription(pendingNewGame, attemptCount);
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
        <button type="button" className={styles.confirmButton} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
