import { useState, useEffect, useRef, useContext } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import logohead from "../../pic/logo-headV2.png";
import "../../misc/login.css";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import toast from "react-hot-toast";
import {
  storeInSession,
  userInSession,
  userIdInSession,
} from "../../common/session";
import { API_BASE_URL } from "../../api/const/apiBaseUrl";

interface LoginPageProps {
  type: string;
}

const Login: React.FC<LoginPageProps> = ({ type }) => {
  const authForm = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  const {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const userAuthThroughServer = (
    serverRoute: string,
    formData: { [key: string]: any }
  ) => {
    fetch(API_BASE_URL + serverRoute, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.error || "Error occurred");
          });
        }
        return response.json();
      })
      .then((data): any => {
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
        userInSession("userId", data.username);
        userIdInSession("adminId", data._id);

        console.log("data.role", data);

        localStorage.setItem("userId", data._id);

        if (data.role === "admin") {
          navigate(`/admin/${data._id}`);
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // ป้องกันไม่ให้หน้ารีเฟรช

    // ส่งข้อมูลฟอร์มไปยัง server
    userAuthThroughServer("/admin", { email, password });
  };

  const handleAlertClose = () => {
    setAlertMessage(null);
  };

  useEffect(() => {
    const toggleBtns = document.querySelectorAll<HTMLAnchorElement>(".toggle");
    const mainElement = document.querySelector<HTMLElement>("main");
    const bulletElements =
      document.querySelectorAll<HTMLElement>(".bullets span");

    const handleFocus = (inp: HTMLInputElement) => {
      inp.classList.add("active");
    };

    const handleBlur = (inp: HTMLInputElement) => {
      if (inp.value === "") {
        inp.classList.remove("active");
      }
    };

    const handleToggleClick = () => {
      mainElement?.classList.toggle("sign-up-mode");
    };

    const moveSlider = (event: Event) => {
      const index = (event.currentTarget as HTMLElement).dataset.value;
      const currentImage = document.querySelector<HTMLImageElement>(
        `.img-${index}`
      );
      const textSlider = document.querySelector<HTMLElement>(".text-group");

      if (currentImage && textSlider) {
        bulletElements.forEach((bull) => bull.classList.remove("active"));
        (event.currentTarget as HTMLElement).classList.add("active");

        const allImages = document.querySelectorAll<HTMLImageElement>(".image");
        allImages.forEach((img) => img.classList.remove("show"));

        currentImage.classList.add("show");
        textSlider.style.transform = `translateY(${
          -(parseInt(index || "1", 10) - 1) * 2.2
        }rem)`;
      }
    };

    toggleBtns.forEach((btn) =>
      btn.addEventListener("click", handleToggleClick)
    );
    bulletElements.forEach((bullet) =>
      bullet.addEventListener("click", moveSlider)
    );

    const inputs = document.querySelectorAll<HTMLInputElement>(".input-field");
    inputs.forEach((inp) => {
      inp.addEventListener("focus", () => handleFocus(inp));
      inp.addEventListener("blur", () => handleBlur(inp));
    });

    return () => {
      toggleBtns.forEach((btn) =>
        btn.removeEventListener("click", handleToggleClick)
      );
      bulletElements.forEach((bullet) =>
        bullet.removeEventListener("click", moveSlider)
      );
      inputs.forEach((inp) => {
        inp.removeEventListener("focus", () => handleFocus(inp));
        inp.removeEventListener("blur", () => handleBlur(inp));
      });
    };
  }, []);

  return (
    <div className="login-container">
      <main>
        <div className="box">
          <div className="inner-box">
            <div className="forms-wrap">
              <form
                autoComplete="off"
                className="sign-in-form"
                onSubmit={handleSubmit}
                ref={authForm}
              >
                <div className="logo">
                  <img src={logohead} alt="easyclass" />
                </div>

                <div className="heading" style={{ textAlign: "center" }}>
                  <h4>ยินดีต้อนรับผู้ดูแลระบบ</h4>
                </div>

                <div className="actual-form">
                  <div className="input-wrap">
                    <input
                      type="email"
                      minLength={4}
                      className="input-field"
                      autoComplete="off"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="label-login">อีเมล</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      type="password"
                      minLength={4}
                      className="input-field"
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label className="label-login">รหัสผ่าน</label>
                  </div>

                  <button type="submit" className="sign-btn">
                    เข้าสู่ระบบ
                  </button>

                  <p className="text">
                    <Link to="/forgot-password">ลืมรหัสผ่าน</Link>{" "}
                    ในการเข้าสู่ระบบ
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
