import React, { useState, useEffect } from "react";
import { PiUsersThreeFill } from "react-icons/pi";
import { LuView } from "react-icons/lu";
import {
  fetchAdminProfile,
  fetchUsersAPI,
  deleteUserAPI,
} from "../../api/adminProfile";
import { useParams } from "react-router-dom";
import GenderChart from "./Chart/GenderChart";

interface User {
  _id: string;
  username: string;
  email: string;
  profile_picture: string;
}

const ManageUser: React.FC = () => {
  const { adminId } = useParams<{ adminId: string }>();
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const genderData = {
    male: 30,
    female: 20,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (adminId) {
          const profileData = await fetchAdminProfile(adminId);
          setUsername(profileData.username);
          setAdminProfile(profileData);
          setEmail(profileData.email);
          setTel(profileData.tel);
          setFirstname(profileData.firstname);
          setLastname(profileData.lastname);
        }
        const usersData = await fetchUsersAPI();
        console.log("usersData", usersData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [adminId]);

  const handleEditUser = (userId: string) => {
    console.log("Edit user with ID:", userId);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserAPI(userId);
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="manageUser">
      <div className="main1">
        <h1>จัดการบัญชีผู้ใช้</h1>

        <div className="insights">
          <div className="user-all">
            <PiUsersThreeFill className="svg1" />
            <div className="middle">
              <div className="left">
                <h3>ผู้ใช้ทั้งหมด</h3>
                <h1>{users.length}</h1>
              </div>
            </div>
            <small className="text-muted1">Last 24 Hour</small>
          </div>

          <div className="view-all">
            <LuView className="svg2" />
            <div className="middle">
              <div className="left">
                <h3>ผู้ใช้ใหม่</h3>
                <h1>256</h1>
              </div>
              <div className="progres">
                <svg className="svg4">
                  <circle cx="38" cy="38" r="36"></circle>
                </svg>
                <div className="number">
                  <p>80%</p>
                </div>
              </div>
            </div>
            <small className="text-muted1">Last 24 Hour</small>
          </div>

          <div className="blogpost-all">
            <div className="middle">
              <GenderChart data={genderData} />
            </div>
          </div>
        </div>

        <div className="recent-order" style={{ marginTop: "1.5rem" }}>
          <h2>รายการ</h2>
          <div className="right">
            <div
              className="activity-analytics"
              style={{
                marginTop: "0.5rem",
                overflowY: "scroll",
                maxHeight: "300px",
              }}
            >
              {/* {users.map((user) => (
                <div className="item" key={user._id}>
                  <div className="profile-photo">
                    <img src={user.profile_picture} alt={user.username} />
                  </div>
                  <div className="right">
                    <div className="info">
                      <h3>{user.username}</h3>
                      <small className="text-muted1">{user.email}</small>
                    </div>
                    <div className="manage d-flex ">
                      <div
                        className="edit warning"
                        style={{ paddingRight: "10px" }}
                        onClick={() => handleEditUser(user._id)}
                      >
                        <h3>Edit</h3>
                      </div>
                      <div
                        className="delete danger"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <h3>Delete</h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
