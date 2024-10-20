export const uploadImage = async (img: File) => {
  let imgUrl = null;
  const API_URL = process.env.PUBLIC_APP_ENDPOINT || "https://kku-blog-server.onrender.com";

  const formData = new FormData();
  formData.append("file", img);

  try {
    const uploadResponse = await fetch(`${API_URL}/get-upload-picture`, {
      method: "POST",
      body: formData,
    });

    if (uploadResponse.ok) {
      const { filename } = await uploadResponse.json();
      imgUrl = `${API_URL}/uploads/${filename}`;
    } else {
      throw new Error("Error uploading image");
    }
  } catch (error) {
    console.error("Error during image upload:", error);
  }

  return imgUrl; // ส่งกลับ URL ของไฟล์ที่อัพโหลด
};
