"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  label: string;
  hint: string;
  accept?: string;
  maxSizeMb?: number;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileUploadZone({
  label,
  hint,
  accept,
  maxSizeMb = 5,
  file,
  onChange,
  error,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState("");

  const activeError = error || sizeError;

  function validate(f: File): boolean {
    if (f.size > maxSizeMb * 1024 * 1024) {
      setSizeError(`File must be smaller than ${maxSizeMb} MB`);
      return false;
    }
    setSizeError("");
    return true;
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (validate(f)) onChange(f);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setSizeError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const isImage = file?.type.startsWith("image/");
  const previewUrl = file && isImage ? URL.createObjectURL(file) : null;

  if (file) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-3 border border-[#E3E3E3] rounded-sm p-3 bg-white">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="h-14 w-14 object-cover rounded-sm flex-shrink-0"
            />
          ) : (
            <div className="h-14 w-14 flex items-center justify-center bg-[#F8F8F8] rounded-sm flex-shrink-0">
              <FileText size={24} className="text-[#767676]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#333333] truncate">{file.name}</p>
            <p className="text-xs text-[#767676] mt-0.5">{formatBytes(file.size)}</p>
          </div>
          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          <button
            type="button"
            onClick={handleRemove}
            className="flex-shrink-0 text-[#767676] hover:text-[#DB0011] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "cursor-pointer border-2 border-dashed rounded-sm px-4 py-8 flex flex-col items-center gap-2 transition-colors duration-150",
          dragOver && "bg-blue-50 border-blue-400",
          !dragOver && activeError && "border-[#DB0011]",
          !dragOver && !activeError && "border-[#E3E3E3] hover:border-[#DB0011] hover:bg-[#F8F8F8]"
        )}
      >
        <UploadCloud
          size={28}
          className={cn(
            dragOver ? "text-blue-500" : activeError ? "text-[#DB0011]" : "text-[#767676]"
          )}
        />
        <div className="text-center">
          <p className="text-sm font-semibold text-[#333333]">{label}</p>
          <p className="text-xs text-[#767676] mt-0.5">{hint}</p>
          <p className="text-xs text-[#767676] mt-2">Click to upload or drag &amp; drop</p>
          <p className="text-xs text-[#AAAAAA] mt-1">
            {accept
              ? accept.split(",").map((a) => a.trim().split("/").pop()?.toUpperCase()).join(", ")
              : "Any file"}{" "}
            &middot; Max {maxSizeMb} MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {activeError && (
        <p className="text-xs text-[#DB0011]">{activeError}</p>
      )}
    </div>
  );
}

export { FileUploadZone };
export type { FileUploadZoneProps };
