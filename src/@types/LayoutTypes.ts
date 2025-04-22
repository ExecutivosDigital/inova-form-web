import { ServiceTypeProps } from "./ServiceTypes";

export interface CipProps {
  name: string;
  code: string;
  id: string;
  position: string;
  SubsetId?: string;
}

export interface SubSetProps {
  name: string;
  code: string;
  id: string;
  position: string;
  cip: CipProps[] | null;
  setId?: string;
}

export interface SetProps {
  name: string;
  code: string;
  id: string;
  position: string;
  subSets: SubSetProps[] | null;
  equipmentId?: string;
}

export interface EquipmentPhotoProps {
  id?: string; // Optional because new photos won't have an id yet
  url: string;
  fullUrl: string;
}

export interface EquipmentsProps {
  name: string;
  tag: string;
  type: string;
  maker: string;
  model: string;
  year: string;
  description: string;
  photos: EquipmentPhotoProps[] | null;
  id: string;
  position: string;
  sets: SetProps[] | null;
  sectorId?: string;
  initialRotation?: number;
  finalRotation?: number;
  lubrication?: string;
  power?: number;
  operationTemperature?: number;
  mainComponent?: string;
  RPM?: number;
  innerDiameter?: number;
  DN?: number;
  services?: ServiceTypeProps[] | null;
}

export interface SectorProps {
  name: string;
  id: string;
  position: string;
  equipments: EquipmentsProps[] | null;
}

export interface AreaProps {
  createdAt?: string;
  name: string;
  id: string;
  position: string;
  sectors: SectorProps[] | null;
}

export interface LayoutTypeProps {
  areas: AreaProps[] | null;
}
