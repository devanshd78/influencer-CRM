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
      {/* 
        Outer “border” container:
        - p-[2px] gives a 2px thick frame
        - bg-gray-300 by default
        - on focus-within: switches to your gradient
      */}
      <div
        className="
          overflow-hidden rounded-md
          p-[2px]
          bg-gray-300
          group-focus-within:bg-gradient-to-r
          group-focus-within:from-[#FFA135]
          group-focus-within:to-[#FF7236]
        "
      >

        <input
          id={id}
          placeholder=" "
          {...props}
          className="
            peer block w-full
            rounded-md
            bg-white
            px-3 py-2
            text-gray-900
            focus:outline-none focus:ring-0
            transition
          "
        />
      </div>

      {/* Floating label */}
      <label
        htmlFor={id}
        className="
          absolute left-3
          bg-white px-1
          transition-all
          -top-2 text-sm text-gray-500
          peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
          peer-focus:-top-2 peer-focus:text-sm
          peer-focus:bg-gradient-to-r peer-focus:from-[#FFA135] peer-focus:to-[#FF7236]
          peer-focus:bg-clip-text peer-focus:text-transparent
        "
      >
        {label}
      </label>
    </div>
  );
}
