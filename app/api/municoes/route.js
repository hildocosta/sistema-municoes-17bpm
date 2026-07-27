import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET: Lista todos os lotes
export async function GET() {
  try {
    const lotes = await prisma.loteMunicao.findMany({
      orderBy: {
        criadoEm: "desc",
      },
    });

    return NextResponse.json(lotes);
  } catch (error) {
    console.error("Erro ao buscar lotes:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar lotes do banco." },
      { status: 500 }
    );
  }
}

// POST: Cadastra um novo lote
export async function POST(request) {
  try {
    const body = await request.json();
    const { tipo, lote, marca, modelo, calibre, almoxarifado, distribuido } = body;

    // Validação simples
    if (!lote) {
      return NextResponse.json(
        { error: "O número do lote é obrigatório." },
        { status: 400 }
      );
    }

    const qtdAlmox = Number(almoxarifado) || 0;
    const qtdDist = Number(distribuido) || 0;
    const total = qtdAlmox + qtdDist;

    // Definição lógica do status de estoque
    let statusDefinido = "Estoque Seguro";
    if (total === 0) statusDefinido = "Crítico";
    else if (total < 3000) statusDefinido = "Atenção";

    const novoLote = await prisma.loteMunicao.create({
      data: {
        lote: lote.toUpperCase().trim(),
        calibre,
        marca,
        modelo,
        tipo,
        almoxarifado: qtdAlmox,
        distribuido: qtdDist,
        estoqueTotal: total,
        status: statusDefinido,
      },
    });

    return NextResponse.json(novoLote, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar lote:", error);

    // Trata erro de lote duplicado (@unique no Prisma)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Este número de lote já está cadastrado no sistema." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno ao salvar lote no banco." },
      { status: 500 }
    );
  }
}