import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/profesionales
 * Lista profesionales (Prisma). Query: q (search), specialty, city.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const specialty = searchParams.get("specialty")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";

    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { specialty: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (specialty) {
      where.specialty = { contains: specialty, mode: "insensitive" };
    }
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    const professionals = await prisma.professional.findMany({
      where,
      include: {
        reviews: true,
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    const list = professionals.map((p) => {
      const ratingCount = p.reviews.length;
      const ratingAvg =
        ratingCount > 0
          ? p.reviews.reduce((a, r) => a + r.rating, 0) / ratingCount
          : null;
      return {
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        city: p.city,
        photoUrl: p.photoUrl,
        priceRange: p.priceRange,
        description: p.description,
        rating: ratingAvg !== null ? Math.round(ratingAvg * 10) / 10 : 0,
        reviewCount: ratingCount,
      };
    });

    return NextResponse.json({ professionals: list });
  } catch (error) {
    console.error("GET /api/profesionales", error);
    return NextResponse.json(
      { error: "Error al listar profesionales" },
      { status: 500 }
    );
  }
}
