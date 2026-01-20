/**
 * ML Service - Connects Node.js backend to Flask ML API
 * Handles all communication with the Python ML microservice
 */

const axios = require('axios');

// ML API Configuration
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';
const ML_API_TIMEOUT = 10000; // 10 seconds

// Create axios instance for ML API
const mlClient = axios.create({
  baseURL: ML_API_URL,
  timeout: ML_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Check if ML API is healthy and model is loaded
 */
async function checkHealth() {
  try {
    const response = await mlClient.get('/health');
    return {
      connected: true,
      ...response.data
    };
  } catch (error) {
    return {
      connected: false,
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Predict efficiency loss for a solar panel
 * @param {Object} data - Panel and weather data
 * @returns {Object} Prediction result
 */
async function predictEfficiencyLoss(data) {
  try {
    const response = await mlClient.post('/predict/efficiency-loss', {
      temperature: data.temperature,
      humidity: data.humidity,
      wind_speed: data.windSpeed || data.wind_speed,
      irradiance: data.irradiance,
      voltage: data.voltage,
      current: data.current,
      days_since_installation: data.daysSinceInstallation || data.days_since_installation
    });
    
    return {
      success: true,
      source: 'ml-model',
      ...response.data
    };
  } catch (error) {
    console.error('ML API Error (efficiency-loss):', error.message);
    
    // Fallback to simulation if ML API is unavailable
    return {
      success: true,
      source: 'simulation',
      efficiency_loss: (Math.random() * 10 + 2).toFixed(2),
      status: 'unknown',
      recommendation: 'ML service unavailable - using simulated data',
      error: error.message
    };
  }
}

/**
 * Calculate degradation index for a solar panel
 * @param {Object} data - Panel stress factors
 * @returns {Object} Degradation result
 */
async function predictDegradation(data) {
  try {
    const response = await mlClient.post('/predict/degradation', {
      temperature: data.temperature,
      humidity: data.humidity,
      voltage_max: data.voltageMax || data.voltage_max,
      voltage_min: data.voltageMin || data.voltage_min,
      current_max: data.currentMax || data.current_max,
      current_min: data.currentMin || data.current_min,
      days_since_installation: data.daysSinceInstallation || data.days_since_installation
    });
    
    return {
      success: true,
      source: 'ml-model',
      ...response.data
    };
  } catch (error) {
    console.error('ML API Error (degradation):', error.message);
    
    // Fallback to simulation
    const degradationIndex = Math.random() * 0.5 + 0.1;
    return {
      success: true,
      source: 'simulation',
      degradation_index: degradationIndex.toFixed(3),
      status: degradationIndex < 0.4 ? 'Healthy' : degradationIndex < 0.7 ? 'Degrading' : 'Critical',
      recommendation: 'ML service unavailable - using simulated data',
      error: error.message
    };
  }
}

/**
 * Batch prediction for multiple panels
 * @param {Array} panels - Array of panel data objects
 * @returns {Object} Batch prediction results
 */
async function predictBatch(panels) {
  try {
    const response = await mlClient.post('/predict/batch', {
      data: panels.map(panel => ({
        panel_id: panel.panelId || panel.panel_id,
        temperature: panel.temperature,
        humidity: panel.humidity,
        wind_speed: panel.windSpeed || panel.wind_speed,
        irradiance: panel.irradiance,
        voltage: panel.voltage,
        current: panel.current,
        days_since_installation: panel.daysSinceInstallation || panel.days_since_installation
      }))
    });
    
    return {
      success: true,
      source: 'ml-model',
      ...response.data
    };
  } catch (error) {
    console.error('ML API Error (batch):', error.message);
    
    // Fallback to simulation
    return {
      success: true,
      source: 'simulation',
      count: panels.length,
      predictions: panels.map((panel, i) => ({
        index: i,
        panel_id: panel.panelId || panel.panel_id || `panel_${i}`,
        efficiency_loss: (Math.random() * 10 + 2).toFixed(2),
        status: ['healthy', 'degrading', 'critical'][Math.floor(Math.random() * 3)]
      })),
      error: error.message
    };
  }
}

/**
 * Get model information
 * @returns {Object} Model metadata
 */
async function getModelInfo() {
  try {
    const response = await mlClient.get('/model/info');
    return {
      connected: true,
      ...response.data
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

module.exports = {
  checkHealth,
  predictEfficiencyLoss,
  predictDegradation,
  predictBatch,
  getModelInfo,
  ML_API_URL
};
