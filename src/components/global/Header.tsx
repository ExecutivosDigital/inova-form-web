import Image from "next/image";

export function Header() {
  return (
    <div className="flex h-20 w-full items-center justify-between p-4">
      <div className="flex h-full w-1/2 items-center gap-4">
        <button className="bg-primary h-10 rounded-md px-4 py-2 font-semibold text-white shadow-sm">
          Voltar
        </button>
        <Image
          src="/horizontal-logo.png"
          alt=""
          width={1000}
          height={200}
          quality={100}
          className="h-12 w-[151px] object-contain"
        />
      </div>
      <div className="flex h-full w-1/2 flex-col justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/pages.png"
            alt=""
            width={200}
            height={200}
            className="h-5 w-max object-contain"
          />
          <span className="text-primary font-bold">
            EXECUTIVOS NEGOCIOS DIGITAIS LTDA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/icons/calendar.png"
            alt=""
            width={200}
            height={200}
            className="h-5 w-max object-contain"
          />
          <div className="flex items-center gap-1">
            <span>CNPJ:</span>
            <span className="text-primary">43.795.283/0001-18</span>
          </div>
        </div>
      </div>
    </div>
  );
}
