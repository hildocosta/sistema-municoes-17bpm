"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Shield, 
  Calendar, 
  Database,
  FileText,
  AlertOctagon,
  MinusCircle,
  Clock,
  User,
  Plus,
  Layers,
  Loader2,
  Tag,
  Package
} from "lucide-react";
import Link from "next/link";

export default function DetalheMunicaoPage() {
  const params = useParams();
  const router = useRouter();

  // Conversão do ID recebido na rota
  const idChave = params?.id ? String(params.id) : "";

  // Estados dos Dados
  const [loteData, setLoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controle da Aba Ativa
  const [activeTab, setActiveTab] = useState("ficha");

  // Formulário de Baixa
  const [origemBaixa, setOrigemBaixa] = useState("Almoxarifado");
  const [qtdBaixa, setQtdBaixa] = useState("");
  const [motivoBaixa, setMotivoBaixa] = useState("");
  const [operador, setOperador] = useState("");

  // 1. CARREGAMENTO INICIAL
  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      if (!idChave) return;

      try {
        const response = await fetch(`/api/municoes/${idChave}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Lote não encontrado no acervo do Paiol.");
          }
          throw new Error("Falha ao carregar os dados do servidor.");
        }

        const data = await response.json();

        if (active) {
          setLoteData(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error("Erro ao buscar detalhes da munição:", err);
          setError(err.message || "Erro de conexão com a API.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, [idChave]);

  // 2. FUNÇÃO REUTILIZÁVEL DE RECARREGAMENTO
  const reloadLoteData = useCallback(async () => {
    if (!idChave) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/municoes/${idChave}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Lote não encontrado no acervo do Paiol.");
        }
        throw new Error("Falha ao carregar os dados do servidor.");
      }

      const data = await response.json();
      setLoteData(data);
      setError(null);
    } catch (err) {
      console.error("Erro ao recarregar dados:", err);
      setError(err.message || "Erro de conexão com a API.");
    } finally {
      setLoading(false);
    }
  }, [idChave]);

  // 3. EXECUTAR BAIXA NA API
  const handleExecutarBaixa = async (e) => {
    e.preventDefault();
    const quantidade = parseInt(qtdBaixa, 10);

    if (!quantidade || quantidade <= 0 || !motivoBaixa.trim() || !operador.trim()) {
      alert("Por favor, preencha todos os campos regulamentares de controle militar.");
      return;
    }

    if (origemBaixa === "Almoxarifado" && quantidade > (loteData?.almoxarifado || 0)) {
      alert("Erro: Quantidade superior ao saldo disponível no Almoxarifado Central!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/municoes/${idChave}/baixa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origem: origemBaixa,
          quantidade,
          operador,
          motivo: motivoBaixa,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Erro ao registrar a baixa no sistema.");
      }

      alert("Baixa registrada com sucesso!");

      setQtdBaixa("");
      setMotivoBaixa("");
      setOperador("");

      await reloadLoteData();
      setActiveTab("ficha");
    } catch (err) {
      console.error("Erro ao enviar baixa:", err);
      alert(`Falha na operação: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Estoque Seguro":
      case "Ativo":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Atenção":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Crítico":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full bg-slate-950 items-center justify-center flex-col gap-4 min-h-[400px]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Sincronizando com a base de dados do Paiol...
        </span>
      </div>
    );
  }

  if (error || !loteData) {
    return (
      <div className="flex h-full w-full bg-slate-950 items-center justify-center flex-col gap-4 min-h-[400px] p-6 text-center">
        <AlertOctagon className="text-rose-500" size={36} />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
          {error || "Lote não localizado no acervo."}
        </span>
        <button
          onClick={() => router.push("/dashboard/municoes")}
          className="text-xs bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
        >
          Voltar ao Painel
        </button>
      </div>
    );
  }

  return (
    <main className="flex-1 h-full bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col overflow-hidden">
      {/* Cabeçalho */}
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/municoes">
            <button className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer">
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight font-mono">
                {loteData.lote}
              </h1>
              <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColor(loteData.status)}`}>
                {loteData.status || "Ativo"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calibre: <span className="text-slate-200 font-bold">{loteData.calibre}</span> | Tipo: <span className="text-slate-200 font-bold">{loteData.tipo}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4 shrink-0">
        <button 
          onClick={() => setActiveTab("ficha")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
            activeTab === "ficha" 
              ? "bg-slate-950 text-white border-slate-700" 
              : "bg-slate-900/40 text-slate-500 border-transparent hover:text-slate-300"
          }`}
        >
          <Layers size={13} /> Ficha Tática de Carga
        </button>
        
        <button 
          onClick={() => setActiveTab("baixa")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
            activeTab === "baixa" 
              ? "bg-rose-950/40 text-rose-400 border-rose-900" 
              : "bg-slate-900/40 text-slate-500 border-transparent hover:text-slate-300"
          }`}
        >
          <MinusCircle size={13} /> Registrar Baixa / Utilização
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-start">
        {activeTab === "ficha" && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-hidden">
            
            {/* Coluna 1: Especificações Técnicas e Cadastro */}
            <div className="md:col-span-1 space-y-4 overflow-y-auto pr-1 container-sombrio">
              <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <Tag size={12} className="text-blue-500" /> Especificações do Fabricante
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Marca:</span><span className="text-slate-200 font-bold">{loteData.marca || "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Modelo:</span><span className="text-slate-200 font-bold">{loteData.modelo || "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tipo de Cartucho:</span><span className="text-slate-300 font-mono">{loteData.tipo || "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Calibre:</span><span className="text-slate-300 font-mono">{loteData.calibre || "N/A"}</span></div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <Calendar size={12} className="text-blue-500" /> Registro no Sistema
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cadastrado em:</span>
                    <span className="text-slate-300 font-mono">
                      {loteData.criadoEm ? new Date(loteData.criadoEm).toLocaleDateString("pt-BR") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: Balanço Volumétrico e Distribuição */}
            <div className="md:col-span-2 border border-slate-800 rounded-xl bg-slate-950/10 flex flex-col min-h-0 overflow-hidden">
              <div className="p-3 bg-slate-900/60 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wide">
                Balanço Volumétrico de Estoque
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 container-sombrio">
                
                {/* Cartão de Estoque no Almoxarifado */}
                <div className="p-4 bg-slate-950/60 border border-blue-900/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/10">
                      <Database size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Reserva Central (Almoxarifado)</p>
                      <p className="text-[10px] text-slate-500">Volume mantido sob custódia direta do Paiol Central.</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-black text-blue-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    {(loteData.almoxarifado || 0).toLocaleString("pt-BR")} UN
                  </span>
                </div>

                {/* Cartão de Estoque Distribuído */}
                <div className="p-4 bg-slate-950/60 border border-indigo-900/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/10">
                      <Shield size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Carga Distribuída</p>
                      <p className="text-[10px] text-slate-500">Volume em cautela externa com subunidades operacionais.</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-indigo-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    {(loteData.distribuido || 0).toLocaleString("pt-BR")} UN
                  </span>
                </div>

                {/* Cartão do Total do Lote */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-800 text-slate-300 rounded-lg">
                      <Package size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Estoque Total Registrado</p>
                      <p className="text-[10px] text-slate-400">Soma de todo o quantitativo sob responsabilidade do lote.</p>
                    </div>
                  </div>
                  <span className="font-mono text-base font-black text-white bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700">
                    {(loteData.estoqueTotal || 0).toLocaleString("pt-BR")} UN
                  </span>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === "baixa" && (
          <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col justify-start">
            <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <MinusCircle size={14} /> REGISTRO DE BAIXA DE CARTUCHOS
            </h2>
            
            <form onSubmit={handleExecutarBaixa} className="space-y-3 text-xs w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Origem do Desfalque:</label>
                  <select 
                    value={origemBaixa} 
                    onChange={(e) => setOrigemBaixa(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 cursor-pointer transition-all"
                  >
                    <option value="Almoxarifado">Almoxarifado (Reserva Central)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Volume para Baixa (Unidades):</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 500"
                    value={qtdBaixa}
                    onChange={(e) => setQtdBaixa(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Militar Responsável pela Movimentação:</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Ex: Ten PM J. Ribeiro"
                    value={operador}
                    onChange={(e) => setOperador(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Justificativa Oficial / Destino do Consumo:</label>
                <textarea 
                  rows={3}
                  placeholder="Especifique a destinação balística. Ex: Consumo em treinamento tático..."
                  value={motivoBaixa}
                  onChange={(e) => setMotivoBaixa(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 resize-none leading-relaxed transition-all"
                />
              </div>

              <div className="pt-1">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-rose-950/50 hover:bg-rose-900 border border-rose-800/80 hover:border-rose-700 text-rose-200 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Plus size={14} />
                  )}
                  {isSubmitting ? "Gravando no Banco de Dados..." : "Homologar Registro de Baixa"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="mt-4 shrink-0 p-2.5 bg-slate-950/40 border border-slate-800 text-[10px] text-slate-500 font-bold tracking-wide flex justify-between items-center rounded-xl">
        <span className="flex items-center gap-1.5">
          <FileText size={12} className="text-slate-600" /> Sistema Integrado de Material de Belonave
        </span>
        <span className="font-mono text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
          ID_SYS_LOTE_{idChave}
        </span>
      </div>
    </main>
  );
}