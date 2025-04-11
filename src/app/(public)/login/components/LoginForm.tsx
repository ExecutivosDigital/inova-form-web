"use client";
import { Button } from "@/components/global/ui/button";
import { Checkbox } from "@/components/global/ui/checkbox";
import { Input } from "@/components/global/ui/input";
import { Label } from "@/components/global/ui/label";
import { useApiContext } from "@/context/ApiContext";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { Loader2, Lock, Mail } from "lucide-react";
import { useCookies } from "next-client-cookies";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const schema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  password: z
    .string()
    .min(4, { message: "Senha deve ter no mínimo 4 caracteres" }),
});

export function LoginForm() {
  const { PostAPI } = useApiContext();
  const cookies = useCookies();
  const [isPending, startTransition] = useTransition();
  const [passwordType, setPasswordType] = useState("password");

  const togglePasswordType = () => {
    if (passwordType === "text") {
      setPasswordType("password");
    } else if (passwordType === "password") {
      setPasswordType("text");
    }
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    startTransition(async () => {
      const login = await PostAPI("/user/signin", data, false);
      if (login.status === 200) {
        cookies.set(
          process.env.NEXT_PUBLIC_USER_TOKEN as string,
          login.body.accessToken,
        );
        toast.success("Login realizado com sucesso");
        window.location.assign("/");
        return reset();
      } else {
        toast.error("Login inválido");
      }
    });
  };

  return (
    <div className="flex h-full w-full max-w-[600px] flex-col justify-center">
      <Image
        alt=""
        src="/horizontal-logo.png"
        width={1000}
        height={200}
        quality={100}
        className="h-max w-24 object-contain md:h-24 md:w-[302px]"
      />
      <div className="text-default-900 mt-6 text-2xl font-bold 2xl:mt-8 2xl:text-3xl">
        Login
      </div>
      <div className="text-default-900 mt-2 text-base leading-6 2xl:text-lg">
        Entre agora no sistema oficial Inova
      </div>
      {/* <div className="text-default-900 mt-2 text-base leading-6 2xl:text-lg">
        Se quiser conhecer mais pode{" "}
        <span className="text-primary italic underline">
          Clicar aqui agora!
        </span>
      </div> */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 2xl:mt-7">
        <div className="relative">
          <Input
            removeWrapper
            type="email"
            id="email"
            size="lg"
            placeholder=""
            disabled={isPending}
            {...register("email")}
            className={cn(
              "peer",
              {
                "border-destructive": errors.email,
              },
              "border-default-600 rounded-none border-t-0 border-r-0 border-l-0 px-6",
            )}
          />

          <Label
            htmlFor="email"
            className="border-default-900 absolute start-1 top-2 z-10 origin-[0] -translate-y-5 scale-75 transform rounded-md px-6 text-base duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
          >
            Email
          </Label>
          <Mail className="border-default-900 absolute top-3 z-10 h-6 w-6 scale-75 transform duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:px-1" />
        </div>
        {errors.email && (
          <div className="text-destructive mt-2">
            {errors.email.message?.toString()}
          </div>
        )}
        <div className="relative mt-6">
          <Input
            removeWrapper
            type={passwordType === "password" ? "password" : "text"}
            id="password"
            size="lg"
            placeholder=" "
            disabled={isPending}
            {...register("password")}
            className={cn(
              "peer",
              {
                "border-destructive": errors.password,
              },
              "border-default-900 rounded-none border-t-0 border-r-0 border-l-0 px-6",
            )}
          />
          <Label
            htmlFor="password"
            className={cn(
              "text-default-900 bg-background absolute start-1 top-2 z-10 origin-[0] -translate-y-5 scale-75 transform rounded-md px-6 text-base duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4",
            )}
          >
            Senha
          </Label>
          <Lock className="text-default-900 absolute top-3 z-10 h-6 w-6 scale-75 transform duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:px-1" />
          <div
            className="absolute top-1/2 -translate-y-1/2 cursor-pointer ltr:right-4 rtl:left-4"
            onClick={togglePasswordType}
          >
            {passwordType === "password" ? (
              <Icon icon="heroicons:eye" className="text-primary h-4 w-4" />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="text-primary h-4 w-4"
              />
            )}
          </div>
        </div>

        {errors.password && (
          <div className="text-destructive mt-2">
            {errors.password.message?.toString()}
          </div>
        )}

        <div className="mt-5 mb-6 flex flex-wrap gap-2">
          <div className="flex flex-1 items-center gap-1.5">
            <Checkbox
              size="sm"
              className="border-primary data-[state=checked]:bg-primary mt-[1px]"
              id="isRemembered"
            />
            <Label
              htmlFor="isRemembered"
              className="text-default-700 cursor-pointer text-sm whitespace-nowrap"
            >
              Lembrar de mim
            </Label>
          </div>
          <span className="text-primary hover:text-primary/90 flex-none text-sm">
            Esqueceu a senha?
          </span>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 w-full"
          disabled={isPending}
          size="md"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Loading..." : "Entrar"}
        </Button>
      </form>

      {/* <div className="mt-6 text-center text-base text-default-600">
          Ainda não possui conta?{" "}
          <Link href="#" className="text-primary">
            {" "}
            Cadastre-se{" "}
          </Link>
        </div> */}
    </div>
  );
}
