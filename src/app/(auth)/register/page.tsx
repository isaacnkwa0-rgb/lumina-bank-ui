"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { setUser } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(10, "Enter a valid phone number"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setApiError("");
    try {
      await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        gender: data.gender,
      });
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("auth.register.failed");
      setApiError(message);
    }
  }

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm">
      <div className="border-b border-[#E3E3E3] px-6 py-5">
        <h1 className="text-xl font-semibold text-[#333333]">
          {t("auth.register.heading")}
        </h1>
        <p className="text-sm text-[#767676] mt-1">
          {t("auth.register.subheading")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
        {apiError && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm">
            <p className="text-sm text-[#DB0011] font-medium">{apiError}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t("auth.register.firstName")}
            type="text"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label={t("auth.register.lastName")}
            type="text"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">
                {t("auth.register.gender")}{" "}
                <span className="text-[#767676] font-normal">{t("auth.register.genderOptional")}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "MALE",   labelKey: "auth.register.genderMale",   icon: "♂" },
                  { value: "FEMALE", labelKey: "auth.register.genderFemale", icon: "♀" },
                  { value: "OTHER",  labelKey: "auth.register.genderOther",  icon: "○" },
                ] .map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(field.value === opt.value ? undefined : opt.value)}
                    className={`py-3 px-2 rounded-sm border text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                      field.value === opt.value
                        ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
                        : "border-[#E3E3E3] text-[#555] hover:border-[#AAAAAA]"
                    }`}
                  >
                    <span className="text-base">{opt.icon}</span>
                    <span className="text-xs">{t(opt.labelKey as Parameters<typeof t>[0])}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        <Input
          label={t("auth.register.email")}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label={t("auth.register.phone")}
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label={t("auth.register.password")}
          type="password"
          autoComplete="new-password"
          hint={t("auth.register.passwordHint")}
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label={t("auth.register.confirmPassword")}
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
            {t("auth.register.submit")}
          </Button>
        </div>

        <p className="text-center text-sm text-[#767676]">
          {t("auth.register.alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-[#DB0011] font-medium hover:underline">
            {t("auth.register.logOn")}
          </Link>
        </p>
      </form>

      <div className="bg-[#F8F8F8] border-t border-[#E3E3E3] px-6 py-4">
        <p className="text-xs text-[#767676]">
          {t("auth.register.gdprNotice")}
        </p>
      </div>
    </div>
  );
}
