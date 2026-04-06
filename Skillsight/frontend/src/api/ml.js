const BASE_URL = import.meta.env.VITE_API_URL;

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