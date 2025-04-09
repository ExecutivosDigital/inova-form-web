"use client";
import { Card } from "@/components/global/Card";
import { Step, Stepper } from "@/components/global/ui/steps";
import { useLayoutContext } from "@/context/LayoutContext";
import { CheckCheck } from "lucide-react";

export function EquipmentHeader() {
  const { selectedLayoutStep } = useLayoutContext();
  const steps: { label: string; icon: React.ReactNode }[] = [
    {
      label: "Identificação do Equipamento",
      icon: "",
    },
    {
      label: "Especificações Técnicas",
      icon: "",
    },
    {
      label: "Produtos e Lubrificantes",
      icon: "",
    },
    {
      label: "Localização e Operação",
      icon: "",
    },
    {
      label: "Serviços",
      icon: "",
    },
    {
      label: "Requisitos Adicionais",
      icon: <CheckCheck className="h-max w-5 object-contain" />,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-primary text-xl font-bold">
        Cadastramento de Equipamento
      </span>
      <span className="text-neutral-500">
        Importância de fazer o Cadastramento do Equipamento
      </span>
      <div className="flex flex-col gap-4">
        <Card>
          <span>Etapas do Cadastramento</span>
          <Stepper current={selectedLayoutStep - 1} gap direction="horizontal">
            {steps?.map((label, index) => (
              <Step key={index} icon={label.icon} />
            ))}
          </Stepper>
        </Card>
      </div>
    </div>
  );
}
