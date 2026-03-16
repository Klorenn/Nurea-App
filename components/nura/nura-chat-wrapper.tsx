"use client";

import dynamic from "next/dynamic";

export const NuraChatDynamic = dynamic(
  () => import("./NuraChat").then((mod) => mod.NuraChat),
  { ssr: false }
);
