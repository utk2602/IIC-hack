export interface RoofDimensions {
  width: number;
  length: number;
  height: number;
}

export interface RoofState {
  dimensions: RoofDimensions;
  showGrid: boolean;
  showMeasurements: boolean;
  rotation: number;
}

export interface ViewStats {
  area: number;
  availableSpace: number;
  viewAngle: string;
  panelCount: number;
  systemSize: number;
  panelTilt: number;
}

export interface SolarPanel {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  isValid: boolean;
}
