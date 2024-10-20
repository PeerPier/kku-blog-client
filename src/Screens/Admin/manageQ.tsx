import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import { AiFillQuestionCircle } from "react-icons/ai";
import { Modal, Button } from "react-bootstrap";
import {
  addQuestionAPI,
  deleteQuestionAPI,
  fetchQuestionsAPI,
  updateQuestionAPI,
} from "../../api/manageQAPI";

const ManageQ: React.FC = () => {
  const { adminId } = useParams<{ adminId: string }>();
  const [questions, setQuestions] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

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

  const handleAddQuestion = async (e: React.FormEvent, adminId?: string) => {
    e.preventDefault();

    if (!adminId) {
      console.error("Admin ID is undefined");
      return;
    }

    try {
      const newQuestion = await addQuestionAPI(topic, answer, adminId);
      setQuestions((prev) => [...prev, newQuestion]);
      setTopic("");
      setAnswer("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const handleEditQuestion = (question: any) => {
    if (!question) {
      console.error("Question is null or undefined");
      return;
    }

    setTopic(question.topic);
    setAnswer(question.answer);
    setEditingId(question._id);
    setShowEditModal(true);
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) return;

    try {
      const updatedQuestion = await updateQuestionAPI(editingId, topic, answer);

      setQuestions((prev) =>
        prev.map((q) => (q._id === editingId ? updatedQuestion : q))
      );

      setTopic("");
      setAnswer("");
      setEditingId(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestionAPI(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const confirmDeleteQuestion = (id: string) => {
    setQuestionToDelete(id);
    setShowConfirmModal(true);
  };

  return (
    <div className="manageUser">
      <div className="main1">
        <h1>จัดการคำถาม</h1>
        <div className="add-q" onClick={() => setShowAddModal(true)}>
          <div>
            <IoMdAdd />
            <span>เพิ่มคำถาม</span>
          </div>
        </div>

        <div className="recent-order" style={{ marginTop: "1.5rem" }}>
          <h2>รายการ</h2>
          <div className="right">
            <div className="activity-analytics" style={{ marginTop: "0.5rem" }}>
              {questions.map(
                (question) =>
                  question && (
                    <div className="item" key={question._id}>
                      <div className="profile-photo">
                        <AiFillQuestionCircle />
                      </div>
                      <div className="right">
                        <div className="info">
                          <h3>{question.topic}</h3>
                        </div>
                        <div className="manage d-flex">
                          <div
                            className="edit warning"
                            onClick={() => handleEditQuestion(question)}
                            style={{ paddingRight: "10px" }}
                          >
                            <h3>Edit</h3>
                          </div>
                          <div
                            className="delete danger"
                            onClick={() => confirmDeleteQuestion(question._id)}
                          >
                            <h3>Delete</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <input
              type="text"
              placeholder="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="form-control"
            />
            <textarea
              placeholder="Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="form-control mt-2"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={(e) => handleAddQuestion(e,adminId)}>
            Sav
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <input
              type="text"
              placeholder="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="form-control"
            />
            <textarea
              placeholder="Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="form-control mt-2"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateQuestion}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this question?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (questionToDelete) {
                await handleDeleteQuestion(questionToDelete);
                setShowConfirmModal(false);
              }
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageQ;
