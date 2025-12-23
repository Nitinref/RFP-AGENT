import { NextResponse } from 'next/server';
import { prisma } from '@/backend/src/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const report = await prisma.rFPReport.findFirst({
    where: { rfpId: params.id },
    orderBy: { generatedAt: 'desc' },
  });

  if (!report) {
    return NextResponse.json(
      { success: false, error: 'Report not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: report,
  });
}
