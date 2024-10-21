import React from "react";
import "../misc/AccountPreferences.css";
import { Modal, Button } from "react-bootstrap";

interface ChangeEmailModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (email: string) => void;
  oldEmail: string;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  show,
  onClose,
  onSave,
  oldEmail,
}) => {
  const [email, setEmail] = React.useState("");

  const handleSave = () => {
    if (email) {
      onSave(email);
      setEmail("");
    } else {
      alert("Please enter a valid email.");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>เปลี่ยนอีเมล</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input
          type="email"
          placeholder="Enter new email"
          value={email || oldEmail}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
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

export default ChangeEmailModal;
