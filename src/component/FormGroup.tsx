import React from "react";

const FormGroup = (props: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div className="flex flex-col gap-4" {...props}>
      {props.children}
    </div>
  );
};

export default FormGroup;
