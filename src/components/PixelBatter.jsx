/*
 * 날아오는 공을 배트로 치는 사람 도트 그림. 시작 화면 가운데에 놓는다.
 * PixelBatter (픽셀 배터) — pixel=화면의 점 하나, batter=(야구의) 타자
 *
 * 그림 파일 대신 사각형을 하나씩 찍어서 그린다. 크게 늘려도 흐려지지 않고,
 * 색을 이 앱의 CSS 변수로 줄 수 있어 화면 색을 바꾸면 그림도 따라온다.
 */

import styles from './PixelBatter.module.css';

// 그림 한 장의 가로·세로 점 개수. 아래 그림표의 줄 수·글자 수와 반드시 같아야 한다.
const GRID_SIZE = 16;

/*
 * 그림표에 쓰는 글자와 그 색.
 * 여기 없는 글자(마침표)는 점을 찍지 않는 빈 자리다.
 */
const PIXEL_COLORS = {
  R: 'var(--color-batter-accent)',
  S: 'var(--color-batter-skin)',
  W: 'var(--color-batter-uniform)',
  B: 'var(--color-batter-bat)',
  K: 'var(--color-batter-shoe)',
  O: 'var(--color-batter-ball)',

  /*
   * 눈 한 점. 이 한 점이 없으면 얼굴이 그냥 살색 네모라 사람으로 안 보인다.
   * 오른쪽을 보고 있다는 것도 이 점 하나로 정해진다(공이 날아오는 쪽과 같아야 한다).
   */
  E: 'var(--color-batter-eye)',
};

/*
 * 휘두르는 동작 네 장. 글자 한 개가 점 한 개다.
 *
 * 배트를 세운 준비 자세 → 내려오는 중 → 맞히는 순간 → 끝까지 돌린 자세로 이어진다.
 * 배트 끝이 반원을 그리며 내려오는 동안, 공(O)은 오른쪽 아래에서 날아 들어와
 * 셋째 장에서 배트 끝에 닿고 넷째 장에서 오른쪽 위로 튀어 나간다(맞으면 오던 쪽으로 돌아간다).
 *
 * 공이 배트보다 한 박자 먼저 움직이면 안 된다. 셋째 장에서 배트 끝과 공이 반드시
 * 붙어 있어야 "맞았다"로 보인다. 한 칸이라도 떨어지면 스쳐 지나간 것처럼 보인다.
 *
 * 몸통이 네 번 되풀이되지만 공통 부분을 따로 빼지 않았다.
 * 이대로 두면 한 장이 소스에서 그림으로 보여서, 배트나 공 위치를 고칠 때 눈으로 찾을 수 있다.
 * 몸과 배트를 나눠 두면 그 그림이 사라지고 머릿속에서 두 장을 겹쳐야 한다.
 *
 * 장수를 늘리거나 줄이면 PixelBatter.module.css의 폭·steps()도 같이 고쳐야 한다.
 * CSS는 이 배열의 길이를 읽을 방법이 없어서 숫자를 직접 적어두었다.
 */
const SWING_FRAMES = [
  [
    '..............BB',
    '.............BB.',
    '...RRRR.....BB..',
    '..RRRRRRR..BB...',
    '..RSSES...BB....',
    '...SSSS..BB.....',
    '..WWWWWWSS......',
    '..WWWWWW........',
    '..WWWWWW........',
    '..RRRRRR......OO',
    '..WWWWWW......OO',
    '..WW..WW........',
    '..RR..RR........',
    '..RR..RR........',
    '.KKK..KKK.......',
    '................',
  ],
  [
    '................',
    '................',
    '...RRRR.........',
    '..RRRRRRR.......',
    '..RSSES...BBBB..',
    '...SSSS..BB.....',
    '..WWWWWWSS......',
    '..WWWWWW........',
    '..WWWWWW....OO..',
    '..RRRRRR....OO..',
    '..WWWWWW........',
    '..WW..WW........',
    '..RR..RR........',
    '..RR..RR........',
    '.KKK..KKK.......',
    '................',
  ],
  [
    '................',
    '................',
    '...RRRR.........',
    '..RRRRRRR.......',
    '..RSSES.........',
    '...SSSS.........',
    '..WWWWWW......OO',
    '..WWWWWWSSBBBBOO',
    '..WWWWWW........',
    '..RRRRRR........',
    '..WWWWWW........',
    '..WW..WW........',
    '..RR..RR........',
    '..RR..RR........',
    '.KKK..KKK.......',
    '................',
  ],
  [
    '................',
    '.............OO.',
    '...RRRR......OO.',
    '..RRRRRRR.......',
    '..RSSES.........',
    '...SSSS.........',
    '..WWWWWW........',
    '..WWWWWWSS......',
    '..WWWWWW..BB....',
    '..RRRRRR...BB...',
    '..WWWWWW....BB..',
    '..WW..WW.....BB.',
    '..RR..RR........',
    '..RR..RR........',
    '.KKK..KKK.......',
    '................',
  ],
];

/**
 * 그림 한 장을 사각형 목록으로 바꾼다.
 * createFrameRects (크리에이트 프레임 렉츠) — frame=(만화의) 한 컷, rect=rectangle의 줄임말, 사각형
 *
 * key에 줄·칸 번호를 같이 넣는 이유는 한 장 안에 사각형이 백 개 넘게 들어가는데
 * 번호가 겹치면 React가 어느 것이 어느 것인지 구분하지 못하기 때문이다.
 */
function createFrameRects(frame) {
  const rects = [];

  for (let rowIndex = 0; rowIndex < frame.length; rowIndex += 1) {
    const row = frame[rowIndex];

    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      const letter = row[columnIndex];
      const color = PIXEL_COLORS[letter];

      if (color === undefined) {
        continue;
      }

      rects.push(
        <rect
          key={`${rowIndex}-${columnIndex}`}
          x={columnIndex}
          y={rowIndex}
          width="1"
          height="1"
          fill={color}
        />,
      );
    }
  }

  return rects;
}

function PixelBatter() {
  /*
   * aria-hidden은 화면을 읽어주는 프로그램에게 이 그림을 건너뛰라고 알린다.
   * 뜻을 담은 그림이 아니라 분위기를 내는 장식이라, 읽어주면 시작 버튼에 닿기까지가 길어진다.
   */
  return (
    <div className={styles.window} aria-hidden="true">
      <div className={styles.filmstrip}>
        {SWING_FRAMES.map((frame, frameIndex) => (
          <svg
            key={frameIndex}
            className={styles.frame}
            viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
            shapeRendering="crispEdges"
          >
            {createFrameRects(frame)}
          </svg>
        ))}
      </div>
    </div>
  );
}

export default PixelBatter;
