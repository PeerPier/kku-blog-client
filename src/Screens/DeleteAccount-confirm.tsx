import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../misc/AccountPreferences.css";
import { API_BASE_URL } from "../api/const/apiBaseUrl";

const DeleteAccountModal: React.FC<{
  userId: string | null;
  show: boolean;
  onClose: () => void;
  onDeleteSuccess: () => void;
}> = ({ userId, show, onClose, onDeleteSuccess }) => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/profile/edit-profile/delete/${userId}`,
        {
          data: { password },
        }
      );

      if (response.data.message === "User deleted successfully") {
        setSuccessMessage("Account deleted successfully!");
        setErrorMessage("");
        onDeleteSuccess();
        localStorage.removeItem("userId");
        sessionStorage.removeItem("userId");
      } else {
        setErrorMessage(response.data.error);
      }
    } catch (error) {
      setErrorMessage("Error deleting account. Please check your password.");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>ลบบัญชีผู้ใช้</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของคุณ
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>
        <Form>
          <Form.Group controlId="password">
            <Form.Label>กรอกรหัสผ่านของคุณเพื่อยืนยัน</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          {errorMessage && <p className="text-danger">{errorMessage}</p>}
          {successMessage && <p className="text-success">{successMessage}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          style={{
            backgroundColor: "#333" /* สีพื้นหลัง */,
            color: "white" /* สีข้อความ */,
            borderRadius: "8px" /* มุมโค้ง */,
            padding: "10px 20px" /* ขนาด padding */,
            border: "none" /* ไม่มีเส้นขอบ */,
            textTransform: "none" /* ข้อความไม่เปลี่ยนรูปแบบ */,
          }}
          onClick={handleDeleteAccount}
        >
          ยืนยัน
        </Button>
        <Button variant="secondary" onClick={onClose}>
          ยกเลิก
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteAccountModal;
