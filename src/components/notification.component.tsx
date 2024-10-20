import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import axios from "axios";
import "../misc/dropdown-nav.css"; // Assuming this file includes custom styles.

const UserNotificationPanel = () => {
  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);
  const userId = sessionStorage.getItem("userId");

  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:3001";

  // Fetch notifications on component mount and every 5 seconds.
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/notifications?userId=${userId}`
        );

        if (response.status === 200) {
          setNotifications(response.data);
        } else {
          console.error("Failed to fetch notifications:", response.data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 5000);
    return () => clearInterval(intervalId);
  }, [userId]);

  // Handle the notification click (mark as read and navigate).
  const handleNotificationClick = async (
    e: React.MouseEvent<HTMLDivElement>,
    type: string,
    notificationId: string,
    entityId: string,
    userId: string
  ) => {
    e.preventDefault();

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/mark-as-read`
      );

      if (response.status === 200) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === notificationId
              ? { ...notification, seen: true }
              : notification
          )
        );
        // Navigate to the relevant page based on notification type.
        navigate(type === "follow" ? `/user/${userId}` : `/blog/${entityId}`);
      } else {
        console.error("Failed to mark notification as read:", response.data);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div
      style={{
        padding: "1rem",
        position: "absolute",
        width: "25rem",
        right: "0",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "1rem",
        zIndex: 1000,
      }}
    >
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        notifications.map((notification, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: notification.seen ? "transparent" : "#eaeaea",
              display: "flex",
              alignItems: "center",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "0.5rem",
              transition: "background-color 200ms ease",
              cursor: "pointer",
            }}
            onClick={(e) => {
              const entityId = notification.blog?.blog_id || notification._id;
              handleNotificationClick(
                e,
                notification.type,
                notification._id,
                entityId,
                notification.user._id
              );
            }}
          >
            <img
              src={notification.user.profile_picture}
              alt="User"
              className="rounded-circle"
              style={{
                height: "40px",
                width: "40px",
                objectFit: "cover",
                marginRight: "10px",
              }}
            />
            <div style={{ flexGrow: 1 }}>
              <p style={{ margin: 0, fontWeight: 500 }}>
                {notification.type === "follow"
                  ? `${notification.user.fullname} started following you`
                  : notification.type === "like"
                  ? `${notification.user.fullname} liked your blog`
                  : notification.type === "comment"
                  ? `${notification.user.fullname} commented on your blog`
                  : notification.type === "reply"
                  ? `${notification.user.fullname} replied to your comment`
                  : `${notification.user.fullname} commented on your blog`}
              </p>
              <small style={{ color: "#888" }}>
                {new Date(notification.createdAt).toLocaleString()}
              </small>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserNotificationPanel;
