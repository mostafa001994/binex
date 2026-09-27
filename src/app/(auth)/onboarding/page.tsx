import { redirect } from "next/navigation";

type Props = {
  searchParams?: Promise<{ service?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const params = (await searchParams) || {};
  redirect(params.service ? `/app?service=${params.service}` : "/app");
}
