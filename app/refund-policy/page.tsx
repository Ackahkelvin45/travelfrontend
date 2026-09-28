import PolicyPage from "@/components/policies/PolicyPage";

export const metadata = { title: "Refund Policy | Azura Travels" };

export default function Page() {
  return <PolicyPage type="refund" fallbackTitle="Refund Policy" />;
}
