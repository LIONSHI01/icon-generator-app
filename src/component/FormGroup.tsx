import React from "react";

export const FormGroup = (props: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div className="flex flex-col gap-4" {...props}>
      {props.children}
    </div>
  );
};
