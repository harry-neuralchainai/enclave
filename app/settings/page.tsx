import ModulePlaceholder from "@/components/ModulePlaceholder";

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Workspace settings · in-VPC"
      title="Settings"
      sub="Models, users, access controls, and indexing — managed for your deployment."
      cardTitle="Served by the Onyx admin (rebranded)"
      note="For milestone 1, Settings reuses Onyx's admin UI, whitelabeled to Enclave. This nav item will deep-link into that rebranded admin once Onyx is running."
    />
  );
}
