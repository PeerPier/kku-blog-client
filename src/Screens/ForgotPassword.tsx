import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../misc/reset-password.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบเงื่อนไขรหัสผ่าน
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/; // Regex สำหรับรหัสผ่าน
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be 6-20 characters long and include at least one uppercase letter, one lowercase letter, and one number."
      );
      return; // หยุดการส่งฟอร์ม
    }

    fetch("http://localhost:3001/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(
            "Password reset successful! Redirecting you to the Admin login page..."
          );

          const redirectTo =
            data.role === "admin" ? "/admin/login" : "/admin/login"; // กลับไปหน้า Admin Login
          setTimeout(() => {
            navigate(redirectTo); // นำผู้ใช้ไปยังหน้า login
          }, 3000); // ใช้ setTimeout เพื่อเลื่อนการนำทาง
        } else {
          toast.error(data.message);
        }
      })
      .catch((err) => toast.error("An error occurred. Please try again."));
  };

  return (
    <Container
      maxWidth="sm"
      className="d-flex justify-content-center align-items-center vh-100 reset-password"
      style={{ padding: "5%" }}
    >
      <ToastContainer />
      <div className="form-reset" style={{ boxShadow: "1px solid gray" }}>
        <Typography
          variant="h5"
          align="center"
          sx={{ padding: "25px 0", fontWeight: "900" }} // เพิ่ม padding ด้านบนและด้านล่าง
        >
          Reset Password
        </Typography>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>New Password</label>
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            variant="outlined"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="mt-2"
            sx={{
              backgroundColor: "#151111",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#151111",
              },
              marginY: "20px",
              textTransform: "none", // ป้องกันไม่ให้ข้อความแสดงเป็นตัวอักษรใหญ่ทั้งหมด
            }}
          >
            Reset
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default ForgotPassword;
