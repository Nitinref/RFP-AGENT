import RFPDetailClient from './workflow/RFPDetailClient';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Next.js 16 ke liye zaroori
  const { id } = await params;

  return <RFPDetailClient id={id} />;
}
