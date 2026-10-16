import { redirect } from "next/navigation";
import { routes } from "@/utils/navigation";

export default function SupportIndexPage() {
  redirect(routes.supportTickets());
}
