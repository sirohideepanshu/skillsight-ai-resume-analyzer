import API from "../services/api";

export const analyzeResume = async (data) => {
  try {
    const res = await API.post("/api/ml/analyze", data);
    return res.data;
  } catch (error) {
    console.error("ML API ERROR:", error);
    return { success: false, error: "ML request failed" };
  }
};
