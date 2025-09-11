export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { GITHUB_TOKEN, GIST_ID_CEULOOKUP, GIST_FILENAME_CEULOOKUP } = process.env;

    if (!GITHUB_TOKEN || !GIST_ID_CEULOOKUP || !GIST_FILENAME_CEULOOKUP) {
      return res.status(500).json({ message: "Missing required environment variables" });
    }

    const body = req.body;
    if (!body || typeof body !== "object") {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const updateRes = await fetch(`https://api.github.com/gists/${GIST_ID_CEULOOKUP}`, {
      method: "PATCH",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME_CEULOOKUP]: {
            content: JSON.stringify(body, null, 2),
          },
        },
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`GitHub API error: ${errText}`);
    }

    return res.status(200).json({ message: "Gist updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

