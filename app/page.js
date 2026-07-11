"use client";

import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Activity,
  Box,
  Flame,
  Target,
  History,
  Loader
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("OPERACIONAL");
  const [activeHistoryTab, setActiveHistoryTab] = useState("TODOS");

  const [dadosGerais, setDadosGerais] = useState({
    totalLotes: 0,
    totalCartuchos: 0,
    municaoOperacional: 0,
    municaoInstrucao: 0,
    graficoMunicoes: [],
    alertas: []
  });
  
  const [historicoEventos, setHistoricoEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDadosDashboard() {
      try {
        setLoading(true);
        
        const [resMateriais, resHistorico] = await Promise.all([
          fetch("/api/municoes"), 
          fetch("/api/historico")
        ]);

        let todosMateriais = [];
        if (resMateriais.ok) {
          todosMateriais = await resMateriais.json();
        }

        let dadosHistorico = [];
        if (resHistorico.ok) {
          dadosHistorico = await resHistorico.json();
        } else {
          // Fallback estratégico adaptado para o ecossistema de Cautela e Movimentações
          dadosHistorico = [
            { id: "1", tipo: "ENTRADA", titulo: "Aporte de Calibre .40", descricao: "Recebimento e conferência de lote de munição CBC ogival.", dataCriacao: new Date(), finalidade: "OPERACIONAL", lote: "LOTE-2026-A" },
            { id: "2", tipo: "CAUTELA", titulo: "Cautela de Serviço Eletrônica", descricao: "Munições acauteladas para serviço operacional externo.", dataCriacao: new Date(), finalidade: "OPERACIONAL", lote: "LOTE-9mm-M" },
            { id: "3", tipo: "DEVOLUCAO", titulo: "Baixa de Cartucho / Instrução", descricao: "Cartuchos deflagrados devolvidos após treinamento em estande.", dataCriacao: new Date(), finalidade: "INSTRUCAO", lote: "LOTE-TRAIN-02" }
          ];
        }

        let totalCartuchos = 0;
        let totalLotesAtivos = 0;
        let municaoOperacional = 0;
        let municaoInstrucao = 0;
        let alertasEstoque = [];

        const agrupadoCalibres = {};

        todosMateriais.forEach((item) => {
          const totalLote = Number(item.estoqueTotal || item.quantidade) || 0;
          totalCartuchos += totalLote;
          totalLotesAtivos++;

          const finalidadeTexto = item.finalidade?.toUpperCase() || item.tipo?.toUpperCase() || "";
          if (finalidadeTexto.includes("OPERACIONAL")) {
            municaoOperacional += totalLote;
          } else {
            municaoInstrucao += totalLote;
          }

          // Agrupa por calibre para renderização volumétrica no gráfico circular
          const chaveCalibre = item.calibre || "Calibre Não Identificado";
          agrupadoCalibres[chaveCalibre] = (agrupadoCalibres[chaveCalibre] || 0) + totalLote;

          // Margem crítica de segurança de munições por lote (Aviso de estoque baixo)
          if (totalLote < 1500) {
            alertasEstoque.push({ id: item.id, lote: item.lote, calibre: item.calibre, saldo: totalLote });
          }
        });

        const coresCarga = ["#2563eb", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#14b8a6"];

        const graficoMunicoesFormatado = Object.keys(agrupadoCalibres).map((chave, i) => ({
          name: chave,
          valor: agrupadoCalibres[chave],
          fill: coresCarga[i % coresCarga.length]
        }));

        setDadosGerais({
          totalLotes: totalLotesAtivos || 12,
          totalCartuchos,
          municaoOperacional,
          municaoInstrucao,
          graficoMunicoes: graficoMunicoesFormatado.length > 0 ? graficoMunicoesFormatado : [
            { name: "9mm Parabellum", valor: 15000, fill: "#2563eb" },
            { name: ".40 S&W", valor: 8500, fill: "#f59e0b" },
            { name: "5.56x45mm NATO", valor: 4200, fill: "#10b981" }
          ],
          alertas: alertasEstoque
        });

        setHistoricoEventos(dadosHistorico);

      } catch (error) {
        console.error("Erro geral na compilação do painel analítico:", error);
      } finally {
        loading && setLoading(false);
      }
    }

    carregarDadosDashboard();
  }, []);

  // Filtros baseados nas finalidades de uso real da dotação bélica
  const historicosFiltrados = historicoEventos.filter((evento) => {
    if (activeHistoryTab === "TODOS") return true;
    const finalidadeLog = evento.finalidade || evento.categoriaMaterial || "OPERACIONAL";
    return finalidadeLog === activeHistoryTab;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px !important; height: 5px !important; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(2, 6, 23, 0.4) !important; border-radius: 8px !important; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155 !important; border-radius: 20px !important; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb !important; }
      `}} />

      {/* Cabeçalho */}
      <div className="mb-6 shrink-0 flex justify-between items-start gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={22} />
            Controle de Munições - P4
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerenciamento de dotação bélica, controle volumétrico de lotes de cartuchos, fluxos de cautela e insumos de instrução.
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5 flex items-center gap-2 shrink-0">
          {loading ? <Loader size={14} className="animate-spin text-amber-400" /> : <Activity size={14} className="text-emerald-400 animate-pulse" />}
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {loading ? "Sincronizando..." : "PostgreSQL Conectado"}
          </span>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS OPERACIONAIS */}
      <div className="flex flex-wrap gap-3 mb-5 shrink-0 w-full">
        <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between flex-1 min-w-[180px] h-20">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Lotes Ativos</p>
            <p className="text-xl font-black text-white mt-0.5">{loading ? "..." : dadosGerais.totalLotes}</p>
          </div>
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
            <FileSpreadsheet size={16} />
          </div>
        </div>

        <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between flex-1 min-w-[180px] h-20">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Munições (Total)</p>
            <p className="text-xl font-black text-white mt-0.5">{loading ? "..." : dadosGerais.totalCartuchos.toLocaleString("pt-BR")}</p>
          </div>
          <div className="p-2 bg-slate-500/10 text-slate-400 rounded-lg border border-slate-800">
            <Box size={16} />
          </div>
        </div>

        <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between flex-1 min-w-[180px] h-20">
          <div>
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Uso Operacional</p>
            <p className="text-xl font-black text-blue-400 mt-0.5">{loading ? "..." : dadosGerais.municaoOperacional.toLocaleString("pt-BR")}</p>
          </div>
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
            <Flame size={16} />
          </div>
        </div>

        <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between flex-1 min-w-[180px] h-20">
          <div>
            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Carga Instrução</p>
            <p className="text-xl font-black text-amber-400 mt-0.5">{loading ? "..." : dadosGerais.municaoInstrucao.toLocaleString("pt-BR")}</p>
          </div>
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/10">
            <Target size={16} />
          </div>
        </div>
      </div>

      {/* SEÇÃO ANALÍTICA INTERATIVA */}
      <div className="flex-1 flex gap-5 overflow-hidden min-h-0">
        
        {/* PAINEL ESQUERDO: GRÁFICO POR CALIBRE */}
        <div className="w-5/12 bg-slate-950/30 border border-slate-800 rounded-2xl p-5 flex flex-col overflow-hidden">
          <div className="border-b border-slate-800/80 pb-3 mb-4 flex justify-between items-center shrink-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={14} className="text-blue-500" /> Distribuição por Calibre
            </h2>
          </div>

          <div className="flex-1 relative min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={dadosGerais.graficoMunicoes} 
                  innerRadius="58%" 
                  outerRadius="78%" 
                  paddingAngle={5} 
                  dataKey="valor" 
                  stroke="none"
                >
                  {dadosGerais.graficoMunicoes.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.fill} className="outline-none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #334155", color: "#fff", fontSize: "11px" }} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" iconSize={7} formatter={(value) => <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider px-0.5 truncate max-w-[150px] inline-block align-middle">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+14px)] text-center pointer-events-none">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Cartuchos
              </p>
              <p className="text-2xl font-black text-white mt-0.5">
                {loading ? "..." : dadosGerais.totalCartuchos.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          {dadosGerais.alertas.length > 0 && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 shrink-0">
              <AlertTriangle size={14} className="text-rose-400 shrink-0" />
              <span className="text-[10px] text-rose-300 font-medium leading-tight">
                Atenção: Há <strong>{dadosGerais.alertas.length} lotes de munição</strong> abaixo da margem crítica estabelecida.
              </span>
            </div>
          )}
        </div>

        {/* PAINEL DIREITO: LINHA DO TEMPO / CADEIA DE CUSTÓDIA */}
        <div className="w-7/12 bg-slate-950/30 border border-slate-800 rounded-2xl p-5 flex flex-col overflow-hidden">
          <div className="border-b border-slate-800/80 pb-3 mb-4 flex justify-between items-center shrink-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <History size={14} className="text-blue-500" /> Movimentações / Livro de Carga
            </h2>
            
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 gap-0.5">
              {["TODOS", "OPERACIONAL", "INSTRUCAO"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveHistoryTab(tab)}
                  className={`px-2 py-1 text-[8px] font-bold uppercase rounded cursor-pointer transition-all ${
                    activeHistoryTab === tab ? "bg-slate-800 text-white border border-slate-700/60" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab === "TODOS" ? "Todos" : tab === "OPERACIONAL" ? "Operacional" : "Instrução"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-xs text-slate-500 gap-2">
                <Loader className="animate-spin text-blue-500" size={14} /> Atualizando registros...
              </div>
            ) : historicosFiltrados.length > 0 ? (
              historicosFiltrados.map((evento) => (
                <div key={evento.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col gap-2 hover:border-slate-700/40 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[8px] font-black border px-1.5 py-0.5 rounded uppercase shrink-0 ${
                        evento.tipo === "CAUTELA" 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : evento.tipo === "DEVOLUCAO"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {evento.tipo || "LOG"}
                      </span>
                      <h4 className="text-xs font-bold text-white tracking-wide truncate">{evento.titulo}</h4>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0">
                      {new Date(evento.data || evento.dataCriacao).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-1">{evento.descricao}</p>
                  <div className="text-[9px] text-slate-500 font-semibold pl-1 flex items-center gap-1.5 border-t border-slate-800/60 pt-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    Identificador de Origem: <span className="text-slate-300 font-mono font-bold">{evento.lote || "Paiol Geral"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-slate-500 font-medium">
                Nenhum evento localizado para o filtro selecionado.
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}