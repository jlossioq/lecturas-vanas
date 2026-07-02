import { useState } from "react";

function App() {
  const [book, setBook] = useState("");
  const [started, setStarted] = useState(false);
  const [reflection, setReflection] = useState("");
const [saved, setSaved] = useState(false);

  if (started) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <button style={styles.back} onClick={() => setStarted(false)}>
            ← Volver
          </button>

          <h1>📚 {book || "Tu libro"}</h1>
          <p style={styles.subtitle}>Conversemos sobre tu lectura.</p>

          <div style={styles.message}>
            No voy a resumirte el libro. Primero dime:
            <br />
            <strong>¿Qué escena o idea se te quedó más grabada?</strong>
          </div>

          <textarea
  style={styles.textarea}
  placeholder="Escribe aquí tu respuesta..."
  value={reflection}
  onChange={(e) => setReflection(e.target.value)}
>
  </textarea>

          <button
  style={styles.button}
  onClick={() => setSaved(true)}
>
  Guardar mi reflexión
</button>

{saved && (
  <p style={{ color: "#86efac", marginTop: 16 }}>
    ✅ Reflexión guardada.
  </p>
)}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>📚</div>
        <h1>Lecturas Vanas</h1>
        <p style={styles.subtitle}>Los libros terminan. La conversación apenas comienza.</p>

        <input
          style={styles.input}
          placeholder="¿Qué libro quieres comentar?"
          value={book}
          onChange={(e) => setBook(e.target.value)}
        />

        <button style={styles.button} onClick={() => setStarted(true)}>
          Comenzar conversación
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 430,
    background: "#111827",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    textAlign: "center",
  },
  icon: { fontSize: 58 },
  subtitle: { color: "#cbd5e1", lineHeight: 1.5 },
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    border: "1px solid #334155",
    marginTop: 24,
    fontSize: 16,
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontSize: 17,
    cursor: "pointer",
  },
  message: {
    background: "#1e293b",
    padding: 18,
    borderRadius: 16,
    marginTop: 24,
    lineHeight: 1.5,
    textAlign: "left",
  },
  textarea: {
    width: "100%",
    height: 140,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    border: "1px solid #334155",
    fontSize: 16,
    boxSizing: "border-box",
  },
  back: {
    background: "transparent",
    border: "none",
    color: "#93c5fd",
    cursor: "pointer",
    marginBottom: 12,
  },
};

export default App;