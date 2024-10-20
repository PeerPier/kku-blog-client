import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  fetchUserProfile,
  fetchPostsByUser,
  fetchLikedPosts,
  fetchSavedPosts,
} from "../api/profile";
import { FaUserFriends } from "react-icons/fa";
import { Badge, Form } from "react-bootstrap";
import "../misc/edit-profile.css";
import "../misc/profile.css";
import { Button, Nav, Tab } from "react-bootstrap";
import { IoMdHeart } from "react-icons/io";
import { IoBookmark, IoDocumentText, IoStatsChart } from "react-icons/io5";
import { FollowingModal } from "./following-modal";
import { FollowerModal } from "./follower-modal";
import { deleteSave, likePost, savePost } from "../api/post";
import { Post } from "../types/post";
import { GoHeartFill } from "react-icons/go";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [checkUser, setCheckUser] = useState<boolean>(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const profileData = await fetchUserProfile(id);
          setUserProfile(profileData);
          setCheckUser(localStorage.getItem("userId") === id);
          setIsFollowing(
            profileData.followers.includes(localStorage.getItem("userId"))
          );
          // ดึงบล็อกที่ผู้ที่ Login โพสต์
          const posts = await fetchPostsByUser(id);

          // กรองเฉพาะบล็อกที่ถูกโพสต์โดยผู้ใช้ที่ login
          const filteredPosts = posts.filter(
            (post: Post) => post.user._id === localStorage.getItem("userId")
          );

          // ตั้งค่าบล็อกที่กรองแล้ว
          setUserPosts(filteredPosts);

          // ดึงบล็อกที่ผู้ใช้กดถูกใจ
          const liked = await fetchLikedPosts(id);
          const filteredLiked = liked.filter((post: Post[]) => post !== null);
          console.log("Fetched liked posts in Profile:", filteredLiked);
          setLikedPosts(filteredLiked as Post[]);

          // ดึงบล็อกที่ผู้ใช้บันทึก
          const saved = await fetchSavedPosts(id);
          const filteredSaved = saved.filter((post: Post[]) => post !== null);
          console.log("Fetched save posts in Profile:", filteredSaved);
          setSavedPosts(filteredSaved as Post[]);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchData();
  }, [id]);

  const handleFollow = useCallback(async () => {
    const API_BASE_URL = "http://localhost:3001/follow";
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ me: localStorage.getItem("userId"), you: id }),
      });
      if (!response.ok) {
        const statusText = response.statusText || "Unknown Error";
        throw new Error(
          `Server returned ${response.status} ${statusText} for ${API_BASE_URL}`
        );
      }
      const followerData = await response.json();
      setUserProfile(followerData.newFollow);
      setIsFollowing(followerData.newFollow.if_followed);
    } catch (error) {
      console.error("Error:", (error as Error).message);
    }
  }, [id, isFollowing]);

  const handleUnfollow = useCallback(async () => {
    const API_BASE_URL_DELETE = "http://localhost:3001/follow/delete";
    try {
      const response = await fetch(API_BASE_URL_DELETE, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ me: localStorage.getItem("userId"), you: id }),
      });
      if (!response.ok) {
        const statusText = response.statusText || "Unknown Error";
        throw new Error(
          `Server returned ${response.status} ${statusText} for ${API_BASE_URL_DELETE}`
        );
      }
      const res = await response.json();
      setUserProfile(res.unFollow);
      setIsFollowing(false);
    } catch (error) {
      console.error("Error:", (error as Error).message);
    }
  }, [id, isFollowing]);

  const handleEdit = () => {
    navigate(`/profile/edit-profile/${id}`);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "วิชาเสรี":
        return "category-วิชาเสรี";
      case "ข่าวสาร/ประชาสัมพันธ์":
        return "category-ข่าวสารประชาสัมพันธ์";
      case "น้องใหม่":
        return "category-น้องใหม่";
      case "ลงทะเบียนเรียน":
        return "category-ลงทะเบียนเรียน";
      case "กีฬา":
        return "category-กีฬา";
      case "ทั่วไป":
        return "category-ทั่วไป";
      case "รีวิวมข":
        return "category-รีวิวมข";
      default:
        return "";
    }
  };

  const handleLike = async (postId: string) => {
    if (!userId) {
      console.error("User ID is undefined");
      return;
    }

    try {
      await likePost(postId);
      setUserPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likes: [...post.likes, { user: userId } as any] }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSavePost = async (postId: string) => {
    if (!userId) {
      console.error("User ID is null");
      return;
    }

    try {
      const isAlreadySaved = savedPosts.some((post) => post._id === postId);

      if (isAlreadySaved) {
        await deleteSave(postId);
        setSavedPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
      } else {
        await savePost(postId);
        const savedPost = await fetchSavedPosts(userId);
        setSavedPosts(savedPost);
      }

      // เพิ่ม log เพื่อตรวจสอบสถานะการบันทึก
      console.log(
        `Post ID ${postId} is now ${isAlreadySaved ? "un-saved" : "saved"}`
      );
    } catch (e) {
      console.error("Failed to save or unsave post:", e);
    }
  };

  const handleClickCard = (id: string) => {
    navigate(`/content/${id}`);
  };

  return (
    <div>
      <Form className="profile">
        <div className="profile">
          <div className="coverpic">
            <img
              className="d-block w-100"
              src={userProfile?.cover_pic || ""}
              alt="Cover"
              style={{
                height: "60vh",
                objectFit: "cover",
              }}
            />
          </div>
          <div
            className="ex-Pro1"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              className="profilepic"
              style={{
                width: "230px",
                height: "230px",
                objectFit: "cover",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                className="d-block w-100"
                src={userProfile?.profile_picture || ""}
                alt="Profile"
                style={{
                  objectFit: "cover",
                  border: "5px solid white",
                  borderRadius: "200px",
                }}
              />
            </div>
          </div>
        </div>
      </Form>

      <div
        className="detail-profile"
        style={{ marginTop: "8rem", textAlign: "center" }}
      >
        {userProfile && (
          <div>
            <div className="d-flex justify-content-center">
              <h1 style={{ padding: "0 10px 0 10px" }}>
                {userProfile.firstname}
              </h1>
              <h1 style={{ padding: "0 10px 0 10px" }}>
                {userProfile.lastname}
              </h1>
            </div>
            <p className="fw-bold fs-5">@{userProfile.username}</p>
          </div>
        )}
      </div>
      <div className="follow">
        {userProfile && (
          <div className="follow-icon">
            <FaUserFriends />
            <FollowerModal userProfile={userProfile} />
          </div>
        )}

        <div className="bar-icon"></div>

        {userProfile && (
          <div className="follow-icon">
            <FaUserFriends />
            <FollowingModal userProfile={userProfile} />
          </div>
        )}
      </div>
      {checkUser ? (
        <div className="edit d-flex justify-content-center my-4">
          <Button
            variant="dark"
            style={{ marginRight: "10px" }}
            onClick={handleEdit}
          >
            แก้ไขโปรไฟล์
          </Button>
          <Button variant="dark" style={{ marginRight: "10px" }}>
            แชร์โปรไฟล์
          </Button>
        </div>
      ) : (
        <div className="edit d-flex justify-content-center my-4">
          <Button
            variant="dark"
            style={{ marginRight: "10px" }}
            onClick={isFollowing ? handleUnfollow : handleFollow}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
          <Button variant="dark" style={{ marginRight: "10px" }}>
            ข้อความ
          </Button>
        </div>
      )}
      <Tab.Container id="myTab" defaultActiveKey="home-tab">
        <Nav variant="underline" className="justify-content-center">
          <Nav.Item>
            <Nav.Link eventKey="home-tab" className="nav-link-custom">
              <IoDocumentText style={{ color: "blue" }} />
              <p>บล็อกของฉัน</p>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="likeblog-tab" className="nav-link-custom">
              <IoMdHeart style={{ color: "red" }} />
              <p>บล็อกที่ถูกใจ</p>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="saveblog-tab" className="nav-link-custom">
              <IoBookmark style={{ color: "#cb6ce6" }} />
              <p>บล็อกที่บันทึก</p>
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="home-tab">
            {userPosts.length > 0 ? (
              <div className="blog-list">
                {userPosts.map((post) => (
                  <div
                    key={post._id}
                    className="row"
                    onClick={() => handleClickCard(post._id)}
                  >
                    <img src={post.image} alt={post.topic} />
                    <div className="user-name d-flex align-items-center justify-content-between mt-2">
                      <div className="user-feed d-flex align-items-center">
                        <img
                          src={`${post.user.profile_picture}`}
                          alt=""
                          style={{ margin: "0.5rem 0.5rem 0.5rem 0 " }}
                        />
                        <h6 style={{ fontSize: "16px" }}>
                          {post.user.username}
                        </h6>
                      </div>
                      <div className="stat-icon">
                        <IoStatsChart style={{ fontSize: "16px" }} />
                      </div>
                    </div>
                    <div className="detail-blog">
                      <h4>{post.topic}</h4>
                      <div style={{ marginBottom: "10px" }}>
                        {post.category.map((category) => (
                          <span
                            key={category}
                            className={`category ${getCategoryBadgeClass(
                              category
                            )}`}
                            style={{ marginRight: "5px" }}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      <p>
                        {post.contentWithImages
                          .map((cwi) => cwi.content)
                          .join("\n")}
                      </p>
                      <div
                        className="action-iconBlog"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "10px",
                        }}
                      >
                        <Badge bg="light" text="dark">
                          <GoHeartFill
                            style={{ fontSize: "16px", marginRight: "5px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post._id);
                            }}
                            color={
                              post.likes.find((l) => l.user === userId)
                                ? "red"
                                : "black"
                            }
                          />
                          {post.likes.length}
                        </Badge>

                        <Badge bg="light" text="dark">
                          <IoBookmark
                            style={{
                              marginRight: "5px",
                              fontSize: "16px",
                              color: savedPosts.some(
                                (savedPost) => savedPost?._id === post?._id
                              )
                                ? "#cb6ce6"
                                : "black",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSavePost(post._id);
                            }}
                          />
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No posts available</p>
            )}
          </Tab.Pane>
          <Tab.Pane eventKey="likeblog-tab">
            {likedPosts.length > 0 ? (
              <div className="blog-list">
                {likedPosts.map((post) => (
                  <div key={post?._id} className="row">
                    {post?.image ? (
                      <img src={post.image} alt={post.topic} />
                    ) : (
                      <p>No image available</p>
                    )}
                    <p>{post?.topic}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No liked posts available</p>
            )}
          </Tab.Pane>

          <Tab.Pane eventKey="saveblog-tab">
            {savedPosts.length > 0 ? (
              <div className="blog-list">
                {savedPosts.map((post) => (
                  <div key={post?._id} className="row">
                    {post?.image ? (
                      <img src={post.image} alt={post.topic} />
                    ) : (
                      <p>No image available</p>
                    )}
                    <p>{post?.topic}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No save posts available</p>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default Profile;
