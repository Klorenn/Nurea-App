import { redirect } from "next/navigation";

export default function PacienteBuscarRedirect() {
  redirect("/dashboard/patient/buscar");
}
