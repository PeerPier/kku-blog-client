import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MdCategory } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { Modal, Button } from "react-bootstrap";
import { fetchAllUser } from "../../api/adminProfile";

interface Blog {
  _id: string;
  blog_id: string;
  topic: string;
  banner: string;
  des: string;
  content: Array<{
    time: number;
    blocks: Array<{
      id: string;
      type: string;
      data: {
        text: string;
      };
    }>;
    version: string;
  }>;
  tags: string[];
  author: string;
  comments: any[];
  draft: boolean;
  likes: any[];
  saves: any[];
  views: number;
  publishedAt: string;
  updatedAt: string;
  __v: number;
}

const ManageCate: React.FC<{ blogsData: Blog[] }> = ({ blogsData }) => {
  const { id } = useParams<{ id: string }>();
  const [uniqueTags, setUniqueTags] = useState<any>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<{
    blog_id: string;
    tags: string;
    banner: string;
  } | null>(null);
  const [newTag, setNewTag] = useState("");
  const [getBlog, setGetBlog] = useState<Blog[]>();

  useEffect(() => {
    const formattedTags: Array<{
      blog_id: string;
      tags: string;
      banner: string;
    }> = [];

    (getBlog || blogsData).forEach((blog) => {
      const { blog_id, tags, banner } = blog;

      tags.forEach((tag) => {
        formattedTags.push({ blog_id, tags: tag, banner });
      });
    });

    setUniqueTags(formattedTags);
  }, [blogsData, getBlog]);

  const memoizedTags = useMemo(() => uniqueTags, [uniqueTags]);

  const handleEditTag = async () => {
    if (selectedTag) {
      try {
        const response = await fetch(
          "http://localhost:3001/create-blog/edit-tag",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              blog_id: selectedTag.blog_id,
              old_tag: selectedTag.tags,
              new_tag: newTag,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to edit tag");
        }

        setShowEditModal(false);
        const dataFetch = async () => {
          try {
            const AllPost = await fetchAllUser();

            setGetBlog(AllPost);
          } catch (error) {
            console.error("Error fetching user count:", error);
          }
        };
        dataFetch();
      } catch (error) {
        console.error("Error editing tag:", error);
      }
    }
  };

  const handleDeleteTag = async () => {
    if (selectedTag) {
      try {
        const response = await fetch(
          "http://localhost:3001/create-blog/deletetag",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              blog_id: selectedTag.blog_id,
              tag: selectedTag.tags,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete tag");
        }

        const updatedBlog = await response.json();

        setShowDeleteModal(false);
        const dataFetch = async () => {
          try {
            const AllPost = await fetchAllUser();

            setGetBlog(AllPost);
          } catch (error) {
            console.error("Error fetching user count:", error);
          }
        };
        dataFetch();
      } catch (error: any) {
        console.error("Error deleting tag:", error.message);
      }
    }
  };

  return (
    <div className="manageUser">
      <div className="main1">
        <h1>จัดการบัญชีผู้ใช้</h1>

        <div className="add-q">
          <div>
            <IoMdAdd />
            <a href="#" style={{ width: "150px" }}>
              เพิ่มหมวดหมู่
            </a>
          </div>
        </div>

        <div className="insights">
          <div className="user-all">
            <MdCategory className="svg1" />
            <div className="middle">
              <div className="left">
                <h3>หมวดหมู่ทั้งหมด</h3>
                <h1>{memoizedTags.length}</h1>
              </div>
            </div>
            <small className="text-muted1">Last 24 Hour</small>
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
              {memoizedTags.map(({ blog_id, tags, banner }: any) => (
                <div className="item" key={`${blog_id}-${tags}`}>
                  <div className="profile-photo">
                    <img src={banner} alt="" />
                  </div>
                  <div className="right">
                    <div className="info">
                      <h3>{tags}</h3>
                      <small className="text-muted1">อาหาร</small>
                    </div>
                    <div className="manage d-flex">
                      <div
                        className="edit warning"
                        style={{ paddingRight: "10px" }}
                        onClick={() => {
                          setSelectedTag({ blog_id, tags, banner });
                          setNewTag(tags);
                          setShowEditModal(true);
                        }}
                      >
                        <h3>Edit</h3>
                      </div>
                      <div
                        className="delete danger"
                        onClick={() => {
                          setSelectedTag({ blog_id, tags, banner });
                          setShowDeleteModal(true);
                        }}
                      >
                        <h3>Delete</h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Tag</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter new tag"
              className="form-control"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditTag}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this tag:{" "}
            <strong>{selectedTag?.tags}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteTag}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ManageCate;
