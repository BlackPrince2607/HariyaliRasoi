import { redirect } from "next/navigation";

export default function NgoRedirect() {
  redirect("/events?type=ngo");
}
