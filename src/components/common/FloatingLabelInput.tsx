// components/ui/FloatingLabelInput.tsx
import React, { InputHTMLAttributes } from "react";

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FloatingLabelInput({
  id,
  label,
  className = "",
  ...props
}: FloatingLabelInputProps) {
  return (
    <div className={`relative w-full group ${className}`}>
      <input
        id={id}
        {...props}
        placeholder=" "
        className="
          peer
          block w-full
          border-2 border-gray-300 rounded-md
          bg-white
          px-3 py-2 text-gray-900
          focus:border-pink-600 focus:outline-none focus:ring-0
          transition
        "
      />
      <label
        htmlFor={id}
        className="
          absolute left-3
          bg-white px-1
          transition-all
          /* Default: floated */
          -top-2 text-sm text-gray-500
          /* When empty: sink it down */
          peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
          /* When focused: colored & stay floated */
          peer-focus:-top-2 peer-focus:text-sm peer-focus:text-pink-600
        "
      >
        {label}
      </label>
    </div>
  );
}
