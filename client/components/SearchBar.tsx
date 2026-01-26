'use client';

import React from "react";

type SearchBarProps = {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Recherche...",
  className = "",
}: SearchBarProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string>(value ?? "");

  React.useEffect(() => {
    if (isControlled) return;
    setInternalValue(value ?? "");
  }, [value, isControlled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const current = isControlled ? (value ?? "") : internalValue;
    if (e.key === "Enter" && onSearch) onSearch(current);
  };

  return (
    <div
      className={[
        "flex items-center",
        "w-full",
        "bg-white text-black",
        "border-2 border-black",
        "rounded-full",
        "px-6 py-3",
        "shadow-sm",
        "font-[Arial]",
        "focus-within:ring-4 focus-within:ring-red-600",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-center shrink-0 mr-4">
        <svg 
          className="w-5 h-5 md:w-6 md:h-6 text-black" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={2.5} 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
          />
        </svg>
      </div>

      <input
        type="text"
        value={isControlled ? (value ?? "") : internalValue}
        onChange={(e) => {
          const v = e.target.value;
          if (onChange) onChange(v);
          else setInternalValue(v);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        className={[
          "w-full bg-transparent outline-none",
          "text-lg md:text-xl",
          "placeholder:text-gray-400",
          "caret-black",
        ].join(" ")}
      />
    </div>
  );
}
