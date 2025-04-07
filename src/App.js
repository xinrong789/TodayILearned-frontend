import "./style.css"
import { useEffect, useState } from "react"
import axios from "axios"

function App() {
  const [showForm, setShowForm] = useState(false)
  const [facts, setFacts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false) // To track errors
  const [currentCategory, setCurrentCategory] = useState("all")

  useEffect(() => {
    async function getFacts() {
      setIsLoading(true)
      setIsError(false) // Reset error before making the request

      try {
        let url = "http://localhost:3000/facts"
        if (currentCategory !== "all") {
          url += `?category=${currentCategory}`
        }

        const response = await axios.get(url)
        setFacts(response.data)
      } catch (error) {
        setIsError(true)
        console.error("Error fetching data:", error)
      }

      setIsLoading(false)
    }
    getFacts()
  }, [currentCategory])

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilters setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <p className="message">
            There was an error loading the facts. Please try again later.
          </p>
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  )
}

function Loader() {
  return <p className="message">Loading...</p>
}

function Header(props) {
  const setShowForm = props.setShowForm
  const showForm = props.showForm
  const appTitle = "Today I Learned"

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  )
}

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" }
]

function isValidHttpUrl(string) {
  let url
  try {
    url = new URL(string)
  } catch (_) {
    return false
  }
  return url.protocol === "http:" || url.protocol === "https:"
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("")
  const [source, setSource] = useState("")
  const [category, setCategory] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const textLength = text.length

  async function HandleSubmit(e) {
    e.preventDefault()

    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      setIsUploading(true)

      try {
        const response = await axios.post("http://localhost:3000/facts", {
          text,
          source,
          category
        })

        setFacts((facts) => [response.data, ...facts])
        setText("")
        setSource("")
        setCategory("")
        setShowForm(false)
      } catch (error) {
        console.error("Error submitting new fact:", error)
      }

      setIsUploading(false)
    }
  }

  return (
    <form className="fact-form" onSubmit={HandleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Choose category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        {isUploading ? "Posting..." : "Post"}
      </button>
    </form>
  )
}

function CategoryFilters({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            ALL
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0)
    return (
      <p className="message">
        No facts for this category yet! Create the first one!
      </p>
    )

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database. Add your own!</p>
    </section>
  )
}

function Fact({ fact, setFacts }) {
  // IsUpdating(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse

  // Find the category, or use a default if not found
  const categoryObj = CATEGORIES.find((cat) => cat.name === fact.category) || {
    color: "#999999" // Default color when category not found
  }

  async function handleVote(columnName) {
    setIsUpdating(true)
    try {
      const response = await axios.patch(
        `http://localhost:3000/facts/${fact.id}`,
        {
          [columnName]: fact[columnName] + 1
        }
      )

      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? response.data : f))
      )
    } catch (error) {
      console.error("Error updating vote:", error)
    }
    setIsUpdating(false)
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[❌DISPUTED]</span> : null}
        {fact.TEXT}
        <a
          className="source"
          href={fact.SOURCE}
          target="_blank"
          rel="noreferrer"
        >
          {"Source"}
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: categoryObj.color
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  )
}

export default App
