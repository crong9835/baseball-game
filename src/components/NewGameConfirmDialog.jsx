/*
 * 진행 중인 판이 사라지기 전에 물어보는 확인 창의 '문구'를 고르는 컴포넌트.
 * NewGameConfirmDialog (뉴 게임 컨펌 다이얼로그) — new game=새 판
 *
 * 창을 여닫는 일은 ConfirmDialog가 하고, 이 파일은 무엇 때문에 뜬 창인지에 맞는
 * 질문·설명·버튼 글자를 골라 넘기기만 한다. 그래서 짝꿍 css 파일이 없다.
 */

import { NEW_GAME_REASON } from '../constants/gameConstants.js';
import ConfirmDialog from './ConfirmDialog.jsx';

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

  // 남은 하나는 '다시하기'다. 바뀌는 설정이 없으므로 새로 시작한다는 말만 하면 된다.
  return '새 게임을 시작할까요?';
}

/**
 * 확인 버튼에 적을 글자를 고른다.
 * getConfirmLabel (겟 컨펌 레이블) — get=골라서 돌려준다, label=붙이는 글자
 *
 * "친구가 낸 문제를 그만둘까요?"라고 묻고 버튼에 "새 게임 시작"이라고 적혀 있으면,
 * 묻는 말과 답하는 말이 서로 다른 이야기를 한다.
 * getQuestion 바로 아래에 두었으니 질문을 고칠 때 이것도 같이 보라.
 */
function getConfirmLabel(pendingNewGame) {
  if (pendingNewGame.reason === NEW_GAME_REASON.LEAVE_SHARED_PUZZLE) {
    return '그만두기';
  }

  return '새 게임 시작';
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
  return `하던 게임이 사라집니다. ${attemptCount}번 시도한 기록이 지워집니다.`;
}

function NewGameConfirmDialog({ isOpen, pendingNewGame, attemptCount, onConfirm, onCancel }) {
  /*
   * 닫혀 있는 동안에는 pendingNewGame이 null이라 문구를 만들 수 없다.
   * 그때는 어차피 화면에 안 보이므로 빈 글자를 넘겨 둔다.
   *
   * 여기서 return null을 하면 안 된다. ConfirmDialog가 사라지면 창을 닫을 대상이 없어진다.
   */
  let question = '';
  let confirmLabel = '';
  let description = '';
  if (pendingNewGame !== null) {
    question = getQuestion(pendingNewGame);
    confirmLabel = getConfirmLabel(pendingNewGame);
    description = getDescription(pendingNewGame, attemptCount);
  }

  // 이 창이 묻는 넷은 전부 판을 지우는 조작이라 확인 버튼이 경고색이다.
  return (
    <ConfirmDialog
      isOpen={isOpen}
      question={question}
      description={description}
      confirmLabel={confirmLabel}
      isDestructive={true}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export default NewGameConfirmDialog;
