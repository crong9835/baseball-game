/*
 * 게임 규칙을 읽는 화면. 시작 화면의 '설명보기'로 들어온다.
 * HelpScreen (헬프 스크린) — help=도움말, screen=화면
 *
 * 게임 화면과 통째로 갈아 끼우는 화면이라 자기 <main>을 갖는다.
 * 값을 하나도 받지 않는다. 여기 적힌 것은 게임이 어떻게 돌아가든 달라지지 않는 규칙이다.
 */

import styles from './HelpScreen.module.css';

function HelpScreen({ onClose }) {
  /*
   * 판정 세 가지를 설명하는 줄.
   * 배열로 만들어 아래에서 돌려 그린다. 세 줄의 생김새가 똑같아서, JSX로 세 번 적어두면
   * 색이나 여백을 손볼 때 세 군데를 고치게 된다.
   */
  const judgeGuides = [
    { chipClassName: styles.strikeChip, name: '스트라이크', description: '숫자도 자리도 맞았습니다' },
    { chipClassName: styles.ballChip, name: '볼', description: '정답에 있는 숫자인데 자리가 다릅니다' },
    { chipClassName: styles.outChip, name: '아웃', description: '정답에 없는 숫자입니다' },
  ];

  return (
    <main className={styles.help}>
      <header className={styles.header}>
        <h1 className={styles.title}>게임 설명</h1>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          돌아가기
        </button>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>어떤 게임인가요</h2>
        <p className={styles.text}>
          서로 다른 숫자로 만들어진 정답을 맞히는 게임입니다. 숫자가 몇 개인지는 난이도에서
          고릅니다(3·4·5자리). 숫자 버튼을 눌러 입력하고 확인을 누르면 얼마나 맞았는지
          알려주고, 그 결과만 보고 정답을 좁혀 나갑니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>결과 읽는 법</h2>

        <ul className={styles.judgeList}>
          {judgeGuides.map((guide) => (
            <li key={guide.name} className={styles.judgeRow}>
              <span className={[styles.chip, guide.chipClassName].join(' ')}>{guide.name}</span>
              <span className={styles.text}>{guide.description}</span>
            </li>
          ))}
        </ul>

        {/*
          예를 하나 들어야 세 줄이 한 번에 이해된다.
          정답 372에 317을 낸 경우다 — 3은 자리까지 맞고, 7은 있지만 자리가 다르고, 1은 없다.
        */}
        <p className={styles.text}>
          정답이 <b className={styles.exampleNumber}>372</b>일 때{' '}
          <b className={styles.exampleNumber}>317</b>을 내면{' '}
          <b className={styles.exampleResult}>1스트라이크 1볼 1아웃</b>입니다. 세 개를 더하면 항상
          자릿수와 같고, 0개인 것은 적지 않습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>기회는 열 번</h2>
        <p className={styles.text}>
          열 번 안에 맞히면 이깁니다. 이미 냈던 조합은 결과가 뻔하므로 다시 낼 수 없습니다.
          무제한 기회를 켜면 맞힐 때까지 끝나지 않습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>초보 모드</h2>
        <p className={styles.text}>
          켜면 지금까지 알아낸 사실을 숫자 버튼에 색으로 칠해줍니다. 다음에 무엇을 누를지
          고민할 때 도움이 됩니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>바꾸면 새 게임</h2>
        <p className={styles.text}>
          자릿수·무제한 기회·초보 모드를 바꾸면 그 자리에서 새 게임이 시작됩니다. 한 게임은
          처음부터 끝까지 같은 조건이어야 하기 때문입니다. 하던 기록이 있으면 먼저 물어봅니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>친구에게 문제 내기</h2>
        <p className={styles.text}>
          정답을 직접 골라 링크로 만들 수 있습니다. 그 링크를 받은 친구는 같은 조건으로 그
          정답을 맞힙니다. 링크 안에 문제가 통째로 들어 있어서, 주소만 보내면 됩니다.
        </p>
      </section>
    </main>
  );
}

export default HelpScreen;
