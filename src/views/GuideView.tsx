import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Printer,
  Download,
  Smartphone,
  Store,
  UtensilsCrossed,
  QrCode,
  Package,
  Boxes,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Search,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Building2,
  DollarSign,
  Clock,
  Sparkles,
  Zap,
  HelpCircle,
  Copy,
  CheckSquare,
  Square,
  ArrowRight,
  Layers,
  BarChart3,
  Wifi,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';

interface GuideChapter {
  id: string;
  number: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  summary: string;
  targetPage?: string;
  targetPageLabel?: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

export const GuideView: React.FC = () => {
  const { activeCompany, setActivePage, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChapterId, setActiveChapterId] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [printFilter, setPrintFilter] = useState<string>('all');

  // Interactive Onboarding Checklist
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    step1_pix: true,
    step2_terminal: false,
    step3_products: true,
    step4_qr_tables: false,
    step5_test_sale: false,
    step6_wholesale: false
  });

  const toggleChecklistItem = (key: string) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const checklistCompletedCount = Object.values(checklist).filter(Boolean).length;
  const checklistTotalCount = Object.keys(checklist).length;
  const checklistPercentage = Math.round((checklistCompletedCount / checklistTotalCount) * 100);

  const chapters: GuideChapter[] = [
    {
      id: 'maquininhas',
      number: '01',
      title: 'Conectar e Operar Maquininhas (Smart POS Ton / Stone)',
      badge: 'Hardware & PIX',
      icon: <Smartphone className="w-5 h-5 text-emerald-400" />,
      summary: 'Como parear maquininhas Smart Android, sincronização instantânea em tempo real (<10ms), leitor de código de barras e QR Code PIX único por perfil.',
      targetPage: 'terminal_pos',
      targetPageLabel: 'Abrir Modo Maquininha',
      accentColor: 'text-emerald-700',
      accentBg: 'bg-emerald-50',
      accentBorder: 'border-emerald-500'
    },
    {
      id: 'vendas',
      number: '02',
      title: 'Fazer Vendas no Balcão (PDV Caixa Rápido)',
      badge: 'Frente de Caixa',
      icon: <Store className="w-5 h-5 text-amber-400" />,
      summary: 'Operação de venda rápida sem mesa, atalhos de teclado (F1, F2, ENTER, ESC), calculadora de troco automática e divisão de formas de pagamento.',
      targetPage: 'pos',
      targetPageLabel: 'Abrir PDV Vendas',
      accentColor: 'text-amber-700',
      accentBg: 'bg-amber-50',
      accentBorder: 'border-amber-500'
    },
    {
      id: 'mesas',
      number: '03',
      title: 'Gestão de Mesas, Deck e Comandas',
      badge: 'Atendimento',
      icon: <UtensilsCrossed className="w-5 h-5 text-blue-400" />,
      summary: 'Mapa visual com status de cores (Livre, Ocupada, Pediu Conta, Fechando), lançamento de pedidos, edição de capacidade e fechamento com taxa de serviço e PIX.',
      targetPage: 'tables',
      targetPageLabel: 'Abrir Gestão de Mesas',
      accentColor: 'text-blue-700',
      accentBg: 'bg-blue-50',
      accentBorder: 'border-blue-500'
    },
    {
      id: 'cardapio',
      number: '04',
      title: 'Cardápio Digital QR Code (Autoatendimento)',
      badge: 'Autoatendimento',
      icon: <QrCode className="w-5 h-5 text-purple-400" />,
      summary: 'Geração e impressão de plaquinhas acrílicas em lote para mesas e balcão, pedidos direto do celular do cliente sem instalar app e aviso sonoro no bar.',
      targetPage: 'menu',
      targetPageLabel: 'Ver Cardápio Digital',
      accentColor: 'text-purple-700',
      accentBg: 'bg-purple-50',
      accentBorder: 'border-purple-500'
    },
    {
      id: 'produtos',
      number: '05',
      title: 'Produtos, Categorias & Margem de Lucro',
      badge: 'Catálogo',
      icon: <Package className="w-5 h-5 text-teal-400" />,
      summary: 'Organização de bebidas por categorias, precificação (Custo x Venda x Margem %), código EAN de barras, código rápido de 2 dígitos e estoque mínimo.',
      targetPage: 'products',
      targetPageLabel: 'Gerenciar Produtos',
      accentColor: 'text-teal-700',
      accentBg: 'bg-teal-50',
      accentBorder: 'border-teal-500'
    },
    {
      id: 'estoque_atacado',
      number: '06',
      title: 'Estoque do Galpão & Módulo Atacado (B2B)',
      badge: 'Operação B2B',
      icon: <Boxes className="w-5 h-5 text-rose-400" />,
      summary: 'Controle de caixas, fardos e unidades no depósito, entradas/saídas com responsável e módulo Atacado B2B com faturamento PJ, tabela por fardo e prazos.',
      targetPage: 'stock',
      targetPageLabel: 'Acessar Estoque & Galpão',
      accentColor: 'text-rose-700',
      accentBg: 'bg-rose-50',
      accentBorder: 'border-rose-500'
    },
    {
      id: 'extrato',
      number: '07',
      title: 'Extrato dos Meses Passados & Financeiro',
      badge: 'Financeiro',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      summary: 'Histórico retroativo mês a mês, CMV (Custo de Mercadorias), Lucro Líquido Real, comparativo de crescimento e exportação em CSV/Excel para contabilidade.',
      targetPage: 'statement',
      targetPageLabel: 'Abrir Extrato Consolidado',
      accentColor: 'text-amber-800',
      accentBg: 'bg-amber-50',
      accentBorder: 'border-amber-600'
    },
    {
      id: 'cola_caixa',
      number: '08',
      title: 'Guia de Bolso: Cola Rápida para o Caixa',
      badge: 'Cola Rápida',
      icon: <Zap className="w-5 h-5 text-indigo-400" />,
      summary: 'Folha prática para imprimir e colar na parede do caixa com os atalhos essenciais, passos de abertura/fechamento e segurança do PIX.',
      accentColor: 'text-indigo-700',
      accentBg: 'bg-indigo-50',
      accentBorder: 'border-indigo-500'
    },
    {
      id: 'faq',
      number: '09',
      title: 'Perguntas Frequentes (FAQ) & Dicas de Ouro',
      badge: 'Suporte',
      icon: <HelpCircle className="w-5 h-5 text-slate-400" />,
      summary: 'Respostas para dúvidas operacionais frequentes, procedimentos quando o Wi-Fi cai e permissões de funcionários.',
      accentColor: 'text-slate-800',
      accentBg: 'bg-slate-50',
      accentBorder: 'border-slate-400'
    }
  ];

  const handlePrintAllPdf = () => {
    setPrintFilter('all');
    addToast('info', 'Preparando Guia Completo em PDF...', 'Selecione a opção "Salvar como PDF" no destino da impressão.');
    setTimeout(() => {
      window.print();
    }, 450);
  };

  const handlePrintSingleChapter = (chapterId: string, chapterTitle: string) => {
    setPrintFilter(chapterId);
    addToast('info', `Preparando Módulo: ${chapterTitle}`, 'Selecione "Salvar como PDF" para gerar o documento deste módulo.');
    setTimeout(() => {
      window.print();
    }, 450);
  };

  const handleCopyGuideLink = () => {
    const url = `${window.location.origin}/?page=guide`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    addToast('success', 'Link do Guia Copiado!', 'Compartilhe este manual com seus colaboradores e operadores de caixa.');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const filteredChapters = useMemo(() => {
    if (!searchTerm.trim()) {
      if (activeChapterId === 'all') return chapters;
      return chapters.filter(c => c.id === activeChapterId);
    }
    const q = searchTerm.toLowerCase();
    return chapters.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.badge.toLowerCase().includes(q)
    );
  }, [searchTerm, activeChapterId]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* BARRA DE CABEÇALHO & AÇÕES DO MANUAL (APENAS TELA)                        */}
      {/* ========================================================================= */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Documentação & Manual Oficial do Cliente</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-amber-400 shrink-0" />
            <span>Guia Completo de Instruções — BebêAqui</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Manual passo a passo para o cliente e sua equipe dominarem todos os módulos: conexão de maquininhas, frente de caixa (PDV), gestão de mesas, cardápio digital, produtos, estoque atacado e extratos mensais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyGuideLink}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copiar link do manual online"
          >
            {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintAllPdf}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
            title="Exportar manual completo em formato PDF (A4) com capa executiva e sumário"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Baixar Guia Completo em PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHECKLIST DE IMPLANTAÇÃO EXPRESSA (10 MINUTOS) (APENAS TELA)              */}
      {/* ========================================================================= */}
      <div className="no-print p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Checklist de Ativação do Novo Cliente</span>
                <span className="text-xs font-normal text-slate-400">({checklistCompletedCount} de {checklistTotalCount} concluídos)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Siga estes 6 passos para colocar o sistema 100% em operação na distribuidora em menos de 10 minutos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${checklistPercentage}%` }}
              />
            </div>
            <span className="text-xs font-black text-amber-400 font-mono">{checklistPercentage}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div
            onClick={() => toggleChecklistItem('step1_pix')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
              checklist.step1_pix
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="pt-0.5 text-emerald-400">
              {checklist.step1_pix ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
            </div>
            <div>
              <strong className="block text-white font-bold">1. Chave PIX Oficial</strong>
              <span className="text-[11px] text-slate-400">Configurada em "Configurações & PIX".</span>
            </div>
          </div>

          <div
            onClick={() => toggleChecklistItem('step2_terminal')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
              checklist.step2_terminal
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="pt-0.5 text-emerald-400">
              {checklist.step2_terminal ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
            </div>
            <div>
              <strong className="block text-white font-bold">2. Conectar Maquininha</strong>
              <span className="text-[11px] text-slate-400">Abrir o Modo Maquininha Ton / Smart POS.</span>
            </div>
          </div>

          <div
            onClick={() => toggleChecklistItem('step3_products')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
              checklist.step3_products
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="pt-0.5 text-emerald-400">
              {checklist.step3_products ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
            </div>
            <div>
              <strong className="block text-white font-bold">3. Catálogo de Bebidas</strong>
              <span className="text-[11px] text-slate-400">Verificar preços de custo e venda dos itens.</span>
            </div>
          </div>

          <div
            onClick={() => toggleChecklistItem('step4_qr_tables')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
              checklist.step4_qr_tables
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="pt-0.5 text-emerald-400">
              {checklist.step4_qr_tables ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
            </div>
            <div>
              <strong className="block text-white font-bold">4. Plaquinhas QR Code</strong>
              <span className="text-[11px] text-slate-400">Imprimir placas para as mesas e balcão.</span>
            </div>
          </div>

          <div
            onClick={() => toggleChecklistItem('step5_test_sale')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
              checklist.step5_test_sale
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="pt-0.5 text-emerald-400">
              {checklist.step5_test_sale ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
            </div>
            <div>
              <strong className="block text-white font-bold">5. Fazer 1ª Venda Teste</strong>
              <span className="text-[11px] text-slate-400">Testar venda rápida no PDV (F1 / F2).</span>
            </div>
          </div>

          <div
            onClick={() => toggleChecklistItem('step6_wholesale')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
              checklist.step6_wholesale
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="pt-0.5 text-emerald-400">
              {checklist.step6_wholesale ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
            </div>
            <div>
              <strong className="block text-white font-bold">6. Atacado B2B & Extrato</strong>
              <span className="text-[11px] text-slate-400">Acompanhar pedidos e histórico financeiro.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTRO E PESQUISA RÁPIDA (APENAS TELA)                                     */}
      {/* ========================================================================= */}
      <div className="no-print space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar instrução rápida (ex: maquininha, pix, mesas, troco, atacado, extrato)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            <button
              type="button"
              onClick={() => setActiveChapterId('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 cursor-pointer ${
                activeChapterId === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos os Módulos ({chapters.length})
            </button>
            {chapters.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveChapterId(c.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 cursor-pointer ${
                  activeChapterId === c.id
                    ? 'bg-slate-850 text-amber-400 border border-amber-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c.number}. {c.badge}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CORPO DO MANUAL (RENDERIZADO NA TELA E EM IMPRESSÃO PDF)                   */}
      {/* ========================================================================= */}
      <div
        id="printable-guide-section"
        className="space-y-8 bg-white text-slate-900 p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-200"
      >
        
        {/* ========================================================================= */}
        {/* CAPA EXECUTIVA (Formatada para PDF / A4)                                  */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'capa') && (
          <div className="border-b-4 border-amber-500 pb-8 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-2xl shadow-md">
                  B
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-slate-900">
                    BEBÊ<span className="text-amber-600">AQUI</span>
                  </span>
                  <span className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    SaaS de Gestão para Distribuidoras, Depósitos e Bares
                  </span>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 font-mono">
                <div className="font-bold text-slate-900">MANUAL OFICIAL DO CLIENTE</div>
                <div>Versão 2.4 — Edição 2026</div>
                <div>Emitido em: {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            <div className="pt-4">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Guia Completo de Operação & Implantação
              </h1>
              <p className="text-base text-slate-600 mt-1 font-medium">
                Manual prático e ilustrado para o contratante e sua equipe dominarem todos os módulos do BebêAqui com máxima eficiência, controle de estoque e velocidade no atendimento.
              </p>
            </div>

            {/* Dados da Empresa Contratante */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Licenciado Exclusivamente Para:</span>
                  <strong className="text-slate-950 font-extrabold text-sm">{activeCompany.tradeName}</strong>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-slate-700 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">CNPJ:</span>
                  <span className="font-bold">{activeCompany.cnpj}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">LOCALIZAÇÃO:</span>
                  <span className="font-bold">{activeCompany.city} - {activeCompany.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CHAVE PIX VALIDADA:</span>
                  <span className="font-bold text-emerald-800">{activeCompany.bankDetails?.pixKey}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUMÁRIO GERAL DOS CAPÍTULOS                                               */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'capa') && (
          <div className="avoid-page-break p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Índice e Estrutura dos Módulos do Sistema</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {chapters.map(c => (
                <a
                  key={c.id}
                  href={`#sec-${c.id}`}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-sm transition-all flex items-center justify-between text-slate-800"
                >
                  <div className="truncate pr-2">
                    <span className="text-amber-600 font-black mr-2 font-mono">{c.number}.</span>
                    <strong className="font-semibold text-slate-900">{c.badge}</strong>
                    <span className="text-[11px] text-slate-500 block truncate">{c.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 01: CONECTAR MAQUININHAS                                           */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'maquininhas') && (
          <div id="sec-maquininhas" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-emerald-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Módulo 01</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Como Conectar e Operar Maquininhas (Smart POS Ton / Stone)
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('maquininhas', 'Conectar Maquininhas')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Imprimir somente este capítulo"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('terminal_pos')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Abrir no App</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O BebêAqui possui tecnologia de <strong>sincronização ultra-rápida P2P</strong> para maquininhas Smart Android (como <strong>Ton T3 Smart</strong>, <strong>Stone P2 Touch</strong>, <strong>PagBank Smart</strong> ou celulares dos garçons). O garçom ou vendedor de pista registra as bebidas na tela da maquininha e os pedidos aparecem no computador do caixa em menos de <strong>10 milissegundos</strong>.
            </p>

            {/* Passo a Passo em 3 Etapas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Acesso na Maquininha</h3>
                <p className="text-slate-600 leading-relaxed">
                  Na sua maquininha Ton ou Stone, abra o navegador de internet (Google Chrome) e acesse o endereço da sua loja:
                </p>
                <div className="p-2.5 rounded-lg bg-white border border-slate-300 font-mono text-[11px] text-emerald-700 font-bold truncate">
                  {window.location.origin}/?page=terminal_pos
                </div>
                <p className="text-[10px] text-slate-500">
                  Dica: Toque nos três pontinhos do navegador e selecione <em>"Adicionar à tela inicial"</em> para criar o ícone como um aplicativo nativo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">Bipar com Câmera ou Tocar</h3>
                <p className="text-slate-600 leading-relaxed">
                  O operador de pista pode simplesmente tocar na foto da cerveja/destilado na tela ou usar o botão <strong>"Bipar Câmera Traseira"</strong> para ler o código de barras das latinhas ou fardos diretamente no depósito.
                </p>
                <p className="text-[10px] text-slate-500">
                  Compatível com leitura de EAN-13 em frações de segundo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">Cobrança & Cupom Térmico</h3>
                <p className="text-slate-600 leading-relaxed">
                  Ao clicar em <strong>"Cobrar na Maquininha"</strong>, selecione se o cliente vai pagar no Cartão (Aproximação/Chip) ou no <strong>PIX na Tela</strong>.
                </p>
                <p className="text-[10px] text-slate-500">
                  A maquininha imprime o comprovante térmico no topo automaticamente assim que a venda é aprovada.
                </p>
              </div>
            </div>

            {/* Destaque: Regra de Ouro do PIX Exclusivo por Perfil */}
            <div className="avoid-page-break p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-3 text-xs text-slate-800">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Regra de Ouro do PIX na Maquininha: Chave Única por Perfil</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Quando o cliente da maquininha optar por pagar no <strong>PIX</strong>, o operador seleciona "PIX" ou clica no aviso <em>"💡 Cliente prefere pagar via PIX?"</em>. O sistema gera um <strong>QR Code oficial BACEN escaneável</strong> na própria tela da maquininha com o valor exato da conta.
              </p>
              <div className="p-3.5 bg-white rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Perfil de Destino:</span>
                  <strong className="text-slate-950 font-bold">{activeCompany.tradeName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Chave PIX Cadastrada:</span>
                  <strong className="text-emerald-700 font-bold">{activeCompany.bankDetails?.pixKey}</strong> ({activeCompany.bankDetails?.pixKeyType?.toUpperCase()})
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Favorecido Oficial:</span>
                  <strong className="text-slate-950">{activeCompany.bankDetails?.beneficiaryName || activeCompany.tradeName}</strong>
                </div>
              </div>
              <p className="text-[11px] text-emerald-900 font-medium">
                ✔ <strong>Zero Risco de Fraude:</strong> O dinheiro entra direto na conta bancária cadastrada na sua empresa, sem intermediários e com confirmação visual imediata na maquininha.
              </p>
            </div>

            {/* Dica de Contingência (Queda de Internet) */}
            <div className="avoid-page-break p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-2.5">
              <Wifi className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">O que fazer se o Wi-Fi da loja oscilar ou cair?</strong>
                <p className="text-slate-600 mt-0.5">
                  As maquininhas Ton T3 e Stone contam com chip de dados 4G próprio incluso. Se a internet fixa cair, o operador continua vendendo e recebendo normalmente via 4G. Todos os pedidos são reconciliados automaticamente no servidor central.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 02: FAZER VENDAS NO BALCÃO (PDV CAIXA)                             */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'vendas') && (
          <div id="sec-vendas" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-amber-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Módulo 02</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Fazer Vendas no Balcão (PDV Caixa Rápido)
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('vendas', 'Fazer Vendas')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('pos')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Abrir no App</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O <strong>PDV Vendas</strong> foi projetado para operadores de caixa que precisam atender filas com extrema velocidade. Você pode efetuar vendas rápidas de balcão (sem mesa) ou selecionar uma mesa para comanda.
            </p>

            {/* Tabela Oficial de Atalhos de Teclado */}
            <div className="avoid-page-break p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Atalhos de Teclado Oficiais para o Operador de Caixa:</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <strong className="text-amber-600 text-base block font-black">F1</strong>
                  <span className="text-slate-800 font-bold block text-xs">Venda Balcão / Mesa</span>
                  <span className="text-slate-500 text-[10px]">Alterna entre venda rápida e mapa de mesas.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <strong className="text-emerald-600 text-base block font-black">F2</strong>
                  <span className="text-slate-800 font-bold block text-xs">Receber & Finalizar</span>
                  <span className="text-slate-500 text-[10px]">Abre o modal de pagamento do caixa.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <strong className="text-blue-600 text-base block font-black">ENTER</strong>
                  <span className="text-slate-800 font-bold block text-xs">Confirmar Pagamento</span>
                  <span className="text-slate-500 text-[10px]">Valida o recebimento e conclui a venda.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <strong className="text-rose-600 text-base block font-black">ESC</strong>
                  <span className="text-slate-800 font-bold block text-xs">Voltar / Fechar</span>
                  <span className="text-slate-500 text-[10px]">Cancela modais ou limpa a busca.</span>
                </div>
              </div>
            </div>

            {/* Formas de Pagamento e Troco */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Dinheiro & Troco</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Digite o valor entregue pelo cliente ou clique nos botões rápidos de notas (R$ 10, R$ 20, R$ 50, R$ 100 ou Exato). O sistema exibe o <strong>Troco do Cliente</strong> em destaque verde.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <span>PIX Dinâmico com QR Code</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Ao escolher PIX, a tela do caixa exibe o QR Code dinâmico do BACEN com o valor exato da compra. O operador pode virar o monitor para o cliente ler ou clicar em <strong>"Copiar Código PIX"</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Cartão Débito & Crédito</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Selecione Débito ou Crédito e efetue a cobrança na maquininha Ton / Stone conectada. O PDV grava o NSU e o comprovante da transação no relatório diário.
                </p>
              </div>
            </div>

            {/* Pagamentos Parciais e Divisão */}
            <div className="avoid-page-break p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-1.5">
              <strong className="text-blue-950 font-bold block text-sm">Como Dividir o Pagamento em Múltiplas Formas:</strong>
              <p className="text-blue-900 leading-relaxed">
                Se o cliente desejar pagar R$ 30,00 em dinheiro e o restante no PIX ou Cartão, clique no botão <strong>"+ Registrar Pagamento Parcial"</strong> no modal de recebimento. O caixa abate o saldo recebido, atualiza o saldo restante em tempo real e permite liquidar o restante com outra modalidade.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 03: GESTÃO DE MESAS E COMANDAS                                     */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'mesas') && (
          <div id="sec-mesas" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-blue-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Módulo 03</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Fazer a Gestão de Mesas, Deck e Comandas
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('mesas', 'Gestão de Mesas')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('tables')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Abrir no App</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O módulo de <strong>Gestão de Mesas</strong> monitora o salão, deck e pista em tempo real. Cada mesa possui indicadores visuais de cor para saber na hora o estado de atendimento do cliente.
            </p>

            {/* Indicadores Visuais de Cores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black text-[10px] uppercase">
                  Livre (Verde)
                </span>
                <p className="text-slate-600 mt-1.5 text-[11px]">Mesa desocupada e pronta para receber novos clientes.</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[10px] uppercase">
                  Ocupada (Amarela)
                </span>
                <p className="text-slate-600 mt-1.5 text-[11px]">Comanda aberta com bebidas lançadas consumindo.</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-950 font-black text-[10px] uppercase">
                  Pediu Conta (Roxo)
                </span>
                <p className="text-slate-600 mt-1.5 text-[11px]">Cliente solicitou o encerramento da comanda.</p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-950 font-black text-[10px] uppercase">
                  Fechando (Azul)
                </span>
                <p className="text-slate-600 mt-1.5 text-[11px]">Pagamento sendo processado no balcão ou maquininha.</p>
              </div>
            </div>

            {/* Operação Prática das Mesas */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">1. Como Lançar Bebidas na Mesa:</strong>
                <p className="leading-relaxed">
                  No PDV Vendas, clique no seletor de <strong>"Mesa"</strong> ou pressione F1. Escolha a mesa desejada no mapa. A partir desse momento, todos os itens adicionados ao carrinho serão gravados diretamente na comanda da mesa ao clicar em <strong>"Lançar Pedido na Mesa (F2)"</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">2. Adicionar, Renomear e Editar Mesas:</strong>
                <p className="leading-relaxed">
                  No painel de Mesas, clique no botão <strong>"+ Adicionar Mesa"</strong> para criar novas mesas. No card de qualquer mesa existente, clique no ícone de lápis para alterar o número, capacidade de assentos ou apelido (ex: <em>"Deck 01"</em>, <em>"Área VIP 04"</em>, <em>"Banqueta Balcão"</em>).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">3. Fechar Conta & Taxa de Serviço:</strong>
                <p className="leading-relaxed">
                  Clique em <strong>"Fechar Conta"</strong>. O sistema calcula o subtotal, permite incluir taxa de serviço de 10% (opcional e desativável com um clique) e concede descontos. Ao escolher PIX, a tela exibe o QR Code oficial da comanda para pagamento imediato. Assim que confirmado, a mesa é liberada automaticamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 04: CARDÁPIO DIGITAL QR CODE                                      */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'cardapio') && (
          <div id="sec-cardapio" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-purple-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Módulo 04</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Cardápio Digital QR Code (Autoatendimento)
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('cardapio', 'Cardápio Digital')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('menu')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Ver Cardápio</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Elimine cardápios físicos de papel e filas no caixa. O cliente aponta a câmera do celular para a plaquinha com QR Code na mesa e tem acesso imediato a todas as bebidas geladas com fotos de alta qualidade, preços atualizados e descrições.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <h3 className="font-bold text-purple-950 text-sm">Sem Necessidade de App</h3>
                <p className="text-purple-900 leading-relaxed">
                  O cliente não precisa baixar nada na App Store ou Google Play. O cardápio abre instantaneamente no navegador móvel (Chrome/Safari) via tecnologia Web leve.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <h3 className="font-bold text-purple-950 text-sm">Identificação da Mesa</h3>
                <p className="text-purple-900 leading-relaxed">
                  Cada QR Code carrega a identificação única da mesa do cliente. Ao finalizar o pedido, o bar ou cozinha sabe exatamente onde fazer a entrega da bebida.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <h3 className="font-bold text-purple-950 text-sm">Impressão em Lote (A4)</h3>
                <p className="text-purple-900 leading-relaxed">
                  No painel de Mesas, clique em <strong>"Gerenciar Placas QR Code"</strong>. O sistema gera uma folha A4 com todas as plaquinhas diagramadas prontas para imprimir e plastificar.
                </p>
              </div>
            </div>

            {/* Fluxo do Pedido pelo Cardápio */}
            <div className="avoid-page-break p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Como Funciona o Ciclo do Autoatendimento:</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
                <li>O cliente senta na mesa e escaneia a plaquinha com a câmera do smartphone.</li>
                <li>Ele navega pelas categorias (Cervejas, Destilados, Sem Álcool) e adiciona itens à sacola.</li>
                <li>Ele clica em <strong>"Enviar Pedido"</strong>. O sistema emite um alerta sonoro no painel do bar e insere os produtos diretamente na comanda da mesa.</li>
                <li>O garçom entrega a bebida na mesa sem atritos de fila.</li>
              </ol>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 05: PRODUTOS E CATEGORIAS                                         */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'produtos') && (
          <div id="sec-produtos" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-teal-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Módulo 05</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Produtos, Categorias & Margem de Lucro
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('produtos', 'Produtos e Categorias')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('products')}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Gerenciar Produtos</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Mantenha o catálogo de bebidas da sua distribuidora sempre em dia. O cadastro inteligente calcula a margem bruta de cada item e avisa automaticamente quando o estoque mínimo for atingido.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Passo a Passo para Cadastrar um Novo Produto:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">1. Dados Básicos & Volume:</strong>
                  <p className="text-slate-600">
                    Acesse <strong>"Produtos & Categorias"</strong> &gt; <strong>"+ Cadastrar Produto"</strong>. Digite o nome (ex: <em>"Heineken 600ml"</em>) e escolha a categoria (Cervejas, Destilados, Sucos, Gelo).
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">2. Preço de Custo x Venda:</strong>
                  <p className="text-slate-600">
                    Informe quanto você paga para a cervejaria (Preço de Custo) e por quanto vende no balcão. O sistema calcula a sua <strong>Margem de Lucro (%)</strong> na hora.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">3. Código de Barras & Código Rápido:</strong>
                  <p className="text-slate-600">
                    Cadastre o código de barras original (EAN-13) ou um código rápido de 2 dígitos (ex: "01", "02") para o operador digitar no caixa em segundos.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">4. Alerta de Estoque Mínimo:</strong>
                  <p className="text-slate-600">
                    Defina o estoque de segurança (ex: 24 garrafas). Quando o estoque chegar nesse número, o sistema acende o alerta vermelho no painel de compras.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 06: ESTOQUE E ATACADO (B2B)                                       */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'estoque_atacado') && (
          <div id="sec-estoque_atacado" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-rose-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Módulo 06</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Controle de Estoque & Módulo Atacado (B2B)
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('estoque_atacado', 'Estoque e Atacado')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('stock')}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Acessar Estoque</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Para quem vende tanto no varejo quanto em grande volume para outros estabelecimentos, o BebêAqui integra o <strong>Estoque do Galpão</strong> com o <strong>Módulo de Atacado B2B</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Gestão de Estoque do Galpão</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Controle caixas fechadas, paletes e unidades soltas. Toda vez que uma carga chegar dos fornecedores, clique em <strong>"+ Entrada de Mercadoria"</strong>. Todas as entradas e saídas por quebra/avaria são registradas com data, hora e responsável.
                </p>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                  <strong>Auditoria Completa:</strong> Evite desvios no depósito com relatórios de saldo físico vs fiscal.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Vendas no Atacado B2B</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Cadastre clientes pessoa jurídica (bares, restaurantes, casas noturnas, eventos e buffets). Lance pedidos no atacado com tabela de preços por fardo e emita faturas com prazos flexíveis (À vista, 7 dias, 14 dias ou 28 dias).
                </p>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                  <strong>Fluxo do Pedido:</strong> Pendente &rarr; Confirmado &rarr; Separação &rarr; Rota &rarr; Entregue.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 07: EXTRATO DOS MESES PASSADOS & FINANCEIRO                       */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'extrato') && (
          <div id="sec-extrato" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-amber-600 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Módulo 07</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Extrato dos Meses Passados & Relatórios Financeiros
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('extrato', 'Extrato dos Meses Passados')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('statement')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Abrir Extrato</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O módulo de <strong>Extrato Consolidado</strong> apresenta o histórico financeiro retroativo da sua empresa mês a mês, permitindo avaliar a rentabilidade real, evolução de vendas e exportar os dados contábeis.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Principais Indicadores Financeiros Disponíveis:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Faturamento Bruto:</strong>
                    <span>Total arrecadado em dinheiro, cartões de crédito/débito e PIX no mês selecionado.</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">CMV (Custo das Mercadorias):</strong>
                    <span>O valor pago pelas bebidas aos fornecedores e cervejarias para gerar aquele faturamento.</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Lucro Líquido Real:</strong>
                    <span>O resultado financeiro limpo após descontar custos de bebidas e despesas operacionais.</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Exportação CSV / Excel:</strong>
                    <span>Gere arquivos estruturados com um clique para enviar diretamente ao seu contador.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 08: GUIA DE BOLSO / COLA RÁPIDA DO CAIXA                           */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'cola_caixa') && (
          <div id="sec-cola_caixa" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-indigo-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Módulo 08</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Guia de Bolso: Cola Rápida para o Operador de Caixa
                  </h2>
                </div>
              </div>

              <div className="no-print">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('cola_caixa', 'Cola Rápida do Caixa')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Esta Cola</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Folha prática de consulta rápida. Recomendamos imprimir esta página em folha sulfite A4 e colar ao lado do monitor do caixa e da maquininha Ton para orientação diária dos funcionários.
            </p>

            <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-indigo-200">
                  <strong className="text-indigo-950 font-bold block mb-1">Início do Turno:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Verificar se o papel térmico da maquininha está abastecido.</li>
                    <li>Abrir a tela do PDV Vendas no computador.</li>
                    <li>Conferir saldo de troco no gaveteiro de notas.</li>
                  </ul>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-200">
                  <strong className="text-indigo-950 font-bold block mb-1">Durante a Venda:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Pressione <strong>F1</strong> para alternar entre Balcão ou Mesa.</li>
                    <li>Bipe os produtos ou digite o código de 2 dígitos.</li>
                    <li>Pressione <strong>F2</strong> para abrir a cobrança.</li>
                  </ul>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-200">
                  <strong className="text-indigo-950 font-bold block mb-1">Recebimento Seguro:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>PIX: Confirme na tela o nome do favorecido.</li>
                    <li>Dinheiro: Digite o valor e confira o troco verde.</li>
                    <li>Pressione <strong>ENTER</strong> para emitir cupom.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 09: PERGUNTAS FREQUENTES (FAQ)                                     */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'faq') && (
          <div id="sec-faq" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-slate-400 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Módulo 09</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Perguntas Frequentes (FAQ) & Dicas de Ouro
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">1. Posso usar mais de uma maquininha ao mesmo tempo?</strong>
                <p className="text-slate-600 leading-relaxed">
                  Sim! Você pode conectar quantas maquininhas quiser (ex: Maquininha Balcão, Garçom 01, Garçom 02). Todas sincronizam os pedidos na mesma conta da distribuidora em tempo real, sem conflito.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">2. Como garanto que o PIX caia na conta correta?</strong>
                <p className="text-slate-600 leading-relaxed">
                  Acesse <strong>"Configurações & PIX"</strong>. Cadastre a chave PIX da sua distribuidora (CNPJ, Celular, E-mail ou Aleatória). O sistema valida a chave e garante que todos os QR Codes emitidos no PDV, nas Mesas e nas Maquininhas caiam exclusivamente na sua conta.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">3. Como limitar o acesso de operadores para não verem o lucro?</strong>
                <p className="text-slate-600 leading-relaxed">
                  No menu <strong>"Funcionários & Acessos"</strong>, defina o perfil de cada pessoa como <em>"Funcionário / Operador"</em>. Eles terão acesso liberado apenas para registrar vendas no PDV e abrir mesas, mantendo os relatórios de lucro, extratos e configurações bloqueados.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RODAPÉ CORPORATIVO OFICIAL (Formatado para PDF)                           */}
        {/* ========================================================================= */}
        <div className="avoid-page-break border-t-2 border-slate-200 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
              B
            </div>
            <span className="font-bold text-slate-800">BebêAqui — Tecnologia para Distribuidoras, Depósitos e Bares</span>
          </div>
          <div>
            <span>Suporte Técnico: <strong>suporte@bebeaqui.com.br</strong></span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Documento Oficial Gerado em {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>

      </div>
    </div>
  );
};
