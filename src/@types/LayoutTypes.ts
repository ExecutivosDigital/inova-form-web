export interface CipProps {
  name: string;
  code: string;
  id: string;
  position: string;
}

export interface SubSetProps {
  name: string;
  code: string;
  id: string;
  position: string;
  cip: CipProps[] | null;
}

export interface SetProps {
  name: string;
  code: string;
  id: string;
  position: string;
  subSets: SubSetProps[] | null;
}

export interface EquipmentsProps {
  name: string;
  tag: string;
  type: string;
  maker: string;
  model: string;
  year: string;
  description: string;
  photos:
    | {
        url: string;
        fullUrl: string;
      }[]
    | null;
  id: string;
  position: string;
  sets: SetProps[] | null;
  initialRotation?: number;
  finalRotation?: number;
  lubrication?: string;
  power?: number;
  operationTemperature?: number;
  mainComponent?: string;
  RPM?: number;
  innerDiameter?: number;
  DN?: number;
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
