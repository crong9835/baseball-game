/*
 * 지금 입력 중인 숫자를 3칸으로 보여주는 컴포넌트.
 * 부모(App)가 준 값을 그리기만 하고, 스스로 기억하거나 바꾸는 것은 하나도 없다.
 * 이렇게 "받아서 보여주기만" 하는 컴포넌트가 가장 다루기 쉽고 버그도 적다.
 */

import { DIGIT_COUNT } from '../constants/gameConstants.js';

// 아직 입력하지 않은 칸에 보여줄 글자
const EMPTY_SLOT_TEXT = '_';

/**
 * 화면에 그릴 칸 정보를 만든다.
 *
 * 입력이 1개뿐이어도 칸은 항상 DIGIT_COUNT개를 그려야 하므로,
 * currentGuess를 그대로 map 하지 않고 칸 배열을 따로 만든다.
 * (그대로 map 하면 입력이 1개일 때 칸도 1개만 그려진다)
 */
function createSlots(currentGuess) {
  const slots = [];

  for (let position = 0; position < DIGIT_COUNT; position += 1) {
    const digit = currentGuess[position];
    const hasDigit = digit !== undefined;

    let text = EMPTY_SLOT_TEXT;
    if (hasDigit) {
      text = String(digit);
    }

    slots.push({ position, text });
  }

  return slots;
}

function GuessInput({ currentGuess }) {
  const slots = createSlots(currentGuess);

  return (
    <div>
      {slots.map((slot) => (
        <span key={slot.position}>{slot.text}</span>
      ))}
    </div>
  );
}

export default GuessInput;
