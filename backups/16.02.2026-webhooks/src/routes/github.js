const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// GitHub Token aus Umgebung oder Anfrage
function getGitHubToken(req) {
  return req.headers['x-github-token'] || process.env.GITHUB_TOKEN;
}

// GitHub Verbindung testen
router.get('/status', async (req, res) => {
  const token = getGitHubToken(req);
  
  if (!token) {
    return res.json({
      success: false,
      connected: false,
      message: 'Kein GitHub Token konfiguriert'
    });
  }

  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    res.json({
      success: true,
      connected: true,
      user: {
        login: response.data.login,
        name: response.data.name,
        avatar_url: response.data.avatar_url
      }
    });
  } catch (error) {
    res.json({
      success: false,
      connected: false,
      message: error.response?.data?.message || 'Ungültiger Token'
    });
  }
});

// Repository Liste abrufen
router.get('/repos', async (req, res) => {
  const token = getGitHubToken(req);
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Kein Token' });
  }

  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      },
      params: { sort: 'updated', per_page: 50 }
    });

    res.json({
      success: true,
      repos: response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        description: repo.description,
        updated_at: repo.updated_at,
        url: repo.html_url
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Fehler beim Abrufen'
    });
  }
});

// Repository erstellen
router.post('/repo', async (req, res) => {
  const token = getGitHubToken(req);
  const { name, description, private: isPrivate } = req.body;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Kein Token' });
  }

  try {
    const response = await axios.post('https://api.github.com/user/repos', {
      name,
      description: description || 'Created with OpenClaw Dashboard',
      private: isPrivate || false,
      auto_init: true
    }, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    res.json({
      success: true,
      repo: {
        id: response.data.id,
        name: response.data.name,
        full_name: response.data.full_name,
        url: response.data.html_url
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Fehler beim Erstellen'
    });
  }
});

// Datei zu Repository pushen
router.post('/push', async (req, res) => {
  const token = getGitHubToken(req);
  const { owner, repo, path: filePath, content, message, branch } = req.body;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Kein Token' });
  }

  try {
    // Base64 encode content
    const encodedContent = Buffer.from(content).toString('base64');

    // Check if file exists
    let sha = null;
    try {
      const existingFile = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'
          },
          params: { ref: branch || 'main' }
        }
      );
      sha = existingFile.data.sha;
    } catch (e) {
      // File doesn't exist, that's okay
    }

    // Push file
    const payload = {
      message: message || `Update ${filePath} via OpenClaw`,
      content: encodedContent,
      branch: branch || 'main'
    };
    
    if (sha) {
      payload.sha = sha;
    }

    const response = await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      payload,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    res.json({
      success: true,
      commit: {
        sha: response.data.commit.sha,
        message: response.data.commit.message,
        url: response.data.commit.html_url
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Fehler beim Pushen'
    });
  }
});

// Ganzen Ordner pushen
router.post('/push-folder', async (req, res) => {
  const token = getGitHubToken(req);
  const { owner, repo, folderPath, branch, appName } = req.body;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Kein Token' });
  }

  const generatedPath = process.env.CONTEXT_PATH || '/openclaw/generated';
  const appFolder = path.join(generatedPath, appName);

  if (!fs.existsSync(appFolder)) {
    return res.status(404).json({ success: false, error: 'App-Ordner nicht gefunden' });
  }

  try {
    const results = [];
    const files = fs.readdirSync(appFolder);

    for (const file of files) {
      const filePath = path.join(appFolder, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const targetPath = folderPath 
          ? `${folderPath}/${file}` 
          : file;

        // Base64 encode
        const encodedContent = Buffer.from(content).toString('base64');

        // Check if exists
        let sha = null;
        try {
          const existing = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}`,
            {
              headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json'
              },
              params: { ref: branch || 'main' }
            }
          );
          sha = existing.data.sha;
        } catch (e) {}

        const payload = {
          message: `Add ${file} via OpenClaw`,
          content: encodedContent,
          branch: branch || 'main'
        };
        
        if (sha) {
          payload.sha = sha;
        }

        await axios.put(
          `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}`,
          payload,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json'
            }
          }
        );

        results.push({ file, success: true });
      }
    }

    res.json({
      success: true,
      message: `${results.length} Dateien gepusht`,
      files: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Fehler beim Pushen'
    });
  }
});

// Commits abrufen
router.get('/commits/:owner/:repo', async (req, res) => {
  const token = getGitHubToken(req);
  const { owner, repo } = req.params;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Kein Token' });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: { per_page: 10 }
      }
    );

    res.json({
      success: true,
      commits: response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Fehler beim Abrufen'
    });
  }
});

module.exports = router;
