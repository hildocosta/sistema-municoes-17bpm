"use client";

import React, { useState } from "react";
import { 
  History, 
  Search, 
  ShieldAlert, 
  DownloadCloud, 
  FileSpreadsheet, 
  FileText,
  SlidersHorizontal,
  UserCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";

// DADOS MOCKADOS INICIAIS — Registro Imutável de Auditoria (Logs do Paiol)
const DEBBUG_LOGS_AUDITORIA = [
  {
    id: "LOG-9842",
    data: "11/07/2026 - 14:15",
    usuario: "Maj. QOPM Silva",
    acao: "Homologação de Lote",
    detalhe: "Inserção do novo lote LOTE-9MM-2026A (9x19mm Parabellum)",
    tipo: "entrada", // entrada, saida, alerta, seguranca
    ip: "10.142.45.12"
  },
  {
    id: "LOG-9839",
    data: "11/07/2026 - 09:30",
    usuario: "Cap. PM Almeida",
    acao: "Distribuição Externa",
    detalhe: "Transferência de 1.200 un do LOTE-556-IARA para a 2ª Cia",
    tipo: "saida",
    ip: "10.142.45.89"
  },
  {
    id: "LOG-9835",
    data: "10/07/2026 - 18:22",
    usuario: "Sgt. PM Ribeiro",
    acao: "Alerta de Criticidade",
    detalhe: "Lote LOTE-12CBC-TACTICAL atingiu o limite crítico (< 200 un no Almox.)",
    tipo: "alerta",
    ip: "10.142.48.201"
  },
  {
    id: "LOG-9830",
    data: "09/07/2026 - 23:05",
    usuario: "SISTEMA (Automático)",
    acao: "Bloqueio Preventivo",
    detalhe: "Tentativa de login malsucedida com credenciais de armeiro revogadas",
    tipo: "seguranca",
    ip: "186.232.12.44"
  }
];

export default function HistoricoAuditoriaPage() {
  const [logs, setLogs] = useState(DEBBUG_LOGS_AUDITORIA);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  // Filtros em tempo de execução limpos (Sem useEffect)
  const logsFiltrados = logs.filter(log => {
    const usuarioTexto = log.usuario.toLowerCase();
    const acaoTexto = log.acao.toLowerCase();
    const detalheTexto = log.detalhe.toLowerCase();
    const buscaTexto = busca.toLowerCase();

    const correspondeBusca = 
      usuarioTexto.includes(buscaTexto) ||
      acaoTexto.includes(buscaTexto) ||
      detalheTexto.includes(buscaTexto);

    const correspondeTipo = filtroTipo === "Todos" || log.tipo === filtroTipo;

    return correspondeBusca && correspondeTipo;
  });

  // Estilização dinâmica por categoria de Log de Auditoria
  const getLogStyle = (tipo) => {
    switch (tipo) {
      case "entrada": return { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <ArrowDownLeft size={14} /> };
      case "saida": return { bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: <ArrowUpRight size={14} /> };
      case "alerta": return { bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <ShieldAlert size={14} /> };
      case "seguranca": return { bg: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: <ShieldAlert size={14} /> };
      default: return { bg: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: <History size={14} /> };
    }
  };

  const handleExportar = (formato) => {
    alert(`Relatório de auditoria compilado e exportado com sucesso em formato ${formato.toUpperCase()}! (Simulado)`);
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between overflow-hidden antialiased">
      
      <div className="flex flex-col min-h-0 space-y-5">
        
        {/* CABEÇALHO DA TELA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <History className="text-blue-500" size={22} />
              Trilha de Auditoria e Histórico da Reserva (P4)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Livro de registro digital imutável contendo transferências de material, alterações de carga e eventos de segurança física.
            </p>
          </div>

          {/* BOTÕES DE EXPORTAÇÃO RÁPIDA */}
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => handleExportar("pdf")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold uppercase text-slate-300 tracking-wider transition-all cursor-pointer"
            >
              <FileText size={12} className="text-rose-500" />
              PDF
            </button>
            <button 
              onClick={() => handleExportar("xls")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold uppercase text-slate-300 tracking-wider transition-all cursor-pointer"
            >
              <FileSpreadsheet size={12} className="text-emerald-500" />
              XLSX / CSV
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS E BUSCA */}
        <div className="shrink-0 flex flex-col sm:flex-row gap-3 items-center justify-between p-3 bg-slate-950/30 border border-slate-800/60 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Filtrar por Usuário, Ação ou Detalhe do log..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <SlidersHorizontal size={14} className="text-slate-500" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              <option value="Todos">Todas as Ocorrências</option>
              <option value="entrada">Entradas de Material (+)</option>
              <option value="saida">Saídas / Distribuições (-)</option>
              <option value="alerta">Alertas do Sistema</option>
              <option value="seguranca">Crítico / Segurança</option>
            </select>
          </div>
        </div>

        {/* TABELA DE REGISTROS DE AUDITORIA */}
        <div className="bg-slate-950/20 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-0">
          <div className="overflow-y-auto min-h-0 container-sombrio max-h-[380px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80 sticky top-0 backdrop-blur-md border-b border-slate-800 z-10">
                <tr>
                  <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider w-[100px]">ID Log</th>
                  <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider w-[140px]">Data / Hora</th>
                  <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider w-[150px]">Operador (P4)</th>
                  <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider w-[160px]">Ação Executada</th>
                  <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Descrição dos Detalhes</th>
                  <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider text-center w-[110px]">Origem IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {logsFiltrados.length > 0 ? (
                  logsFiltrados.map((log) => {
                    const style = getLogStyle(log.tipo);
                    return (
                      <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                        {/* ID */}
                        <td className="p-3 font-mono text-[11px] text-slate-500 font-bold">{log.id}</td>
                        
                        {/* DATA */}
                        <td className="p-3 text-xs text-slate-300 font-medium whitespace-nowrap">{log.data}</td>
                        
                        {/* OPERADOR */}
                        <td className="p-3 text-xs text-white font-bold tracking-wide">
                          <div className="flex items-center gap-1.5">
                            <UserCheck size={12} className="text-slate-500" />
                            {log.usuario}
                          </div>
                        </td>
                        
                        {/* AÇÃO COM BADGE */}
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 w-fit ${style.bg}`}>
                            {style.icon}
                            {log.acao}
                          </span>
                        </td>
                        
                        {/* DETALHES */}
                        <td className="p-3 text-xs text-slate-400 font-medium leading-relaxed">{log.detalhe}</td>
                        
                        {/* IP */}
                        <td className="p-3 text-center font-mono text-[10px] text-slate-500 tracking-tight whitespace-nowrap">{log.ip}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-xs text-slate-500 font-medium">
                      Nenhum registro de auditoria condizente com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* RODAPÉ DO HISTÓRICO COM BANNER DE INTEGRIDADE */}
      <div className="mt-4 shrink-0 flex flex-col sm:flex-row gap-3 justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
          <RefreshCw size={12} className="text-blue-500 animate-spin-slow" />
          <span>Monitorando alterações em tempo real via logs criptografados</span>
        </div>
        <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Assinatura de Integridade SHA-256 Ativa
        </div>
      </div>

    </div>
  );
}