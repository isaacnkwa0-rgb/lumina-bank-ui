"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle2, Lock } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter your email address"),
  code: z.string().length(6, "Enter the 6-digit code"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormValues) {
    setApiError("");
    try {
      await authApi.resetPassword({ email: data.email, code: data.code, newPassword: data.newPassword });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg || "Invalid or expired code. Please try again.");
    }
  }

  if (done) {
    return (
      <div className="bg-white border border-[#E3E3E3] rounded-sm px-6 py-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-[#333333] mb-2">Password reset</h2>
        <p className="text-sm text-[#767676] mb-6">Your password has been updated. You can now log in.</p>
        <Link
          href="/login"
          className="inline-block bg-[#DB0011] text-white text-sm font-semibold px-6 py-3 rounded-sm hover:bg-[#b8000e] transition-colors"
        >
          Log on
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm">
      <div className="border-b border-[#E3E3E3] px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <Lock size={20} className="text-[#DB0011]" />
          <h1 className="text-xl font-semibold text-[#333333]">Reset your password</h1>
        </div>
        <p className="text-sm text-[#767676]">
          Enter the 6-digit code we sent to your email, then choose a new password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
        {apiError && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm">
            <p className="text-sm text-[#DB0011] font-medium">{apiError}</p>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="e.g. demo@lumina.bank"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <label className="block text-xs font-semibold text-[#555] mb-1.5 uppercase tracking-wide">
            6-digit reset code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="w-full px-4 py-3 border border-[#E3E3E3] rounded-sm text-center text-2xl font-bold tracking-[0.5em] text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20 font-mono"
            {...register("code")}
          />
          {errors.code && <p className="text-xs text-[#DB0011] mt-1">{errors.code.message}</p>}
        </div>

        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="pt-1">
          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
            Reset password
          </Button>
        </div>

        <p className="text-center text-sm text-[#767676]">
          <Link href="/forgot-password" className="text-[#DB0011] hover:underline">Resend code</Link>
          {" · "}
          <Link href="/login" className="text-[#DB0011] hover:underline">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
