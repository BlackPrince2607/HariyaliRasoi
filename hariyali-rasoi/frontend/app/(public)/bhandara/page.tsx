import { redirect } from "next/navigation";

export default function BhandaraRedirect() {
  redirect("/events?type=bhandara");
}
