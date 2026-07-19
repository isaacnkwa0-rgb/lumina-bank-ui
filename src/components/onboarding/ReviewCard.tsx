"use client";

import { Pencil } from "lucide-react";
import type { ReactNode } from "react";

interface ReviewCardField {
  label: string;
  value: string | ReactNode;
}

interface ReviewCardProps {
  title: string;
  fields: ReviewCardField[];
  onEdit?: () => void;
}

function ReviewCard({ title, fields, onEdit }: ReviewCardProps) {
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-sm shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#F5F5F5]">
        <span className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest">
          {title}
        </span>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-semibold text-[#DB0011] hover:text-[#b8000e] transition-colors"
          >
            <Pencil size={12} />
            Edit
          </button>
        )}
      </div>
      <div className="px-4 pb-1">
        {fields.map((field, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-3 border-b border-[#F5F5F5] last:border-0"
          >
            <p className="text-xs text-[#AAAAAA] font-medium">{field.label}</p>
            <div className="text-sm font-medium text-[#222222] text-right max-w-[60%]">
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ReviewCard };
export type { ReviewCardProps, ReviewCardField };
