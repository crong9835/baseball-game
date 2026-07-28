/*
 * 지금 입력 중인 숫자를 자릿수만큼의 칸으로 보여주는 컴포넌트.
 * GuessInput (게스 인풋) — guess=추측(입력한 숫자), input=입력
 *
 * 받은 값을 그리기만 하고, 스스로 기억하거나 바꾸는 것은 하나도 없다.
 */

import styles from './GuessInput.module.css';

// 아직 입력하지 않은 칸에 보여줄 글자
const EMPTY_SLOT_TEXT = '_';

/**
 * 화면에 그릴 칸 정보를 만든다.
 * createSlots (크리에이트 슬롯츠) — create=만들다, slot=(무언가 들어갈) 칸
 *
 * 입력이 1개뿐이어도 칸은 항상 digitCount개를 그려야 한다.
 * currentGuess를 그대로 map 하면 입력이 1개일 때 칸도 1개만 그려진다.
 */
function createSlots(currentGuess, digitCount) {
  const slots = [];

  for (let position = 0; position < digitCount; position += 1) {
    const digit = currentGuess[position];
    const hasDigit = digit !== undefined;

    let text = EMPTY_SLOT_TEXT;
    if (hasDigit) {
      text = String(digit);
    }

    slots.push({ position, text, hasDigit });
  }

  return slots;
}

/**
 * 칸 하나에 붙일 CSS 클래스 이름을 정한다.
 * getSlotClassName (겟 슬롯 클래스 네임) — get=가져오다, className=CSS 클래스 이름
 *
 * 채운 칸과 빈 칸의 모양이 달라야 하므로 클래스를 상황에 따라 더 붙인다.
 */
function getSlotClassName(slot) {
  const classNames = [styles.slot];

  if (!slot.hasDigit) {
    classNames.push(styles.emptySlot);
  }

  return classNames.join(' ');
}

function GuessInput({ currentGuess, digitCount }) {
  const slots = createSlots(currentGuess, digitCount);

  return (
    <div className={styles.guessInput}>
      {slots.map((slot) => (
        <span key={slot.position} className={getSlotClassName(slot)}>
          {slot.text}
        </span>
      ))}
    </div>
  );
}

export default GuessInput;
