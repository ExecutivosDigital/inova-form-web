export interface CipProps {
  name: string;
  id: string;
  localId: string;
}

export interface SubSetProps {
  name: string;
  id: string;
  localId: string;
  cip: CipProps[] | null;
}

export interface SetProps {
  name: string;
  id: string;
  localId: string;
  subSets: SubSetProps[] | null;
}

export interface EquipmentsProps {
  name: string;
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
