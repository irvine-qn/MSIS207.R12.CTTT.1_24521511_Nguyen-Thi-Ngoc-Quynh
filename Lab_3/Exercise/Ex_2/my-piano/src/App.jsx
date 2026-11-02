import pianoIcon from "./assets/piano.svg";
import styles from "./App.module.css";

function App() {
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
    </main>
  );
}

export default App;
