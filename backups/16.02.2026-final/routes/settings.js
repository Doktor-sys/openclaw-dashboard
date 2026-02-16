const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Settings file path
const SETTINGS_FILE = path.join(process.cwd(), '..', '..', 'openclaw', 'config', 'settings.json');
const ENV_FILE = path.join(process.cwd(), '..', '..', 'openclaw', 'config', 'settings.env');

// Default settings
const DEFAULT_SETTINGS = {
  version: '2.0',
  lastUpdated: new Date().toISOString(),
  
  // API Keys (masked in responses)
  apiKeys: {
    kimi: {
      enabled: true,
      key: '',
      model: 'kimi-k2.5-free',
      baseUrl: 'https://api.moonshot.cn/v1',
      maxTokens: 8000,
      temperature: 0.2,
      timeout: 60
    },
    openai: {
      enabled: false,
      key: '',
      defaultModel: 'gpt-4o-mini',
      premiumModel: 'gpt-4o',
      baseUrl: 'https://api.openai.com/v1',
      maxTokens: 4000,
      temperature: 0.3,
      timeout: 45
    },
    anthropic: {
      enabled: false,
      key: '',
      opusModel: 'claude-opus-4',
      sonnetModel: 'claude-sonnet-4',
      baseUrl: 'https://api.anthropic.com/v1',
      maxTokens: 8000,
      temperature: 0.3,
      timeout: 90
    },
    ollama: {
      enabled: false,
      baseUrl: 'http://localhost:11434',
      model: 'codellama',
      maxTokens: 4000,
      temperature: 0.2,
      timeout: 120
    }
  },
  
  // Agent Configuration
  agent: {
    routingStrategy: 'intelligent',
    fallbackEnabled: true,
    fallbackChain: ['kimi', 'gpt-mini', 'local'],
    costLimitDaily: 50.00,
    costLimitMonthly: 1000.00,
    costAlertThreshold: 80,
    preferFreeTier: true,
    maxRetries: 3,
    retryDelay: 2000,
    timeoutDefault: 60,
    timeoutPremium: 120,
    qualityMinScore: 7.5,
    codeReviewRequired: true,
    autoRetryOnFailure: true
  },
  
  // Dashboard Settings
  dashboard: {
    theme: 'light',
    language: 'de',
    autoSave: true,
    autoSaveInterval: 30,
    showWelcome: true,
    compactMode: false,
    animations: true,
    notifications: true,
    defaultSection: 'overview',
    kanbanColumns: 3,
    itemsPerPage: 20
  },
  
  // Notifications
  notifications: {
    email: {
      enabled: false,
      address: '',
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      useTls: true
    },
    push: {
      enabled: true,
      browser: true,
      mobile: false
    },
    bot: {
      status: true,
      errors: true,
      success: false
    },
    task: {
      assigned: true,
      due: true,
      completed: true
    },
    system: {
      updates: true,
      errors: true,
      maintenance: true
    }
  },
  
  // Code Generation
  codegen: {
    defaultTemplate: 'react-standalone',
    standaloneHtml: true,
    inlineCss: true,
    cdnReact: true,
    outputPath: '/tmp/openclaw_generated',
    hostPath: 'C:/openclaw/generated',
    autoCopy: true,
    createReadme: true,
    createPackageJson: false,
    minQualityScore: 7.0,
    autoReview: false,
    maxGenerationTime: 30,
    templatesEnabled: ['weather', 'calculator', 'todo', 'clock', 'notes', 'quote'],
    customTemplatesPath: ''
  }
};

// Encryption key
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Encrypt sensitive data
 */
function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-gcm', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 */
function decrypt(text) {
  if (!text) return '';
  try {
    const parts = text.split(':');
    if (parts.length !== 3) return text;
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipher('aes-256-gcm', ENCRYPTION_KEY);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

/**
 * Mask API key for display
 */
function maskApiKey(key) {
  if (!key || key.length < 8) return '';
  return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
}

/**
 * Load settings from file
 */
async function loadSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data);
    
    // Decrypt API keys
    if (settings.apiKeys) {
      for (const provider of Object.keys(settings.apiKeys)) {
        if (settings.apiKeys[provider].key) {
          settings.apiKeys[provider].key = decrypt(settings.apiKeys[provider].key);
        }
      }
    }
    
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.log('Settings file not found, using defaults');
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to file
 */
async function saveSettings(settings) {
  const settingsToSave = JSON.parse(JSON.stringify(settings));
  
  // Encrypt API keys
  if (settingsToSave.apiKeys) {
    for (const provider of Object.keys(settingsToSave.apiKeys)) {
      if (settingsToSave.apiKeys[provider].key) {
        settingsToSave.apiKeys[provider].key = encrypt(settingsToSave.apiKeys[provider].key);
      }
    }
  }
  
  settingsToSave.lastUpdated = new Date().toISOString();
  
  const dir = path.dirname(SETTINGS_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settingsToSave, null, 2));
}

/**
 * Get public settings (without sensitive data)
 */
function getPublicSettings(settings) {
  const publicSettings = JSON.parse(JSON.stringify(settings));
  
  if (publicSettings.apiKeys) {
    for (const provider of Object.keys(publicSettings.apiKeys)) {
      if (publicSettings.apiKeys[provider].key) {
        publicSettings.apiKeys[provider].key = maskApiKey(publicSettings.apiKeys[provider].key);
      }
    }
  }
  
  return publicSettings;
}

// Routes

/**
 * GET /api/settings
 * Get all settings (public version)
 */
router.get('/', async (req, res) => {
  try {
    const settings = await loadSettings();
    res.json({
      success: true,
      data: getPublicSettings(settings)
    });
  } catch (error) {
    console.error('Error loading settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load settings'
    });
  }
});

/**
 * PUT /api/settings
 * Update all settings
 */
router.put('/', async (req, res) => {
  try {
    const newSettings = req.body;
    const currentSettings = await loadSettings();
    
    const mergedSettings = { ...currentSettings, ...newSettings };
    
    // Handle API keys specially
    if (newSettings.apiKeys) {
      for (const provider of Object.keys(newSettings.apiKeys)) {
        if (newSettings.apiKeys[provider].key === '') {
          mergedSettings.apiKeys[provider].key = currentSettings.apiKeys[provider]?.key || '';
        }
      }
    }
    
    await saveSettings(mergedSettings);
    
    res.json({
      success: true,
      message: 'Settings saved successfully',
      data: getPublicSettings(mergedSettings)
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save settings'
    });
  }
});

/**
 * POST /api/settings/test-api-key
 * Test API key validity
 */
router.post('/test-api-key', async (req, res) => {
  try {
    const { provider, key } = req.body;
    
    let testResult = { valid: false, message: '' };
    
    switch (provider) {
      case 'kimi':
        const kimiResponse = await fetch('https://api.moonshot.cn/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        testResult.valid = kimiResponse.ok;
        testResult.message = kimiResponse.ok ? 'Kimi API key is valid' : 'Invalid Kimi API key';
        break;
        
      case 'openai':
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        testResult.valid = openaiResponse.ok;
        testResult.message = openaiResponse.ok ? 'OpenAI API key is valid' : 'Invalid OpenAI API key';
        break;
        
      case 'anthropic':
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/models', {
          headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' }
        });
        testResult.valid = anthropicResponse.ok;
        testResult.message = anthropicResponse.ok ? 'Anthropic API key is valid' : 'Invalid Anthropic API key';
        break;
        
      default:
        testResult.message = 'Unknown provider';
    }
    
    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    console.error('Error testing API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test API key',
      message: error.message
    });
  }
});

/**
 * POST /api/settings/reset
 * Reset to defaults
 */
router.post('/reset', async (req, res) => {
  try {
    await saveSettings(DEFAULT_SETTINGS);
    
    res.json({
      success: true,
      message: 'Settings reset to defaults',
      data: getPublicSettings(DEFAULT_SETTINGS)
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset settings'
    });
  }
});

module.exports = router;
