"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle2, Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    setApiError("");
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg || "Something went wrong. Please try again.");
    }
  }

  if (sent) {
    return (
      <div className="bg-white border border-[#E3E3E3] rounded-sm px-6 py-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-[#333333] mb-2">{t("auth.forgot.successHeading")}</h2>
        <p className="text-sm text-[#767676] mb-6">{t("auth.forgot.successBody")}</p>
        <Link
          href="/reset-password"
          className="inline-block bg-[#DB0011] text-white text-sm font-semibold px-6 py-3 rounded-sm hover:bg-[#b8000e] transition-colors"
        >
          Enter reset code
        </Link>
        <p className="mt-4 text-sm text-[#767676]">
          <Link href="/login" className="text-[#DB0011] hover:underline">{t("auth.forgot.backToLogin")}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm">
      <div className="border-b border-[#E3E3E3] px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <Mail size={20} className="text-[#DB0011]" />
          <h1 className="text-xl font-semibold text-[#333333]">{t("auth.forgot.heading")}</h1>
        </div>
        <p className="text-sm text-[#767676]">{t("auth.forgot.subheading")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
        {apiError && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm">
            <p className="text-sm text-[#DB0011] font-medium">{apiError}</p>
          </div>
        )}

        <Input
          label={t("auth.forgot.emailLabel")}
          type="email"
          autoComplete="email"
          placeholder="e.g. demo@lumina.bank"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          {t("auth.forgot.submit")}
        </Button>

        <p className="text-center text-sm text-[#767676]">
          <Link href="/login" className="text-[#DB0011] hover:underline">{t("auth.forgot.backToLogin")}</Link>
        </p>
      </form>
    </div>
  );
}
