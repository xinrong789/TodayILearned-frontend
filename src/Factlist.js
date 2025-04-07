import { useEffect, useState } from "react"
import axios from "axios"
function FactList({ facts, setFacts }) {
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
  function Fact({ fact, setFacts }) {
    // IsUpdating(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const isDisputed =
      fact.votesInteresting + fact.votesMindblowing < fact.votesFalse

    // Find the category, or use a default if not found
    const categoryObj = CATEGORIES.find(
      (cat) => cat.name === fact.category
    ) || {
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
          <button
            onClick={() => handleVote("votesFalse")}
            disabled={isUpdating}
          >
            ⛔️ {fact.votesFalse}
          </button>
        </div>
      </li>
    )
  }
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
export default FactList
