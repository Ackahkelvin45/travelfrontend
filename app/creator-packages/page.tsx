import type { Metadata } from "next";
import image from "../../assets/images/services/osu.png";
import ComingSoon from "@/components/ghana/ComingSoon";

export const metadata: Metadata = {
  title: "Creator Packages | Azura Travels",
  description: "Events in Ghana from creators and organisers abroad. Coming soon.",
};

export default function CreatorPackagesPage() {
  return (
    <ComingSoon image={image} alt="Accra skyline at night" title="Creator Packages"
      intro="Events in Ghana hosted by creators and organisers from abroad, bookable through Azura."
      enquiry="Tell me when creator events go live" />
  );
}
