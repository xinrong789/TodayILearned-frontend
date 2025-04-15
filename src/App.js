import "./style.css";
import { useEffect, useState } from "react";
import axios from "axios";
import CategoryFilters from "./CategoryFilters";
import NewFactForm from "./NewFactForm";
import FactList from "./Factlist";
import Header from "./Header";
function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false); // To track errors
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);
      setIsError(false); // Reset error before making the request

      try {
        // let url = "http://localhost:3000/facts";
        let url = "https://todayilearned-backend.onrender.com/facts";
        if (currentCategory !== "all") {
          url += `?category=${currentCategory}`;
        }

        const response = await axios.get(url);
        console.log("返回的数据:", response.data);
        console.log("数据条数:", response.data.length);
        setFacts(response.data);
      } catch (error) {
        setIsError(true);
        console.error("Error fetching data:", error);
      }

      setIsLoading(false);
    }
    getFacts();
  }, [currentCategory]);

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
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

export default App;
