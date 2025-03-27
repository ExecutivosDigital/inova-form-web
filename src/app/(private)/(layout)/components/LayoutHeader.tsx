"use client";
import { Card } from "@/components/global/Card";
import { Step, Stepper } from "@/components/global/ui/steps";
import { useLayoutContext } from "@/context/LayoutContext";
import { CheckCheck } from "lucide-react";

export function LayoutHeader() {
  const { selectedLayoutStep } = useLayoutContext();
  const steps: { label: string; icon: React.ReactNode }[] = [
    {
      label: "Cadastramento de Áreas",
      icon: "",
    },
    {
      label: "Cadastramento de Setores",
      icon: "",
    },
    {
      label: "Cadastramento de Equipamentos",
      icon: "",
    },
    {
      label: "Cadastramento de Conjuntos",
      icon: "",
    },
    {
      label: "Cadastramento de Subconjuntos",
      icon: "",
    },
    {
      label: "Cadastramento de CIP - Código Identificador",
      icon: (
        <CheckCheck className="h-max w-5 object-contain" />
        // <Image
        //   src="/icons/checkCheck.png"
        //   alt=""
        //   width={200}
        //   height={200}
        //   className="h-max w-5 object-contain"
        // />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-primary text-xl font-bold">
        Cadastramento de Layout
      </span>
      <span className="text-neutral-500">
        Importância de fazer o Cadastramento do Layout
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
