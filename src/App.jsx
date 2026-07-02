import { useEffect, useState } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);

  const [page, setPage] = useState("home");

const [readerComments, setReaderComments] = useState(() => {
  const savedComments = localStorage.getItem("readerComments");
  return savedComments ? JSON.parse(savedComments) : [];
});

  const [bookText, setBookText] = useState("");
  const [question, setQuestion] = useState("");
  const [fragments, setFragments] = useState([]);
  const [conversationMode, setConversationMode] = useState(false);

  useEffect(() => {
    async function loadBooks() {
      const res = await fetch("books.json");
      const data = await res.json();
      setAllBooks(data);
      setBooks(data);
    }

    loadBooks();
  }, []);

  function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\/-]/g, "");
}

  function searchBooks() {
    const text = normalizeText(query.trim());

    if (!text) {
      setBooks(allBooks);
      return;
    }

    const results = allBooks.filter((book) => {
      const searchableText = normalizeText(
        [
          book.title,
          book.author,
          book.year,
          book.publisher,
          book.genre,
          ...(book.themes || []),
          book.description,
        ].join(" ")
      );

      return searchableText.includes(text);
    });

    setBooks(results);
  }

  async function startConversation(topic = "") {
  if (!selectedBook.text) {
    alert("Este libro todavía no tiene texto cargado.");
    return;
  }

  const res = await fetch(selectedBook.text);
  const text = await res.text();

  setBookText(text);
  setConversationMode(true);
  setQuestion(topic);

  if (topic) {
    const found = findFragmentsInText(text, topic);
    setFragments(found);

    if (found.length === 0) {
      alert("No encontré fragmentos relacionados. Prueba con otra palabra.");
    }
  } else {
    setFragments([]);
  }
}

  function findFragmentsInText(sourceText, searchTerm) {
  const cleanQuestion = normalizeText(searchTerm.trim());

  if (!cleanQuestion) return [];

  const stopWords = [
    "sobre",
    "quiero",
    "hablar",
    "libro",
    "poema",
    "este",
    "esta",
    "donde",
    "como",
    "para",
    "pero",
    "porque",
    "tiene",
    "aparece",
    "aparecen",
  ];

  const words = cleanQuestion
    .split(/\s+/)
    .map((word) => word.replace(/[^\wñ]/g, ""))
    .filter((word) => word.length > 2 && !stopWords.includes(word));

  const blocks = sourceText
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 40);

  const scoredBlocks = blocks
    .map((block) => {
      const cleanBlock = normalizeText(block);

      const score = words.reduce((total, word) => {
        return cleanBlock.includes(word) ? total + 1 : total;
      }, 0);

      return { block, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return scoredBlocks.map((item) => item.block);
}

  function searchInsideBook() {
  if (!question.trim()) {
    alert("Escribe una palabra o idea para buscar en el libro.");
    return;
  }

  const found = findFragmentsInText(bookText, question);
  setFragments(found);

  if (found.length === 0) {
    alert("No encontré fragmentos relacionados. Prueba con otra palabra.");
  }
}

function containsOffensiveWords(text) {
  const bannedWords = [
    "idiota",
    "imbecil",
    "estupido",
    "basura"
  ];

  const cleanText = normalizeText(text);

  return bannedWords.some((word) => cleanText.includes(word));
}

function sendComment() {
  const cleanComment = reflection.trim();

  if (!cleanComment) {
    alert("Escribe primero tu comentario.");
    return;
  }

  if (containsOffensiveWords(cleanComment)) {
    alert("Este comentario no puede publicarse porque contiene lenguaje ofensivo.");
    return;
  }

  const newComment = {
    id: Date.now(),
    bookTitle: selectedBook.title,
    bookAuthor: selectedBook.author,
    topic: question || "lectura general",
    text: cleanComment,
    createdAt: new Date().toLocaleString("es-PE"),
  };

  const updatedComments = [newComment, ...readerComments];

  setReaderComments(updatedComments);
  localStorage.setItem("readerComments", JSON.stringify(updatedComments));

  setReflection("");
  setSaved(true);
}

if (page === "comments") {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.back} onClick={() => setPage("home")}>
          ← Volver
        </button>

        <div style={styles.icon}>💬</div>

        <h1 style={styles.mainTitle}>Comentarios de lectorxs</h1>

        <p style={styles.subtitle}>
          Comentarios enviados por quienes han leído fragmentos de los libros.
        </p>

        {readerComments.length === 0 && (
          <div style={styles.message}>
            Todavía no hay comentarios publicados.
          </div>
        )}

        {readerComments.map((comment) => (
          <div key={comment.id} style={styles.commentCard}>
            <p style={styles.commentMeta}>
              <strong>{comment.bookTitle}</strong> · Tema: {comment.topic}
            </p>

            <p style={styles.commentText}>{comment.text}</p>

            <p style={styles.commentDate}>{comment.createdAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

  if (selectedBook) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <button
            style={styles.back}
            onClick={() => {
              setSelectedBook(null);
              setConversationMode(false);
              setFragments([]);
              setQuestion("");
            }}
          >
            ← Volver
          </button>

          <div style={styles.icon}>📚</div>

          <h1 style={styles.bookTitle}>{selectedBook.title}</h1>

          <p style={styles.subtitle}>
            {selectedBook.author} · {selectedBook.year}
          </p>

          <div style={styles.infoBox}>
            <p>
              <strong>Editorial:</strong> {selectedBook.publisher}
            </p>
            <p>
              <strong>Género:</strong> {selectedBook.genre}
            </p>
            <p>
              <strong>Temas:</strong> {(selectedBook.themes || []).join(", ")}
            </p>
          </div>

          <div style={styles.message}>
            <strong>Descripción:</strong>
            <br />
            {selectedBook.description}
          </div>


          {selectedBook.text && (
  <div style={styles.topicBox}>
    <p style={styles.topicTitle}>
      ¿Sobre qué tema te gustaría ver fragmentos?
    </p>

    <div style={styles.topicGrid}>
      {(selectedBook.suggestedTopics || [
        "cuerpo",
        "memoria",
        "deseo",
        "sombra",
        "casa"
      ]).map((topic) => (
        <button
          key={topic}
          style={styles.topicButton}
          onClick={() => startConversation(topic)}
        >
          {topic}
        </button>
      ))}
    </div>
  </div>
)}

          {conversationMode && (
            <div style={styles.conversationBox}>
  {fragments.length > 0 && (
    <div style={styles.results}>
      <h2>Fragmentos encontrados sobre “{question}”</h2>

      {fragments.map((fragment, index) => (
        <div key={index} style={styles.fragment}>
          {fragment}
        </div>
      ))}
    </div>
  )}
</div>
          )}

          <div style={styles.message}>
  <strong>
    ¿Qué le dirías a lx autorx sobre estos fragmentos que has leído?
  </strong>
</div>

          <textarea
            style={styles.textarea}
            placeholder="Escribe aquí tu respuesta (si deseas puedes colocar tu nombre o tu IG)..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          ></textarea>

         <button style={styles.button} onClick={sendComment}>
  Enviar
</button>

          {saved && (
  <>
    <p style={{ color: "#86efac", marginTop: 16 }}>
      ✅ Comentario enviado.
    </p>

    <button
      style={styles.secondaryButton}
      onClick={() => setPage("comments")}
    >
      Ver comentarios de lectorxs
    </button>
  </>
)}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>📚</div>

        <h1 style={styles.mainTitle}>Lecturas Vanas</h1>

        <p style={styles.subtitle}>
          Busca en una base propia de libros peruanos.
        </p>

        

        <div style={styles.results}>
          {books.length === 0 && (
            <p style={styles.subtitle}>No se encontraron libros.</p>
          )}

          {books.map((book) => (
            <div
              key={book.id}
              style={styles.bookItem}
              onClick={() => {
                setSelectedBook(book);
                setReflection("");
                setSaved(false);
                setConversationMode(false);
                setFragments([]);
                setQuestion("");
              }}
            >
              <div style={styles.bookIcon}>📖</div>

              <div>
                <strong>{book.title}</strong>
                <p style={styles.author}>
                  {book.author} · {book.year}
                </p>
                <p style={styles.author}>{book.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
mainTitle: {
  color: "#93c5fd",
  fontSize: 48,
  margin: "8px 0 12px",
},

bookTitle: {
  color: "#c4b5fd",
  fontSize: 46,
  margin: "8px 0 12px",
},
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
    maxWidth: 620,
    background: "#111827",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    textAlign: "center",
  },
  icon: {
    fontSize: 58,
  },
  subtitle: {
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    border: "1px solid #334155",
    marginTop: 16,
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
  pdfButton: {
    display: "block",
    width: "100%",
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    background: "#16a34a",
    color: "white",
    textDecoration: "none",
    fontSize: 17,
    boxSizing: "border-box",
  },
  talkButton: {
    width: "100%",
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    border: "none",
    background: "#9333ea",
    color: "white",
    fontSize: 17,
    cursor: "pointer",
  },
  results: {
    marginTop: 24,
    textAlign: "left",
  },
  bookItem: {
    display: "flex",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    background: "#1e293b",
    marginBottom: 10,
    cursor: "pointer",
  },
  bookIcon: {
    fontSize: 36,
  },
  author: {
    color: "#cbd5e1",
    margin: "6px 0 0",
  },
  infoBox: {
    background: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    textAlign: "left",
    lineHeight: 1.5,
  },
  message: {
    background: "#1e293b",
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    lineHeight: 1.5,
    textAlign: "left",
  },
  conversationBox: {
    background: "#0f172a",
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    textAlign: "left",
  },
  fragment: {
    whiteSpace: "pre-wrap",
    background: "#1e293b",
    padding: 16,
    borderRadius: 16,
    marginTop: 14,
    lineHeight: 1.5,
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
  topicBox: {
  background: "#0f172a",
  padding: 18,
  borderRadius: 16,
  marginTop: 20,
  textAlign: "left",
},

topicTitle: {
  color: "white",
  fontWeight: "bold",
  marginTop: 0,
  marginBottom: 12,
  fontSize: 17,
},

topicGrid: {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
},

topicButton: {
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid #7c3aed",
  background: "#312e81",
  color: "white",
  cursor: "pointer",
  fontSize: 15,
},
};

export default App;