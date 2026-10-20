"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const loginSchema = z.object({
  identifier: z.string().min(1, "Enter your email or account number"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const MAX_WARM_RETRIES = 4;

function isColdStart(err: unknown): { yes: boolean; retryAfter: number } {
  const e = err as {
    response?: {
      status?: number;
      data?: { error?: { code?: string; retryAfter?: number } };
    };
  };
  const code = e.response?.data?.error?.code;
  const status = e.response?.status;
  const yes =
    code === "SYS_WARMING" ||
    !e.response ||
    status === 502 ||
    status === 503 ||
    status === 504;
  const retryAfter = e.response?.data?.error?.retryAfter ?? 10;
  return { yes, retryAfter };
}

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [apiError, setApiError] = useState<string>("");
  const [warmingUp, setWarmingUp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setApiError("");
    setWarmingUp(false);

    for (let attempt = 0; attempt <= MAX_WARM_RETRIES; attempt++) {
      try {
        await login(data.identifier.trim(), data.password);
        return;
      } catch (err: unknown) {
        const { yes, retryAfter } = isColdStart(err);

        if (yes && attempt < MAX_WARM_RETRIES) {
          setWarmingUp(true);
          await new Promise<void>((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
          setWarmingUp(false);
          continue;
        }

        setWarmingUp(false);
        const e = err as { response?: { data?: { message?: string } } };
        const message =
          e.response?.data?.message ?? t("auth.login.invalidCredentials");
        setApiError(message);
        return;
      }
    }
  }

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm">
      <div className="border-b border-[#E3E3E3] px-6 py-5">
        <h1 className="text-xl font-semibold text-[#333333]">
          {t("auth.login.heading")}
        </h1>
        <p className="text-sm text-[#767676] mt-1">
          {t("auth.login.subheading")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
        {warmingUp && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-sm">
            <p className="text-sm text-amber-700 font-medium">
              Connecting to server, please wait…
            </p>
          </div>
        )}

        {apiError && !warmingUp && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm">
            <p className="text-sm text-[#DB0011] font-medium">{apiError}</p>
          </div>
        )}

        <Input
          label="Email or Account Number"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          placeholder="email@example.com or 0123456789"
          error={errors.identifier?.message}
          {...register("identifier")}
        />

        <Input
          label={t("auth.login.passwordLabel")}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
            {t("auth.login.submit")}
          </Button>
        </div>

        <div className="flex flex-col items-center gap-3 pt-1">
          <Link href="/forgot-password" className="text-sm text-[#DB0011] hover:underline">
            {t("auth.login.forgotPassword")}
          </Link>
          <div className="text-sm text-[#767676]">
            {t("auth.login.newUser")}{" "}
            <Link href="/register" className="text-[#DB0011] font-medium hover:underline">
              {t("auth.login.register")}
            </Link>
          </div>
        </div>
      </form>

      <div className="bg-[#F8F8F8] border-t border-[#E3E3E3] px-6 py-4">
        <p className="text-xs text-[#767676]">
          <span className="font-medium text-[#333333]">{t("auth.login.securityTitle")}</span>
          {t("auth.login.securityBody")}
        </p>
      </div>
    </div>
  );
}
