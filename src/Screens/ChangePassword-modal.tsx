import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import "../misc/AccountPreferences.css";
import { API_BASE_URL } from "../api/const/apiBaseUrl";

const ChangePasswordModal: React.FC<{
  userId: string | null;
  show: boolean;
  onClose: () => void;
}> = ({ userId, show, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/;
    return regex.test(password);
  };

  const handleSave = async () => {
    if (oldPassword === newPassword) {
      setErrorMessage("New password cannot be the same as the old password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setErrorMessage(
        "Password must be 8-20 characters, include upper and lowercase letters, and numbers."
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/profile/changepassword/${userId}`,
        {
          _id: userId,
          oldPassword,
          newPassword,
        }
      );

      if (response.data.success) {
        setSuccessMessage("Password updated successfully!");
        setErrorMessage("");

        setCountdown(5);
      } else {
        setErrorMessage(response.data.error);
      }
    } catch (error) {
      setErrorMessage("Error updating password. Please try again.");
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0 && successMessage) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      onClose();
      setCountdown(5);
      setSuccessMessage("");
    }

    return () => clearInterval(timer);
  }, [countdown, successMessage, onClose]);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>เปลี่นรหัสผ่าน</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="oldPassword">
            <Form.Label>รหัสผ่านเก่า</Form.Label>
            <Form.Control
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="newPassword">
            <Form.Label>รหัสผ่านใหม่</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="confirmPassword">
            <Form.Label>ยืนยันรหัสผ่านใหม่</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          {errorMessage && <p className="text-danger">{errorMessage}</p>}
          {successMessage && (
            <>
              <p className="text-success">{successMessage}</p>
              <p>Closing in {countdown} seconds...</p>
            </>
          )}
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
          }}onClick={handleSave}>
          ยืนยัน
        </Button>
        <Button variant="secondary" onClick={onClose}>
          ยกเลิก
        </Button>
        
      </Modal.Footer>
    </Modal>
  );
};

export default ChangePasswordModal;
