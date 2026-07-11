"use client";

import React, { useState } from "react"; 
import { 
  ShieldAlert, 
  UserPlus, 
  FileSpreadsheet, 
  UserCheck, 
  Clock, 
  AlertCircle,
  Loader2,
  ArrowRightLeft,
  LayoutDashboard
} from "lucide-react";

// MOCK DE DADOS - Lote principal de 100.000 munições da P4 do 17º BPM
const DADOS_MOCK_LOTES = [
  { id: "1", lote: "LOTE-9MM-100K-2026", calibre: "9x19mm Parabellum", tipo: "Operacional Padronizado", almoxarifado: 100000 }
];

const DADOS_MOCK_CAUTELAS = [
  {
    id: "C-1",
    militar: "Sgt PM Marcondes (RG 12.345)",
    subunidade: "1ª CIA",
    lote: "LOTE-9MM-100K-2026",
    quantidadeCautelada: 50,
    dataRetirada: "10/05/2026",
    status: "CARGA_FIXA"
  },
  {
    id: "C-2",
    militar: "Cb PM Elaine (RG 67.890)",
    subunidade: "FORÇA TÁTICA",
    lote: "LOTE-9MM-100K-2026",
    quantidadeCautelada: 50,
    dataRetirada: "14/05/2026",
    status: "CARGA_FIXA"
  }
];

export default function CautelaMilitarPage() {
  const [lotes, setLotes] = useState(DADOS_MOCK_LOTES);
  const [cautelas, setCautelas] = useState(DADOS_MOCK_CAUTELAS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Controle do Passo Atual (Step 1: Visualização/Painel, Step 2: Cadastro de Nova Carga)
  const [step, setStep] = useState(1);

  // Estados do Formulário (Passo 2)
  const [loteId, setLoteId] = useState("1"); 
  const [militarNome, setMilitarNome] = useState("");
  const [militarRg, setMilitarRg] = useState("");
  const [subunidade, setSubunidade] = useState("1ª CIA");
  const [quantidade, setQuantidade] = useState("50"); 

  // Derivações de Estado Limpas e Determinísticas
  const loteSelecionado = lotes.find(item => String(item.id) === loteId) || null;
  const totalMuniçãoNaRua = cautelas.reduce((acc, curr) => acc + curr.quantidadeCautelada, 0);
  const totalPoliciaisComCarga = cautelas.length;
  const totalNoAlmoxarifado = loteSelecionado ? loteSelecionado.almoxarifado : 0;

  // Registrar nova entrega de carga permanente
  const handleAbrirCautela = async (e) => {
    e.preventDefault();
    const qtdNum = parseInt(quantidade);

    if (!militarNome || !militarRg || !qtdNum || qtdNum <= 0) {
      alert("Aviso P4: Preencha a identificação completa do Policial.");
      return;
    }

    if (qtdNum > totalNoAlmoxarifado) {
      alert("Saldo insuficiente no Almoxarifado Central.");
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      const novoIdSequencial = `C-${cautelas.length + 1}`;

      const novaCautela = {
        id: novoIdSequencial,
        militar: `${militarNome} (RG ${militarRg})`,
        subunidade,
        lote: loteSelecionado.lote,
        quantidadeCautelada: qtdNum,
        dataRetirada: "11/07/2026",
        status: "CARGA_FIXA"
      };

      setLotes(lotes.map(l => l.id === loteId ? { ...l, almoxarifado: l.almoxarifado - qtdNum } : l));
      setCautelas([novaCautela, ...cautelas]);

      setMilitarNome("");
      setMilitarRg("");
      
      // Retorna automaticamente para o painel principal após cadastrar com sucesso
      setStep(1);
    } catch (err) {
      alert("Erro ao processar cautela.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualizar a carga do PM após um confronto/disparo lançado no Boletim
  const handleRegistrarDisparoEmServico = (id, qtdAtual, militarInfo) => {
    const disparadas = prompt(`Militar: ${militarInfo}\n\nQuantas munições foram disparadas em serviço conforme o Boletim?`);
    const qtdDisparadas = parseInt(disparadas);

    if (isNaN(qtdDisparadas) || qtdDisparadas <= 0 || qtdDisparadas > qtdAtual) {
      alert("Quantidade inválida ou superior à carga que o PM possui.");
      return;
    }

    const novaCargaRestante = qtdAtual - qtdDisparadas;

    // CORREÇÃO: Ajustado de "quantityCautelada" para "quantidadeCautelada" para bater com o objeto
    setCautelas(cautelas.map(c => c.id === id ? { ...c, quantidadeCautelada: novaCargaRestante } : c));

    alert(`Ficha Atualizada!\n\nA carga cautelada do militar foi reduzida para ${novaCargaRestante} un.\n\n⚠️ Lembre-se: Vá até a tela 'DAR BAIXA EM LOTE' para abater essas ${qtdDisparadas} munições deflagradas do estoque geral do Batalhão usando o nº do Boletim!`);
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between overflow-hidden antialiased">
      
      <div className="flex flex-col min-h-0 space-y-5">
        
        {/* CABEÇALHO & SELETOR DE PASSOS (STEPS) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 shrink-0">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <ShieldAlert className="text-blue-500" size={20} /> Cautelas Permanentes / Ficha de Carga
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Controle de munições operacionais de posse definitiva do efetivo (50 unidades por homem).
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
              Painel Geral
            </button>
            <button
              onClick={() => setStep(2)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                step === 2 
                  ? "bg-blue-950 text-blue-400 border border-blue-900/50" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserPlus size={14} />
              Nova Cautela
            </button>
          </div>
        </div>

        {/* CONTEÚDO DINÂMICO BASEADO NO STEP SELECIONADO */}
        {step === 1 ? (
          <div className="flex flex-col min-h-0 space-y-5 animate-fadeIn">
            
            {/* CARDS LOGÍSTICOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-blue-950 text-blue-400 rounded-lg"><Clock size={18} /></div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Policiais com Carga</span>
                  <span className="text-white font-mono text-lg font-black">{totalPoliciaisComCarga} Homens</span>
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-amber-950 text-amber-400 rounded-lg"><ArrowRightLeft size={18} /></div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Munição na Rua</span>
                  <span className="text-amber-400 font-mono text-lg font-black">{totalMuniçãoNaRua} un</span>
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-lg"><FileSpreadsheet size={18} /></div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Reserva no Paiol</span>
                  <span className="text-emerald-400 font-mono text-lg font-black">{totalNoAlmoxarifado.toLocaleString("pt-BR")} un</span>
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-purple-950 text-purple-400 rounded-lg"><UserCheck size={18} /></div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Capacidade Disp.</span>
                  <span className="text-purple-400 font-mono text-lg font-black">
                    +{Math.floor(totalNoAlmoxarifado / 50).toLocaleString("pt-BR")} PMs
                  </span>
                </div>
              </div>
            </div>

            {/* TABELA - LIVRO DE REGISTRO */}
            <div className="flex flex-col min-h-0 space-y-3">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <UserCheck size={14} className="text-emerald-500" /> Livro de Registro: Cargas Ativas do Efetivo
              </h2>

              <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-0">
                <div className="overflow-y-auto container-sombrio text-xs max-h-[340px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-950 z-10 shadow-sm">
                      <tr className="border-b border-slate-800 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3">Policial Detentor</th>
                        <th className="p-3">Lote Origem</th>
                        <th className="p-3 text-center">Carga Atual</th>
                        <th className="p-3">Data Cautela</th>
                        <th className="p-3 text-right">Ocorrência</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {cautelas.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-950/20 transition-colors">
                          <td className="p-3">
                            <div className="text-white font-bold">{c.militar}</div>
                            <div className="text-[9px] text-slate-500 uppercase">{c.subunidade}</div>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-blue-400">{c.lote}</td>
                          <td className="p-3 text-center font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded ${c.quantidadeCautelada < 50 ? "bg-amber-950 text-amber-400 border border-amber-800" : "text-slate-300"}`}>
                              {c.quantidadeCautelada} un
                            </span>
                          </td>
                          <td className="p-3 text-[10px] text-slate-400 font-mono">{c.dataRetirada}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleRegistrarDisparoEmServico(c.id, c.quantidadeCautelada, c.militar)}
                              className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-rose-400 hover:text-rose-300 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer"
                            >
                              Registrar Disparo
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* FORMULÁRIO DE ENTREGA (STEP 2) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-h-0 animate-fadeIn">
            <form onSubmit={handleAbrirCautela} className="lg:col-span-1 bg-slate-950/30 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
              <h2 className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <UserPlus size={14} className="text-blue-500" /> Detalhes da Nova Carga Fixa
              </h2>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase text-[9px]">Lote Logístico P4:</label>
                <select value={loteId} onChange={(e) => setLoteId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500">
                  {lotes.map(l => <option key={l.id} value={l.id}>[{l.lote}] 9mm</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase text-[9px]">Posto/Grad + Nome:</label>
                  <input type="text" required placeholder="Ex: Cb PM Silva" value={militarNome} onChange={(e) => setMilitarNome(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase text-[9px]">RG Funcional:</label>
                  <input type="text" required placeholder="Ex: 190.112" value={militarRg} onChange={(e) => setMilitarRg(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase text-[9px]">Companhia:</label>
                  <select value={subunidade} onChange={(e) => setSubunidade(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-white text-xs focus:outline-none focus:border-blue-500">
                    <option value="1ª CIA">1ª CIA</option>
                    <option value="2ª CIA">2ª CIA</option>
                    <option value="FORÇA TÁTICA">FT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase text-[9px]">Qtd Regulamentar:</label>
                  <input type="number" disabled value={quantidade} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold opacity-80 text-center" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-blue-200 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer">
                {isSubmitting ? <Loader2 className="animate-spin" size={12} /> : "Assinar Carga Fixa (50 un)"}
              </button>
            </form>

            {/* INFORMAÇÕES AUXILIARES DO STEP 2 */}
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex gap-3 items-start">
                <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Diretriz P4 Logística</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A inclusão de uma nova cautela deduzirá automaticamente o quantitativo do estoque da reserva do Batalhão. Certifique-se de recolher a assinatura física correspondente na ficha de carga física do militar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RODAPÉ E ALERTA FIXO DE DOUTRINA */}
      <div className="mt-4 flex flex-col space-y-3 shrink-0">
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-2.5 flex gap-2.5 items-center">
          <AlertCircle size={14} className="text-amber-500 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-none">
            <strong className="text-slate-200">Doutrina P4:</strong> Ao registrar disparos, a quantidade é alterada no controle interno do PM. Reabasteça os cartuchos fisicamente após publicação de Boletim.
          </p>
        </div>

        <div className="p-2.5 bg-slate-950/40 border border-slate-800 text-[10px] text-slate-500 font-bold tracking-wide flex justify-between items-center rounded-xl">
          <span><FileSpreadsheet size={12} className="text-slate-600 inline mr-1" /> Ficha de Carga Definitiva Individual do Efetivo — 17º BPM</span>
          <span className="font-mono text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">CARGA_FIXA_SYS</span>
        </div>
      </div>

    </div>
  );
}