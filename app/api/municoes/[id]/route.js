import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"; // <--- Alterado de 'import prisma' para '{ prisma }'

export async function GET(request, { params }) {
  try {
    // No Next.js 15+, 'params' é uma Promise e precisa ser aguardada
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Converte o ID para número (conforme definido no schema.prisma: Int @id)
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "Identificador de lote inválido." },
        { status: 400 }
      );
    }

    // Busca no banco de dados com o schema do Prisma
    const lote = await prisma.loteMunicao.findUnique({
      where: {
        id: numericId,
      },
      select: {
        id: true,
        lote: true,
        calibre: true,
        marca: true,
        modelo: true,
        tipo: true,
        almoxarifado: true,
        distribuido: true,
        estoqueTotal: true,
        status: true,
        criadoEm: true,
      },
    });

    if (!lote) {
      return NextResponse.json(
        { message: "Lote não localizado no acervo do Paiol." },
        { status: 404 }
      );
    }

    return NextResponse.json(lote, { status: 200 });
  } catch (error) {
    console.error("Erro interno no servidor ao buscar lote:", error);

    return NextResponse.json(
      { message: "Erro interno no servidor de dados do Paiol." },
      { status: 500 }
    );
  }
}