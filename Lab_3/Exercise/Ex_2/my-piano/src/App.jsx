import pianoIcon from "./assets/piano.svg";
import styles from "./App.module.css";
import { generateKeys } from "./utils/generateKeys";
import PianoKey from "./components/PianoKey";

const KEYS = generateKeys();

function App() {
  const whiteKeys = KEYS.filter((key) => !key.isBlack);
  const blackCount = KEYS.length - whiteKeys.length;
  const blackAfter = new Map(
    KEYS.filter((key) => key.isBlack).map((key) => [key.midi - 1, key]),
  );

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
        <div className={styles.keyboardScroll}>
          <ul className={styles.keyboard} aria-label="Piano keyboard">
            {whiteKeys.map((key) => {
              const blackKey = blackAfter.get(key.midi);
              return (
                <li key={key.id} className={styles.whiteKey}>
                  <PianoKey
                    midi={key.midi}
                    freqHz={key.freqHz}
                    isBlack={key.isBlack}
                  />
                  {blackKey && (
                    <PianoKey
                      midi={blackKey.midi}
                      freqHz={blackKey.freqHz}
                      isBlack={blackKey.isBlack}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}

export default App;
