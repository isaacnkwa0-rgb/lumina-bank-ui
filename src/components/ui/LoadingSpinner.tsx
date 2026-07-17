import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div
      className={cn(
        "rounded-full border-[#E3E3E3] border-t-[#DB0011] animate-spin",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-sm", className)} />;
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm p-4">
      <SkeletonBlock className="h-4 w-1/3 mb-3" />
      <SkeletonBlock className="h-8 w-1/2 mb-2" />
      <SkeletonBlock className="h-3 w-2/3" />
    </div>
  );
}

function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border-b border-[#E3E3E3]">
          <SkeletonBlock className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <SkeletonBlock className="h-4 w-1/2 mb-2" />
            <SkeletonBlock className="h-3 w-1/3" />
          </div>
          <SkeletonBlock className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export { LoadingSpinner, LoadingPage, SkeletonBlock, SkeletonCard, SkeletonList };
