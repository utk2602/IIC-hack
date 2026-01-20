export interface RoofDimensions {
  width: number;
  length: number;
  height: number;
}

export interface SolarPanelConfig {
  // Dimensions
  width: number;
  height: number;
  thickness: number;
  
  // Orientation
  tilt: number;
  azimuth: number;
  isRotationLocked: boolean;

  // Light Source
  lightAzimuth: number;
  lightElevation: number;
  lightIntensity: number;
  lightColor: string; // 'warm' | 'cool' | 'daylight'

  // Grid & Display
  showGrid: boolean;
  gridSize: number;
  panelColor: string;
  showMeasurements: boolean;
  showLightDirection: boolean;
  showNormalVector: boolean;
}

export interface RoofState {
  dimensions: RoofDimensions;
  config: SolarPanelConfig;
}

export interface ViewStats {
  area: number;
  availableSpace: number;
  viewAngle: string;
  panelCount: number;
  systemSize: number;
  panelTilt: number;
  efficiency: number;
  incidentAngle: number;
}

export interface SolarPanel {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isValid: boolean;
}
