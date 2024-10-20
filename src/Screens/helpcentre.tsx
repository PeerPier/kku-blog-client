import React, { useEffect, useState } from "react";
import "../misc/helpcentre.css";
import Navbar2 from "../Navbar/Navbar1";
import { fetchQuestionsAPI } from "../api/manageQAPI";

const HelpCentre = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "ฉันจะลงทะเบียนบัญชีใหม่ได้อย่างไร?",
      answer:
        "คุณสามารถลงทะเบียนบัญชีใหม่ได้โดยการคลิกที่ปุ่ม “ลงทะเบียน” บนหน้าแรกของเว็บไซต์ จากนั้นกรอกข้อมูลที่จำเป็นเช่น ชื่อ, อีเมล, และรหัสผ่าน หลังจากกรอกข้อมูลเสร็จสิ้น ให้คลิกที่ปุ่ม “สมัครสมาชิก” และคุณจะได้รับอีเมลยืนยันการสมัครสมาชิก",
    },
    {
      question: "ฉันจะรีเซ็ตรหัสผ่านของฉันได้อย่างไร?",
      answer:
        "คลิกที่ปุ่ม “ลืมรหัสผ่าน” บนหน้าเข้าสู่ระบบ จากนั้นกรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณ",
    },
    {
      question: "ฉันจะเขียนบล็อกใหม่ได้อย่างไร?",
      answer:
        "หลังจากเข้าสู่ระบบ คลิกที่ปุ่ม( ไอคอน + ) จากนั้นกรอกหัวข้อ ประเภทและเนื้อหาของบล็อกของคุณ คุณยังสามารถเพิ่มรูปภาพได้ หากต้องการเผยแพร่ ให้คลิกที่ปุ่ม “โพสต์”",
    },
    {
      question: "ฉันจะแก้ไขหรืออัปเดตบล็อกที่ฉันเขียนไว้ได้อย่างไร?",
      answer:
        "ไปที่ “บล็อกของฉัน” ในแถบเมนู คลิกที่บล็อกที่ต้องการแก้ไข จากนั้นคลิกที่ปุ่ม “แก้ไข” เพื่อทำการอัปเดตเนื้อหาหรือรายละเอียดของบล็อก.",
    },
    {
      question: "ฉันจะเปลี่ยนข้อมูลโปรไฟล์ของฉันได้อย่างไร?",
      answer:
        "ไปที่หน้า “โปรไฟล์” คลิกที่ปุ่ม “แก้ไขโปรไฟล์” จากนั้นคุณสามารถอัปเดตข้อมูลที่ต้องการ เช่น ชื่อ, อีเมล, ภาพโปรไฟล์และอื่นๆของคุณ",
    },
    {
      question: "ฉันไม่สามารถเข้าสู่ระบบได้ ฉันควรทำอย่างไร?",
      answer:
        "ตรวจสอบให้แน่ใจว่าคุณใช้ชื่อผู้ใช้และรหัสผ่านที่ถูกต้อง หากคุณยังไม่สามารถเข้าสู่ระบบได้ ให้คลิกที่ “ลืมรหัสผ่าน”",
    },
    {
      question: "ฉันจะเปลี่ยนข้อมูลโปรไฟล์ของฉันได้อย่างไร?",
      answer:
        "ไปที่หน้า “โปรไฟล์” คลิกที่ปุ่ม “แก้ไขโปรไฟล์” จากนั้นคุณสามารถอัปเดตข้อมูลที่ต้องการ เช่น ชื่อ, อีเมล, ภาพโปรไฟล์และอื่นๆของคุณ",
    },
    {
      question: "บล็อกของฉันไม่แสดงในหน้าแรก ฉันต้องทำอย่างไร?",
      answer:
        "ตรวจสอบว่าได้คลิก “โพสต์” บล็อกของคุณหรือไม่ หากบล็อกของคุณยังไม่แสดงให้ตรวจสอบว่ามีการตั้งค่าความเป็นส่วนตัวอย่างไร",
    },
  ];

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
      <Navbar2 />
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
