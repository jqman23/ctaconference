export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    const gistId = process.env.SESSION_SPEAKER_GIST_ID;

    if (!token || !gistId) {
      return res.status(500).json({ message: 'Missing GitHub credentials in environment variables' });
    }

    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);

    const gistResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          "session-speaker-index.json": {
            content: body
          }
        }
      })
    });

    if (!gistResponse.ok) {
      const errorText = await gistResponse.text();
      return res.status(gistResponse.status).json({ message: errorText });
    }

    const gistData = await gistResponse.json();
    res.status(200).json({ message: 'Gist updated successfully', url: gistData.html_url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
