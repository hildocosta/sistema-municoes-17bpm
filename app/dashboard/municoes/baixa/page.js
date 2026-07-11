"use client";

import React, { useState } from "react";
import { 
  MinusCircle, 
  User, 
  FileText, 
  Database, 
  Loader2, 
  AlertTriangle,
  ShieldCheck,
  LayoutDashboard,
  Coins
} from "lucide-react";

// DADOS MOCKADOS - Simulando o acervo do Paiol da P4 para testes locais
const DADOS_MOCK_MUNICOES = [
  {
    id: "1",
    lote: "LOTE-9MM-2026A",
    calibre: "9x19mm Parabellum",
    tipo: "Operacional (Treinamento/Patrulha)",
    validade: "12/2031",
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
    tipo: "Fuzil Tipo IA2",
    validade: "08/2033",
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
    tipo: "Balote / Antimotim",
    validade: "04/2029",
    almoxarifado: 1250,
    cias: {
      "2ª CIA": 450,
      "ROTAM": 600
    }
  }
];

export default function CentralBaixaPage() {
  // Estados de dados iniciados diretamente com o Mock
  const [lotesDisponiveis, setLotesDisponiveis] = useState(DADOS_MOCK_MUNICOES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controle de Passos (Step 1: Painel de Saldos, Step 2: Form de Lançamento)
  const [step, setStep] = useState(1);

  // Estados do formulário de baixa militar
  const [loteId, setLoteId] = useState("");
  const [origemBaixa, setOrigemBaixa] = useState("Almoxarifado");
  const [qtdBaixa, setQtdBaixa] = useState("");
  const [motivoBaixa, setMotivoBaixa] = useState("");
  const [operador, setOperador] = useState("");

  // Derivação de estado direta (Sem useEffect)
  const loteSelecionado = lotesDisponiveis.find(item => String(item.id) === loteId) || null;

  // Retorna o saldo disponível baseado na origem selecionada
  const obterSaldoDisponivel = () => {
    if (!loteSelecionado) return 0;
    if (origemBaixa === "Almoxarifado") return loteSelecionado.almoxarifado || 0;
    return loteSelecionado.cias?.[origemBaixa] || 0;
  };

  const handleHomologarBaixa = async (e) => {
    e.preventDefault();
    const quantidade = parseInt(qtdBaixa);
    const saldoDisponivel = obterSaldoDisponivel();

    if (!loteId || !quantidade || quantidade <= 0 || !motivoBaixa || !operador) {
      alert("Atenção: Todos os campos de controle de carga são obrigatórios.");
      return;
    }

    if (quantidade > saldoDisponivel) {
      alert(`Erro Carga: Quantidade solicitada (${quantidade} un) excede o saldo disponível na origem selecionada (${saldoDisponivel} un).`);
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const novosLotes = lotesDisponiveis.map(item => {
        if (String(item.id) === loteId) {
          if (origemBaixa === "Almoxarifado") {
            return { ...item, almoxarifado: item.almoxarifado - quantidade };
          } else {
            return {
              ...item,
              cias: {
                ...item.cias,
                [origemBaixa]: item.cias[origemBaixa] - quantidade
              }
            };
          }
        }
        return item;
      });

      setLotesDisponiveis(novosLotes);
      alert("Ordem de Baixa homologada e publicada em boletim interno com sucesso!");
      
      // Reseta formulário e volta ao painel de controle principal
      setLoteId("");
      setQtdBaixa("");
      setMotivoBaixa("");
      setOperador("");
      setStep(1);

    } catch (error) {
      alert("Erro do Sistema: Não foi possível efetuar o desfalque físico.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between overflow-hidden antialiased">
      
      <div className="flex flex-col min-h-0 space-y-5">
        
        {/* CABEÇALHO & ABA DE NAVEGAÇÃO DE PASSOS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 shrink-0">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <MinusCircle className="text-rose-500" size={20} /> Central de Abate de Munições
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Descontar consumo operacional, instruções de tiro ou desfalques com publicação em BG.
            </p>
          </div>

          {/* CONTROLADOR DE ABAS (STEPS) */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-center">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                step === 1 
                  ? "bg-slate-800 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard size={14} />
              Saldos Atuais
            </button>
            <button
              onClick={() => setStep(2)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                step === 2 
                  ? "bg-rose-950 text-rose-400 border border-rose-900/50" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MinusCircle size={14} />
              Lançar Abate
            </button>
          </div>
        </div>

        {/* CONTEÚDO DINÂMICO DOS PASSOS */}
        {step === 1 ? (
          /* PASSO 1: MONITORAMENTO GERAL E EXIBIÇÃO DE LOTES */
          <div className="flex flex-col min-h-0 space-y-3 animate-fadeIn">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <Database size={14} className="text-blue-500" /> Inventário de Lotes e Distribuição por Companhia
            </h2>

            <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-0">
              <div className="overflow-y-auto container-sombrio text-xs max-h-[350px]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-950 z-10 shadow-sm">
                    <tr className="border-b border-slate-800 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Lote / Calibre</th>
                      <th className="p-3">Finalidade / Tipo</th>
                      <th className="p-3 font-mono">Validade</th>
                      <th className="p-3 text-center">Reserva Central</th>
                      <th className="p-3 text-right">Distribuição Cias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {lotesDisponiveis.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-950/20 transition-colors">
                        <td className="p-3">
                          <div className="text-white font-mono font-bold">{item.lote}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{item.calibre}</div>
                        </td>
                        <td className="p-3 text-slate-400">{item.tipo}</td>
                        <td className="p-3 font-mono text-[11px] text-amber-500">{item.validade}</td>
                        <td className="p-3 text-center font-mono font-bold text-blue-400">
                          {item.almoxarifado.toLocaleString("pt-BR")} un
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex flex-wrap gap-1 justify-end max-w-[240px] ml-auto">
                            {Object.entries(item.cias || {}).map(([cia, qtd]) => (
                              <span key={cia} className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-mono text-slate-400">
                                <strong className="text-slate-500">{cia}:</strong> {qtd}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* PASSO 2: FORMULÁRIO DE ABATE FOCO TOTAL */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-h-0 animate-fadeIn">
            
            {/* CAMPOS DO FORMULÁRIO */}
            <form onSubmit={handleHomologarBaixa} className="lg:col-span-2 bg-slate-950/30 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
              <h2 className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Coins size={14} className="text-rose-500" /> Preenchimento da Guia de Baixa
              </h2>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Lote Logístico Alvo:</label>
                <select
                  value={loteId}
                  onChange={(e) => {
                    setLoteId(e.target.value);
                    setOrigemBaixa("Almoxarifado");
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- SELECIONE O LOTE --</option>
                  {lotesDisponiveis.map(item => (
                    <option key={item.id} value={item.id}>[{item.lote}] {item.calibre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Origem do Abate:</label>
                  <select
                    value={origemBaixa}
                    onChange={(e) => setOrigemBaixa(e.target.value)}
                    disabled={!loteId}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500 disabled:opacity-40"
                  >
                    <option value="Almoxarifado">Almoxarifado P4 (Reserva Central)</option>
                    {loteSelecionado?.cias && Object.keys(loteSelecionado.cias).map(cia => (
                      <option key={cia} value={cia}>{cia} - Cautela Externa</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Quantidade (Unidades):</label>
                  <input
                    type="number"
                    placeholder="Ex: 150"
                    value={qtdBaixa}
                    onChange={(e) => setQtdBaixa(e.target.value)}
                    disabled={!loteId}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Militar Responsável:</label>
                  <div className="relative">
                    <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Ex: Cap PM Fontes"
                      value={operador}
                      onChange={(e) => setOperador(e.target.value)}
                      disabled={!loteId}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-rose-500 disabled:opacity-40"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Motivo Regulamentar / BG:</label>
                  <input
                    type="text"
                    placeholder="Ex: Consumo em instrução de tiro prático da 1ª CIA..."
                    value={motivoBaixa}
                    onChange={(e) => setMotivoBaixa(e.target.value)}
                    disabled={!loteId}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !loteId}
                className="w-full bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={12} />
                    <span>Processando Baixa no Banco...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={12} />
                    <span>Homologar e Publicar Baixa</span>
                  </>
                )}
              </button>
            </form>

            {/* SIDEBAR CONFERENTE LATERAL */}
            <div className="lg:col-span-1">
              {loteSelecionado ? (
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                    <Database size={12} className="text-blue-400" /> Conferência de Saldo
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Código do Lote</span>
                      <span className="text-white font-mono font-bold">{loteSelecionado.lote}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-800/40 py-2">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Calibre</span>
                        <span className="text-slate-300 font-bold">{loteSelecionado.calibre}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Validade</span>
                        <span className="text-amber-500 font-mono font-bold">{loteSelecionado.validade}</span>
                      </div>
                    </div>
                    <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800/80 flex justify-between items-center">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">Saldo em ({origemBaixa}):</span>
                      <span className="text-blue-400 font-mono font-black">
                        {obterSaldoDisponivel().toLocaleString("pt-BR")} un
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/20 border border-slate-800/60 border-dashed rounded-xl p-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1.5 h-36">
                  <AlertTriangle size={16} className="text-slate-600" />
                  <span>Aguardando a seleção do lote logístico alvo para auditoria de saldo.</span>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* RODAPÉ FIXO DO SISTEMA */}
      <div className="mt-4 shrink-0 p-2.5 bg-slate-950/40 border border-slate-800 text-[10px] text-slate-500 font-bold tracking-wide flex justify-between items-center rounded-xl">
        <span className="flex items-center gap-1.5">
          <FileText size={12} className="text-slate-600" /> Livro Eletrônico de Cargas e Descargas — Seção Logística
        </span>
        <span className="font-mono text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
          P4_17BPM_BAIXA_SYS
        </span>
      </div>

    </div>
  );
}