import { API_BASE_URL } from "../api/const/apiBaseUrl";

export const uploadImage = async (img: File) => {
  let imgUrl = null;

  const formData = new FormData();
  formData.append("file", img);

  try {
    const uploadResponse = await fetch(`${API_BASE_URL}/get-upload-picture`, {
      method: "POST",
      body: formData,
    });

    if (uploadResponse.ok) {
      const { filename } = await uploadResponse.json();
      imgUrl = `${API_BASE_URL}/uploads/${filename}`;
    } else {
      throw new Error("Error uploading image");
    }
  } catch (error) {
    console.error("Error during image upload:", error);
  }

  return imgUrl; // ส่งกลับ URL ของไฟล์ที่อัพโหลด
};
