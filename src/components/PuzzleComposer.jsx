/*
 * 친구에게 보낼 문제를 만드는 화면.
 * PuzzleComposer (퍼즐 컴포저) — puzzle=문제, compose=(작품을) 짓다 → 문제를 짓는 것
 *
 * 게임 화면과 통째로 갈아 끼우는 화면이라 자기 <main>을 갖는다.
 * 값은 전부 usePuzzleComposer 훅이 갖고 있다.
 */

import DifficultySelector from './DifficultySelector.jsx';
import GuessInput from './GuessInput.jsx';
import NumberPad from './NumberPad.jsx';
import SettingToggle from './SettingToggle.jsx';
import styles from './PuzzleComposer.module.css';

function PuzzleComposer({
  digitCount,
  isUnlimitedMode,
  isBeginnerMode,
  pickedAnswer,
  isPickedAnswerFull,
  puzzleLink,
  isLinkCopied,
  isCopyFailed,
  onClose,
  onDigitToggle,
  onBackspace,
  onChangeDigitCount,
  onToggleUnlimitedMode,
  onToggleBeginnerMode,
  onCopyLink,
}) {
  // 정답을 다 고르기 전에는 링크가 없다. 그때는 무엇을 하면 되는지 대신 적어준다.
  let linkText = `숫자 ${digitCount}개를 고르면 여기에 링크가 나옵니다`;
  if (puzzleLink !== null) {
    linkText = puzzleLink;
  }

  /*
   * 복사 버튼을 누른 결과를 한 줄로 알린다. 둘은 훅에서 하나만 참이 되게 만들어져 있다.
   *
   * 실패했을 때 아무 말도 없으면 버튼이 고장 난 것으로 보인다.
   * 무엇을 하면 되는지(위 링크를 직접 복사)까지 적어야 막다른 길이 되지 않는다.
   */
  let copyNotice = '';
  if (isLinkCopied) {
    copyNotice = '복사했습니다 · 친구에게 붙여넣으세요';
  }
  if (isCopyFailed) {
    copyNotice = '복사가 안 됐습니다 · 위 링크를 직접 복사하세요';
  }

  // 성공은 강조색, 실패는 경고색으로 칠한다.
  const copyNoticeClassNames = [styles.copyNotice];
  if (isCopyFailed) {
    copyNoticeClassNames.push(styles.copyFailedNotice);
  }

  return (
    <main className={styles.composer}>
      <header className={styles.header}>
        <h1 className={styles.title}>문제 내기</h1>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      </header>

      <p className={styles.guide}>
        조건을 정하고 정답을 직접 고르세요. 만들어진 링크를 받은 친구가 그 정답을 맞힙니다.
      </p>

      {/*
        조건 셋을 위에 모아둔다. 정답보다 먼저 정해야 하는 것이기 때문이다.
        자릿수를 나중에 바꾸면 고르던 숫자가 지워지는데, 순서대로 내려오면 그럴 일이 없다.

        isLocked는 false다. 잠기는 것은 "받은 문제를 푸는 쪽"이다.
      */}
      <DifficultySelector digitCount={digitCount} isLocked={false} onSelect={onChangeDigitCount} />

      {/*
        설명에 "바꾸면 새 판"을 적지 않았다. 아직 시작하지도 않은 판이라
        실제로 지워지는 것이 없기 때문이다.
      */}
      <div className={styles.settings}>
        <SettingToggle
          label="초보 모드"
          description="친구에게 힌트 색을 보여줍니다"
          isOn={isBeginnerMode}
          isLocked={false}
          onToggle={onToggleBeginnerMode}
        />
        <SettingToggle
          label="무제한 기회"
          description="친구가 맞힐 때까지 끝나지 않습니다"
          isOn={isUnlimitedMode}
          isLocked={false}
          onToggle={onToggleUnlimitedMode}
        />
      </div>

      <GuessInput currentGuess={pickedAnswer} digitCount={digitCount} />

      {/*
        게임 화면의 숫자 패드를 그대로 다시 쓴다. 숫자를 눌러 고르고 다시 눌러 빼는 동작이
        정확히 같아서, 비슷한 패드를 하나 더 만들면 나중에 두 군데를 고쳐야 한다.

        게임에서만 쓰는 값 넷은 "없음"에 해당하는 값을 넘긴다.
        digitHints에 빈 객체를 넘기는 이유는 패드가 digitHints[숫자]를 꺼내 보기 때문이다.
        넘기지 않으면 undefined에서 꺼내려다 오류가 난다.
        isBeginnerMode가 false인 이유는 위의 체크박스가 "친구 화면"을 켜고 끄는 것이지
        지금 이 패드에 색을 칠하라는 뜻이 아니기 때문이다.
      */}
      <NumberPad
        currentGuess={pickedAnswer}
        digitHints={{}}
        duplicateAttemptNumber={null}
        isDuplicateGuess={false}
        isBeginnerMode={false}
        isGuessFull={isPickedAnswerFull}
        isGameOver={false}
        submitLabel="링크 복사하기"
        onDigitToggle={onDigitToggle}
        onBackspace={onBackspace}
        onSubmit={onCopyLink}
      />

      {/*
        링크는 복사 버튼과 별개로 글자로도 보여준다.
        브라우저가 복사를 막는 경우가 있어서, 그때는 손으로 긁어 갈 수 있어야 한다.
      */}
      <section className={styles.linkSection}>
        <p className={styles.link}>{linkText}</p>
        <p className={copyNoticeClassNames.join(' ')}>{copyNotice}</p>
      </section>
    </main>
  );
}

export default PuzzleComposer;
