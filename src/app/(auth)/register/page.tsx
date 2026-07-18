"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { setUser } from "@/lib/auth";
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
          ?.message || "Registration failed. Please try again.";
      setApiError(message);
    }
  }

  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm">
      <div className="border-b border-[#E3E3E3] px-6 py-5">
        <h1 className="text-xl font-semibold text-[#333333]">
          Create your account
        </h1>
        <p className="text-sm text-[#767676] mt-1">
          Join Lumina Bank — takes less than 5 minutes.
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
            label="First name"
            type="text"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Last name"
            type="text"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        {/* Gender selector */}
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">
                Gender <span className="text-[#767676] font-normal">(optional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "MALE",   label: "Male",            icon: "♂" },
                  { value: "FEMALE", label: "Female",          icon: "♀" },
                  { value: "OTHER",  label: "Prefer not to say", icon: "○" },
                ].map((opt) => (
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
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Phone number"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="Minimum 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
            Register
          </Button>
        </div>

        <p className="text-center text-sm text-[#767676]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#DB0011] font-medium hover:underline">
            Log on
          </Link>
        </p>
      </form>

      <div className="bg-[#F8F8F8] border-t border-[#E3E3E3] px-6 py-4">
        <p className="text-xs text-[#767676]">
          By registering, you agree to our Terms & Conditions and Privacy
          Policy. Your data is protected under UK GDPR.
        </p>
      </div>
    </div>
  );
}
