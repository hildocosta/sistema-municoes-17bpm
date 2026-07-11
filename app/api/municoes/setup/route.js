import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS municoes (
        id SERIAL PRIMARY KEY,
        lote VARCHAR(255) NOT NULL UNIQUE,
        calibre VARCHAR(255) NOT NULL,
        tipo VARCHAR(255) NOT NULL,
        almoxarifado INT DEFAULT 0,
        distribuido INT DEFAULT 0,
        estoque_total INT DEFAULT 0,
        status VARCHAR(50) NOT NULL
      );
    `;
    return NextResponse.json({ message: "Tabela 'municoes' criada com sucesso no Neon!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}