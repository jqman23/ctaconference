export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const body = req.body; // frontend sends JSON already

    // Simple validation
    if (!body.SESSIONS_AS_OF || !body.PBKDF2_ITERATIONS || !Array.isArray(body.ATTENDEE_INDEX)) {
      return res.status(400).json({ message: "Invalid schema" });
    }

    const token = process.env.GITHUB_TOKEN;
    const gistId = process.env.GIST_ID_CEULOOKUP;
    const filename = process.env.GIST_FILENAME_CEULOOKUP;

    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github+json"
      },
      body: JSON.stringify({
        files: {
          [filename]: {
            content: JSON.stringify(body, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ message: "GitHub update failed", error: errText });
    }

    return res.status(200).json({ message: "Gist updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
