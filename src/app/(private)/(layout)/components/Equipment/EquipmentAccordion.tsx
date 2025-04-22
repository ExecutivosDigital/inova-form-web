"use client";
import {
  EquipmentPhotoProps,
  EquipmentsProps,
  SectorProps,
} from "@/@types/LayoutTypes";
import { CustomPagination } from "@/components/global/CustomPagination";
import { Skeleton } from "@/components/global/Skeleton";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/global/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/global/ui/dropdown-menu";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/global/ui/popover";
import { useApiContext } from "@/context/ApiContext";
import { useLayoutContext } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { v4 } from "uuid";
import { EquipmentTemplateSheet } from "./EquipmentTemplateSheet";

interface EquipmentAccordionProps {
  selectedLayoutStep: number;
  setSelectedLayoutStep: React.Dispatch<React.SetStateAction<number>>;
}

interface PhotoChangeEntryProps {
  newPhotos: EquipmentPhotoProps[];
  removedPhotoIds: string[];
  originalPhotos: EquipmentPhotoProps[];
}

interface PhotoChangesProps {
  [equipmentId: string]: PhotoChangeEntryProps;
}

export function EquipmentAccordion({
  selectedLayoutStep,
  setSelectedLayoutStep,
}: EquipmentAccordionProps) {
  const {
    layoutData,
    setLayoutData,
    GetEquipments,
    originalEquipments,
    query,
    setQuery,
    isGettingData,
    GetAllData,
  } = useLayoutContext();
  const { PostAPI, PutAPI, DeleteAPI } = useApiContext();
  const [selectedSector, setSelectedSector] = useState<SectorProps | null>(
    null,
  );
  const [sectorsPages, setSectorsPages] = useState<number>(1);
  const [equipmentPages, setEquipmentPages] = useState<number>(1);
  const [currentSectorPage, setCurrentSectorPage] = useState(1);
  const [currentEquipmentPage, setCurrentEquipmentPage] = useState(1);
  const [equipmentsArrayLength, setEquipmentsArrayLength] = useState(5);
  const [inputEquipmentValues, setInputEquipmentValues] = useState<
    EquipmentsProps[]
  >(
    Array(equipmentsArrayLength).fill({
      name: "",
      tag: "",
      type: "",
      maker: "",
      model: "",
      year: "",
      description: "",
      photos: null,
      id: "",
      position: "",
      sets: null,
    }),
  );
  const [isSectorNameHovered, setIsSectorNameHovered] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isModifyingEquipments, setIsModifyingEquipments] = useState(false);
  const [isEquipmentTemplateSheetOpen, setIsEquipmentTemplateSheetOpen] =
    useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);
  const [photoChanges, setPhotoChanges] = useState<PhotoChangesProps>({});

  const allEquipments =
    layoutData.areas
      ?.flatMap((area) => area.sectors || [])
      .flatMap((sector) => sector.equipments || []) || [];
  const hasAnyEquipment = allEquipments.length > 0;

  const equipmentHasPhotos = (() => {
    if (!selectedSector || selectedEquipment === null || !layoutData.areas)
      return false;

    // Look through each area to find the selected sector
    for (const area of layoutData.areas) {
      if (area.sectors) {
        const matchingSector = area.sectors.find(
          (sec) => sec.id === selectedSector.id,
        );
        if (matchingSector) {
          // Compute the full equipment position.
          // (We assume that selectedEquipment is an index and equipment positions were set as `${sector.position}.${index+1}`)
          const fullposition = `${selectedSector.position}.${selectedEquipment + 1}`;
          const equipment = matchingSector.equipments?.find(
            (eq) => eq.position === fullposition,
          );
          return Boolean(
            equipment && equipment.photos && equipment.photos.length > 0,
          );
        }
      }
    }
    return false;
  })();

  const handleAddEquipment = () => {
    setEquipmentsArrayLength((prevLength) => prevLength + 1);
    setInputEquipmentValues((prev) => [
      ...prev,
      {
        name: "",
        tag: "",
        type: "",
        maker: "",
        model: "",
        year: "",
        description: "",
        photos: null,
        id: "",
        position: "",
        sets: null,
      },
    ]);
    setEquipmentPages((prevPages) =>
      (equipmentsArrayLength + 1) / 6 > prevPages ? prevPages + 1 : prevPages,
    );
  };

  const handleInputChange = (
    index: number,
    field: keyof EquipmentsProps,
    value: string | string[],
  ) => {
    if (!selectedSector) return;

    const fullposition = `${selectedSector.position}.${index + 1}`; // Ensure the position is correct

    // Update local UI state
    setInputEquipmentValues((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[index] = {
        ...updatedInputs[index],
        [field]: value,
      };
      return updatedInputs;
    });

    // Update global layoutData state
    setLayoutData((prevLayout) => {
      if (!prevLayout.areas) return prevLayout; // Ensure areas exist

      const updatedAreas = prevLayout.areas.map((area) => {
        if (!area.sectors) return area; // Skip areas without sectors

        const updatedSectors = area.sectors.map((sector) => {
          if (sector.position !== selectedSector.position) return sector; // Skip unrelated sectors

          // Clone the equipment array or create a new one
          const updatedEquipments = sector.equipments
            ? [...sector.equipments]
            : [];

          const existingEquipmentIndex = updatedEquipments.findIndex(
            (equipment) => equipment.position === fullposition,
          );

          if (existingEquipmentIndex !== -1) {
            // If equipment exists, update only the changed field
            updatedEquipments[existingEquipmentIndex] = {
              ...updatedEquipments[existingEquipmentIndex],
              [field]: value,
            };
          } else {
            // Only add a new equipment if it truly doesn't exist
            updatedEquipments.push({
              name: "",
              tag: "",
              type: "",
              maker: "",
              model: "",
              year: "",
              description: "",
              photos: null,
              id: v4(), // Assign a unique ID once, only on creation
              position: fullposition,
              sets: null,
              [field]: value,
            });
          }

          return {
            ...sector,
            equipments: updatedEquipments, // Update only this sector's equipment
          };
        });

        return {
          ...area,
          sectors: updatedSectors, // Keep other sectors unchanged
        };
      });

      return { ...prevLayout, areas: updatedAreas };
    });
  };

  const handleSelectSector = (sector: SectorProps) => {
    setSelectedSector(sector);
    setEquipmentPages(1);

    if (sector.equipments && sector.equipments.length > 0) {
      // Build an array from the selected area's sectors.
      const updatedEquipmentValues = sector.equipments.map(
        (equipment) => equipment,
      );
      setInputEquipmentValues(updatedEquipmentValues);
      setEquipmentsArrayLength(updatedEquipmentValues.length);
      setEquipmentPages(Math.ceil(updatedEquipmentValues.length / 6));
    } else {
      // If no sectors exist for the selected area, default to 5 empty inputs.
      const defaultLength = 5;
      setInputEquipmentValues(Array(defaultLength).fill(""));
      setEquipmentsArrayLength(defaultLength);
      setEquipmentPages(1);
    }

    setCurrentEquipmentPage(1);
  };

  const isEquipmentFullyFilled = (
    equipment: EquipmentsProps,
    photos?: boolean,
  ) => {
    return equipment.name &&
      equipment.tag &&
      equipment.type &&
      equipment.maker &&
      equipment.model &&
      equipment.year &&
      equipment.description &&
      photos === true
      ? true
      : equipment.photos;
  };

  async function handleUpload(file: File) {
    const formData = new FormData();
    // Sanitize the file name by replacing spaces with dashes.
    const sanitizedFileName = file.name.replace(/\s+/g, "-");
    formData.append("file", file, sanitizedFileName);
    setIsUploadingFile(true);

    const response = await PostAPI("/file", formData, true);

    if (
      response &&
      response.body &&
      response.body.url &&
      response.body.fullUrl
    ) {
      const uploadedUrl = response.body.url;
      const uploadedFullUrl = response.body.fullUrl;
      // Update layoutData only if an equipment is currently selected.
      if (selectedSector !== null && selectedEquipment !== null) {
        const equipment = inputEquipmentValues[selectedEquipment];

        // Track the new photo
        setPhotoChanges((prev) => ({
          ...prev,
          [equipment.id]: {
            ...(prev[equipment.id] || {
              newPhotos: [],
              removedPhotoIds: [],
              originalPhotos: equipment.photos || [],
            }),
            newPhotos: [
              ...(prev[equipment.id]?.newPhotos || []),
              { url: uploadedUrl, fullUrl: uploadedFullUrl },
            ],
          },
        }));
        // Compute the full position for the equipment, e.g. "1.2.1"
        const fullposition = `${selectedSector.position}.${selectedEquipment + 1}`;

        setLayoutData((prevLayout) => {
          if (!prevLayout.areas) return prevLayout;

          const updatedAreas = prevLayout.areas.map((area) => {
            // Only update areas that have sectors.
            if (!area.sectors) return area;
            const updatedSectors = area.sectors.map((sector) => {
              // Only update the sector matching the selected sector.
              if (sector.id !== selectedSector.id) {
                return sector;
              }
              // Clone the existing equipments array or create a new one.
              const updatedEquipments = sector.equipments
                ? [...sector.equipments]
                : [];
              // Find the equipment with the matching full position.
              const eqIndex = updatedEquipments.findIndex(
                (eq) => eq.position === fullposition,
              );

              if (eqIndex !== -1) {
                // Equipment exists: update its photos array.
                const currentEquipment = updatedEquipments[eqIndex];
                // If photos already exist, copy them; otherwise, start with an empty array.
                const updatedPhotos = currentEquipment.photos
                  ? [...currentEquipment.photos]
                  : [];
                // Push the new photo object.
                updatedPhotos.push({
                  url: uploadedUrl,
                  fullUrl: uploadedFullUrl,
                });
                updatedEquipments[eqIndex] = {
                  ...currentEquipment,
                  photos: updatedPhotos,
                };
              } else {
                // Equipment does not exist: create a new one.
                updatedEquipments.push({
                  name: "",
                  tag: "",
                  type: "",
                  maker: "",
                  model: "",
                  year: "",
                  description: "",
                  photos: [{ url: uploadedUrl, fullUrl: uploadedFullUrl }],
                  id: v4(),
                  position: fullposition,
                  sets: null,
                });
              }
              return { ...sector, equipments: updatedEquipments };
            });
            return { ...area, sectors: updatedSectors };
          });
          return { ...prevLayout, areas: updatedAreas };
        });
      }
      setIsUploadingFile(false);
      return response.body.url;
    } else {
      setIsUploadingFile(false);
      toast.error("Falha no upload do arquivo. Tente novamente!");
      return null;
    }
  }

  async function HandleCreateEquipments(
    modifiedEquipments?: EquipmentsProps[],
  ) {
    setIsModifyingEquipments(true);
    // If no new equipments are provided, get them by flattening the equipments from all sectors in all areas.
    const equipmentsToSend =
      modifiedEquipments ||
      layoutData.areas?.flatMap((area) =>
        area.sectors?.flatMap((sector) => sector.equipments),
      );

    const newEquipments = await PostAPI(
      "/equipment/multi",
      {
        equipments: equipmentsToSend?.map((equipment) => {
          const parts = equipment?.position.split(".");
          let sectorId = "";
          if (parts && parts.length >= 2) {
            const equipmentSectorPos = `${parts[0]}.${parts[1]}`;
            const sector = layoutData.areas
              ?.flatMap((area) => area.sectors || [])
              .find((sec) => sec.position === equipmentSectorPos);
            sectorId = sector?.id as string;
          }
          return {
            name: equipment?.name,
            tag: equipment?.tag,
            type: equipment?.type,
            maker: equipment?.maker,
            model: equipment?.model,
            year: equipment?.year,
            description: equipment?.description,
            position: equipment?.position,
            sectorId,
            photos: equipment?.photos,
          };
        }),
      },
      true,
    );
    if (newEquipments.status === 200) {
      toast.success("Equipamentos cadastrados com sucesso");
      await GetEquipments();
      setSelectedLayoutStep(4);
      return setIsModifyingEquipments(false);
    }
    toast.error("Erro ao cadastrar Equipamentos");
    return setIsModifyingEquipments(false);
  }

  async function HandleUpdateEquipments(modifiedEquipments: EquipmentsProps[]) {
    if (modifiedEquipments.length === 0) return;
    setIsModifyingEquipments(true);

    const editedEquipments = await PutAPI(
      "/equipment/multi",
      {
        equipments: modifiedEquipments.map((eq) => {
          const changes = photoChanges[eq.id] || {
            newPhotos: [],
            removedPhotoIds: [],
            originalPhotos: [],
          };

          return {
            name: eq.name,
            tag: eq.tag,
            type: eq.type,
            maker: eq.maker,
            model: eq.model,
            year: eq.year,
            description: eq.description,
            position: eq.position,
            equipmentId: eq.id,
            newPhotos: changes.newPhotos,
            removedPhotos: changes.removedPhotoIds,
          };
        }),
      },
      true,
    );

    if (editedEquipments.status === 200) {
      // Clear photo changes after successful update
      setPhotoChanges({});
      toast.success("Equipamentos atualizados com sucesso");
      await GetAllData();
      setSelectedLayoutStep(4);
    } else {
      toast.error("Erro ao atualizar Equipamentos");
    }

    setIsModifyingEquipments(false);
  }

  async function HandleDeleteEquipments(modifiedEquipments: EquipmentsProps[]) {
    if (modifiedEquipments.length === 0) return;
    setIsModifyingEquipments(true);
    const ids = modifiedEquipments.map((sector) => sector.id).join(",");
    const deletedEquipments = await DeleteAPI(
      `/equipment?equipments=${ids}`,
      true,
    );
    if (deletedEquipments.status === 200) {
      toast.success("Equipamentos deletados com sucesso");
      await GetEquipments();
      setSelectedLayoutStep(4);
    } else {
      toast.error("Erro ao deletar as Equipamentos");
    }
    return setIsModifyingEquipments(false);
  }

  const HandleNextStep = () => {
    // 1. flatten everything
    const currentEquipments: EquipmentsProps[] =
      layoutData.areas
        ?.flatMap((a) => a.sectors || [])
        .flatMap((s) => s.equipments || []) || [];

    // 2. your original list from context
    const original = originalEquipments || [];

    // 3a. NEW = has no matching id in original
    const newEquipments = currentEquipments.filter(
      (eq) => !original.find((o) => o.position === eq.position),
    );

    const modifiedEquipments = currentEquipments.filter((eq) => {
      const o = original.find((o) => o.position === eq.position);

      // Check if this equipment has any photo changes
      const hasPhotoChanges =
        eq.id &&
        photoChanges[eq.id] &&
        (photoChanges[eq.id].newPhotos.length > 0 ||
          photoChanges[eq.id].removedPhotoIds.length > 0);

      return (
        o &&
        (o.name !== eq.name ||
          o.tag !== eq.tag ||
          o.type !== eq.type ||
          o.maker !== eq.maker ||
          o.model !== eq.model ||
          o.year !== eq.year ||
          o.description !== eq.description ||
          hasPhotoChanges) // Add photo changes to modification check
      );
    });

    const deletedEquipments = original.filter(
      (o) => !currentEquipments.find((eq) => eq.position === o.position),
    );

    // 4. dispatch your three API calls exactly as before
    const promises: Promise<void>[] = [];
    if (newEquipments.length)
      promises.push(HandleCreateEquipments(newEquipments));
    if (modifiedEquipments.length)
      promises.push(HandleUpdateEquipments(modifiedEquipments));
    if (deletedEquipments.length)
      promises.push(HandleDeleteEquipments(deletedEquipments));
    // 5. step on
    if (promises.length) {
      Promise.all(promises).then(() => setSelectedLayoutStep(4));
    } else {
      setSelectedLayoutStep(4);
    }
  };
  // Add this function to handle the local deletion
  const handleDeleteCurrentEquipment = () => {
    if (!selectedSector || selectedEquipment === null) return;

    // Create a copy of the current equipment for deletion
    const equipmentToDelete = inputEquipmentValues[selectedEquipment];

    // Update layoutData to remove the equipment
    setLayoutData((prevLayout) => {
      if (!prevLayout.areas) return prevLayout;

      const updatedAreas = prevLayout.areas.map((area) => {
        if (!area.sectors) return area;

        const updatedSectors = area.sectors.map((sector) => {
          if (sector.id !== selectedSector.id) return sector;

          return {
            ...sector,
            equipments:
              sector.equipments?.filter(
                (eq) => eq.position !== equipmentToDelete.position,
              ) || null,
          };
        });

        return {
          ...area,
          sectors: updatedSectors,
        };
      });

      return { ...prevLayout, areas: updatedAreas };
    });

    // Update input values
    setInputEquipmentValues((prev) => {
      const updated = [...prev];
      updated[selectedEquipment] = {
        name: "",
        tag: "",
        type: "",
        maker: "",
        model: "",
        year: "",
        description: "",
        photos: null,
        id: "",
        position: "",
        sets: null,
      };
      return updated;
    });

    // If the equipment has an ID (meaning it exists in the backend), delete it
    // if (equipmentToDelete.id) {
    //   HandleDeleteEquipments([equipmentToDelete]);
    // }

    // Return to equipment list view
    setSelectedEquipment(null);
    toast.success("Equipamento excluído com sucesso");
  };

  const getCurrentEquipmentPhotos = () => {
    if (!selectedSector || selectedEquipment === null || !layoutData.areas)
      return [];

    const fullposition = `${selectedSector.position}.${selectedEquipment + 1}`;

    // Find the current equipment in layoutData
    const equipment = layoutData.areas
      .flatMap((area) => area.sectors || [])
      .find((sector) => sector.id === selectedSector.id)
      ?.equipments?.find((eq) => eq.position === fullposition);

    return equipment?.photos || [];
  };

  const handleDeletePhoto = (photoIndex: number) => {
    if (!selectedSector || selectedEquipment === null) return;

    const equipment = inputEquipmentValues[selectedEquipment];
    const photo = equipment.photos?.[photoIndex];

    if (photo?.id && equipment.id) {
      setPhotoChanges((prev: PhotoChangesProps) => {
        // Get existing changes or create new entry
        const existingChanges = prev[equipment.id] || {
          newPhotos: [],
          removedPhotoIds: [],
          originalPhotos: equipment.photos || [],
        };

        // Create new changes object with type safety
        const updatedChanges: PhotoChangeEntryProps = {
          ...existingChanges,
          removedPhotoIds: [
            ...existingChanges.removedPhotoIds,
            photo.id as string,
          ],
        };

        // Return new state with type safety
        return {
          ...prev,
          [equipment.id]: updatedChanges,
        };
      });
    }

    // Continue with your existing delete logic...
    setLayoutData((prevLayout) => {
      if (!prevLayout.areas) return prevLayout;

      const updatedAreas = prevLayout.areas.map((area) => {
        if (!area.sectors) return area;

        const updatedSectors = area.sectors.map((sector) => {
          if (sector.id !== selectedSector.id) return sector;

          if (!sector.equipments) return sector;

          const updatedEquipments = sector.equipments.map((eq) => {
            if (eq.position !== equipment.position) return eq;

            const updatedPhotos =
              eq.photos?.filter((_, index) => index !== photoIndex) || null;

            return {
              ...eq,
              photos: updatedPhotos,
            };
          });

          return {
            ...sector,
            equipments: updatedEquipments,
          };
        });

        return {
          ...area,
          sectors: updatedSectors,
        };
      });

      return { ...prevLayout, areas: updatedAreas };
    });

    // If no photos left, close the photos view
    if (getCurrentEquipmentPhotos().length <= 1) {
      setIsPhotosOpen(false);
    }
  };

  const handleSelectEquipment = (index: number) => {
    setSelectedEquipment(index);
    const equipment = inputEquipmentValues[index];

    // Initialize photo changes for this equipment if not already present
    if (equipment.id && !photoChanges[equipment.id]) {
      setPhotoChanges((prev) => ({
        ...prev,
        [equipment.id]: {
          newPhotos: [],
          removedPhotoIds: [],
          originalPhotos: equipment.photos || [],
        },
      }));
    }
  };

  useEffect(() => {
    if (!selectedSector) return;
    setInputEquipmentValues((prev) => {
      // Copy the previous state.
      const merged = [...prev];

      selectedSector.equipments?.forEach((equipment) => {
        // Here we expect equipment.position to be in the format "sectorPosition.equipmentNumber"
        // e.g. "1.2.3" where "3" is the equipment number.
        const parts = equipment.position.split(".");
        // Ensure the equipment's position has at least three parts.
        if (parts.length < 3) return;
        // Convert the last part (equipment number) to a 0-indexed value.
        const pos = parseInt(parts[2], 10) - 1;
        // If this position is beyond the current length, extend the array.
        if (pos >= merged.length) {
          const numToAdd = pos - merged.length + 1;
          for (let i = 0; i < numToAdd; i++) {
            // Push a default equipment object.
            merged.push({
              name: "",
              tag: "",
              type: "",
              maker: "",
              model: "",
              year: "",
              description: "",
              photos: null,
              id: "",
              position: "", // This can be updated later.
              sets: null,
            });
          }
        }
        // Place the equipment object at its proper index.
        merged[pos] = equipment;
      });
      return merged;
    });
  }, [selectedSector?.equipments]);

  useEffect(() => {
    setEquipmentsArrayLength(inputEquipmentValues.length);
    setEquipmentPages(Math.ceil(inputEquipmentValues.length / 6));
  }, [inputEquipmentValues]);

  useEffect(() => {
    if (!layoutData.areas) {
      setSectorsPages(1);
      return;
    }

    // Flatten all sectors from all areas
    const allSectors = layoutData.areas.flatMap((area) => area.sectors || []);

    // Filter the sectors using the query.
    // (Assuming each sector has a "name" property you want to match against.)
    const filteredSectors = query
      ? allSectors.filter((sector) =>
          sector.name.toLowerCase().includes(query.toLowerCase()),
        )
      : allSectors;

    // Calculate the number of pages using the filtered list (e.g. 12 sectors per page)
    setSectorsPages(
      filteredSectors.length > 0 ? Math.ceil(filteredSectors.length / 12) : 1,
    );
  }, [layoutData.areas, query]);

  useEffect(() => {
    if (!selectedSector) return;
    setInputEquipmentValues((prev) => {
      const merged = [...prev];
      selectedSector.equipments?.forEach((equipment) => {
        const parts = equipment.position.split(".");
        if (parts.length < 3) return;
        const pos = parseInt(parts[2], 10) - 1;
        if (pos >= merged.length) {
          const numToAdd = pos - merged.length + 1;
          for (let i = 0; i < numToAdd; i++) {
            merged.push({
              name: "",
              tag: "",
              type: "",
              maker: "",
              model: "",
              year: "",
              description: "",
              photos: null,
              id: "",
              position: "",
              sets: null,
            });
          }
        }
        merged[pos] = equipment;
      });
      return merged;
    });
  }, [selectedSector?.equipments]);

  // Sync selectedSector when layoutData changes (e.g. after template additions)
  useEffect(() => {
    if (!selectedSector) return;
    const updated = layoutData.areas
      ?.flatMap((area) => area.sectors || [])
      .find((sec) => sec.id === selectedSector.id);
    if (updated) setSelectedSector(updated);
  }, [layoutData.areas]);

  return (
    <>
      <AccordionItem value="3" onClick={() => setSelectedLayoutStep(3)}>
        <AccordionTrigger arrow>
          {isGettingData ? (
            <Skeleton className="h-10" />
          ) : (
            <div className="flex w-full items-center justify-between">
              <div className="text-primary flex items-center gap-2 text-base font-bold md:gap-4 md:text-2xl">
                <span>1.3</span>
                <div className="flex flex-col">
                  <span className="leading-6">
                    Cadastramento de Equipamentos
                  </span>
                  <span
                    className={cn(
                      "w-max text-xs font-normal text-neutral-500 md:text-sm",
                      selectedLayoutStep !== 3 && "hidden",
                    )}
                  >
                    O que é um Equipamento? Explicitar
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedLayoutStep === 3 && selectedSector !== null ? (
                  <DropdownMenu
                    open={isDropdownOpen}
                    onOpenChange={setIsDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <div className="bg-primary flex h-6 items-center gap-2 rounded-full p-1 text-sm font-semibold text-white md:h-10 md:p-2">
                        <Upload className="h-4 md:h-8" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="flex w-max flex-col items-center bg-white p-0 text-sm">
                      <DropdownMenuItem className="w-full rounded-none border-b">
                        <DropdownMenuArrow className="fill-neutral-300" />
                        <span className="w-full">Importar Planilhas</span>
                        <ArrowRight />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setIsDropdownOpen(false);
                          setTimeout(() => {
                            setIsEquipmentTemplateSheetOpen(true);
                          }, 100);
                        }}
                        className="w-full rounded-none"
                      >
                        <DropdownMenuArrow className="fill-neutral-300" />
                        <span className="w-full">Selecionar Modelo Pronto</span>
                        <ArrowRight />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : selectedLayoutStep === 3 && !selectedSector ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      HandleNextStep();
                    }}
                    className={cn(
                      "bg-primary flex h-6 items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-white md:h-10 md:px-4",
                      !hasAnyEquipment &&
                        "pointer-events-none cursor-not-allowed opacity-50",
                    )}
                  >
                    {isModifyingEquipments ? (
                      <>
                        <span className="hidden md:block">Salvando...</span>
                        <Loader2 className="h-4 animate-spin md:h-8" />
                      </>
                    ) : (
                      <>
                        <span className="hidden md:block">Avançar 1.4</span>
                        <ArrowRight className="h-4 md:h-8" />
                      </>
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          )}
        </AccordionTrigger>
        <AccordionContent>
          <div
            className={cn(
              "grid grid-cols-4 gap-2 border-t border-neutral-300 p-2 md:gap-4 md:p-4",
              selectedSector && "grid-cols-3",
            )}
          >
            {isGettingData ? (
              [...Array(12)].map((item, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <Skeleton />
                </div>
              ))
            ) : selectedEquipment !== null ? (
              <>
                <div className="col-span-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEquipment(null)}
                      className="text-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.35)] md:h-12 md:w-12"
                    >
                      <ChevronLeft />
                    </button>
                    <Popover
                      open={isSectorNameHovered}
                      onOpenChange={setIsSectorNameHovered}
                    >
                      <PopoverTrigger
                        asChild
                        onMouseEnter={() => setIsSectorNameHovered(true)}
                        onMouseLeave={() => setIsSectorNameHovered(false)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSectorNameHovered(false);
                        }}
                        onBlur={() => setIsSectorNameHovered(false)}
                      >
                        <label
                          className={cn(
                            "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                            "bg-primary",
                          )}
                        >
                          <span
                            className={cn(
                              "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                              "bg-white/20 text-white",
                            )}
                          >
                            {selectedSector?.position}
                          </span>
                          <input
                            className={cn(
                              "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                              "text-white",
                            )}
                            placeholder="Nome da Área"
                            value={selectedSector?.name}
                            disabled
                          />

                          <div
                            className={cn(
                              "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                              "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                            )}
                          />
                        </label>
                      </PopoverTrigger>
                      <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                        <PopoverArrow className="fill-neutral-300" />
                        <span>{selectedSector?.name}</span>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center gap-2">
                    {equipmentHasPhotos && (
                      <button
                        onClick={() => setIsPhotosOpen(!isPhotosOpen)}
                        className={cn(
                          "text-primary relative flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-2 py-2 text-xs font-semibold transition duration-300 md:h-12 md:px-4",
                          isPhotosOpen &&
                            "bg-primary border-transparent text-white",
                        )}
                      >
                        Ver Fotos
                      </button>
                    )}
                    <button
                      disabled={isUploadingFile}
                      className={cn(
                        "text-primary relative flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-2 py-2 text-xs font-semibold transition duration-300 md:h-12 md:px-4",
                        equipmentHasPhotos &&
                          "bg-primary border-transparent text-white",
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        className="absolute top-0 left-0 h-full w-full cursor-pointer bg-transparent opacity-0"
                        type="file"
                        multiple
                        onChange={(e) => {
                          const file = e.target.files;
                          if (!file) return;
                          for (let i = 0; i < file.length; i++) {
                            handleUpload(file[i]);
                          }
                        }}
                      />
                      {isUploadingFile ? (
                        <>
                          <span>Carregando...</span>
                          <Loader2 className="w-4 animate-spin" />
                        </>
                      ) : equipmentHasPhotos ? (
                        "Fotos Inseridas"
                      ) : (
                        "Adicionar Fotos"
                      )}
                    </button>
                  </div>
                </div>
                {isPhotosOpen && (
                  <div className="col-span-3 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-primary text-sm md:text-base">
                          Fotos do Equipamento
                        </span>
                        <button
                          onClick={() => setIsPhotosOpen(false)}
                          className="text-primary hover:bg-primary/10 rounded-full p-2 transition-colors"
                        >
                          <X className="h-4 w-4 md:h-6 md:w-6" />
                        </button>
                      </div>
                      <Swiper
                        slidesPerView="auto"
                        spaceBetween={10}
                        className="w-full"
                      >
                        {getCurrentEquipmentPhotos().map((photo, index) => (
                          <SwiperSlide key={index} className="!w-auto">
                            <div className="group relative">
                              <Image
                                src={photo.fullUrl}
                                alt={`Equipment photo ${index + 1}`}
                                width={200}
                                height={200}
                                className="h-28 w-auto rounded-lg object-contain"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    confirm(
                                      "Tem certeza que deseja excluir essa foto?",
                                    )
                                  ) {
                                    handleDeletePhoto(index);
                                  }
                                }}
                                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                )}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-primary text-xs md:text-sm">TAG</span>
                    <input
                      type="text"
                      className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                      placeholder="TAG do Equipamento"
                      value={inputEquipmentValues[selectedEquipment]?.tag || ""}
                      onChange={(e) =>
                        handleInputChange(
                          selectedEquipment,
                          "tag",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-primary text-xs md:text-sm">
                      Fabricante
                    </span>
                    <input
                      type="text"
                      className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                      placeholder="Fabricante do Equipamento"
                      value={
                        inputEquipmentValues[selectedEquipment]?.maker || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          selectedEquipment,
                          "maker",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-primary text-xs md:text-sm">
                      Identificação
                    </span>
                    <input
                      type="text"
                      className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                      placeholder="Identificação do Equipamento"
                      value={
                        inputEquipmentValues[selectedEquipment]?.name || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          selectedEquipment,
                          "name",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-primary text-xs md:text-sm">
                      Modelo / Série
                    </span>
                    <input
                      type="text"
                      className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                      placeholder="Modelo / Série do Equipamento"
                      value={
                        inputEquipmentValues[selectedEquipment]?.model || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          selectedEquipment,
                          "model",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-primary text-xs md:text-sm">
                      Tipo do Equipamento
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="group relative">
                        <div className="relative flex w-full items-center">
                          <input
                            type="text"
                            className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                            placeholder="Tipo do Equipamento"
                            value={
                              inputEquipmentValues[selectedEquipment]?.type ||
                              ""
                            }
                            readOnly
                          />
                          <ChevronDown className="absolute top-1/2 right-0 -translate-y-1/2 transition duration-150 data-[state=closed]:rotate-180" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white">
                        <DropdownMenuArrow />
                        <DropdownMenuItem
                          onClick={() =>
                            handleInputChange(
                              selectedEquipment,
                              "type",
                              "Tipo 1",
                            )
                          }
                        >
                          Tipo 1
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleInputChange(
                              selectedEquipment,
                              "type",
                              "Tipo 2",
                            )
                          }
                        >
                          Tipo 2
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleInputChange(
                              selectedEquipment,
                              "type",
                              "Tipo 3",
                            )
                          }
                        >
                          Tipo 3
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-primary text-xs md:text-sm">
                      Ano de Fabricação
                    </span>
                    <input
                      type="text"
                      className="h-10 w-full rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:h-12 md:px-4"
                      placeholder="Ano de Fabricação do Equipamento"
                      value={
                        inputEquipmentValues[selectedEquipment]?.year || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          selectedEquipment,
                          "year",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <span className="text-primary text-xs md:text-sm">
                      Descrição
                    </span>
                    <textarea
                      className="h-40 w-full resize-none rounded-2xl bg-white p-2 px-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] placeholder:text-neutral-300 focus:outline-none md:px-4"
                      placeholder="Descrição do Equipamento"
                      value={
                        inputEquipmentValues[selectedEquipment]?.description ||
                        ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          selectedEquipment,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex h-10 items-center justify-end gap-4 md:h-12">
                    <button
                      onClick={() => handleDeleteCurrentEquipment()}
                      className="h-10 w-full rounded-xl bg-red-500 p-2 text-sm text-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] md:w-2/5"
                    >
                      Excluir
                    </button>
                    <button
                      onClick={() => {
                        if (
                          isEquipmentFullyFilled(
                            inputEquipmentValues[selectedEquipment],
                            true,
                          )
                        ) {
                          setSelectedEquipment(null);
                        } else {
                          toast.error("Por favor, preencha todos os campos.");
                        }
                      }}
                      className="h-10 w-full rounded-xl bg-green-500 p-2 text-sm text-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] md:w-2/5"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </>
            ) : selectedSector ? (
              <>
                <div className="col-span-3 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSector(null)}
                    className="text-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.35)] md:h-12 md:w-12"
                  >
                    <ChevronLeft />
                  </button>
                  <Popover
                    open={isSectorNameHovered}
                    onOpenChange={setIsSectorNameHovered}
                  >
                    <PopoverTrigger
                      asChild
                      onMouseEnter={() => setIsSectorNameHovered(true)}
                      onMouseLeave={() => setIsSectorNameHovered(false)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSectorNameHovered(false);
                      }}
                      onBlur={() => setIsSectorNameHovered(false)}
                    >
                      <label
                        className={cn(
                          "relative flex h-10 w-32 items-center justify-start overflow-hidden rounded-2xl pr-1 md:h-12 md:w-40",
                          "bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            "bg-primary/20 text-primary flex h-10 w-10 min-w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12 md:min-w-12",
                            "bg-white/20 text-white",
                          )}
                        >
                          {selectedSector.position}
                        </span>
                        <input
                          className={cn(
                            "peer transparent h-full px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                            "text-white",
                          )}
                          placeholder="Nome da Área"
                          value={selectedSector.name}
                          disabled
                        />

                        <div
                          className={cn(
                            "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            "shadow-[0px_2px_7px_rgba(0,0,0,0.35)]",
                          )}
                        />
                      </label>
                    </PopoverTrigger>
                    <PopoverContent className="w-max max-w-40 bg-white p-1 text-sm break-words">
                      <PopoverArrow className="fill-neutral-300" />
                      <span>{selectedSector.name}</span>
                    </PopoverContent>
                  </Popover>
                </div>

                {[...Array(equipmentsArrayLength)]
                  .slice(
                    (currentEquipmentPage - 1) * 6,
                    currentEquipmentPage * 6,
                  )
                  .map((item, index) => {
                    const stateIndex = (currentEquipmentPage - 1) * 6 + index;
                    return (
                      <div key={stateIndex} className="flex flex-col gap-2">
                        <span className="text-primary text-xs md:text-sm">
                          Equipamento {stateIndex + 1}
                        </span>
                        <label
                          onClick={() => {
                            handleSelectEquipment(stateIndex);
                          }}
                          className={cn(
                            "relative flex h-10 items-center justify-end rounded-2xl px-2 md:h-12 md:px-4",
                            isEquipmentFullyFilled(
                              inputEquipmentValues[stateIndex],
                              true,
                            )
                              ? "bg-primary"
                              : "",
                          )}
                        >
                          <input
                            className={cn(
                              "peer transparent absolute left-0 h-full w-[calc(100%-2rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:px-4 md:text-sm",
                              isEquipmentFullyFilled(
                                inputEquipmentValues[stateIndex],
                                true,
                              )
                                ? "text-white"
                                : "",
                            )}
                            placeholder="TAG do Equipamento"
                            value={inputEquipmentValues[stateIndex].tag || ""}
                            readOnly
                          />
                          <Image
                            src="/icons/equipment.png"
                            alt=""
                            width={200}
                            height={200}
                            className={cn(
                              "absolute h-max w-5 object-contain transition duration-200 peer-focus:translate-x-2 peer-focus:opacity-0",
                              isEquipmentFullyFilled(
                                inputEquipmentValues[stateIndex],
                                true,
                              )
                                ? "opacity-0"
                                : "peer-focus:translate-x-2 peer-focus:opacity-0",
                            )}
                          />
                          <Image
                            src={
                              isEquipmentFullyFilled(
                                inputEquipmentValues[stateIndex],
                                true,
                              )
                                ? "/icons/checkCheckWhite.png"
                                : "/icons/checkCheck.png"
                            }
                            alt=""
                            width={200}
                            height={200}
                            className={cn(
                              "absolute h-max w-5 -translate-x-2 object-contain opacity-0 transition duration-200 peer-focus:translate-x-0 peer-focus:opacity-100",
                              isEquipmentFullyFilled(
                                inputEquipmentValues[stateIndex],
                                true,
                              )
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-2 opacity-0",
                            )}
                          />
                          <div
                            className={cn(
                              "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                              isEquipmentFullyFilled(
                                inputEquipmentValues[stateIndex],
                                true,
                              )
                                ? "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]"
                                : "",
                            )}
                          />
                        </label>
                      </div>
                    );
                  })}
              </>
            ) : (
              <>
                <div className="col-span-4 flex flex-col gap-2">
                  <span>
                    Texto para Explicar que deverá selecionar um Setor antes do
                    Equipamento:
                  </span>
                  <label className="border-primary relative flex h-8 w-60 items-center rounded-md border">
                    <input
                      className="transparent placeholder:neutral-300 absolute left-0 h-full w-[calc(100%-2rem)] rounded-md px-4 focus:outline-none"
                      placeholder="Buscar Setor"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="bg-primary absolute right-0 flex h-full w-8 items-center justify-center">
                      <Search size={12} />
                    </div>
                  </label>
                </div>
                {layoutData.areas &&
                  layoutData.areas
                    .flatMap((area) => area.sectors || [])
                    .sort((a, b) => a.position.localeCompare(b.position))
                    .filter((sector) =>
                      sector.name.toLowerCase().includes(query.toLowerCase()),
                    )
                    .slice((currentSectorPage - 1) * 12, currentSectorPage * 12)
                    .map((item, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <label
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSector(item);
                            setQuery("");
                          }}
                          className={cn(
                            "relative flex h-10 cursor-pointer items-center justify-start rounded-2xl md:h-12",
                            item.equipments &&
                              item.equipments.length !== 0 &&
                              "bg-primary",
                          )}
                        >
                          <span
                            className={cn(
                              "bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-2xl p-1 font-bold md:h-12 md:w-12",
                              item.equipments &&
                                item.equipments.length !== 0 &&
                                "bg-white/20 text-white",
                            )}
                          >
                            {item.position}
                          </span>
                          <input
                            className={cn(
                              "peer transparent absolute right-0 h-full w-[calc(100%-2.5rem)] px-2 text-xs placeholder:text-neutral-300 focus:outline-none md:w-[calc(100%-3rem)] md:px-4 md:text-sm",
                              item.equipments &&
                                item.equipments.length !== 0 &&
                                "text-white",
                            )}
                            placeholder="Nome da Área"
                            value={item.name}
                            disabled
                          />

                          <div
                            className={cn(
                              "absolute left-0 z-10 h-full w-full rounded-2xl shadow-[0px_2px_7px_rgba(0,0,0,0.15)] transition duration-200 peer-focus:shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                              item.equipments &&
                                item.equipments.length !== 0 &&
                                "shadow-[0px_2px_7px_rgba(0,0,0,0.5)]",
                            )}
                          />
                        </label>
                      </div>
                    ))}
              </>
            )}
            {isGettingData ? (
              <Skeleton />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!selectedSector) {
                    setSelectedLayoutStep(2);
                  } else {
                    handleAddEquipment();
                  }
                }}
                className={cn(
                  "bg-primary flex h-10 w-full items-center justify-center gap-1 self-end rounded-full px-1 font-bold text-white md:px-4",
                  selectedEquipment && "hidden",
                )}
              >
                <p className="text-xs md:text-sm">+</p>
                <p className="hidden md:block">
                  Cadastrar {""}
                  {selectedSector ? " Equipamento" : " Setor"}
                </p>
              </button>
            )}
          </div>
          {isGettingData ? (
            <Skeleton className="ml-auto w-80" />
          ) : (
            <div className={cn(selectedEquipment && "hidden")}>
              <CustomPagination
                currentPage={
                  selectedSector ? currentEquipmentPage : currentSectorPage
                }
                setCurrentPage={
                  selectedSector
                    ? setCurrentEquipmentPage
                    : setCurrentSectorPage
                }
                pages={selectedSector ? equipmentPages : sectorsPages}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
      {isEquipmentTemplateSheetOpen && (
        <EquipmentTemplateSheet
          open={isEquipmentTemplateSheetOpen}
          onClose={() => setIsEquipmentTemplateSheetOpen(false)}
          selectedSector={selectedSector}
        />
      )}
    </>
  );
}
