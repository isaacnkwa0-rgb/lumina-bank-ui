"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setApiError("");
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Invalid credentials. Please try again.";
      setApiError(message);
    }
  }

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm">
      {/* Card header */}
      <div className="border-b border-[#E3E3E3] px-6 py-5">
        <h1 className="text-xl font-semibold text-[#333333]">
          Log on to Online Banking
        </h1>
        <p className="text-sm text-[#767676] mt-1">
          Enter your email and password to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
        {/* API error */}
        {apiError && (
          <div className="bg-red-50 border-l-4 border-[#DB0011] p-4 rounded-sm">
            <p className="text-sm text-[#DB0011] font-medium">{apiError}</p>
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="e.g. demo@lumina.bank"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
          >
            Log on
          </Button>
        </div>

        <div className="flex flex-col items-center gap-3 pt-1">
          <Link
            href="/forgot-password"
            className="text-sm text-[#DB0011] hover:underline"
          >
            Forgotten your details?
          </Link>
          <div className="text-sm text-[#767676]">
            New to Lumina Bank?{" "}
            <Link
              href="/register"
              className="text-[#DB0011] font-medium hover:underline"
            >
              Register
            </Link>
          </div>
        </div>
      </form>

      {/* Security notice */}
      <div className="bg-[#F8F8F8] border-t border-[#E3E3E3] px-6 py-4">
        <p className="text-xs text-[#767676]">
          <span className="font-medium text-[#333333]">Security notice: </span>
          Lumina Bank will never ask for your full password. Always ensure you
          are on the correct website before logging on.
        </p>
      </div>
    </div>
  );
}
