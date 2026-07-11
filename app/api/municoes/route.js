import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Buscar todos os lotes cadastrados
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM municoes ORDER BY id DESC;`;
    
    // Mapeia colunas do SQL para o padrão CamelCase do seu frontend
    const dadosFormatados = rows.map(item => ({
      id: item.id ? item.id.toString() : Math.random().toString(),
      lote: item.lote,
      calibre: item.calibre,
      tipo: item.tipo,
      almoxarifado: Number(item.almoxarifado) || 0,
      distribuido: Number(item.distribuido) || 0,
      estoqueTotal: Number(item.estoque_total) || 0,
      status: item.status || "Estoque Seguro"
    }));

    return NextResponse.json(dadosFormatados);
  } catch (error) {
    console.error("Erro no GET /api/municoes:", error);
    return NextResponse.json({ error: "Erro ao consultar banco de dados" }, { status: 500 });
  }
}

// Inserir um novo lote
export async function POST(request) {
  try {
    const body = await request.json();
    const { marca, modelo, calibre, lote, tipo, almoxarifado, distribuido } = body;

    // Validação básica de presença de dados
    if (!lote || !calibre) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes (Lote/Calibre)" }, { status: 400 });
    }

    const numeroLote = lote.trim().toUpperCase();
    const qtdAlmox = parseInt(almoxarifado) || 0;
    const qtdDist = parseInt(distribuido) || 0;
    const total = qtdAlmox + qtdDist;

    // Regra de negócio dos níveis de estoque
    let statusDefinido = "Estoque Seguro";
    if (total < 2000) statusDefinido = "Crítico";
    else if (total < 6000) statusDefinido = "Atenção";

    const especificacaoTecnica = `${marca || ""} ${modelo || ""} (${tipo || "Operacional"})`.trim();

    // 1. Verificação manual preventiva se o lote já existe para evitar estouro no ON CONFLICT
    const { rowCount } = await sql`SELECT 1 FROM municoes WHERE UPPER(lote) = ${numeroLote};`;
    if (rowCount > 0) {
      return NextResponse.json({ error: `O lote número ${numeroLote} já encontra-se cadastrado no sistema.` }, { status: 409 });
    }

    // 2. Executa a inserção real
    const resultado = await sql`
      INSERT INTO municoes (lote, calibre, tipo, almoxarifado, distribuido, estoque_total, status)
      VALUES (${numeroLote}, ${calibre}, ${especificacaoTecnica}, ${qtdAlmox}, ${qtdDist}, ${total}, ${statusDefinido})
      RETURNING id;
    `;

    if (resultado.rowCount === 0) {
      throw new Error("O banco de dados recusou a inserção do registro.");
    }

    return NextResponse.json({ success: true, id: resultado.rows[0].id });
  } catch (error) {
    console.error("Erro interno no POST /api/municoes:", error);
    return NextResponse.json({ error: error.message || "Erro interno no servidor de banco de dados." }, { status: 500 });
  }
}