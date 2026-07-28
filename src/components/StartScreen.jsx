/*
 * 앱을 켜면 가장 먼저 나오는 화면. 시작하기와 설명보기 두 버튼만 있다.
 * StartScreen (스타트 스크린) — start=시작, screen=화면
 *
 * 게임 화면과 통째로 갈아 끼우는 화면이라 자기 <main>을 갖는다.
 */

import PixelBatter from './PixelBatter.jsx';
import styles from './StartScreen.module.css';

function StartScreen({
  isSharedPuzzle,
  hasPreviousGame,
  isBrokenPuzzleLink,
  onStart,
  onOpenHelp,
}) {
  /*
   * 버튼 글자는 세 갈래다. 기본값을 먼저 정하고 조건에 맞으면 덮어쓴다.
   *
   * 친구 링크로 들어온 사람에게 "시작하기"라고만 적혀 있으면 링크가 제대로 열린 것인지
   * 눌러보기 전에는 알 수 없다.
   *
   * 순서를 바꾸지 마라. 하던 판이 있는지를 마지막에 본다. 친구 문제를 풀던 중에 제목을
   * 눌러 나온 경우에는 "친구 문제 풀기"가 아니라 "게임으로 돌아가기"가 맞다.
   * 앞의 글자는 이제부터 시작한다는 말이라, 기록이 쌓여 있는데 그렇게 적으면 눌렀을 때
   * 기록이 지워지는 줄 알고 못 누른다.
   *
   * 여기서는 "돌아가기"라고 적어도 된다. 실제로 돌아갈 판이 남아 있기 때문이다.
   * (받은 문제를 그만두는 버튼에 그 말을 쓰지 말라는 것은 그쪽에 돌아갈 판이 없어서다)
   */
  let startLabel = '시작하기';
  if (isSharedPuzzle) {
    startLabel = '친구 문제 풀기';
  }
  if (hasPreviousGame) {
    startLabel = '게임으로 돌아가기';
  }

  return (
    <main className={styles.start}>
      {/*
        한 겹 더 감싸는 이유는 이 덩어리를 화면 세로 가운데에 놓기 위해서다.
        까닭은 StartScreen.module.css의 .content에 적어두었다.
      */}
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>숫자 야구</h1>
          <p className={styles.tagline}>숨겨진 숫자를 맞혀보세요</p>
        </header>

        <PixelBatter />

        {/*
          친구 문제가 도착했다는 것을 시작 전에 알린다.
          누르고 나서 알게 되면 "이게 친구가 낸 문제였나"를 판이 시작된 뒤에 깨닫는다.
        */}
        {isSharedPuzzle && (
          <p className={styles.sharedPuzzleNotice}>
            친구가 낸 문제가 도착했습니다 · 조건도 친구가 정했습니다
          </p>
        )}

        {/*
          링크는 왔는데 글자가 망가져 있던 경우.
          말없이 평소 게임을 시작하면 친구 문제를 푸는 줄 알고 다른 문제를 풀게 된다.
          게임 화면에도 같은 안내가 있지만, 시작 전에 알아야 링크를 다시 받고 들어올 수 있다.
        */}
        {isBrokenPuzzleLink && (
          <p className={styles.brokenLinkNotice}>
            링크가 망가져 있습니다 · 시작하면 평소 게임이 됩니다
          </p>
        )}

        {/*
          설명보기를 조용한 모양으로 둔 것은 뒤로 물러나라는 뜻이 아니라,
          이 화면에서 눈이 먼저 닿아야 할 곳이 시작하기 하나이기 때문이다.
        */}
        <div className={styles.buttonRow}>
          <button type="button" className={styles.startButton} onClick={onStart}>
            {startLabel}
          </button>
          <button type="button" className={styles.helpButton} onClick={onOpenHelp}>
            설명보기
          </button>
        </div>
      </div>
    </main>
  );
}

export default StartScreen;
