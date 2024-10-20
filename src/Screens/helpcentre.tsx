import React, { useEffect, useState } from "react";
import "../misc/helpcentre.css";
import { fetchQuestionsAPI } from "../api/manageQAPI";

const HelpCentre = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchQuestionsAPI();
        if (Array.isArray(fetchedQuestions)) {
          setQuestions(fetchedQuestions);
        } else {
          console.error("Fetched questions is not an array");
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    };

    loadQuestions();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredFaqs = questions.filter((faq) =>
    faq.topic.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="help-centre">
      <header className="header">
        <h1>FAQ</h1>
        <h2>How can we help you?</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button>Search</button>
        </div>
      </header>

      <div className="faq">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div className="faq-item" key={index}>
              <details>
                <summary className="faq-question">{faq.topic}</summary>
                <div className="faq-answer">{faq.answer}</div>
              </details>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default HelpCentre;
