/*
 * 지금 어느 화면(시작·설명·게임)을 보여줄지만 갖고 있는 커스텀 훅.
 * useScreen (유즈 스크린) — screen=화면
 *
 * useBaseballGame과 따로 둔 이유는 하는 일이 상관없기 때문이다.
 * 화면을 바꿔도 진행 중인 판은 그대로 있고, 판이 어떻게 돌아가든 화면 이름은 달라지지 않는다.
 */

import { useState } from 'react';

import { SCREEN } from '../constants/gameConstants.js';

export function useScreen() {
  const [screen, setScreen] = useState(SCREEN.START);

  // handleStart (핸들 스타트) — start=시작하다
  function handleStart() {
    setScreen(SCREEN.GAME);
  }

  // handleOpenHelp (핸들 오픈 헬프) — help=도움말
  function handleOpenHelp() {
    setScreen(SCREEN.HELP);
  }

  /*
   * 게임 화면에서 제목을 눌렀을 때 시작 화면으로 나간다.
   *
   * 하던 판은 지우지 않는다. 이 훅은 화면 이름만 갖고 있어서 게임 state에 손댈 방법이
   * 아예 없다. 그래서 다시 들어가면 기록이 그대로 있고, 잃을 것이 없으니 확인 창도 없다.
   */
  function handleGoToStart() {
    setScreen(SCREEN.START);
  }

  /*
   * 설명을 다 읽으면 게임이 아니라 시작 화면으로 돌아간다.
   * 설명을 보러 들어온 사람은 아직 시작하겠다고 누른 적이 없다. 읽자마자 판이 시작되면
   * 규칙을 확인만 하려던 사람이 그대로 게임에 떨어진다.
   */
  function handleCloseHelp() {
    setScreen(SCREEN.START);
  }

  // 게임 훅과 같은 이유로 setScreen은 내보내지 않는다.
  return {
    screen,
    handleStart,
    handleOpenHelp,
    handleCloseHelp,
    handleGoToStart,
  };
}
