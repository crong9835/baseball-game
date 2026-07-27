/*
 * 난이도(정답의 자릿수)를 고르는 버튼 줄.
 * DifficultySelector (디피컬티 셀렉터) — difficulty=난이도, select=고르다
 *
 * 값을 기억하는 곳은 useBaseballGame 훅이고, 이 컴포넌트는 받은 값을 비추고
 * 사용자가 무엇을 눌렀는지만 위로 알린다.
 */

import { DIGIT_COUNT_OPTIONS } from '../constants/gameConstants.js';
import styles from './DifficultySelector.module.css';

/**
 * 버튼 하나에 붙일 CSS 클래스 이름을 정한다.
 * getOptionClassName (겟 옵션 클래스 네임) — option=고를 수 있는 항목
 *
 * NumberPad의 getDigitButtonClassName과 같은 방식으로, 배열에 담았다가 마지막에 합친다.
 * (템플릿 문자열 안에 조건을 넣으면 읽기 어려워진다)
 */
function getOptionClassName(isSelected) {
  const classNames = [styles.option];

  if (isSelected) {
    classNames.push(styles.selectedOption);
  }

  return classNames.join(' ');
}

function DifficultySelector({ digitCount, onSelect }) {
  return (
    <div className={styles.difficultySelector}>
      {DIGIT_COUNT_OPTIONS.map((option) => {
        const isSelected = option === digitCount;

        return (
          <button
            key={option}
            type="button"
            className={getOptionClassName(isSelected)}
            /*
             * aria-pressed는 화면을 읽어주는 프로그램에 "이 버튼이 눌린 상태"라고 알려준다.
             * 색과 테두리만으로 표시하면 눈으로 볼 때만 구분되기 때문이다.
             */
            aria-pressed={isSelected}
            // onClick={onSelect(option)}이라고 쓰면 화면을 그리는 순간 실행돼 버린다.
            // 값을 넘겨야 하므로 화살표 함수로 한 겹 감싼다.
            onClick={() => onSelect(option)}
          >
            {option}자리
          </button>
        );
      })}
    </div>
  );
}

export default DifficultySelector;
