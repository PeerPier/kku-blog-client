const API_BASE_URL = process.env.PUBLIC_APP_ENDPOINT || "https://kku-blog-server.onrender.com";

// Function to fetch all questions
export const fetchQuestionsAPI = async () => {
  const token = localStorage.getItem("userId");
  if (!token) {
    console.error("No token found, redirecting to login...");
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/questions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }

  const data = await response.json();
  return data;
};

// Function to add a new question
export const addQuestionAPI = async (
  topic: string,
  answer: string,
  createdBy: string
) => {
  const token = localStorage.getItem("userId");
  if (!token) {
    console.error("No token found, redirecting to login...");
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topic, answer, createdBy }),
  });

  if (!response.ok) {
    throw new Error("Failed to add question");
  }

  const data = await response.json();
  return data;
};

// Function to update a question
export const updateQuestionAPI = async (
  id: string,
  topic: string,
  answer: string
) => {
  const token = localStorage.getItem("userId"); // Get token from localStorage

  if (!token) {
    throw new Error("No admin token found. Unauthorized request.");
  }

  const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
    method: "PUT", // Make sure you're using PUT for updates
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topic, answer }), // Send the updated data
  });

  if (!response.ok) {
    throw new Error("Failed to update question");
  }

  const data = await response.json();
  return data; // Return the updated question
};

// Function to delete a question
export const deleteQuestionAPI = async (id: string) => {
  const token = localStorage.getItem("userId");
  if (!token) {
    console.error("No token found, redirecting to login...");
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete question");
  }
};
