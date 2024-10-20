import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { getDay } from "../../common/date";

interface Report {
  _id: string;
  reason: string;
  verified: boolean;
  status: string;
  createdAt: string;
  reportedBy: {
    _id: string;
    fullname: string;
  };
  post: {
    _id: string;
    author: {
      _id: string;
      fullname: string;
      banner: string;
      profile_picture: string;
    };
    content: [
      {
        time: number;
        blocks: [
          {
            id: string;
            type: string;
            data: {
              text: string;
            };
          }
        ];
        version: string;
      }
    ];
    image: string;
    topic: string;
    detail: string;
    tags: string[];
    banner: string;
    publishedAt: string;
    contentWithImages: {
      content: string;
      images?: string[];
    }[];
  };
}

interface ReportDetailsModalProps {
  showModal: boolean;
  handleClose: () => void;
  report: Report | null;
  refreshReports: () => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  showModal,
  handleClose,
  report,
  refreshReports,
}) => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.PUBLIC_APP_ENDPOINT || "https://kku-blog-server.onrender.com";

  const verifyReport = async (
    reportId: string,
    isVerified: boolean
  ): Promise<AxiosResponse<any>> => {
    const url = `${API_BASE_URL}/api/report/${reportId}/verify`;

    try {
      const response = await axios.patch(url, {
        verified: isVerified,
      });

      if (response.status !== 200) {
        throw new Error(`Failed to verify report: ${response.statusText}`);
      }

      return response;
    } catch (error: any) {
      console.error("Error verifying report:", error.message);
      throw error;
    }
  };

  const deletePostAndVerifyReport = async (
    reportId: string,
    postId: string
  ): Promise<any> => {
    const url = `${API_BASE_URL}/api/report/${reportId}/deletePost`;
    const token = Cookies.get("token");

    if (!token) {
      throw new Error("Authentication token is missing");
    }

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status} ${response.statusText} for report ${reportId}`
        );
      }

      return response.json();
    } catch (error: any) {
      console.error("Error deleting post and verifying report:", error.message);
      throw error;
    }
  };

  const handleVerification = async (isVerified: boolean) => {
    if (!report) {
      console.error("No report found");
      return;
    }

    try {
      await verifyReport(report._id, isVerified);
      console.log("Report verified successfully");

      if (!isVerified && report.post && report.post._id) {
        await deletePostAndVerifyReport(report._id, report.post._id);
        console.log("Post deleted successfully");
      }

      refreshReports();
      handleClose();
    } catch (error) {
      console.error("Failed to verify report:", error);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Report Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="blogpage">
          <img
            src={report?.post.banner}
            alt="banner"
            style={{ aspectRatio: "16/9" }}
          />

          <div className="mt-2">
            <h2 className="mt-4 fs-3">{report?.post.topic}</h2>

            <div className="detail-user d-flex  justify-content-between my-4">
              <div className="d-flex gap-2 align-items-start">
                <img
                  src={report?.post.author.profile_picture}
                  alt=""
                  className="rounded-circle"
                  style={{ width: "3rem", height: "3rem" }}
                />

                <p className="m-0" style={{ textTransform: "capitalize" }}>
                  {report?.post.author.fullname}
                  <br />@
                  <Link
                    to={`/user/${report?.post.author.fullname}`}
                    className="underline "
                    style={{ color: "inherit" }}
                  >
                    {report?.post.author.fullname}
                  </Link>
                </p>
              </div>
              <p className="m-0 published-detail">
                เผยแพร่เมื่อ:{" "}
                {report?.post.publishedAt
                  ? getDay(report?.post.publishedAt)
                  : "ไม่ทราบวันที่"}
              </p>
            </div>
            <p>
              {report?.post.content.map((e) =>
                e.blocks.map((s) => <span key={s.id}>{s.data.text}</span>)
              )}
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={() => handleVerification(true)}>
          Verified
        </Button>
        <Button variant="danger" onClick={() => handleVerification(false)}>
          Not Verified
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportDetailsModal;
