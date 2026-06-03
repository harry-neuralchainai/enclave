import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function ConnectPage() {
  return (
    <ModulePlaceholder
      eyebrow="Connectors & ingestion · in-VPC"
      title="Connect"
      sub="Connect your DMS, CLM, drives, and email; watch live in-VPC indexing and per-source sync status."
      cardTitle="Served by the Onyx admin (rebranded)"
      note="For milestone 1, Connect reuses Onyx's connector admin UI, whitelabeled to Enclave. This nav item will deep-link into that rebranded admin once Onyx is running."
    />
  );
}
