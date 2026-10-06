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
  FileSpreadsheet,
  KeyRound,
  Image as ImageIcon,
  Palette
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
      id: 'cadastro_pix',
      number: '01',
      title: 'Cadastro (CPF ou CNPJ) & Chave PIX Única da Distribuidora',
      badge: 'Início & PIX',
      icon: <KeyRound className="w-5 h-5 text-amber-500" />,
      summary: 'Como cadastrar sua distribuidora com CPF (sem CNPJ) ou CNPJ, escolher o plano ideal para seu perfil e vincular sua Chave PIX exclusiva para recebimento direto de vendas.',
      targetPage: 'register',
      targetPageLabel: 'Ver Tela de Cadastro',
      accentColor: 'text-amber-800',
      accentBg: 'bg-amber-50',
      accentBorder: 'border-amber-500'
    },
    {
      id: 'maquininhas',
      number: '02',
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
      number: '03',
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
      number: '04',
      title: 'Gestão de Mesas, Deck e Comandas de Salão',
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
      number: '05',
      title: 'Cardápio Digital QR Code (Autoatendimento)',
      badge: 'Autoatendimento',
      icon: <QrCode className="w-5 h-5 text-purple-400" />,
      summary: 'Como clientes pedem direto do smartphone sem baixar aplicativo, identificação automática de mesas e aviso sonoro de novo pedido no bar.',
      targetPage: 'menu',
      targetPageLabel: 'Ver Cardápio Digital',
      accentColor: 'text-purple-700',
      accentBg: 'bg-purple-50',
      accentBorder: 'border-purple-500'
    },
    {
      id: 'edicao_cardapio',
      number: '06',
      title: 'Edição & Customização do Cardápio Digital',
      badge: 'Personalização',
      icon: <Palette className="w-5 h-5 text-amber-400" />,
      summary: 'Como trocar foto de capa e logotipo, configurar horários, taxa de delivery, organizar categorias em destaque e imprimir plaquinhas acrílicas em lote A4.',
      targetPage: 'settings',
      targetPageLabel: 'Configurar Cardápio',
      accentColor: 'text-amber-700',
      accentBg: 'bg-amber-50',
      accentBorder: 'border-amber-500'
    },
    {
      id: 'produtos',
      number: '07',
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
      number: '08',
      title: 'Estoque de Varejo & Módulo Atacado (B2B)',
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
      number: '09',
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
      number: '10',
      title: 'Guia de Bolso: Cola Rápida para o Operador do Caixa',
      badge: 'Cola Rápida',
      icon: <Zap className="w-5 h-5 text-indigo-400" />,
      summary: 'Folha prática para imprimir e colar na parede do caixa com os atalhos essenciais, passos de abertura/fechamento e segurança do PIX.',
      accentColor: 'text-indigo-700',
      accentBg: 'bg-indigo-50',
      accentBorder: 'border-indigo-500'
    },
    {
      id: 'faq',
      number: '11',
      title: 'Perguntas Frequentes (FAQ) & Procedimentos Operacionais',
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
          <a
            href="/bebeaqui-projeto-completo.zip"
            download="bebeaqui-projeto-completo.zip"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
            title="Baixar arquivo .ZIP com todo o código fonte pronto para o GitHub"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Baixar Projeto (.ZIP)</span>
          </a>

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
              <strong className="block text-white font-bold">1. Cadastro CPF/CNPJ & PIX Único</strong>
              <span className="text-[11px] text-slate-400">Chave exclusiva para receber vendas no balcão e maquininha.</span>
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
                  <span className="text-slate-400 block text-[10px]">{activeCompany.documentType === 'cpf' ? 'CPF:' : 'CNPJ:'}</span>
                  <span className="font-bold">{activeCompany.document || activeCompany.cnpj}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">LOCALIZAÇÃO:</span>
                  <span className="font-bold">{activeCompany.city} - {activeCompany.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CHAVE PIX VALIDADA:</span>
                  <span className="font-bold text-emerald-800">{activeCompany.bankDetails?.pixKey}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PLANO CONTRATADO:</span>
                  <span className="font-bold text-amber-700">{activeCompany.plan || 'Plano BebêAqui'}</span>
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
        {/* MÓDULO 01: CADASTRO COM CPF/CNPJ & CHAVE PIX ÚNICA                        */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'cadastro_pix') && (
          <div id="sec-cadastro_pix" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-amber-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Módulo 01</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Cadastro (CPF ou CNPJ) & Chave PIX Única da Distribuidora
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('cadastro_pix', 'Cadastro & Chave PIX')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Imprimir somente este capítulo"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('register')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Tela de Cadastro</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O BebêAqui foi projetado para acolher <strong>tanto distribuidores com CNPJ quanto adegas, depósitos familiares e comércios que operam por CPF</strong>. O processo de ativação é imediato, com vinculação de uma <strong>Chave PIX Única</strong> que direciona todas as vendas da sua loja direto para a sua conta bancária pessoal ou empresarial.
            </p>

            {/* 3 Pilares do Cadastro e PIX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Cadastro por CPF ou CNPJ</h3>
                <p className="text-slate-600 leading-relaxed">
                  Não possui CNPJ? Basta clicar em <strong>"Cadastro por CPF"</strong>. O sistema valida os 11 dígitos do CPF do titular em tempo real e libera 100% dos recursos do sistema (PDV, Mesas, Comandas, Estoque e Cardápio).
                </p>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 font-medium">
                  ✔ Sem exigência de CNPJ para abrir sua conta.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">Sua Chave PIX Única</h3>
                <p className="text-slate-600 leading-relaxed">
                  O assinante escolhe qual chave quer usar para receber: <strong>CPF, Celular, CNPJ, E-mail ou Aleatória EVP</strong>. Informa o Favorecido e o Banco (Nubank, Inter, Caixa, Itaú, etc.).
                </p>
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px] text-emerald-900 font-medium">
                  ✔ O dinheiro das vendas entra 100% na sua conta (zero intermediários).
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">Planos Sob Medida</h3>
                <p className="text-slate-600 leading-relaxed">
                  Escolha o plano que melhor se adapta à realidade da sua empresa: Distribuidora Varejo, Atacado Exclusivo B2B ou Combo Integrado. Você pode alternar de plano conforme sua distribuidora cresce.
                </p>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-[10px] text-blue-900 font-medium">
                  ✔ Flexibilidade total para seu modelo de negócio.
                </div>
              </div>
            </div>

            {/* Destaque: Como a Chave PIX opera no Balcão, Mesas e Maquininhas */}
            <div className="avoid-page-break p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3 text-xs text-slate-800">
              <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Onde a sua Chave PIX Exclusiva entra em ação no sistema</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Assim que a sua chave PIX exclusiva é configurada (no cadastro ou na tela de Configurações), ela passa a comandar todas as saídas de cobrança:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">1. No PDV (Balcão)</strong>
                  <p className="text-[11px] text-slate-600">Ao cobrar uma venda em PIX, a tela gera o QR Code com a sua chave e confirma a entrada.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">2. Nas Mesas & Cardápio</strong>
                  <p className="text-[11px] text-slate-600">O cliente na mesa escaneia a plaquinha QR Code e faz o PIX direto para o seu favorecido.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                  <strong className="text-slate-900 block font-bold">3. No Modo Maquininha</strong>
                  <p className="text-[11px] text-slate-600">Na maquininha Ton/Stone, o operador toca em "PIX" e o QR Code oficial aparece na tela do aparelho.</p>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Sua Empresa Cadastrada:</span>
                  <strong className="text-slate-950">{activeCompany.tradeName}</strong> ({activeCompany.documentType === 'cpf' ? 'CPF' : 'CNPJ'})
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Chave PIX de Recebimento:</span>
                  <strong className="text-emerald-700 font-bold">{activeCompany.bankDetails?.pixKey}</strong> ({activeCompany.bankDetails?.pixKeyType?.toUpperCase()})
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Titular / Favorecido:</span>
                  <strong className="text-slate-900 font-bold">{activeCompany.bankDetails?.beneficiaryName || activeCompany.tradeName}</strong>
                </div>
              </div>
            </div>

            {/* Dica Técnica: Qualidade das Fotos no Catálogo */}
            <div className="avoid-page-break p-3.5 bg-slate-50 border border-slate-300 rounded-xl flex items-start gap-3 text-xs text-slate-700">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-slate-800" />
              </div>
              <div className="space-y-1">
                <strong className="text-slate-900 block font-bold">Qualidade Visual do Catálogo de Bebidas</strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Todas as fotos de cervejas, destilados e refrigerantes contam com <strong>banco de imagens de alta resolução</strong> e carregamento ultra-rápido otimizado para celulares e maquininhas. O cardápio digital permanece sempre nítido e atrativo para aumentar as vendas por impulso.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* MÓDULO 02: A ÁREA DAS MAQUININHAS (SMART POS TON / STONE)                 */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'maquininhas') && (
          <div id="sec-maquininhas" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-emerald-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Módulo 02</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    A Área das Maquininhas: Conexão & Operação Smart POS (Ton / Stone / PagBank)
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('maquininhas', 'A Área das Maquininhas')}
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
                  <span>Abrir Modo Maquininha</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              A <strong>Área das Maquininhas (Modo Smart POS)</strong> transforma terminais Android portáteis com bobina térmica integrada (como <strong>Ton T3 Smart</strong>, <strong>Stone P2 Touch</strong>, <strong>PagBank Smart</strong> ou celulares dos garçons) em pontos de venda móveis completos. Com tecnologia de <strong>sincronização instantânea P2P (&lt;10ms)</strong>, cada produto bipado na pista ou no galpão é atualizado no computador do caixa em frações de segundo.
            </p>

            {/* Passo a Passo Didático em 4 Etapas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Acesso & Atalho de Tela Cheia</h3>
                <p className="text-slate-600 leading-relaxed">
                  Na sua maquininha Ton ou Stone, abra o <strong>Google Chrome</strong> e digite o link do terminal. Toque nos 3 pontinhos do navegador e selecione <strong>"Adicionar à tela inicial"</strong>. O ícone oficial do BebêAqui é criado na tela da maquininha, funcionando como aplicativo nativo em tela inteira.
                </p>
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 font-mono text-[10px] text-emerald-800 font-bold truncate">
                  {window.location.origin}/?page=terminal_pos
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">Identificação do Operador</h3>
                <p className="text-slate-600 leading-relaxed">
                  No topo da tela da maquininha, toque no seletor de operador para identificar quem está vendendo (ex: <em>Carlos - Garçom Pista</em>, <em>Marina - Balcão</em> ou <em>Vendedor Galpão</em>). Isso garante comissões certas e rastreabilidade total das vendas de cada membro da equipe.
                </p>
                <div className="p-1.5 bg-slate-100 rounded-lg text-[10px] text-slate-600">
                  ✔ Troca de operador com 1 toque sem fechar a conta.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">Bipar com Câmera Traseira</h3>
                <p className="text-slate-600 leading-relaxed">
                  O atendente pode simplesmente tocar na foto da cerveja no catálogo ou clicar no botão <strong>"Bipar Câmera Traseira"</strong>. Aponte a câmera da maquininha para o código de barras (EAN-13) da latinha, garrafa ou fardo para adicionar à venda em menos de 1 segundo.
                </p>
                <div className="p-1.5 bg-slate-100 rounded-lg text-[10px] text-slate-600">
                  ✔ Leitura ultrarrápida no escuro ou ambientes claros.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center">
                  4
                </div>
                <h3 className="font-bold text-sm text-slate-900">Cobrança & Cupom Térmico</h3>
                <p className="text-slate-600 leading-relaxed">
                  Ao clicar em <strong>"Cobrar na Maquininha"</strong>, escolha se o cliente pagará no Cartão (Aproximação/NFC ou Chip) ou no <strong>PIX na Tela</strong>. A maquininha imprime automaticamente o comprovante fiscal/térmico pelo compartimento superior assim que a venda for aprovada.
                </p>
                <div className="p-1.5 bg-slate-100 rounded-lg text-[10px] text-slate-600">
                  ✔ Impressão instantânea sem precisar de impressora externa.
                </div>
              </div>
            </div>

            {/* Destaque: Regra de Ouro do PIX Exclusivo por Perfil na Maquininha */}
            <div className="avoid-page-break p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-3 text-xs text-slate-800">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Recebimento PIX na Maquininha: Chave Exclusiva da Sua Distribuidora</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Quando o cliente na pista ou na mesa optar por pagar via <strong>PIX</strong>, o operador seleciona a opção <strong>"PIX"</strong> na maquininha. O sistema gera automaticamente um <strong>QR Code oficial BACEN dinâmico</strong> na própria tela da máquina com o valor exato da conta.
              </p>
              <div className="p-3.5 bg-white rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Distribuidora Beneficiária:</span>
                  <strong className="text-slate-950 font-bold">{activeCompany.tradeName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Chave PIX Validada:</span>
                  <strong className="text-emerald-700 font-bold">{activeCompany.bankDetails?.pixKey}</strong> ({activeCompany.bankDetails?.pixKeyType?.toUpperCase()})
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Titular da Conta:</span>
                  <strong className="text-slate-950">{activeCompany.bankDetails?.beneficiaryName || activeCompany.tradeName}</strong>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-950">
                <div className="p-2 bg-emerald-100/60 rounded-lg">
                  ✔ <strong>Dinheiro 100% Direto:</strong> Não há intermediação financeira retendo seu capital de giro. O valor cai direto na sua conta bancária cadastrada.
                </div>
                <div className="p-2 bg-emerald-100/60 rounded-lg">
                  ✔ <strong>Confirmação Visual Imediata:</strong> A tela da maquininha exibe o comprovante de aprovação e dispara a impressão térmica na hora.
                </div>
              </div>
            </div>

            {/* Dica de Contingência (Queda de Internet e Chip 4G) */}
            <div className="avoid-page-break p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-2.5">
              <Wifi className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-bold">O que fazer se a internet Wi-Fi da loja oscilar ou cair?</strong>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  As maquininhas Smart (Ton T3 e Stone) vêm com <strong>chip de dados 4G próprio incluso</strong> que não consome dados do estabelecimento. Se a internet banda larga da sua distribuidora cair, a maquininha continua vendendo, emitindo QR Codes PIX e imprimindo cupom normalmente pela rede 4G. Quando a rede fixa reestabelece, os dados são sincronizados no computador central do caixa de forma 100% transparente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 03: FAZER VENDAS NO BALCÃO (PDV CAIXA RÁPIDO)                      */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'vendas') && (
          <div id="sec-vendas" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-amber-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Módulo 03</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    PDV Vendas: Frente de Caixa Rápido & Atendimento de Balcão
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('vendas', 'PDV Vendas')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Imprimir somente este capítulo"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('pos')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Abrir Frente de Caixa</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O <strong>PDV Vendas (Frente de Caixa)</strong> foi desenvolvido para atender picos de movimento com fila no balcão em alta velocidade. O operador pode finalizar vendas completas em menos de 10 segundos, aceitar pagamentos fracionados, emitir comprovantes e controlar o fluxo financeiro diário com precisão.
            </p>

            {/* Ciclo Operacional do Caixa em 4 Etapas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Abertura de Caixa (Suprimento)</h3>
                <p className="text-slate-600 leading-relaxed">
                  No início do dia ou início de turno, o operador clica em <strong>"Abrir Caixa"</strong> e informa o valor do <strong>Fundo de Troco</strong> (ex: R$ 150,00 em moedas e notas miúdas). O sistema registra o saldo inicial de partida para a conferência no final do expediente.
                </p>
                <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 font-medium">
                  ✔ Gaveta inicial auditada e protegida.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">Bipar ou Código Rápido</h3>
                <p className="text-slate-600 leading-relaxed">
                  Passe o leitor de código de barras USB nas latas ou digite o código de 2 dígitos do produto (ex: digite <em>01</em> para Heineken ou <em>02</em> para Amstel) e dê ENTER. A busca inteligente filtra por marca, volume ou categoria instantaneamente.
                </p>
                <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 font-medium">
                  ✔ Atendimento 3x mais rápido sem usar mouse.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">Cobrança Rápida (F2)</h3>
                <p className="text-slate-600 leading-relaxed">
                  Pressione <strong>F2</strong> no teclado. Escolha a forma de pagamento: Dinheiro (com cálculo automático de troco em verde), PIX Dinâmico com QR Code na tela ou Cartão (Débito/Crédito). Finalize pressionando <strong>ENTER</strong>.
                </p>
                <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 font-medium">
                  ✔ Cupom gerado e estoque baixado na hora.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center">
                  4
                </div>
                <h3 className="font-bold text-sm text-slate-900">Sangria & Fechamento</h3>
                <p className="text-slate-600 leading-relaxed">
                  Para não acumular muito dinheiro em espécie na gaveta, use a opção <strong>"Sangria de Caixa"</strong> para recolher valores para o cofre. No fim do turno, clique em <strong>"Fechar Caixa"</strong>: o sistema realiza a conferência e imprime o resumo de fechamento.
                </p>
                <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 font-medium">
                  ✔ Sem furos de caixa ou divergências.
                </div>
              </div>
            </div>

            {/* Tabela Oficial de Atalhos de Teclado */}
            <div className="avoid-page-break p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Atalhos de Teclado Oficiais para o Operador do Caixa:</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <strong className="text-amber-600 text-base block font-black">F1</strong>
                  <span className="text-slate-800 font-bold block text-xs">Venda Balcão / Mesa</span>
                  <span className="text-slate-500 text-[10px]">Alterna entre venda rápida de balcão e mapa de mesas.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <strong className="text-emerald-600 text-base block font-black">F2</strong>
                  <span className="text-slate-800 font-bold block text-xs">Receber & Finalizar</span>
                  <span className="text-slate-500 text-[10px]">Abre o modal de pagamento do caixa com as opções.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <strong className="text-blue-600 text-base block font-black">ENTER</strong>
                  <span className="text-slate-800 font-bold block text-xs">Confirmar Pagamento</span>
                  <span className="text-slate-500 text-[10px]">Valida o recebimento e conclui a venda emitindo o cupom.</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <strong className="text-rose-600 text-base block font-black">ESC</strong>
                  <span className="text-slate-800 font-bold block text-xs">Voltar / Cancelar</span>
                  <span className="text-slate-500 text-[10px]">Fecha modais abertos ou limpa o campo de busca.</span>
                </div>
              </div>
            </div>

            {/* Formas de Pagamento e Divisão */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Dinheiro & Calculadora de Troco</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Digite o valor entregue pelo cliente ou clique nos botões rápidos de cédulas (R$ 10, R$ 20, R$ 50, R$ 100 ou Exato). O sistema calcula e destaca em verde exatamente o <strong>Troco do Cliente</strong>, evitando erros manuais de cálculo.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-teal-600" />
                  <span>PIX Dinâmico com QR Code BACEN</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Ao escolher PIX, a tela exibe o QR Code dinâmico do BACEN com o valor exato da compra. O operador pode virar o monitor para o cliente escanear ou clicar em <strong>"Copiar Código PIX"</strong> para enviar pelo WhatsApp no caso de pedidos de delivery.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Cartões Débito, Crédito & Voucher</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Selecione a bandeira/modalidade e passe o cartão na maquininha Ton/Stone. O sistema permite registrar o código de autorização ou NSU para reconciliação automática no fechamento do dia.
                </p>
              </div>
            </div>

            {/* Pagamentos Parciais e Divisão Múltipla */}
            <div className="avoid-page-break p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-1.5">
              <strong className="text-blue-950 font-bold block text-sm">Como Dividir o Pagamento em Múltiplas Formas:</strong>
              <p className="text-blue-900 leading-relaxed">
                Se o cliente desejar pagar R$ 30,00 em dinheiro e os outros R$ 45,00 no PIX ou Cartão, clique no botão <strong>"+ Registrar Pagamento Parcial"</strong> no modal de recebimento. O caixa abate o valor recebido, calcula o saldo restante em tempo real e permite liquidar o restante com outra modalidade, emitindo um cupom consolidado com ambas as baixas.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 04: GESTÃO DE MESAS, DECK, SALÃO E COMANDAS                        */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'mesas') && (
          <div id="sec-mesas" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-blue-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Módulo 04</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Gestão de Mesas, Deck, Salão e Comandas
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('mesas', 'Gestão de Mesas')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Imprimir somente este capítulo"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('tables')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Abrir Mapa de Mesas</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O módulo de <strong>Gestão de Mesas</strong> monitora o salão, o deck externo, a área VIP e as banquetas do balcão em tempo real. Cada mesa possui indicadores visuais de cor para que os garçons e o caixa saibam instantaneamente o estado exato de cada cliente no estabelecimento.
            </p>

            {/* 4 Status Visuais por Cores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300">
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black text-[10px] uppercase">
                  Livre (Verde)
                </span>
                <p className="text-slate-700 mt-1.5 text-[11px] leading-relaxed">
                  Mesa desocupada e pronta para receber novos clientes. O QR Code da mesa está ativo aguardando abertura de comanda.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300">
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[10px] uppercase">
                  Ocupada (Amarela)
                </span>
                <p className="text-slate-700 mt-1.5 text-[11px] leading-relaxed">
                  Clientes sentados com comanda aberta consumindo. Itens lançados pelo garçom na maquininha ou pelo autoatendimento.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-300">
                <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-950 font-black text-[10px] uppercase">
                  Pediu Conta (Roxo)
                </span>
                <p className="text-slate-700 mt-1.5 text-[11px] leading-relaxed">
                  O cliente solicitou a pré-conta no celular ou chamou o garçom. O caixa já visualiza o extrato pronto para cobrança.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-300">
                <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-950 font-black text-[10px] uppercase">
                  Fechando (Azul)
                </span>
                <p className="text-slate-700 mt-1.5 text-[11px] leading-relaxed">
                  Pagamento sendo processado no balcão ou na maquininha móvel Ton/Stone. Bloqueia novos pedidos até a liberação final.
                </p>
              </div>
            </div>

            {/* Operação Prática das Mesas em 4 Pilares */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">1. Como Lançar Bebidas na Mesa:</strong>
                <p className="leading-relaxed">
                  No PDV Vendas, clique no seletor de <strong>"Mesa"</strong> ou pressione F1. Escolha a mesa desejada no mapa visual. Adicione as bebidas ao carrinho e clique em <strong>"Lançar Pedido na Mesa (F2)"</strong>. O pedido é computado instantaneamente na comanda da mesa e sincronizado em todas as maquininhas da equipe.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">2. Adicionar, Renomear e Customizar Mesas:</strong>
                <p className="leading-relaxed">
                  No painel de Mesas, clique no botão <strong>"+ Adicionar Mesa"</strong> para criar novas mesas conforme seu salão cresce. Em qualquer mesa existente, clique no ícone de lápis para ajustar o número, capacidade de assentos (ex: 4 cadeiras, 8 cadeiras) ou apelido do ambiente (ex: <em>"Deck 01"</em>, <em>"Varanda 03"</em>, <em>"Camarote VIP"</em> ou <em>"Banqueta Balcão"</em>).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">3. Transferência de Itens & Junção de Mesas:</strong>
                <p className="leading-relaxed">
                  Quando clientes mudam de mesa ou juntam dois grupos em uma mesa maior, abra a mesa de origem, selecione a opção <strong>"Transferir Itens"</strong> e aponte para a mesa de destino. O saldo e histórico são transferidos sem duplicidades nem perdas de lançamento.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">4. Fechamento de Conta, Divisão por Amigos & 10% Opcional:</strong>
                <p className="leading-relaxed">
                  Clique em <strong>"Fechar Conta"</strong>. O sistema detalha os produtos consumidos, permite ativar ou desativar a taxa de serviço (10% sugerida) com um toque e calcula a divisão do valor pelo número de pessoas na mesa (ex: Total R$ 180 / 4 pessoas = R$ 45,00 cada). Ao escolher PIX, a tela gera o QR Code oficial da comanda. Ao confirmar, a mesa retorna instantaneamente ao status <strong>Livre (Verde)</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 05: CARDÁPIO DIGITAL QR CODE (AUTOATENDIMENTO)                     */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'cardapio') && (
          <div id="sec-cardapio" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-purple-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Módulo 05</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Cardápio Digital QR Code: Autoatendimento na Mesa sem Baixar Aplicativo
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('cardapio', 'Cardápio Digital')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Imprimir somente este capítulo"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('menu')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Ver Cardápio Digital</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O <strong>Cardápio Digital QR Code</strong> moderniza o salão e elimina o custo com cardápios físicos de papel que se desgastam ou ficam com preços desatualizados. O cliente aponta a câmera nativa do seu smartphone (iPhone ou Android) para a plaquinha da mesa e pede suas bebidas com rapidez, conforto e total autonomia.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <h3 className="font-bold text-purple-950 text-sm flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-700" />
                  <span>100% Web: Sem Baixar App</span>
                </h3>
                <p className="text-purple-900 leading-relaxed">
                  O cliente não precisa baixar nada na Google Play ou App Store nem fazer cadastros longos. O cardápio abre em menos de 1 segundo no navegador móvel com interface ultra-leve e fluida.
                </p>
                <div className="p-1.5 bg-white/80 rounded-lg text-[10px] text-purple-950 font-medium">
                  ✔ Zero atrito para o cliente começar a consumir.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <h3 className="font-bold text-purple-950 text-sm flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-700" />
                  <span>Identificação da Mesa</span>
                </h3>
                <p className="text-purple-900 leading-relaxed">
                  Cada plaquinha QR Code possui a chave da respectiva mesa gravada no link. Ao enviar a sacola, o pedido é endereçado automaticamente para a comanda daquela mesa (ex: <em>Mesa 05 - Deck</em>).
                </p>
                <div className="p-1.5 bg-white/80 rounded-lg text-[10px] text-purple-950 font-medium">
                  ✔ Entrega precisa e sem troca de comandas.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                <h3 className="font-bold text-purple-950 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  <span>Alerta Sonoro no Bar</span>
                </h3>
                <p className="text-purple-900 leading-relaxed">
                  Assim que o cliente toca em "Enviar Pedido", o painel do bar e do caixa emite um sinal sonoro claro e exibe o pop-up com as bebidas solicitadas para o garçom apenas retirar na geladeira e levar.
                </p>
                <div className="p-1.5 bg-white/80 rounded-lg text-[10px] text-purple-950 font-medium">
                  ✔ Agilidade recorde no atendimento.
                </div>
              </div>
            </div>

            {/* Ciclo Prático do Autoatendimento */}
            <div className="avoid-page-break p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Passo a Passo da Jornada do Cliente no Salão:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed">
                <li>
                  <strong>Leitura do QR Code:</strong> O cliente senta na mesa e aponta a câmera do smartphone para o display acrílico.
                </li>
                <li>
                  <strong>Navegação Visual:</strong> Ele visualiza as fotos em alta definição, preços de doses, garrafas e combos promocionais divididos por categorias (Cervejas, Destilados, Sucos, Gelo).
                </li>
                <li>
                  <strong>Montagem da Sacola:</strong> O cliente seleciona as bebidas, ajusta as quantidades desejadas e confere o subtotal.
                </li>
                <li>
                  <strong>Envio Imediato:</strong> Ao clicar em <strong>"Enviar Pedido para a Mesa"</strong>, o pedido entra na comanda ativa e o bar é alertado na hora para servir as bebidas geladas.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 06: EDIÇÃO & CUSTOMIZAÇÃO DO CARDÁPIO DIGITAL                      */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'edicao_cardapio') && (
          <div id="sec-edicao_cardapio" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-amber-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Módulo 06</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Edição & Customização do Cardápio Digital Oficial
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('edicao_cardapio', 'Edição do Cardápio')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Imprimir somente este capítulo"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('settings')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Configurações & Visual</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O Cardápio Digital é o cartão de visitas da sua distribuidora. Você pode personalizar 100% da identidade da sua marca, definir fotos de capa temáticas em alta definição, inserir o logotipo da loja, horários de atendimento, parâmetros de delivery e gerar as folhas com plaquinhas QR Code para impressão gráfica em tamanho A4.
            </p>

            {/* 3 Pilares de Customização Didáticos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                  1
                </div>
                <h3 className="font-bold text-sm text-slate-900">Foto de Capa & Logotipo da Loja</h3>
                <p className="text-slate-600 leading-relaxed">
                  No menu <strong>"Configurações da Empresa"</strong> ou direto no cabeçalho do Cardápio Digital, clique em <strong>"Trocar Foto de Capa"</strong>. Selecione um banner de alta definição da vitrine ou informe uma imagem real da sua fachada. Faça upload do seu logo para criar autoridade de marca diante dos clientes.
                </p>
                <div className="p-1.5 bg-white rounded-lg text-[10px] text-amber-950 font-medium border border-amber-200">
                  ✔ Visual premium que estimula pedidos de maior valor.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                  2
                </div>
                <h3 className="font-bold text-sm text-slate-900">Horários, Delivery & WhatsApp</h3>
                <p className="text-slate-600 leading-relaxed">
                  Informe o horário de expediente (ex: Seg a Dom das 10h às 02h) e o número do WhatsApp com link automático de conversa. Configure a <strong>Taxa de Entrega padrão</strong> (ex: R$ 10,00), o valor do <strong>Pedido Mínimo</strong> (ex: R$ 30,00) e a estimativa de tempo (ex: 30 a 45 min).
                </p>
                <div className="p-1.5 bg-white rounded-lg text-[10px] text-amber-950 font-medium border border-amber-200">
                  ✔ Pedidos de tele-entrega recebidos sem intermediários.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                  3
                </div>
                <h3 className="font-bold text-sm text-slate-900">Impressão de Plaquinhas A4 em Lote</h3>
                <p className="text-slate-600 leading-relaxed">
                  No menu <strong>"Gestão de Mesas"</strong>, clique em <strong>"Gerenciar Placas QR Code"</strong>. O sistema monta uma folha A4 diagramada com todos os códigos individuais das mesas e do balcão já com a moldura e instrução de leitura, pronta para imprimir em papel sulfite/couchê e plastificar em displays acrílicos.
                </p>
                <div className="p-1.5 bg-white rounded-lg text-[10px] text-amber-950 font-medium border border-amber-200">
                  ✔ Economia de centenas de reais em gráficas externas.
                </div>
              </div>
            </div>

            {/* Destaque Legal e Prático */}
            <div className="avoid-page-break p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Classificação Indicativa & Destaque de Produtos Campeões:</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                O sistema insere automaticamente o selo oficial <strong>"+18"</strong> nas bebidas alcoólicas cadastradas, atendendo à legislação brasileira. Você pode organizar as categorias no menu (ex: Cervejas Geladas no topo, seguido de Destilados, Refrigerantes e Gelo) para priorizar os produtos de maior margem e saída.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 07: PRODUTOS, CATEGORIAS & MARGEM DE LUCRO                         */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'produtos') && (
          <div id="sec-produtos" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-teal-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Módulo 07</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Produtos, Categorias & Margem de Lucro em Tempo Real
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('produtos', 'Produtos e Categorias')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Imprimir somente este capítulo"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('products')}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Gerenciar Catálogo</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Mantenha o catálogo de bebidas da sua distribuidora sempre atualizado. O cadastro inteligente calcula a margem bruta de cada item, avisa automaticamente quando o estoque mínimo de segurança for atingido e sincroniza os preços instantaneamente com o balcão, as maquininhas e o cardápio digital.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-black flex items-center justify-center">
                  1
                </div>
                <strong className="text-slate-900 block font-bold text-sm">Dados Básicos & Volume</strong>
                <p className="text-slate-600 leading-relaxed">
                  Acesse <strong>"Produtos & Categorias"</strong> &gt; <strong>"+ Cadastrar Produto"</strong>. Digite o nome (ex: <em>"Heineken 600ml"</em>) e vincule à categoria (Cervejas, Destilados, Vinhos, Sucos, Gelo).
                </p>
                <div className="p-1 bg-white rounded text-[10px] text-teal-800 font-medium">
                  Volume: 350ml, 600ml, Litro ou Fardo.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-black flex items-center justify-center">
                  2
                </div>
                <strong className="text-slate-900 block font-bold text-sm">Preço de Custo x Venda</strong>
                <p className="text-slate-600 leading-relaxed">
                  Informe o custo de aquisição da cervejaria e o preço de venda no balcão. O sistema calcula a sua <strong>Margem de Lucro (%)</strong> e o ganho em reais por garrafa na mesma hora.
                </p>
                <div className="p-1 bg-white rounded text-[10px] text-teal-800 font-medium">
                  Controle exato da lucratividade do item.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-black flex items-center justify-center">
                  3
                </div>
                <strong className="text-slate-900 block font-bold text-sm">Código de Barras & 2 Dígitos</strong>
                <p className="text-slate-600 leading-relaxed">
                  Cadastre o código EAN-13 original para bipar com leitor ou defina um código rápido de 2 dígitos (ex: "01", "02"). O operador digita "01" + ENTER e a venda é lançada em segundos.
                </p>
                <div className="p-1 bg-white rounded text-[10px] text-teal-800 font-medium">
                  Agilidade máxima no horário de pico.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-black flex items-center justify-center">
                  4
                </div>
                <strong className="text-slate-900 block font-bold text-sm">Alerta de Estoque Mínimo</strong>
                <p className="text-slate-600 leading-relaxed">
                  Defina o limite de segurança (ex: 24 unidades). Quando o estoque atingir essa quantidade, o sistema acende um alerta visual amarelo/vermelho indicando a hora exata de pedir mais ao fornecedor.
                </p>
                <div className="p-1 bg-white rounded text-[10px] text-teal-800 font-medium">
                  Evite a falta de cerveja gelada no fim de semana.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 08: ESTOQUE DE VAREJO & MÓDULO ATACADO (B2B)                       */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'estoque_atacado') && (
          <div id="sec-estoque_atacado" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-rose-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Módulo 08</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Estoque de Varejo & Módulo de Vendas no Atacado (B2B)
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('estoque_atacado', 'Estoque e Atacado')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Imprimir somente este capítulo"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('stock')}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Acessar Estoque & Atacado</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O BebêAqui unifica a operação para distribuidoras que vendem bebidas avulsas no balcão e volumes pesados no atacado para outros negócios. O módulo integra o <strong>Estoque do Galpão</strong> com o <strong>Módulo Atacado B2B</strong>, evitando divergências entre o estoque de loja e o depósito central.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Varejo & Galpão */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Gestão do Estoque do Galpão (Varejo & Depósito)</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Controle saldos em unidades individuais, caixas fechadas e fardos. Sempre que o caminhão da fábrica descarregar, clique em <strong>"+ Entrada de Mercadoria"</strong> para alimentar os saldos.
                </p>
                <div className="space-y-1.5 text-slate-700">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <strong className="block text-slate-900">Registro de Avarias & Perdas:</strong>
                    <span>Quebrou garrafa ou estufou lata? Registre a baixa indicando o motivo e o operador para manter a auditoria limpa.</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <strong className="block text-slate-900">Auditoria Física vs Sistema:</strong>
                    <span>Compare a contagem física das prateleiras com o saldo registrado no BebêAqui para evitar desvios no depósito.</span>
                  </div>
                </div>
              </div>

              {/* Atacado B2B */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Vendas no Atacado B2B (Grandes Volumes)</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Cadastre clientes corporativos (bares parceiros, restaurantes, organizadores de eventos, casas noturnas e buffets). Lance pedidos de fardos e paletes com tabela de preços diferenciada para atacado.
                </p>
                <div className="space-y-1.5 text-slate-700">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <strong className="block text-slate-900">Faturamento & Prazos Flexíveis:</strong>
                    <span>Configure condições de pagamento adequadas para cada parceiro: À vista, 7 dias, 14 dias ou 28 dias faturado.</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <strong className="block text-slate-900">Rastreamento do Fluxo do Pedido:</strong>
                    <span>Acompanhe as fases em tempo real: Pendente &rarr; Confirmado &rarr; Separação &rarr; Rota de Entrega &rarr; Entregue.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 09: EXTRATO DOS MESES PASSADOS & FINANCEIRO                       */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'extrato') && (
          <div id="sec-extrato" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-amber-600 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Módulo 09</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Extrato dos Meses Passados & Relatórios Financeiros Consolidados
                  </h2>
                </div>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSingleChapter('extrato', 'Extrato dos Meses Passados')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Imprimir somente este capítulo"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Módulo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('statement')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Abrir Extrato Retroativo</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              O módulo de <strong>Extrato Consolidado</strong> apresenta o histórico financeiro retroativo da sua distribuidora mês a mês. Você pode voltar em qualquer mês do ano para avaliar o crescimento real das vendas, margem de lucratividade, despesas operacionais e exportar planilhas para a contabilidade com total transparência.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span>Os 4 Grandes Indicadores Financeiros do Extrato Mensal:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">1. Faturamento Bruto por Meio de Pagamento:</strong>
                    <span className="text-slate-600">Total arrecadado no mês com separação transparente: quanto entrou via PIX, quanto em Cartão de Débito, Cartão de Crédito e Dinheiro em espécie na gaveta.</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">2. CMV (Custo das Mercadorias Vendidas):</strong>
                    <span className="text-slate-600">O valor exato pago pelas bebidas aos fornecedores e cervejarias para gerar aquele faturamento, demonstrando seu custo direto de produtos.</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">3. Lucro Líquido Real & Margem Efetiva:</strong>
                    <span className="text-slate-600">O resultado financeiro limpo após descontar custos de bebidas e despesas operacionais da distribuidora (aluguel, energia e equipe).</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">4. Exportação CSV & Excel para Contador:</strong>
                    <span className="text-slate-600">Gere arquivos compatíveis com Excel e sistemas contábeis com um clique para envio de impostos, balanço fiscal e escrituração.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MÓDULO 10: GUIA DE BOLSO / COLA RÁPIDA DO CAIXA                           */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'cola_caixa') && (
          <div id="sec-cola_caixa" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-indigo-500 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Módulo 10</span>
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
        {/* MÓDULO 11: PERGUNTAS FREQUENTES (FAQ)                                     */}
        {/* ========================================================================= */}
        {(printFilter === 'all' || printFilter === 'faq') && (
          <div id="sec-faq" className="page-break-before space-y-5 pt-4">
            <div className="flex items-start justify-between gap-4 border-b-2 border-slate-400 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Módulo 11</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    Perguntas Frequentes (FAQ) & Procedimentos Operacionais
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
                  Acesse <strong>"Configurações & PIX"</strong>. Cadastre a chave PIX da sua distribuidora (CPF, Celular, CNPJ, E-mail ou Aleatória). O sistema valida a chave e garante que todos os QR Codes emitidos no PDV, nas Mesas e nas Maquininhas caiam exclusivamente na sua conta.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">3. Não tenho CNPJ. Posso me cadastrar e usar o sistema com CPF?</strong>
                <p className="text-slate-600 leading-relaxed">
                  Com certeza! O BebêAqui possui a opção <strong>"Cadastro por CPF"</strong> logo no início. Pequenas adegas, depósitos familiares e distribuidores autônomos têm acesso completo a todos os módulos (PDV, mesas, comandas, estoque, cardápio digital e relatórios) com os mesmos recursos de quem tem CNPJ.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">4. A Chave PIX única também funciona no Modo Maquininha?</strong>
                <p className="text-slate-600 leading-relaxed">
                  Sim, 100%! Quando o operador da maquininha Ton ou Stone registrar os produtos e escolher <strong>PIX</strong>, o sistema gera o QR Code oficial escaneável na própria tela da maquininha com a chave cadastrada da distribuidora. O valor cai imediatamente na sua conta sem retenção de terceiros.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">5. Como escolher o melhor plano para a minha distribuidora?</strong>
                <p className="text-slate-600 leading-relaxed">
                  O BebêAqui oferece opções sob medida para cada estágio do seu negócio: o <strong>Plano Distribuidora</strong> (para atendimento ágil de balcão, mesas, comandas e delivery), o <strong>Plano Atacado B2B</strong> (para faturamento em fardos/caixas e clientes PJ) e o <strong>Plano Integrado Distribuidora + Atacado</strong> (o combo definitivo com estoque unificado). Você pode consultar e alternar seu plano a qualquer momento no menu "Planos & Assinaturas".
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">6. Como funciona o carregamento de fotos do cardápio e produtos?</strong>
                <p className="text-slate-600 leading-relaxed">
                  O catálogo do BebêAqui possui armazenamento inteligente de fotos em alta resolução. Caso a conexão de internet do cliente ou garçom oscile no momento do pedido, o sistema exibe instantaneamente imagens e ícones representativos da categoria, garantindo que o atendimento nunca seja interrompido.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 text-sm block font-bold">7. Como limitar o acesso de operadores para não verem o lucro?</strong>
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
