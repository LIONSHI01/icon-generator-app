import React from "react";

export const Input = (props: React.ComponentPropsWithoutRef<"input">) => {
  return (
    <input
      type="text"
      {...props}
      className="rounded-sm border border-gray-800 px-4 py-2"
    />
  );
};
