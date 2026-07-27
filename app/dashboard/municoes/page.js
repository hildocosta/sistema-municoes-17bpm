"use client";

import React, { useState, useEffect } from "react";
import { 
  Box, 
  Search, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  SlidersHorizontal,
  ExternalLink,
  Loader2,
  LayoutDashboard,
  PlusCircle,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function ControleMunicoesPage() {
  const [lotes, setLotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [step, setStep] = useState(1);

  // Formulário alinhado às necessidades do Paiol
  const [novoLote, setNovoLote] = useState({
    tipo: "LETAL",
    lote: "",
    marca: "CBC",
    modelo: "COMUM M193 - 55GR",
    calibre: "5.56x45mm",
    almoxarifado: "",
    distribuido: ""
  });

  // 1. CARREGAR LOTES DO BANCO NEON VIA API
  // Função auxiliar para recarregar após ações do usuário (ex: submit)
  const recarregarLotes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/municoes");
      if (res.ok) {
        const data = await res.json();
        setLotes(data);
      }
    } catch (error) {
      console.error("Erro ao recarregar lotes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito limpo sem setState síncrono no topo da função
  useEffect(() => {
    let active = true;

    async function buscarDadosIniciais() {
      try {
        const res = await fetch("/api/municoes");
        if (res.ok && active) {
          const data = await res.json();
          setLotes(data);
        }
      } catch (error) {
        console.error("Erro de conexão ao carregar lotes:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    buscarDadosIniciais();

    return () => {
      active = false;
    };
  }, []);

  // Filtro para considerar modelo, lote, calibre e tipo (LETAL/FESTIM)
  const lotesFiltrados = lotes.filter(item => {
    const calibreTexto = item?.calibre?.toLowerCase() || "";
    const loteTexto = item?.lote?.toLowerCase() || "";
    const modeloTexto = item?.modelo?.toLowerCase() || "";
    const marcaTexto = item?.marca?.toLowerCase() || "";
    const tipoTexto = item?.tipo?.toLowerCase() || "";
    const buscaTexto = busca.toLowerCase();

    const correspondeBusca = 
      calibreTexto.includes(buscaTexto) ||
      loteTexto.includes(buscaTexto) ||
      modeloTexto.includes(buscaTexto) ||
      marcaTexto.includes(buscaTexto) ||
      tipoTexto.includes(buscaTexto);
    
    const correspondeStatus = filtroStatus === "Todos" || item?.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  // Totais operacionais
  const totalCartuchos = lotes.reduce((acc, curr) => acc + (Number(curr?.estoqueTotal) || 0), 0);
  const totalAlmoxarifado = lotes.reduce((acc, curr) => acc + (Number(curr?.almoxarifado) || 0), 0);
  const totalDistribuido = lotes.reduce((acc, curr) => acc + (Number(curr?.distribuido) || 0), 0);
  const lotesCriticos = lotes.filter(l => l?.status === "Crítico" || l?.status === "Atenção").length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "Estoque Seguro": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Atenção": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Crítico": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  // 2. ENVIAR DADOS DO FORMULÁRIO PARA GRAVAR NO BANCO NEON
  const handleCadastrarLote = async (e) => {
    e.preventDefault();
    
    if (!novoLote.lote || (!novoLote.almoxarifado && !novoLote.distribuido)) {
      alert("Atenção: Informe o Número do Lote e a Quantidade recebida (Almoxarifado ou Distribuída).");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/municoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoLote),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Erro ao cadastrar: ${data.error || "Falha na requisição"}`);
        return;
      }

      alert("Lote de munição registrado com sucesso no banco de dados!");
      
      // Limpar formulário e atualizar listagem
      setNovoLote({
        tipo: "LETAL",
        lote: "",
        marca: "CBC",
        modelo: "COMUM M193 - 55GR",
        calibre: "5.56x45mm",
        almoxarifado: "",
        distribuido: ""
      });

      await recarregarLotes();
      setStep(1);

    } catch (error) {
      console.error("Erro ao gravar no banco:", error);
      alert("Erro do Sistema: Falha ao registrar lote no Paiol.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between overflow-hidden antialiased">
      
      <div className="flex flex-col min-h-0 space-y-5">
        
        {/* CABEÇALHO & ABAS DE NAVEGAÇÃO */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Box className="text-blue-500" size={22} />
              Controle Metódico de Munições (Lotes Ativos)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Balanço quantitativo de cartuchos por calibre, tipo (Letal/Festim), lote e destinação.
            </p>
          </div>

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
              Lotes Ativos
            </button>
            <button
              onClick={() => setStep(2)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                step === 2 
                  ? "bg-blue-950 text-blue-400 border border-blue-900/50" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <PlusCircle size={14} />
              Cadastrar Lote
            </button>
          </div>
        </div>

        {/* CONTEÚDO DINÂMICO DOS PASSOS */}
        {step === 1 ? (
          <div className="flex flex-col min-h-0 space-y-4 animate-fadeIn">
            
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Carga Total Prontidão</p>
                  <p className="text-xl font-black text-white mt-0.5">
                    {totalCartuchos.toLocaleString("pt-BR")} <span className="text-[10px] font-medium text-slate-500">un</span>
                  </p>
                </div>
                <div className="p-2 bg-slate-800 text-slate-400 rounded-lg border border-slate-700">
                  <Layers size={16} />
                </div>
              </div>

              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Reserva Central (Almox.)</p>
                  <p className="text-xl font-black text-blue-400 mt-0.5">
                    {totalAlmoxarifado.toLocaleString("pt-BR")} <span className="text-[10px] font-medium text-slate-500">un</span>
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
                  <CheckCircle2 size={16} />
                </div>
              </div>

              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Carga Externa (Cias)</p>
                  <p className="text-xl font-black text-indigo-400 mt-0.5">
                    {totalDistribuido.toLocaleString("pt-BR")} <span className="text-[10px] font-medium text-slate-500">un</span>
                  </p>
                </div>
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/10">
                  <TrendingUp size={16} />
                </div>
              </div>

              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Alertas de Reposição</p>
                  <p className="text-xl font-black text-amber-400 mt-0.5">
                    {lotesCriticos} <span className="text-[10px] font-medium text-slate-500">lotes</span>
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/10">
                  <AlertTriangle size={16} />
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="shrink-0 flex flex-col sm:flex-row gap-3 items-center justify-between p-3 bg-slate-950/30 border border-slate-800/60 rounded-xl">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Buscar por Calibre, Lote, Modelo ou Tipo..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <SlidersHorizontal size={14} className="text-slate-500" />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  <option value="Todos">Todos os Níveis</option>
                  <option value="Estoque Seguro">Estoque Seguro</option>
                  <option value="Atenção">Atenção</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>
            </div>

            {/* Listagem em Tabela */}
            <div className="bg-slate-950/20 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-0">
              <div className="overflow-y-auto min-h-0 container-sombrio max-h-[320px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900/80 sticky top-0 backdrop-blur-md border-b border-slate-800 z-10">
                    <tr>
                      <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Tipo</th>
                      <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Calibre</th>
                      <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Lote</th>
                      <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Marca / Modelo</th>
                      <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider text-right">Almox.</th>
                      <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider text-right">Cias (Ext)</th>
                      <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider text-right">Total</th>
                      <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider text-center">Nível</th>
                      <th className="p-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider text-center">Ficha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {isLoading ? (
                      <tr>
                        <td colSpan="9" className="text-center py-12 text-xs text-slate-400">
                          <Loader2 className="animate-spin inline-block mr-2" size={16} />
                          Carregando lotes do banco de dados...
                        </td>
                      </tr>
                    ) : lotesFiltrados.length > 0 ? (
                      lotesFiltrados.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              item.tipo === "LETAL" 
                                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {item.tipo}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-xs text-white">{item.calibre}</td>
                          <td className="p-3 font-mono text-xs text-slate-300 font-bold">{item.lote}</td>
                          <td className="p-3 text-xs text-slate-400 font-medium">
                            <span className="text-slate-300 font-bold">{item.marca}</span> - {item.modelo}
                          </td>
                          <td className="p-3 font-mono text-xs text-slate-400 text-right">{(item.almoxarifado || 0).toLocaleString("pt-BR")}</td>
                          <td className="p-3 font-mono text-xs text-indigo-400 text-right">{(item.distribuido || 0).toLocaleString("pt-BR")}</td>
                          <td className="p-3 font-mono text-xs text-white font-bold text-right">{(item.estoqueTotal || 0).toLocaleString("pt-BR")}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border inline-block min-w-[105px] text-center ${getStatusStyle(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Link href={`/dashboard/municoes/${item.id}`}>
                              <button 
                                title="Ver Detalhes do Lote"
                                className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                              >
                                <ExternalLink size={12} />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-12 text-xs text-slate-500 font-medium">
                          Nenhum lote ou calibre localizado para os filtros inseridos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* PASSO 2: FORMULÁRIO DE CADASTRO */
          <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-5 text-xs animate-fadeIn">
            <h2 className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2.5 mb-4">
              <PlusCircle size={14} className="text-blue-500" /> Cadastrar Entrada de Lote (Paiol)
            </h2>

            <form onSubmit={handleCadastrarLote} className="space-y-4">
              
              {/* LINHA 1: TIPO, CALIBRE E MARCA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Tipo de Munição:</label>
                  <select
                    value={novoLote.tipo}
                    onChange={(e) => setNovoLote({...novoLote, tipo: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="LETAL">LETAL</option>
                    <option value="FESTIM">FESTIM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Calibre:</label>
                  <select
                    value={novoLote.calibre}
                    onChange={(e) => setNovoLote({...novoLote, calibre: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="5.56x45mm">5.56x45mm</option>
                    <option value="9x19mm">9x19mm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Marca / Fabricante:</label>
                  <input
                    type="text"
                    value={novoLote.marca}
                    onChange={(e) => setNovoLote({...novoLote, marca: e.target.value})}
                    placeholder="Ex: CBC"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* LINHA 2: MODELO E NÚMERO DO LOTE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Modelo / Especificação:</label>
                  <select
                    value={novoLote.modelo}
                    onChange={(e) => setNovoLote({...novoLote, modelo: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="COMUM M193 - 55GR">COMUM M193 - 55GR</option>
                    <option value="EOOG - 124GR - TREINA">EOOG - 124GR - TREINA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[9px]">Número do Lote (Rastreio Recebido):</label>
                  <input
                    type="text"
                    placeholder="Ex: LOTE-9MM-2026B"
                    value={novoLote.lote}
                    onChange={(e) => setNovoLote({...novoLote, lote: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold tracking-wide focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* LINHA 3: QUANTIDADES DE ENTRADA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 pt-3">
                <div>
                  <label className="block text-blue-400 font-bold mb-1 uppercase text-[9px]">Quantidade no Almoxarifado (Reserva):</label>
                  <input
                    type="number"
                    placeholder="Ex: 5000"
                    value={novoLote.almoxarifado}
                    onChange={(e) => setNovoLote({...novoLote, almoxarifado: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-indigo-400 font-bold mb-1 uppercase text-[9px]">Quantidade Distribuída (Cias):</label>
                  <input
                    type="number"
                    placeholder="Ex: 1200"
                    value={novoLote.distribuido}
                    onChange={(e) => setNovoLote({...novoLote, distribuido: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-indigo-400 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-blue-200 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={12} />
                    <span>Salvando Lote no Banco...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={12} />
                    <span>Homologar e Inserir Lote</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* RODAPÉ FIXO */}
      <div className="mt-4 shrink-0 p-3 bg-slate-900/60 border border-slate-800 text-[10px] text-slate-500 font-semibold tracking-wide flex justify-between items-center rounded-xl">
        <span>Listando {lotesFiltrados.length} lotes cadastrados</span>
        <span className="text-slate-400 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          Controle Logístico Paiol P4
        </span>
      </div>

    </div>
  );
}