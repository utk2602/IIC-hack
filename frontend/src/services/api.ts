/**
 * API Service - Connects frontend to backend
 * Handles all communication with the Node.js/Express server
 */

const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== Health Check ====================

export async function checkHealth() {
  return fetchApi<{ status: string; version: string }>('/health');
}

// ==================== ML Predictions ====================

export interface EfficiencyPredictionInput {
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  irradiance?: number;
  voltage?: number;
  current?: number;
  daysSinceInstallation?: number;
  tilt?: number;
  cloudCover?: number;
  soilingLevel?: number;
}

export interface EfficiencyPredictionResult {
  predictionId: string;
  efficiencyLoss: number;
  efficiencyLossPercent: string;
  panelStatus: string;
  mlRecommendation: string;
  source: 'ml-model' | 'simulation';
  predictedEfficiency: string;
  factors: {
    tiltImpact: string;
    temperatureImpact: string;
    cloudImpact: string;
    soilingImpact: string;
  };
  recommendations: string[];
}

export async function predictEfficiency(input: EfficiencyPredictionInput) {
  return fetchApi<EfficiencyPredictionResult>('/ml/predict/efficiency', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface DegradationPredictionInput {
  panelId?: string;
  temperature?: number;
  humidity?: number;
  voltageMax?: number;
  voltageMin?: number;
  currentMax?: number;
  currentMin?: number;
  daysSinceInstallation?: number;
  projectionMonths?: number;
}

export interface DegradationPredictionResult {
  predictionId: string;
  panelId: string;
  degradationIndex: number;
  degradationStatus: string;
  stressFactors: {
    thermal_stress: number;
    humidity_stress: number;
    electrical_stress: number;
    aging_stress: number;
  };
  mlRecommendation: string;
  source: 'ml-model' | 'simulation';
  currentEfficiency: string;
  monthlyDegradationRate: string;
  predictions: Array<{
    month: number;
    date: string;
    predictedEfficiency: string;
  }>;
}

export async function predictDegradation(input: DegradationPredictionInput) {
  return fetchApi<DegradationPredictionResult>('/ml/predict/degradation', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// ==================== ML Model Status ====================

export interface MLModelStatus {
  overallStatus: 'connected' | 'simulated';
  message: string;
  mlApiStatus: {
    connected: boolean;
    status: string;
    model_loaded: boolean;
  };
  mlModelInfo: {
    model_type: string;
    n_estimators: number;
    features: string[];
    target: string;
  };
}

export async function getMLStatus() {
  return fetchApi<MLModelStatus>('/ml/models/status');
}

// ==================== Dashboard Stats ====================

export interface DashboardStats {
  totalGeneration: { value: number; unit: string; change: number };
  efficiency: { value: number; change: number };
  activePanels: { active: number; total: number };
  batteryStatus: { percentage: number; remainingMinutes: number };
}

export async function getDashboardStats() {
  return fetchApi<DashboardStats>('/dashboard/stats');
}

// ==================== Panels ====================

export interface Panel {
  id: string;
  name: string;
  status: string;
  efficiency: number;
  temperature: number;
  power: number;
}

export async function getPanels() {
  return fetchApi<Panel[]>('/panels');
}

export async function getPanelById(id: string) {
  return fetchApi<Panel>(`/panels/${id}`);
}

// ==================== Alerts ====================

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
}

export async function getAlerts() {
  return fetchApi<Alert[]>('/alerts');
}

// ==================== Panel Defect Classification ====================

export interface PanelClassificationResult {
  analysisId: string;
  filename: string;
  fileSize: number;
  prediction: {
    label: 'NORMAL' | 'DEFECTIVE';
    status: 'good' | 'bad';
    class_id: number;
    confidence: number;
    confidence_percent: string;
  };
  probabilities: {
    normal: number;
    defective: number;
  };
  analysis: {
    severity: 'none' | 'medium' | 'high' | 'critical';
    action_required: boolean;
    recommendation: string;
  };
  source: 'ml-model' | 'simulation';
  modelInfo: {
    architecture: string;
    classes: string[];
  };
  timestamp: string;
  // Email alert status (only present when defective panel is detected)
  emailAlert?: {
    sent: boolean;
    messageId: string | null;
    error: string | null;
  };
}

export interface BatchClassificationResult {
  batchId: string;
  totalProcessed: number;
  summary: {
    normal_count: number;
    defective_count: number;
    defect_rate: number;
  };
  results: Array<{
    index: number;
    filename: string;
    prediction: 'NORMAL' | 'DEFECTIVE';
    confidence: number;
    is_defective: boolean;
  }>;
  source: 'ml-model' | 'simulation';
  timestamp: string;
}

/**
 * Classify a single panel image for defects using ML model
 */
export async function classifyPanelImage(imageFile: File): Promise<{
  success: boolean;
  data?: PanelClassificationResult;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/ml/image/classify-panel`, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Classification failed');
    }
    
    return result;
  } catch (error) {
    console.error('Panel classification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Classification failed',
    };
  }
}

/**
 * Batch classify multiple panel images
 */
export async function classifyPanelImagesBatch(imageFiles: File[]): Promise<{
  success: boolean;
  data?: BatchClassificationResult;
  error?: string;
}> {
  try {
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await fetch(`${API_BASE_URL}/ml/image/classify-panel/batch`, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Batch classification failed');
    }
    
    return result;
  } catch (error) {
    console.error('Batch classification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Batch classification failed',
    };
  }
}

// Export all
export const api = {
  checkHealth,
  predictEfficiency,
  predictDegradation,
  getMLStatus,
  getDashboardStats,
  getPanels,
  getPanelById,
  getAlerts,
  classifyPanelImage,
  classifyPanelImagesBatch,
};

export default api;
