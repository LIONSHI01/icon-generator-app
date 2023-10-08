import Link from "next/link";
import React from "react";

export const PrimaryLink = (
  props: React.ComponentPropsWithoutRef<typeof Link>
) => {
  return (
    <Link className="hover:text-cyan-500" {...props}>
      {props.children}
    </Link>
  );
};
