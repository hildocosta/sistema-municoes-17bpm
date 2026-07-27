"use client";

import React, { useState } from "react";
import { 
  ArrowRightLeft, 
  Shield, 
  Database, 
  User, 
  FileText, 
  Loader2, 
  AlertTriangle,
  Send,
  Building2,
  PackageCheck
} from "lucide-react";

// DADOS MOCKADOS - Simulando acervo atual do Paiol para Movimentação Interna
const DADOS_MOCK_ESTOQUE = [
  {
    id: "1",
    lote: "LOTE-9MM-2026A",
    calibre: "9x19mm Parabellum",
    almoxarifado: 15400,
    cias: {
      "1ª CIA": 2400,
      "2ª CIA": 1800,
      "FORÇA TÁTICA": 3500
    }
  },
  {
    id: "2",
    lote: "LOTE-556-IARA",
    calibre: "5.56x45mm NATO",
    almoxarifado: 8900,
    cias: {
      "1ª CIA": 1200,
      "FORÇA TÁTICA": 4000
    }
  },
  {
    id: "3",
    lote: "LOTE-12CBC-TACTICAL",
    calibre: "Calibre .12",
    almoxarifado: 1250,
    cias: {
      "2ª CIA": 450,
      "ROTAM": 600
    }
  }
];

// Subunidades cadastradas no Batalhão
const SUBUNIDADES = [
  "1ª CIA - Centro",
  "2ª CIA - Norte",
  "3ª CIA - Sul",
  "FORÇA TÁTICA",
  "ROTAM",
  "P2 - Inteligência"
];

export default function CentralTransferenciaPage() {
  const [estoque, setEstoque] = useState(DADOS_MOCK_ESTOQUE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulário de Cautela / Transferência
  const [loteId, setLoteId] = useState("");
  const [origem, setOrigem] = useState("Almoxarifado");
  const [destino, setDestino] = useState("1ª CIA - Centro");
  const [qtdTransferir, setQtdTransferir] = useState("");
  const [militarRecebedor, setMilitarRecebedor] = useState("");
  const [militarAprovador, setMilitarAprovador] = useState("");
  const [observacao, setObservacao] = useState("");

  // Derivação do Lote Selecionado
  const loteSelecionado = estoque.find((item) => String(item.id) === loteId) || null;

  // Calcula o saldo disponível na origem selecionada
  const obterSaldoOrigem = () => {
    if (!loteSelecionado) return 0;
    if (origem === "Almoxarifado") return loteSelecionado.almoxarifado || 0;
    
    // Procura chave correspondente no objeto de cias
    const chaveCia = Object.keys(loteSelecionado.cias || {}).find(
      (c) => c.toLowerCase() === origem.toLowerCase() || origem.includes(c)
    );
    return chaveCia ? loteSelecionado.cias[chaveCia] : 0;
  };

  const handleExecutarTransferencia = async (e) => {
    e.preventDefault();
    const quantidade = parseInt(qtdTransferir, 10);
    const saldoDisponivel = obterSaldoOrigem();

    if (!loteId || !quantidade || quantidade <= 0 || !militarRecebedor || !militarAprovador) {
      alert("Atenção: Preencha todos os campos regulamentares para homologar a transferência.");
      return;
    }

    if (origem === destino) {
      alert("Erro: A subunidade de origem e destino não podem ser iguais.");
      return;
    }

    if (quantidade > saldoDisponivel) {
      alert(`Erro Logístico: A quantidade (${quantidade} un) excede o saldo disponível na origem (${saldoDisponivel} un).`);
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const novoEstoque = estoque.map((item) => {
        if (String(item.id) === loteId) {
          let novoAlmoxarifado = item.almoxarifado;
          let novasCias = { ...item.cias };

          // Deduz da Origem
          if (origem === "Almoxarifado") {
            novoAlmoxarifado -= quantidade;
          } else {
            const chaveOrigem = Object.keys(novasCias).find((c) => origem.includes(c)) || origem;
            novasCias[chaveOrigem] = (novasCias[chaveOrigem] || 0) - quantidade;
          }

          // Adiciona ao Destino
          if (destino === "Almoxarifado") {
            novoAlmoxarifado += quantidade;
          } else {
            // Normaliza o nome da Cia
            const nomeCurtoDestino = destino.split(" - ")[0];
            novasCias[nomeCurtoDestino] = (novasCias[nomeCurtoDestino] || 0) + quantidade;
          }

          return {
            ...item,
            almoxarifado: novoAlmoxarifado,
            cias: novasCias
          };
        }
        return item;
      });

      setEstoque(novoEstoque);
      alert(`Transferência de ${quantidade} un do lote ${loteSelecionado.lote} realizada com sucesso!`);

      // Limpa Formulário
      setLoteId("");
      setQtdTransferir("");
      setMilitarRecebedor("");
      setMilitarAprovador("");
      setObservacao("");

    } catch (error) {
      alert("Erro do Sistema: Falha ao registrar movimentação de cautela.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between overflow-hidden antialiased">
      
      <div className="flex flex-col min-h-0 space-y-5">
        
        {/* CABEÇALHO DA PÁGINA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 shrink-0">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <ArrowRightLeft className="text-blue-500" size={20} /> Guias de Cautela e Transferência
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Movimentação de munições entre a Reserva Central (Pau/Paiol) e Subunidades Operacionais.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300">
            <Building2 size={14} className="text-blue-400" />
            <span>17º Batalhão de Polícia Militar</span>
          </div>
        </div>

        {/* CORPO PRINCIPAL: FORMULÁRIO + PAINEL DE MONITORAMENTO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-h-0 overflow-y-auto container-sombrio pr-1">
          
          {/* FORMULÁRIO DE TRANSFERÊNCIA (2 COLUNAS) */}
          <form onSubmit={handleExecutarTransferencia} className="lg:col-span-2 bg-slate-950/30 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
            <h2 className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <PackageCheck size={14} className="text-blue-500" /> Emitir Guia de Transferência / Cautela Interna
            </h2>

            {/* SELEÇÃO DO LOTE */}
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Lote Logístico / Acervo:</label>
              <select
                value={loteId}
                onChange={(e) => setLoteId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">-- SELECIONE O LOTE PARA MOVIMENTAR --</option>
                {estoque.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.lote}] {item.calibre} — Almox: {item.almoxarifado} un
                  </option>
                ))}
              </select>
            </div>

            {/* ORIGEM E DESTINO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Ponto de Origem (Saída):</label>
                <select
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  disabled={!loteId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 disabled:opacity-40"
                >
                  <option value="Almoxarifado">Almoxarifado P4 (Reserva Central)</option>
                  {SUBUNIDADES.map((sub) => (
                    <option key={`origem_${sub}`} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Ponto de Destino (Entrada):</label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  disabled={!loteId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 disabled:opacity-40"
                >
                  {SUBUNIDADES.map((sub) => (
                    <option key={`destino_${sub}`} value={sub}>{sub}</option>
                  ))}
                  <option value="Almoxarifado">Almoxarifado P4 (Devolução à Reserva)</option>
                </select>
              </div>
            </div>

            {/* QUANTIDADE E MILITAR RECEBEDOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Volume a Transferir (Unidades):</label>
                <input
                  type="number"
                  placeholder="Ex: 500"
                  value={qtdTransferir}
                  onChange={(e) => setQtdTransferir(e.target.value)}
                  disabled={!loteId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 disabled:opacity-40"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Militar Fiel / Recebedor:</label>
                <div className="relative">
                  <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Ex: 1º Sgt PM Lima (1ª CIA)"
                    value={militarRecebedor}
                    onChange={(e) => setMilitarRecebedor(e.target.value)}
                    disabled={!loteId}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* OFICIAL APROVADOR E OBSERVAÇÃO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Oficial de Logística (Aprovador):</label>
                <input
                  type="text"
                  placeholder="Ex: Maj PM Castro - Chefe da P4"
                  value={militarAprovador}
                  onChange={(e) => setMilitarAprovador(e.target.value)}
                  disabled={!loteId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Finalidade / Partida de Carga:</label>
                <input
                  type="text"
                  placeholder="Ex: Cautela trimestral de munição para rádio patrulha..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  disabled={!loteId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
                />
              </div>
            </div>

            {/* BOTÃO DE SUBMISSÃO */}
            <button
              type="submit"
              disabled={isSubmitting || !loteId}
              className="w-full bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-blue-200 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={12} />
                  <span>Registrando Transferência no Banco...</span>
                </>
              ) : (
                <>
                  <Send size={12} />
                  <span>Homologar e Assinar Guia de Transferência</span>
                </>
              )}
            </button>
          </form>

          {/* PAINEL LATERAL DE AUDITORIA E RESUMO */}
          <div className="lg:col-span-1 space-y-4">
            {loteSelecionado ? (
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  <Database size={12} className="text-blue-400" /> Balanço do Lote Alvo
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] uppercase">Lote:</span>
                    <span className="text-white font-mono font-bold">{loteSelecionado.lote}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] uppercase">Calibre:</span>
                    <span className="text-slate-300 font-bold">{loteSelecionado.calibre}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 mt-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400 uppercase font-bold">Disponível em ({origem}):</span>
                      <span className="text-blue-400 font-mono font-black">
                        {obterSaldoOrigem().toLocaleString("pt-BR")} un
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <h4 className="text-[9px] font-bold text-slate-500 uppercase mb-2">Distribuição Atual por Subunidade:</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto container-sombrio pr-1">
                    <div className="flex justify-between items-center text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                      <span className="text-slate-400 font-semibold">Reserva Central:</span>
                      <span className="font-mono text-blue-400 font-bold">{loteSelecionado.almoxarifado} un</span>
                    </div>
                    {Object.entries(loteSelecionado.cias || {}).map(([cia, qtd]) => (
                      <div key={cia} className="flex justify-between items-center text-[11px] bg-slate-900/30 p-2 rounded-lg border border-slate-800/30">
                        <span className="text-slate-400">{cia}:</span>
                        <span className="font-mono text-slate-200 font-bold">{qtd} un</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/20 border border-slate-800/60 border-dashed rounded-xl p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2 h-48">
                <AlertTriangle size={18} className="text-slate-600" />
                <span>Selecione um lote no formulário ao lado para auditar o saldo em tempo real antes de transferir.</span>
              </div>
            )}

            {/* AVISO REGULAMENTAR */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5 text-[10px] text-slate-400 leading-relaxed">
              <Shield size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                Toda movimentação gera protocolo assinado eletronicamente e altera os demonstrativos de carga das subunidades em tempo real.
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* RODAPÉ FIXO DO SISTEMA */}
      <div className="mt-4 shrink-0 p-2.5 bg-slate-950/40 border border-slate-800 text-[10px] text-slate-500 font-bold tracking-wide flex justify-between items-center rounded-xl">
        <span className="flex items-center gap-1.5">
          <FileText size={12} className="text-slate-600" /> Controle de Cautelas e Carga Externa — Seção Logística
        </span>
        <span className="font-mono text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
          P4_17BPM_TRANSFER_SYS
        </span>
      </div>

    </div>
  );
}