// app/(adminPanel)/page.tsx
import { redirect } from "next/navigation";

export default function adminPanelIndex() {
  // Redirección inmediata a la sección principal
  redirect("/pedidos");
}
