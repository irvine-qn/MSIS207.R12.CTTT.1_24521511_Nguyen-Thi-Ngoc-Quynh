import { useCallback, useState } from "react";
import pianoIcon from "./assets/piano.svg";
import styles from "./App.module.css";
import { generateKeys } from "./utils/generateKeys";
import Keyboard from "./components/Keyboard";

const KEYS = generateKeys();

function App() {
  const whiteKeys = KEYS.filter((key) => !key.isBlack);
  const blackCount = KEYS.length - whiteKeys.length;
  const [pressedSet, setPressedSet] = useState(() => new Set());

  const handlePress = useCallback((midi) => {
    setPressedSet((prev) => {
      if (prev.has(midi)) return prev;
      const next = new Set(prev);
      next.add(midi);
      return next;
    });
  }, []);

  const handleRelease = useCallback((midi) => {
    setPressedSet((prev) => {
      if (!prev.has(midi)) return prev;
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  }, []);

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <img
          src={pianoIcon}
          className={styles.logo}
          width="64"
          height="64"
          alt="Piano icon"
        />
        <h1 className={styles.title}>Piano website</h1>
      </header>
      <section className={styles.panel} aria-labelledby="keyboard-heading">
        <h2 id="keyboard-heading">Keyboard</h2>
        <dl className={styles.freqList}>
          <div className={styles.freqItem}>
            <dt>Total keys</dt>
            <dd>{KEYS.length}</dd>
          </div>
          <div className={styles.freqItem}>
            <dt>White keys</dt>
            <dd>{whiteKeys.length}</dd>
          </div>
          <div className={styles.freqItem}>
            <dt>Black keys</dt>
            <dd>{blackCount}</dd>
          </div>
        </dl>
        <Keyboard
          keys={KEYS}
          pressedSet={pressedSet}
          onPress={handlePress}
          onRelease={handleRelease}
        />
      </section>
    </main>
  );
}

export default App;
