import { EquipmentsProps } from "./LayoutTypes";
import { ServiceTypeProps } from "./ServiceTypes";

export interface EquipmentProductProps {
  id: string;
  name: string;
}

export interface EquipmentFilterProps {
  id: string;
  name: string;
}

export interface EquipmentTypeProps extends EquipmentsProps {
  initialRotation?: number;
  finalRotation?: number;
  lubrication?: string;
  power?: number;
  operationTemperature?: number;
  mainComponent?: string;
  RPM?: number;
  innerDiameter?: number;
  DN?: number;
  productId?: string;
  volume?: number;
  contaminationLevel?: "low" | "medium" | "high";
  filterId?: string;
  filterProducts?: string;
  operationRegime?: string;
  CC?: string;
  criticality?: "A" | "B" | "C";
  safetyMeasures?: "fullStop" | "precautionaryMeasures" | "none";
  services: ServiceTypeProps[];
}
