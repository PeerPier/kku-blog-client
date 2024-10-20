import toast, { Toaster } from "react-hot-toast"
import AnimationWrapper from "./page-animation"
import { MdClose } from "react-icons/md"
import { useContext } from "react"
import { EditorContext } from "./editor-page"
import "../misc/publish-form.css"
import { UserContext } from "../App"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import Tag from "../components/tags.component"
import { API_BASE_URL } from "../api/const/apiBaseUrl"

const PublishForm = () => {
  let { blog_id } = useParams()
  const characterLimit = 200
  const tagLimit = 10
  const context = useContext(EditorContext)
  let {
    userAuth: { access_token },
  } = useContext(UserContext)
  const navigate = useNavigate()

  // ตรวจสอบว่ามีข้อมูลหรือไม่
  if (!context) {
    return <div>Error: Context not found!</div>
  }

  let {
    blog,
    blog: { banner, topic, tags, des, content },
    setEditorState,
    setBlog,
  } = context

  const handleCloseEvent = () => {
    setEditorState("editor")
  }

  const handleBlogTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target

    setBlog({ ...blog, topic: input.value })
  }

  const handleBlogDesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let input = e.target

    setBlog({ ...blog, des: input.value })
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      let input = e.target as HTMLInputElement
      let tag = input.value

      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] })
        } else {
          toast.error(`คุณเพิ่มสูงสุดแล้ว ${tagLimit}`)
        }
      }
      input.value = ""
    }
  }

  const publishBlog = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLButtonElement
    if (target.className.includes("disable")) {
      return
    }
    if (!topic.length) {
      return toast.error("เขียนชื่อบล็อกก่อนเผยแพร่")
    }
    if (!des.length || des.length > characterLimit) {
      return toast.error(
        `เขียนรายละเอียดเกี่ยวกับบล็อกของคุณภายใน ${characterLimit} ตัวอักษรก่อนเผยแพร่`
      )
    }
    if (!tags.length) {
      return toast.error("กรอกอย่างน้อย 1 แท็ก เพื่อช่วยจัดอันดับบล็อกของคุณ")
    }
    let loadingToast = toast.loading("กำลังเผยแพร่...")
    target.classList.add("disable")

    let blogObj = {
      topic,
      banner,
      des,
      content,
      tags,
      draft: false,
    }
    axios
      .post(
        API_BASE_URL + "/create-blog",
        { ...blogObj, id: blog_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        target.classList.remove("disable")

        toast.dismiss(loadingToast)
        toast.success("เผยแพร่แล้ว")

        setTimeout(() => {
          navigate("/")
        }, 500)
      })
      .catch(({ response }) => {
        target.classList.remove("disable")
        toast.dismiss(loadingToast)

        return toast.error(response.data.error)
      })
  }

  // const publishBlog = async (e: React.MouseEvent<HTMLButtonElement>) => {
  //   const target = e.target as HTMLButtonElement;

  //   if (target.className.includes("disable")) {
  //     return;
  //   }

  //   if (!topic.length) {
  //     return toast.error("เขียนชื่อบล็อกก่อนเผยแพร่");
  //   }

  //   if (!des.length || des.length > characterLimit) {
  //     return toast.error(
  //       `เขียนรายละเอียดเกี่ยวกับบล็อกของคุณภายใน ${characterLimit} ตัวอักษรก่อนเผยแพร่`
  //     );
  //   }

  //   if (!tags.length) {
  //     return toast.error("กรอกอย่างน้อย 1 แท็ก เพื่อช่วยจัดอันดับบล็อกของคุณ");
  //   }

  //   let loadingToast = toast.loading("กำลังเผยแพร่...");
  //   target.classList.add("disable");

  //   let blogObj = {
  //     topic,
  //     banner,
  //     des,
  //     content: { blocks: content.blocks },
  //     tags,
  //     draft: false,
  //   };

  //   console.log("Content blocks:", content);

  //   try {
  //     const response = await fetch(API_URL + "/create-blog", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${access_token}`,
  //       },
  //       body: JSON.stringify(blogObj),
  //     });

  //     const responseData = await response.json();

  //     if (!response.ok) {
  //       throw new Error(responseData.error || "เกิดข้อผิดพลาดในการสร้างบล็อก");
  //     }

  //     console.log("Response data:", responseData);

  //     target.classList.remove("disable");
  //     toast.dismiss(loadingToast);
  //     toast.success("เผยแพร่แล้ว");

  //     setTimeout(() => {
  //       navigate("/");
  //     }, 500);
  //   } catch (error: any) {
  //     target.classList.remove("disable");
  //     toast.dismiss(loadingToast);
  //     toast.error(error.message);
  //   }
  // };

  return (
    <AnimationWrapper>
      <Toaster />
      <section className='section-publish'>
        <button className='button-publish-close' onClick={handleCloseEvent}>
          <MdClose />
        </button>

        <div className='center' style={{ maxWidth: "550px" }}>
          <p style={{ wordBreak: "break-word", color: "#282828" }}>พรีวิว</p>
          <div className='div-img-banner'>
            <img src={banner} alt='' />
          </div>

          <h1 className='h1-topic'>{topic}</h1>

          <p className='des-p'>{des}</p>
        </div>

        <div className='div-p-text'>
          <p className='p-text'>Blog Title</p>
          <input
            type='text'
            placeholder='Blog Title'
            defaultValue={topic}
            className='input-box pl-4'
            onChange={handleBlogTitleChange}
          />

          <p className='p-text'>รายละเอียดเกี่ยวกับบล็อกของคุณ</p>

          <textarea
            maxLength={characterLimit}
            defaultValue={des}
            className='textarea-input-box input-box'
            onChange={handleBlogDesChange}
            onKeyDown={handleTitleKeyDown}
          ></textarea>

          <p className='p-characters'>
            {characterLimit - des.length} characters left
          </p>

          <p className='topic-p'>
            หัวเรื่อง -(ช่วยค้นหาและจัดอันดับบล็อกของคุณ)
          </p>

          <div className='position-relative input-box pl-2 pb-4'>
            <input
              type='text'
              placeholder='หัวเรื่อง'
              className='sticky-bg input-box '
              onKeyDown={handleKeyDown}
            />
            {tags.map((tag, i) => {
              return <Tag tag={tag} tagIndex={i} key={i} />
            })}
          </div>
          <p className='p-tagLimit'>{tagLimit - tags.length} Tags left</p>

          <button
            className='btn-dark'
            style={{ paddingLeft: "2rem", paddingRight: "2rem" }}
            onClick={publishBlog}
          >
            เผยแพร่
          </button>
        </div>
      </section>
    </AnimationWrapper>
  )
}

export default PublishForm
