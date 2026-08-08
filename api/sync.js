// Vercel Serverless API Handler: Data Persistence & GitHub Sync Engine
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'elielos123';
const REPO = 'hubpersonal';
const PATH = 'projects.json';

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = GITHUB_TOKEN || req.headers['x-github-token'];
  if (!token) {
    return res.status(401).json({ error: 'GitHub token required in environment or header' });
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Vercel-Sync-Engine',
    'Content-Type': 'application/json'
  };

  try {
    const fileUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
    const ghRes = await fetch(fileUrl, { headers });
    
    if (!ghRes.ok) {
      return res.status(500).json({ error: 'Failed to connect to GitHub repository' });
    }

    const ghData = await ghRes.json();
    const sha = ghData.sha;
    const contentUtf8 = Buffer.from(ghData.content, 'base64').toString('utf8');
    const cloudState = JSON.parse(contentUtf8);
    const cloudTimestamp = cloudState.lastUpdated || '1970-01-01T00:00:00.000Z';

    // GET Request: Return current cloud state
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        cloudState,
        lastUpdated: cloudTimestamp
      });
    }

    // POST Request: Process sync with timestamp conflict resolution
    if (req.method === 'POST') {
      const { state, clientTimestamp } = req.body || {};

      if (!state || !clientTimestamp) {
        return res.status(400).json({ error: 'Invalid payload: state and clientTimestamp required' });
      }

      const clientTime = new Date(clientTimestamp).getTime();
      const cloudTime = new Date(cloudTimestamp).getTime();

      // Rule: Only overwrite cloud if client timestamp is NEWER than cloud timestamp
      if (clientTime > cloudTime) {
        state.lastUpdated = clientTimestamp;
        const updatedContentBase64 = Buffer.from(JSON.stringify(state, null, 2)).toString('base64');

        const putRes = await fetch(fileUrl, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `sync: update state from web client (${clientTimestamp})`,
            content: updatedContentBase64,
            sha: sha
          })
        });

        if (putRes.ok) {
          return res.status(200).json({
            success: true,
            action: 'updated_cloud',
            lastUpdated: clientTimestamp
          });
        } else {
          const errData = await putRes.json();
          return res.status(500).json({ error: 'Failed to commit to GitHub', details: errData });
        }
      } else {
        // Cloud is newer: Do NOT overwrite. Return newer cloud state to client!
        return res.status(200).json({
          success: true,
          action: 'pulled_cloud_to_client',
          cloudState,
          lastUpdated: cloudTimestamp,
          message: 'Cloud data is newer. Client state was updated with cloud data.'
        });
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Sync Engine Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
