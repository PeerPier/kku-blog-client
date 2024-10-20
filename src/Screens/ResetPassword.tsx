import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State สำหรับข้อความผิดพลาด
  const [successMessage, setSuccessMessage] = useState(""); // State สำหรับข้อความสำเร็จ
  const navigate = useNavigate();
  const {type, id, token } = useParams<{type:string, id: string; token: string }>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(""); // ลบข้อความผิดพลาดก่อนหน้า
    setSuccessMessage(""); // ลบข้อความสำเร็จก่อนหน้า

    if (!id || !token) {
      setErrorMessage("Invalid reset link."); // แจ้งเตือนหาก id หรือ token ไม่ถูกต้อง
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/reset_password/${type}/${id}/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.Status === "Success") {
          setSuccessMessage("Password reset successfully! Redirecting to login..."); // ข้อความสำเร็จ
          setTimeout(() => navigate("/signin"), 2000); // นำทางหลัง 2 วินาที
        } else {
          setErrorMessage(data.Message); // แสดงข้อความผิดพลาดจากเซิร์ฟเวอร์
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.Message || "An error occurred. Please try again."); // ข้อความผิดพลาด
      }
    } catch (error) {
      setErrorMessage("Error occurred while resetting password. Please try again."); // ข้อความผิดพลาด
      console.error("Error:", error);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h4>Reset Password</h4>
        {errorMessage && <div className="text-danger">{errorMessage}</div>} {/* แสดงข้อความผิดพลาด */}
        {successMessage && <div className="text-success">{successMessage}</div>} {/* แสดงข้อความสำเร็จ */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password">
              <strong>New Password</strong>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              autoComplete="off"
              name="password"
              className="form-control rounded-0"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-success w-100 rounded-0">
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
