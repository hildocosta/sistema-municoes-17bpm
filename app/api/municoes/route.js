import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Buscar todos os lotes cadastrados
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM municoes ORDER BY id DESC;`;
    
    // Mapeia colunas do SQL para o padrão CamelCase do seu frontend
    const dadosFormatados = rows.map(item => ({
      id: item.id.toString(),
      lote: item.lote,
      calibre: item.calibre,
      tipo: item.tipo,
      almoxarifado: item.almoxarifado,
      distribuido: item.distribuido,
      estoqueTotal: item.estoque_total,
      status: item.status
    }));

    return NextResponse.json(dadosFormatados);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao consultar banco de dados" }, { status: 500 });
  }
}

// Inserir um novo lote
export async function POST(request) {
  try {
    const body = await request.json();
    const { marca, modelo, calibre, lote, tipo, almoxarifado, distribuido } = body;

    const qtdAlmox = parseInt(almoxarifado) || 0;
    const qtdDist = parseInt(distribuido) || 0;
    const total = qtdAlmox + qtdDist;

    let statusDefinido = "Estoque Seguro";
    if (total < 2000) statusDefinido = "Crítico";
    else if (total < 6000) statusDefinido = "Atenção";

    const especificacaoTecnica = `${marca} ${modelo} (${tipo})`;

    await sql`
      INSERT INTO municoes (lote, calibre, tipo, almoxarifado, distribuido, estoque_total, status)
      VALUES (${lote.toUpperCase()}, ${calibre}, ${especificacaoTecnica}, ${qtdAlmox}, ${qtdDist}, ${total}, ${statusDefinido})
      ON CONFLICT (lote) DO NOTHING;
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}