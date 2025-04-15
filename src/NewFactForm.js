import { useEffect, useState } from "react";
import axios from "axios";

function NewFactForm({ setFacts, setShowForm }) {
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
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  function isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  async function HandleSubmit(e) {
    e.preventDefault();
    console.log(text, source, category);

    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      setIsUploading(true);
      try {
        const response = await axios.post(
          "https://todayilearned-backend.onrender.com/facts",
          {
            text,
            source,
            category,
          }
        );

        // 打印新返回的 fact 数据
        console.log("1111Response data received:", response.config.data);

        // const newFact = response.config.data;
        const newFact = JSON.parse(response.config.data);

        // 确保你更新了 facts
        setFacts((prevFacts) => [newFact, ...prevFacts]);

        // 清空表单
        setText("");
        setSource("");
        setCategory("");
        setShowForm(false);
      } catch (error) {
        console.error("Error submitting new fact:", error);
      }
      setIsUploading(false);
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
  );
}
export default NewFactForm;
