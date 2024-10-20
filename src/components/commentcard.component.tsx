import { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { FaRegCommentDots } from "react-icons/fa";
import { BlogContext } from "../Screens/blog.page";
import axios from "axios";
import { API_BASE_URL } from "../api/post";

interface CommentCardProps {
  index: number;
  leftVal: number;
  commentData: {
    comment: string;
    commented_by: {
      profile_picture: string;
      fullname: string;
      username: string;
    };
    commentedAt?: string;
    _id?: string;
    isReplyingLoaded?: boolean;
    childrenLevel: number;
    children?: string[];
  };
}

const CommentCard = ({ index, leftVal, commentData }: CommentCardProps) => {
  let {
    commented_by: { profile_picture, fullname, username },
    comment,
    _id,
    commentedAt,
    children = [],
  } = commentData;

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const [isReplying, setReplying] = useState(false);

  const context = useContext(BlogContext);

  if (!context) {
    return null;
  }

  let {
    blog,
    blog: { comments, comments: { results: commentArr } = { results: [] } },
    setBlog,
  } = context;

  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("เข้าสู่ระบบก่อนจะตอบกลับ");
    }
    setReplying((preVal) => !preVal);
  };

  const removeCommentsCards = (startingPoint: number) => {
    if (commentArr[startingPoint]) {
      while (
        commentArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentArr.splice(startingPoint, 1);

        if (!commentArr[startingPoint]) {
          break;
        }
      }
    }
    setBlog({ ...blog, comments: { results: commentArr } });
  };

  const hideReplies = () => {
    commentData.isReplyingLoaded = false;
    removeCommentsCards(index + 1);
  };

  const loadReplies = ({ skip = 0 }) => {
    if (children.length) {
      hideReplies();

      axios
        .post(API_BASE_URL + "/create-blog/get-replies", { _id, skip })
        .then(({ data: { replies } }) => {
          commentData.isReplyingLoaded = true;

          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel = commentData.childrenLevel + 1;

            commentArr.splice(index + 1 + i + skip, 0, replies[i]);
          }

          setBlog({ ...blog, comments: { ...comments, results: commentArr } });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <div className="w-100" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div
        className="my-3 p-3"
        style={{ borderRadius: "0.375rem", border: "1px solid #f0f0f0" }}
      >
        <div className="d-flex gap-3 align-items-center mb-4">
          <img
            src={profile_picture}
            alt=""
            className="rounded-circle"
            style={{ width: "1.5rem", height: "1.5rem" }}
          />

          <p
            className="m-0"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: "1",
              overflow: "hidden",
            }}
          >
            {fullname} @{username}
          </p>
          <p className="m-0" style={{ minWidth: "fit-content" }}>
            {getDay(commentedAt || "ไม่ทราบวันที่")}
          </p>
        </div>

        <p className="m-0 ml-3">{comment}</p>

        <div
          className="d-flex gap-3 align-items-center mt-2"
          onClick={hideReplies}
        >
          {commentData.isReplyingLoaded ? (
            <button className="p-2 px-3 d-flex align-items-center gap-2 text-hide">
              <FaRegCommentDots />
              ซ่อนการตอบกลับ
            </button>
          ) : (
            <button
              className="p-2 px-3 d-flex align-items-center gap-2 text-hide"
              onClick={() => loadReplies({ skip: 0 })}
            >
              <FaRegCommentDots />
              {children.length}ตอบกลับ
            </button>
          )}
          <button
            className="text-decoration-underline"
            onClick={handleReplyClick}
          >
            ตอบกลับ
          </button>
        </div>

        {isReplying ? (
          <div className="mt-4">
            <CommentField
              action="ตอบกลับ"
              index={index}
              replyingTo={_id}
              setReplying={setReplying}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default CommentCard;
