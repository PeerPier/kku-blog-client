import axios from "axios";
import { API_BASE_URL } from "../api/post";
import { Post } from "../types/post";

interface FilterPaginationDataProps {
  create_new_arr?: boolean;
  state?: any;
  data: any[];
  page: number;
  countRoute: string;
  data_to_send?: any; // ให้เป็น optional
}

export const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {},
}: FilterPaginationDataProps) => {
  let obj;

  if (state && !create_new_arr) {
    obj = { ...state, result: [...state.result, ...data], page: page };
  } else {
    try {
      const response = await axios.post(
        API_BASE_URL + countRoute,
        data_to_send
      );
      const totalDocs = response.data.totalDocs; // ใช้ totalDocs จากการตอบกลับ API
      obj = { result: data, page: 1, totalDocs }; // จัดเก็บข้อมูลทั้งหมดใน obj
    } catch (err) {
      console.error(err); // แสดงข้อผิดพลาดหากมี
    }
  }
  return obj;
};
