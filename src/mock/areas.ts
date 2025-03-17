import { v4 } from "uuid";

export const LayoutStaticData = [
  {
    name: "Área 1",
    id: v4(),
    localId: "1",
    sectors: [
      {
        name: "Setor 1",
        id: v4(),
        localId: "1.1",
        equipments: null,
      },
      {
        name: "Setor 2",
        id: v4(),
        localId: "1.2",
        equipments: null,
      },
    ],
  },
  {
    name: "Área 2",
    id: v4(),
    localId: "2",
    sectors: [
      {
        name: "Setor 1",
        id: v4(),
        localId: "2.1",
        equipments: null,
      },
      {
        name: "Setor 2",
        id: v4(),
        localId: "2.2",
        equipments: null,
      },
    ],
  },
];
