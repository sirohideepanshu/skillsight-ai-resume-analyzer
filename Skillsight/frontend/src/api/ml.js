const BASE_URL = "https://skillsight-backend-ylix.onrender.com";

export const analyzeResume = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/api/ml/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("API ERROR:", error);
    return { success: false, error: "Frontend request failed" };
  }
};
