export interface CipProps {
  name: string;
  code: string;
  id: string;
  localId: string;
}

export interface SubSetProps {
  name: string;
  code: string;
  id: string;
  localId: string;
  cip: CipProps[] | null;
}

export interface SetProps {
  name: string;
  code: string;
  id: string;
  localId: string;
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
  photos: string[] | null;
  id: string;
  localId: string;
  sets: SetProps[] | null;
}

export interface SectorProps {
  name: string;
  id: string;
  localId: string;
  equipments: EquipmentsProps[] | null;
}

export interface AreaProps {
  name: string;
  id: string;
  localId: string;
  sectors: SectorProps[] | null;
}

export interface LayoutTypeProps {
  areas: AreaProps[] | null;
}
