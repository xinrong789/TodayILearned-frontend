import { useEffect, useState } from "react";
import axios from "axios";
import { Pagination } from "antd";
function FactList({ facts, setFacts }) {
  const [currentPage, setCurrentPage] = useState(1); // ✅ 定义分页状态
  const pageSize = 15;
  const CATEGORIES = [
    { name: "technology", color: "#3b82f6" },
    { name: "science", color: "#16a34a" },
    { name: "finance", color: "#ef4444" },
    { name: "society", color: "#eab308" },
    { name: "entertainment", color: "#db2777" },
    { name: "health", color: "#14b8a6" },
    { name: "history", color: "#f97316" },
    { name: "news", color: "#8b5cf6" },
  ];

  function Fact({ fact, setFacts }) {
    // IsUpdating(false)
    const [isUpdating, setIsUpdating] = useState(false);
    // const isDisputed =
    // fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

    // Find the category, or use a default if not found
    const categoryObj = CATEGORIES.find(
      (cat) => cat.name === fact.category
    ) || {
      color: "#999999", // Default color when category not found
    };

    async function handleVote(columnName) {
      setIsUpdating(true);
      try {
        const response = await axios.patch(
          `https://todayilearned-backend.onrender.com/facts/${fact.id}`,
          {
            [columnName]: true, // 只需发送字段名称，后端负责增加
          }
        );

        setFacts((facts) =>
          facts.map((f) => (f.id === fact.id ? response.data : f))
        );
      } catch (error) {
        console.error("Error updating vote:", error);
      }
      setIsUpdating(false);
    }
    async function handleDelete(id) {
      console.log("Deleting fact with ID:", id);
      try {
        // 发送 DELETE 请求到后端
        await axios.delete(
          `https://todayilearned-backend.onrender.com/facts/${fact.id}`
        );

        // 更新前端的事实列表，移除已删除的项
        setFacts((facts) => facts.filter((f) => f.id !== fact.id));
      } catch (error) {
        console.error("Error deleting fact:", error);
      }
    }
    return (
      <li className="fact">
        <p>
          {fact.text}
          <a
            className="source"
            href={fact.source}
            target="_blank"
            rel="noreferrer"
          >
            {"Source"}
          </a>
        </p>
        <span
          className="tag"
          style={{
            backgroundColor: categoryObj.color,
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
          <button onClick={(event) => handleDelete(fact.id, event)}>❌</button>
        </div>
      </li>
    );
  }
  if (facts.length === 0)
    return (
      <p className="message">
        No facts for this category yet! Create the first one!
      </p>
    );

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentFacts = facts.slice(startIndex, endIndex);
  return (
    <section>
      <ul className="facts-list">
        {currentFacts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>

      <p>There are {facts.length} facts in the database. Add your own!</p>
      <div style={{ display: "flex", justifyContent: "right" }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={facts.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>
    </section>
  );
}
export default FactList;
