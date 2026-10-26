import type { Metadata } from "next";
import image from "../../assets/images/services/culture.png";
import ComingSoon from "@/components/ghana/ComingSoon";

export const metadata: Metadata = {
  title: "Group Share | Azura Travels",
  description: "Share a table or experience with a group in Ghana. Coming soon.",
};

export default function GroupSharePage() {
  return (
    <ComingSoon image={image} alt="Friends celebrating in Ghana" title="Group Share"
      intro="Join other travellers and share the cost of a table or experience in Ghana."
      enquiry="Tell me when Group Share opens" />
  );
}
