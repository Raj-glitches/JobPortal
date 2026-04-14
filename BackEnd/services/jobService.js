const fetchJSearchJobs = async (page = 1, query = "developer") => {
  try {
    const response = await axios.get(JSEARCH_BASE_URL, {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      params: {
        query,
        page,
        num_pages: 1, // ✅ IMPORTANT: keep 1
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error("JSearch API error:", error.message);
    return [];
  }
};