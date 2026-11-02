import PianoKey from "./PianoKey";
import styles from "./Keyboard.module.css";

function Keyboard({ keys, pressedSet, shortcutMap, onPress, onRelease }) {
  const whiteKeys = keys.filter((key) => !key.isBlack);
  const blackAfter = new Map(
    keys.filter((key) => key.isBlack).map((key) => [key.midi - 1, key]),
  );

  return (
    <div className={styles.scroll}>
      <ul className={styles.keyboard} aria-label="Piano keyboard">
        {whiteKeys.map((key) => {
          const blackKey = blackAfter.get(key.midi);
          return (
            <li key={key.id} className={styles.slot}>
              <PianoKey
                midi={key.midi}
                freqHz={key.freqHz}
                isBlack={key.isBlack}
                isPressed={pressedSet.has(key.midi)}
                shortcut={shortcutMap.get(key.midi)}
                onPress={onPress}
                onRelease={onRelease}
              />
              {blackKey && (
                <PianoKey
                  midi={blackKey.midi}
                  freqHz={blackKey.freqHz}
                  isBlack={blackKey.isBlack}
                  isPressed={pressedSet.has(blackKey.midi)}
                  shortcut={shortcutMap.get(blackKey.midi)}
                  onPress={onPress}
                  onRelease={onRelease}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Keyboard;
