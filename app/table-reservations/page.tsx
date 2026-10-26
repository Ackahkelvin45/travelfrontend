import type { Metadata } from "next";
import image from "../../assets/images/services/food.jpeg";
import ComingSoon from "@/components/ghana/ComingSoon";

export const metadata: Metadata = {
  title: "Event Table Reservations | Azura Travels",
  description: "Reserved tables at Azura events in Ghana. Coming soon.",
};

export default function TableReservationsPage() {
  return (
    <ComingSoon image={image} alt="A dinner table in Accra" title="Event Table Reservations"
      intro="Reserve a table for your group at Azura events in Ghana."
      enquiry="Tell me when tables open" />
  );
}
