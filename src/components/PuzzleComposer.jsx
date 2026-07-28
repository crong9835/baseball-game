/*
 * 친구에게 보낼 문제를 만드는 화면.
 * PuzzleComposer (퍼즐 컴포저) — puzzle=문제, compose=(작품을) 짓다 → 문제를 짓는 것
 *
 * 게임 화면과 통째로 갈아 끼우는 화면이라 자기 <main>을 갖는다.
 * 값은 전부 usePuzzleComposer 훅이 갖고 있고, 여기는 받아서 그리고 눌린 것을 알리기만 한다.
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
  onClose,
  onDigitToggle,
  onBackspace,
  onChangeDigitCount,
  onToggleUnlimitedMode,
  onToggleBeginnerMode,
  onCopyLink,
}) {
  /*
   * 정답을 다 고르기 전에는 링크가 없다. 그때는 무엇을 하면 되는지 대신 적어준다.
   * 중첩 삼항연산자 대신 기본값을 먼저 정하고 조건에 맞으면 덮어쓴다.
   */
  let linkText = `숫자 ${digitCount}개를 고르면 여기에 링크가 나옵니다`;
  if (puzzleLink !== null) {
    linkText = puzzleLink;
  }

  let copyNotice = '';
  if (isLinkCopied) {
    copyNotice = '복사했습니다 · 친구에게 붙여넣으세요';
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

        여기서는 isLocked에 false를 넘긴다. 잠기는 것은 "받은 문제를 푸는 쪽"이고
        문제를 내는 쪽은 당연히 다 바꿀 수 있어야 한다.
      */}
      <DifficultySelector digitCount={digitCount} isLocked={false} onSelect={onChangeDigitCount} />

      {/*
        설명에 "바꾸면 새 판"을 적지 않았다. 게임 화면과 달리 여기는 아직 시작하지도 않은
        판이라 잃을 기록이 없고, 실제로 아무것도 지워지지 않는다.
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
        정확히 같아서, 여기에 비슷한 패드를 하나 더 만들면 나중에 두 군데를 고쳐야 한다.

        게임에서만 쓰는 값 넷은 "없음"에 해당하는 값을 넘긴다.
        - digitHints={{}}      : 문제를 내는 중에는 기록이 없으니 힌트도 없다.
                                 빈 객체를 넘기는 이유는 패드가 digitHints[숫자]를 꺼내 보기 때문이다.
                                 넘기지 않으면 undefined에서 꺼내려다 오류가 난다
        - isBeginnerMode={false}: 위의 초보 모드 체크박스는 "친구 화면"을 켜고 끄는 것이지
                                 지금 이 패드에 색을 칠하라는 뜻이 아니다
        - isDuplicateGuess      : 같은 조합을 두 번 내는 개념 자체가 없다
        - isGameOver            : 여기는 게임이 아니다
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

        복사 안내는 나타났다 사라지는 글자라 CSS에서 자리를 미리 비워둔다.
        그러지 않으면 복사를 누르는 순간 화면이 아래로 밀린다.
      */}
      <section className={styles.linkSection}>
        <p className={styles.link}>{linkText}</p>
        <p className={styles.copyNotice}>{copyNotice}</p>
      </section>
    </main>
  );
}

export default PuzzleComposer;
