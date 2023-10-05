import React from "react";

const Button = (props: React.ComponentPropsWithoutRef<"button">) => {
  return (
    <button
      className="rounded bg-blue-100 px-4 py-2 hover:bg-blue-500"
      {...props}
    >
      {props.children}
    </button>
  );
};

export default Button;
