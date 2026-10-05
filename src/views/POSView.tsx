import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Table, PaymentMethod, Company } from '../types';
import { initialProducts } from '../data/initialData';
import { TableQrModal } from '../components/TableQrModal';
import { QRCodeSVG } from 'qrcode.react';
import { generatePixPayload } from '../utils/pix';
import {
  Store,
  UtensilsCrossed,
  ClipboardCheck,
  BookOpen,
  Bike,
  CircleDollarSign,
  Settings,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  Printer,
  RotateCcw,
  User,
  Clock,
  AlertTriangle,
  X,
  Check,
  Scale,
  ShoppingBag,
  Flame,
  Sparkles,
  Beer,
  Wine,
  CupSoda,
  Snowflake,
  Package,
  FileText,
  DollarSign,
  Cloud,
  ChevronRight,
  MoreHorizontal,
  Percent,
  Tag,
  SlidersHorizontal,
  Barcode,
  Sparkle,
  Users,
  Receipt,
  PlusCircle,
  ArrowLeft,
  Pencil,
  Send,
  Copy,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

interface SplitPaymentRecord {
  id: string;
  method: PaymentMethod;
  methodLabel: string;
  amount: number;
}

export const POSView: React.FC = () => {
  const {
    products,
    categories,
    tables,
    orders,
    addTable,
    updateTable,
    deleteTable,
    closeTableBill,
    updateTableStatus,
    updateOrderStatus,
    createDirectOrder,
    activeCompany,
    companies,
    updateBankDetails,
    updateCompanyInfo,
    employees,
    currentUser,
    seedSampleProducts,
    setActivePage,
    addToast
  } = useApp();

  // Text normalizer to ignore accents, uppercase and extra spaces
  const normalizeStr = (str: string): string => {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  // Top Bar Tab Mode: 'venda' | 'mesa' | 'comanda' | 'cardapio' | 'delivery' | 'caixa'
  const [activeTab, setActiveTab] = useState<'venda' | 'mesa' | 'comanda' | 'cardapio' | 'delivery' | 'caixa'>('venda');
  const [selectedComandaNumber, setSelectedComandaNumber] = useState<string>('01');

  // Table Management States (for 'mesa' tab and table linkage)
  const [tableFilter, setTableFilter] = useState<'all' | 'available' | 'occupied' | 'closing'>('all');
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState<number>(() => {
    const maxNum = (tables || []).reduce((max, t) => Math.max(max, t.number), 0);
    return maxNum + 1;
  });
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');
  const [selectedTableForDetails, setSelectedTableForDetails] = useState<Table | null>(null);
  const [isCloseTableModalOpen, setIsCloseTableModalOpen] = useState(false);
  const [closeTablePaymentMethod, setCloseTablePaymentMethod] = useState<PaymentMethod>('pix');
  const [isTableQrModalOpen, setIsTableQrModalOpen] = useState(false);
  const [tableForQr, setTableForQr] = useState<Table | null>(null);
  const [tableDrinkSearchInput, setTableDrinkSearchInput] = useState('');

  // Table Selection & Edit/Delete States
  const [isSelectTableModalOpen, setIsSelectTableModalOpen] = useState(false);
  const [showFullHallView, setShowFullHallView] = useState(false);
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<Table | null>(null);
  const [editTableNumber, setEditTableNumber] = useState<number>(1);
  const [editTableName, setEditTableName] = useState('');
  const [editTableCapacity, setEditTableCapacity] = useState('4');
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  // Service fee & discount for closing table bill
  const [tableServiceFeeMode, setTableServiceFeeMode] = useState<'percent' | 'fixed'>('percent');
  const [tableServiceFeePercent, setTableServiceFeePercent] = useState<number>(() => {
    try {
      return localStorage.getItem('bebeaqui_pos_auto_service') === 'true'
        ? parseFloat(localStorage.getItem('bebeaqui_pos_auto_service_val') || '10')
        : 10;
    } catch {
      return 10;
    }
  });
  const [tableServiceFeeFixed, setTableServiceFeeFixed] = useState<number>(0);
  const [isTableAutoServiceEnabled, setIsTableAutoServiceEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bebeaqui_pos_auto_service') === 'true';
    } catch {
      return true;
    }
  });

  const [tableDiscountMode, setTableDiscountMode] = useState<'percent' | 'fixed'>('percent');
  const [tableDiscountPercent, setTableDiscountPercent] = useState<number>(() => {
    try {
      return localStorage.getItem('bebeaqui_pos_auto_discount') === 'true'
        ? parseFloat(localStorage.getItem('bebeaqui_pos_auto_discount_val') || '5')
        : 0;
    } catch {
      return 0;
    }
  });
  const [tableDiscountAmount, setTableDiscountAmount] = useState<number>(0);
  const [isTableAutoDiscountEnabled, setIsTableAutoDiscountEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bebeaqui_pos_auto_discount') === 'true';
    } catch {
      return false;
    }
  });

  // Table helpers & filters
  const availableTables = useMemo(() => tables.filter(t => t.status === 'available'), [tables]);
  const occupiedTables = useMemo(() => tables.filter(t => t.status === 'occupied'), [tables]);
  const closingTables = useMemo(() => tables.filter(t => t.status === 'closing'), [tables]);

  const filteredTablesList = useMemo(() => {
    let list = tables;
    if (tableFilter === 'available') list = availableTables;
    else if (tableFilter === 'occupied') list = occupiedTables;
    else if (tableFilter === 'closing') list = closingTables;

    if (tableSearchTerm.trim()) {
      const q = normalizeStr(tableSearchTerm);
      list = list.filter(t => 
        t.number.toString().includes(q) ||
        normalizeStr(t.name).includes(q)
      );
    }
    return [...list].sort((a, b) => a.number - b.number);
  }, [tables, tableFilter, tableSearchTerm, availableTables, occupiedTables, closingTables]);

  const getTableOrders = (tableNum: number) => {
    return orders.filter(o => o.tableNumber === tableNum && o.status !== 'cancelled' && o.status !== 'delivered');
  };

  const getTableTotal = (tableNum: number) => {
    return getTableOrders(tableNum).reduce((sum, o) => sum + o.total, 0);
  };

  // Selected table comanda calculation
  const selectedTableOrders = useMemo(() => {
    if (!selectedTableForDetails) return [];
    return orders.filter(
      o => o.tableNumber === selectedTableForDetails.number && o.status !== 'cancelled' && o.status !== 'delivered'
    );
  }, [orders, selectedTableForDetails]);

  const selectedTableSubtotal = useMemo(() => {
    return selectedTableOrders.reduce((sum, o) => sum + o.total, 0);
  }, [selectedTableOrders]);

  const selectedTableServiceVal = useMemo(() => {
    if (tableServiceFeeMode === 'fixed') return tableServiceFeeFixed;
    return (selectedTableSubtotal * tableServiceFeePercent) / 100;
  }, [selectedTableSubtotal, tableServiceFeeMode, tableServiceFeePercent, tableServiceFeeFixed]);

  const selectedTableDiscountVal = useMemo(() => {
    if (tableDiscountMode === 'percent') return (selectedTableSubtotal * tableDiscountPercent) / 100;
    return tableDiscountAmount;
  }, [selectedTableSubtotal, tableDiscountMode, tableDiscountPercent, tableDiscountAmount]);

  const selectedTableFinalTotal = useMemo(() => {
    return Math.max(0, selectedTableSubtotal + selectedTableServiceVal - selectedTableDiscountVal);
  }, [selectedTableSubtotal, selectedTableServiceVal, selectedTableDiscountVal]);

  // Live drink suggestions for table comanda
  const tableDrinkSuggestions = useMemo(() => {
    const list = products.length > 0 ? products : initialProducts;
    const activeList = list.filter(p => p.active !== false);
    const q = normalizeStr(tableDrinkSearchInput);
    if (!q) return activeList.slice(0, 10);
    const tokens = q.split(/\s+/).filter(Boolean);
    return activeList.filter(p => {
      const nameNorm = normalizeStr(p.name);
      const codeNorm = normalizeStr(p.code || '');
      const barcodeNorm = (p.barcode || '').trim();
      const volumeNorm = normalizeStr(p.volume || '');
      return tokens.every(tok =>
        nameNorm.includes(tok) ||
        codeNorm.includes(tok) ||
        barcodeNorm.includes(tok) ||
        volumeNorm.includes(tok)
      );
    }).slice(0, 10);
  }, [tableDrinkSearchInput, products]);

  const handleSelectTableForPOS = (table: Table) => {
    setSelectedTableNumber(table.number);
    setCustomerName(`Mesa ${table.number} (${table.name})`);
    setActiveTab('venda');
    setShowFullHallView(false);
    setIsSelectTableModalOpen(false);
    addToast('success', `Mesa ${table.number} Ativada!`, `Agora escolha os produtos no catálogo e clique em "Lançar Pedido na Mesa ${table.number}".`);
    codeInputRef.current?.focus();
  };

  const handleLaunchOrderToTable = () => {
    if (!selectedTableNumber) {
      setIsSelectTableModalOpen(true);
      return;
    }
    if (ticketItems.length === 0) {
      addToast('info', 'Nenhum produto selecionado', 'Clique nas bebidas ou bipe códigos de barras para adicionar ao pedido.');
      return;
    }
    const targetTable = tables.find(t => t.number === selectedTableNumber);
    if (!targetTable) {
      addToast('error', 'Mesa não encontrada', 'Selecione uma mesa válida.');
      return;
    }

    createDirectOrder({
      type: 'table',
      tableId: targetTable.id,
      tableNumber: targetTable.number,
      customerName: `Mesa ${targetTable.number}`,
      customerPhone: '',
      items: ticketItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        volume: item.product.volume,
        code: item.product.code
      })),
      subtotal,
      serviceFee: 0,
      deliveryFee: 0,
      discount: 0,
      total: subtotal,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      status: 'preparing',
      waiterName: currentUser?.name || selectedSeller,
      notes: `Lançado no PDV para a Mesa ${targetTable.number}`
    });

    updateTableStatus(targetTable.id, 'occupied');
    const totalQty = ticketItems.reduce((acc, i) => acc + i.quantity, 0);
    addToast(
      'success',
      `Pedido Lançado na Mesa ${targetTable.number}!`,
      `${totalQty} ${totalQty === 1 ? 'item adicionado' : 'itens adicionados'} à comanda da mesa.`
    );
    setTicketItems([]);
  };

  const handleOpenEditTable = (table: Table, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTableToEdit(table);
    setEditTableNumber(table.number);
    setEditTableName(table.name);
    setEditTableCapacity(String(table.capacity || 4));
    setIsEditTableModalOpen(true);
  };

  const handleSaveEditTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableToEdit) return;
    const num = Number(editTableNumber) || tableToEdit.number;
    const name = editTableName.trim() || `Mesa ${num.toString().padStart(2, '0')}`;
    const cap = Number(editTableCapacity) || 4;

    updateTable(tableToEdit.id, {
      number: num,
      name,
      capacity: cap
    });

    if (selectedTableNumber === tableToEdit.number) {
      setSelectedTableNumber(num);
      setCustomerName(`Mesa ${num} (${name})`);
    }

    setIsEditTableModalOpen(false);
    setTableToEdit(null);
    addToast('success', 'Mesa Atualizada!', `${name} (Nº ${num}) atualizada com sucesso.`);
  };

  const handleOpenDeleteTable = (table: Table, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTableToDelete(table);
  };

  const handleConfirmDeleteTable = () => {
    if (!tableToDelete) return;
    if (selectedTableNumber === tableToDelete.number) {
      setSelectedTableNumber(null);
      setCustomerName('Cliente Balcão');
    }
    deleteTable(tableToDelete.id);
    addToast('warning', 'Mesa Excluída', `Mesa ${tableToDelete.number} foi removida.`);
    setTableToDelete(null);
  };

  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(newTableNum) || (tables.length + 1);
    const name = newTableName.trim() || `Mesa ${num.toString().padStart(2, '0')}`;
    const cap = Number(newTableCapacity) || 4;
    addTable(num, name, cap);
    setIsAddTableModalOpen(false);
    setNewTableName('');
    setNewTableNum(num + 1);
    addToast('success', 'Mesa Cadastrada!', `${name} criada com sucesso para ${cap} lugares.`);
  };

  const handleAddDrinkToSelectedTable = (product: Product) => {
    if (!selectedTableForDetails) return;
    createDirectOrder({
      type: 'table',
      tableId: selectedTableForDetails.id,
      tableNumber: selectedTableForDetails.number,
      customerName: `Mesa ${selectedTableForDetails.number}`,
      items: [{
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price
      }],
      subtotal: product.price,
      deliveryFee: 0,
      discount: 0,
      total: product.price,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      status: 'preparing'
    });
    updateTableStatus(selectedTableForDetails.id, 'occupied');
    addToast('success', `${product.name} lançado!`, `Adicionado à comanda da Mesa ${selectedTableForDetails.number}.`);
    setTableDrinkSearchInput('');
  };

  const handleConfirmCloseTableBill = () => {
    if (!selectedTableForDetails) return;
    closeTableBill(selectedTableForDetails.number, closeTablePaymentMethod);
    addToast('success', `Conta da Mesa ${selectedTableForDetails.number} Fechada!`, `Pagamento registrado com sucesso e mesa liberada.`);
    setIsCloseTableModalOpen(false);
    setSelectedTableForDetails(null);
  };

  const handleToggleTableAutoService = (enabled: boolean) => {
    setIsTableAutoServiceEnabled(enabled);
    try {
      localStorage.setItem('bebeaqui_pos_auto_service', String(enabled));
      localStorage.setItem('bebeaqui_pos_auto_service_mode', tableServiceFeeMode);
      localStorage.setItem('bebeaqui_pos_auto_service_val', String(tableServiceFeeMode === 'percent' ? tableServiceFeePercent : tableServiceFeeFixed));
    } catch {}
    if (enabled) {
      addToast('success', 'Taxa Automática Salva', 'Taxa padrão aplicada para as próximas mesas.');
    }
  };

  const handleToggleTableAutoDiscount = (enabled: boolean) => {
    setIsTableAutoDiscountEnabled(enabled);
    try {
      localStorage.setItem('bebeaqui_pos_auto_discount', String(enabled));
      localStorage.setItem('bebeaqui_pos_auto_discount_mode', tableDiscountMode);
      localStorage.setItem('bebeaqui_pos_auto_discount_val', String(tableDiscountMode === 'percent' ? tableDiscountPercent : tableDiscountAmount));
    } catch {}
    if (enabled) {
      addToast('success', 'Desconto Automático Salvo', 'Desconto padrão salvo para as próximas mesas.');
    }
  };

  // Input states (Código + Qtde from datacaixa screenshot)
  const [codeInput, setCodeInput] = useState('');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('todos');
  const [selectedSeller, setSelectedSeller] = useState<string>(() => {
    return currentUser?.name || 'Vendedor Balcão';
  });
  const [customerName, setCustomerName] = useState('Cliente Balcão');

  // Live Auto-complete / Code Suggestions state
  const [isCodeInputFocused, setIsCodeInputFocused] = useState<boolean>(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);

  // Ticket / Sale Items
  const [ticketItems, setTicketItems] = useState<CartItem[]>([]);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);

  // Instant Search Popup Modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocusedIndex, setSearchFocusedIndex] = useState(0);

  // Service Fee State (Percentage or Fixed amount in Reais)
  const [serviceFeeMode, setServiceFeeMode] = useState<'percent' | 'fixed'>('percent');
  const [serviceFeePercent, setServiceFeePercent] = useState<number>(0);
  const [serviceFeeFixed, setServiceFeeFixed] = useState<number>(0);
  const [isAutoServiceEnabled, setIsAutoServiceEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bebeaqui_pos_auto_service') === 'true';
    } catch {
      return false;
    }
  });

  // Discount State (Percentage or Fixed amount in Reais)
  const [discountMode, setDiscountMode] = useState<'percent' | 'fixed'>('percent');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isAutoDiscountEnabled, setIsAutoDiscountEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bebeaqui_pos_auto_discount') === 'true';
    } catch {
      return false;
    }
  });

  // Finalize Sale Modal
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentInputValue, setPaymentInputValue] = useState<string>('');
  const [splitPayments, setSplitPayments] = useState<SplitPaymentRecord[]>([]);
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState<boolean>(true);

  // Unique PIX key and profile for POS sales (defaults to active BebêAqui company)
  const [selectedPosPixProfile, setSelectedPosPixProfile] = useState<string>(() => activeCompany?.id || '');
  const [copiedPosPixCode, setCopiedPosPixCode] = useState<boolean>(false);
  const [isEditingPosPixModalOpen, setIsEditingPosPixModalOpen] = useState<boolean>(false);
  const [posPixCompanyToEdit, setPosPixCompanyToEdit] = useState<Company | null>(null);
  const [posPixEditKey, setPosPixEditKey] = useState<string>('');
  const [posPixEditType, setPosPixEditType] = useState<'cnpj' | 'cpf' | 'email' | 'phone' | 'random'>('phone');
  const [posPixEditBeneficiary, setPosPixEditBeneficiary] = useState<string>('');

  const effectivePosPixData = useMemo(() => {
    const targetComp = companies.find(c => c.id === selectedPosPixProfile) || activeCompany;
    return {
      pixKey: targetComp.bankDetails?.pixKey || '31975346290',
      pixKeyType: targetComp.bankDetails?.pixKeyType || 'phone',
      beneficiaryName: targetComp.bankDetails?.beneficiaryName || targetComp.tradeName,
      companyName: targetComp.tradeName,
      company: targetComp
    };
  }, [selectedPosPixProfile, activeCompany, companies]);

  // Dynamic PIX payload for Closing Tables
  const closeTablePixPayload = useMemo(() => {
    if (!effectivePosPixData.pixKey || selectedTableFinalTotal <= 0) return '';
    return generatePixPayload({
      pixKey: effectivePosPixData.pixKey,
      pixKeyType: effectivePosPixData.pixKeyType,
      merchantName: effectivePosPixData.beneficiaryName,
      merchantCity: effectivePosPixData.company.city || activeCompany.city || 'BRASIL',
      amount: selectedTableFinalTotal,
      txid: `MESA${selectedTableForDetails?.number || '00'}${Date.now().toString().slice(-6)}`
    });
  }, [effectivePosPixData, selectedTableFinalTotal, selectedTableForDetails, activeCompany]);

  const handleCopyPosPix = (payload: string) => {
    if (!payload) return;
    navigator.clipboard.writeText(payload);
    setCopiedPosPixCode(true);
    addToast('success', 'Código PIX Copiado!', 'Cole no app do banco ou envie ao cliente.');
    setTimeout(() => setCopiedPosPixCode(false), 3000);
  };

  const handleOpenEditPosPix = (comp: Company) => {
    setPosPixCompanyToEdit(comp);
    setPosPixEditKey(comp.bankDetails?.pixKey || '');
    setPosPixEditType(comp.bankDetails?.pixKeyType || 'phone');
    setPosPixEditBeneficiary(comp.bankDetails?.beneficiaryName || comp.tradeName || '');
    setIsEditingPosPixModalOpen(true);
  };

  const handleSavePosPix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posPixCompanyToEdit) return;
    const cleanKey = posPixEditKey.trim();
    const cleanBeneficiary = posPixEditBeneficiary.trim() || posPixCompanyToEdit.tradeName;

    if (posPixCompanyToEdit.id === activeCompany.id) {
      updateBankDetails({
        pixKey: cleanKey,
        pixKeyType: posPixEditType,
        beneficiaryName: cleanBeneficiary
      });
    } else {
      updateCompanyInfo({
        ...posPixCompanyToEdit,
        bankDetails: {
          ...posPixCompanyToEdit.bankDetails,
          pixKey: cleanKey,
          pixKeyType: posPixEditType,
          beneficiaryName: cleanBeneficiary
        }
      });
    }

    setIsEditingPosPixModalOpen(false);
    setPosPixCompanyToEdit(null);
    addToast(
      'success',
      'Chave PIX Única Salva!',
      `O perfil "${posPixCompanyToEdit.tradeName}" no BebêAqui agora tem chave exclusiva ${cleanKey}.`
    );
  };

  // Receipt Modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastFinishedOrder, setLastFinishedOrder] = useState<any | null>(null);

  // Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  const codeInputRef = useRef<HTMLInputElement>(null);
  const searchModalInputRef = useRef<HTMLInputElement>(null);
  const suggestionsBoxRef = useRef<HTMLDivElement>(null);

  // Real-time clock ticker
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize automatic service fee and discounts from localStorage if configured
  useEffect(() => {
    try {
      const autoService = localStorage.getItem('bebeaqui_pos_auto_service') === 'true';
      const autoServiceMode = (localStorage.getItem('bebeaqui_pos_auto_service_mode') || 'percent') as 'percent' | 'fixed';
      const autoServiceVal = parseFloat(localStorage.getItem('bebeaqui_pos_auto_service_val') || '10');
      if (autoService) {
        setIsAutoServiceEnabled(true);
        setServiceFeeMode(autoServiceMode);
        if (autoServiceMode === 'percent') {
          setServiceFeePercent(autoServiceVal);
        } else {
          setServiceFeeFixed(autoServiceVal);
        }
      }

      const autoDiscount = localStorage.getItem('bebeaqui_pos_auto_discount') === 'true';
      const autoDiscountMode = (localStorage.getItem('bebeaqui_pos_auto_discount_mode') || 'percent') as 'percent' | 'fixed';
      const autoDiscountVal = parseFloat(localStorage.getItem('bebeaqui_pos_auto_discount_val') || '5');
      if (autoDiscount) {
        setIsAutoDiscountEnabled(true);
        setDiscountMode(autoDiscountMode);
        if (autoDiscountMode === 'percent') {
          setDiscountPercent(autoDiscountVal);
        } else {
          setDiscountAmount(autoDiscountVal);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Toggle Auto Service Handler
  const handleToggleAutoService = (enabled: boolean) => {
    setIsAutoServiceEnabled(enabled);
    try {
      localStorage.setItem('bebeaqui_pos_auto_service', String(enabled));
      localStorage.setItem('bebeaqui_pos_auto_service_mode', serviceFeeMode);
      localStorage.setItem('bebeaqui_pos_auto_service_val', String(serviceFeeMode === 'percent' ? serviceFeePercent : serviceFeeFixed));
    } catch {}
    if (enabled) {
      addToast('success', 'Taxa Automática Ativada', `Taxa de serviço (${serviceFeeMode === 'percent' ? `${serviceFeePercent}%` : `R$ ${serviceFeeFixed.toFixed(2)}`}) padrão configurada.`);
    } else {
      addToast('info', 'Taxa Automática Desativada', 'Taxa de serviço não será aplicada automaticamente.');
    }
  };

  // Toggle Auto Discount Handler
  const handleToggleAutoDiscount = (enabled: boolean) => {
    setIsAutoDiscountEnabled(enabled);
    try {
      localStorage.setItem('bebeaqui_pos_auto_discount', String(enabled));
      localStorage.setItem('bebeaqui_pos_auto_discount_mode', discountMode);
      localStorage.setItem('bebeaqui_pos_auto_discount_val', String(discountMode === 'percent' ? discountPercent : discountAmount));
    } catch {}
    if (enabled) {
      addToast('success', 'Desconto Automático Ativado', `Desconto (${discountMode === 'percent' ? `${discountPercent}%` : `R$ ${discountAmount.toFixed(2)}`}) padrão configurado.`);
    } else {
      addToast('info', 'Desconto Automático Desativado', 'Desconto não será aplicado automaticamente.');
    }
  };

  // Keyboard Shortcuts (F1 Venda, F2 Finalizar, F3 Código/Busca, F4 Imprimir, F5 Mesa, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setSelectedTableNumber(null);
        setCustomerName('Cliente Balcão');
        setShowFullHallView(false);
        setActiveTab('venda');
        addToast('info', 'Modo Venda Balcão', 'Venda direta no caixa sem mesa.');
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (ticketItems.length > 0 && !isFinalizeModalOpen) {
          if (selectedTableNumber) {
            handleLaunchOrderToTable();
          } else {
            handleOpenFinalize();
          }
        }
      } else if (e.key === 'F3') {
        e.preventDefault();
        codeInputRef.current?.focus();
        codeInputRef.current?.select();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (ticketItems.length > 0) {
          handleOpenPreviewReceipt();
        }
      } else if (e.key === 'F5') {
        e.preventDefault();
        setIsSelectTableModalOpen(true);
      } else if (e.key === 'Escape') {
        if (isSelectTableModalOpen) {
          setIsSelectTableModalOpen(false);
        } else if (isEditTableModalOpen) {
          setIsEditTableModalOpen(false);
        } else if (tableToDelete) {
          setTableToDelete(null);
        } else if (isSearchModalOpen) {
          setIsSearchModalOpen(false);
        } else if (isFinalizeModalOpen) {
          setIsFinalizeModalOpen(false);
        } else if (isReceiptModalOpen) {
          setIsReceiptModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ticketItems, isFinalizeModalOpen, isSearchModalOpen, isReceiptModalOpen, selectedTableNumber, isSelectTableModalOpen, isEditTableModalOpen, tableToDelete]);

  // Active products with reliable codes, with fallback to initialProducts if products is empty
  const activeProducts = useMemo(() => {
    const list = products.length > 0 ? products : initialProducts;
    return list.map((p, idx) => ({
      ...p,
      code: p.code || (idx + 1).toString().padStart(2, '0')
    })).filter(p => p.active !== false);
  }, [products]);

  // Datacaixa Category Buttons Configuration (2 Rows of 5 Buttons)
  const categoryButtons = useMemo(() => [
    { id: 'todos', label: 'TODOS', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'cervejas', label: 'CERVEJAS', icon: <Beer className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'refrigerantes', label: 'REFRIGERANTES', icon: <CupSoda className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'energeticos', label: 'ENERGÉTICOS', icon: <Flame className="w-3.5 h-3.5 text-red-400" /> },
    { id: 'destilados', label: 'DESTILADOS', icon: <Wine className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'vodka', label: 'VODKA', icon: <Wine className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'gin_whisky', label: 'GIN & WHISKY', icon: <Wine className="w-3.5 h-3.5 text-amber-300" /> },
    { id: 'cachaca', label: 'CACHAÇA', icon: <Wine className="w-3.5 h-3.5 text-yellow-500" /> },
    { id: 'agua', label: 'ÁGUA', icon: <Snowflake className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'gelo', label: 'GELO & VINHO', icon: <Snowflake className="w-3.5 h-3.5 text-teal-400" /> }
  ], []);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategorySlug === 'todos') return activeProducts;

    return activeProducts.filter(p => {
      const cat = categories.find(c => c.id === p.categoryId);
      const catSlug = cat?.slug?.toLowerCase() || '';

      if (selectedCategorySlug === 'cervejas') {
        return catSlug === 'cervejas';
      }
      if (selectedCategorySlug === 'refrigerantes') {
        return catSlug === 'refrigerantes';
      }
      if (selectedCategorySlug === 'energeticos') {
        return catSlug === 'energeticos';
      }
      if (selectedCategorySlug === 'destilados') {
        return catSlug === 'vodka' || catSlug === 'cachaca' || catSlug === 'gin' || catSlug === 'whisky' || catSlug === 'destilados';
      }
      if (selectedCategorySlug === 'vodka') {
        return catSlug === 'vodka';
      }
      if (selectedCategorySlug === 'gin_whisky') {
        return catSlug === 'gin' || catSlug === 'whisky';
      }
      if (selectedCategorySlug === 'cachaca') {
        return catSlug === 'cachaca';
      }
      if (selectedCategorySlug === 'agua') {
        return catSlug === 'agua';
      }
      if (selectedCategorySlug === 'gelo') {
        return catSlug === 'gelo' || catSlug === 'vinho';
      }
      return catSlug === selectedCategorySlug;
    });
  }, [activeProducts, categories, selectedCategorySlug]);

  // Live Modal Search Filter
  const modalSearchResults = useMemo(() => {
    if (!searchTerm.trim()) return activeProducts;
    const qNorm = normalizeStr(searchTerm);
    const tokens = qNorm.split(/\s+/).filter(Boolean);
    return activeProducts.filter(p => {
      const nameNorm = normalizeStr(p.name);
      const codeNorm = normalizeStr(p.code || '');
      const barcodeNorm = (p.barcode || '').trim();
      const volumeNorm = normalizeStr(p.volume || '');
      return tokens.every(tok =>
        nameNorm.includes(tok) ||
        codeNorm.includes(tok) ||
        barcodeNorm.includes(tok) ||
        volumeNorm.includes(tok)
      );
    });
  }, [activeProducts, searchTerm]);

  // Live suggestions for Código (F3) input (drinks registered in menu/catalog)
  // Supports accent-free matching, multiple words, barcodes, codes, and category names
  const codeSuggestions = useMemo(() => {
    const raw = codeInput.trim();
    if (!raw) return [];
    const qNorm = normalizeStr(raw);
    const tokens = qNorm.split(/\s+/).filter(Boolean);

    return activeProducts.filter(p => {
      const nameNorm = normalizeStr(p.name);
      const codeNorm = normalizeStr(p.code || '');
      const barcodeNorm = (p.barcode || '').trim();
      const volumeNorm = normalizeStr(p.volume || '');

      const cat = categories.find(c => c.id === p.categoryId);
      const catNorm = normalizeStr(cat?.name || cat?.slug || '');

      // Check if all tokens match name, volume, code, or category
      const matchesAllTokens = tokens.length > 0 && tokens.every(tok =>
        nameNorm.includes(tok) ||
        codeNorm.includes(tok) ||
        barcodeNorm.includes(tok) ||
        volumeNorm.includes(tok) ||
        catNorm.includes(tok)
      );

      const matchesBarcode = barcodeNorm.includes(raw);
      const matchesCode = codeNorm === qNorm || codeNorm.includes(qNorm);

      return matchesAllTokens || matchesBarcode || matchesCode;
    }).slice(0, 10);
  }, [codeInput, activeProducts, categories]);

  // Popular quick drink examples to show when input is empty or as live preview pills
  const quickBeverageExamples = useMemo(() => {
    if (codeInput.trim().length > 0) {
      return codeSuggestions.slice(0, 8);
    }
    return activeProducts.slice(0, 8);
  }, [codeInput, codeSuggestions, activeProducts]);

  // Add Item to Ticket
  const handleAddItem = (product: Product, customQty?: number) => {
    const qty = customQty !== undefined ? customQty : (quantityInput > 0 ? quantityInput : 1);
    setTicketItems(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      }
      return [...prev, { product, quantity: qty, unitPrice: product.price }];
    });

    // Reset code input and qty back to 1
    setCodeInput('');
    setQuantityInput(1);
    setIsCodeInputFocused(false);
    setSelectedSuggestionIndex(-1);
    setIsSearchModalOpen(false);
    codeInputRef.current?.focus();
  };

  // Direct Code / Enter Submission
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = codeInput.trim();
    if (!query) {
      setIsSearchModalOpen(true);
      return;
    }

    // If an item is selected from suggestion list via keyboard
    if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < codeSuggestions.length) {
      handleAddItem(codeSuggestions[selectedSuggestionIndex], quantityInput);
      return;
    }

    // Try exact code or barcode match
    const exactMatch = activeProducts.find(
      p => p.code?.toLowerCase() === query.toLowerCase() ||
           p.barcode === query
    );

    if (exactMatch) {
      handleAddItem(exactMatch, quantityInput);
      return;
    }

    // If there are live suggestions matching, pick the first one
    if (codeSuggestions.length > 0) {
      handleAddItem(codeSuggestions[0], quantityInput);
      return;
    }

    // Try normalized name match
    const qNorm = normalizeStr(query);
    const nameMatch = activeProducts.find(p => normalizeStr(p.name).includes(qNorm));
    if (nameMatch) {
      handleAddItem(nameMatch, quantityInput);
      return;
    }

    // Open search modal with current term
    setSearchTerm(query);
    setIsSearchModalOpen(true);
  };

  // Update Item Qty
  const handleUpdateItemQty = (productId: string, delta: number) => {
    setTicketItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Remove Item
  const handleRemoveItem = (productId: string) => {
    setTicketItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Clear Ticket
  const handleClearTicket = () => {
    if (ticketItems.length === 0) return;
    if (window.confirm('Deseja cancelar e limpar os itens do pedido atual?')) {
      setTicketItems([]);
      setSelectedTableNumber(null);
      if (!isAutoServiceEnabled) {
        setServiceFeePercent(0);
        setServiceFeeFixed(0);
      }
      if (!isAutoDiscountEnabled) {
        setDiscountAmount(0);
        setDiscountPercent(0);
      }
      setCustomerName('Cliente Balcão');
      codeInputRef.current?.focus();
      addToast('info', 'Venda cancelada', 'O cupom de venda atual foi limpo.');
    }
  };

  // Financial Calculations
  const subtotal = useMemo(() => {
    return ticketItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [ticketItems]);

  const serviceFeeAmount = useMemo(() => {
    if (serviceFeeMode === 'fixed') {
      return serviceFeeFixed;
    }
    if (serviceFeePercent <= 0) return 0;
    return (subtotal * serviceFeePercent) / 100;
  }, [subtotal, serviceFeeMode, serviceFeePercent, serviceFeeFixed]);

  const effectiveDiscount = useMemo(() => {
    if (discountMode === 'percent') {
      if (discountPercent <= 0) return 0;
      return (subtotal * discountPercent) / 100;
    }
    return discountAmount;
  }, [subtotal, discountMode, discountPercent, discountAmount]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal + serviceFeeAmount - effectiveDiscount);
  }, [subtotal, serviceFeeAmount, effectiveDiscount]);

  const totalPaidSoFar = useMemo(() => {
    return splitPayments.reduce((acc, p) => acc + p.amount, 0);
  }, [splitPayments]);

  const remainingBalance = useMemo(() => {
    return Math.max(0, totalAmount - totalPaidSoFar);
  }, [totalAmount, totalPaidSoFar]);

  // Standard BACEN PIX BR Code Payload (Copia e Cola)
  const posPixPayload = useMemo(() => {
    const amount = parseFloat(paymentInputValue) || remainingBalance || totalAmount;
    if (!effectivePosPixData.pixKey) return '';
    return generatePixPayload({
      pixKey: effectivePosPixData.pixKey,
      pixKeyType: effectivePosPixData.pixKeyType,
      merchantName: effectivePosPixData.beneficiaryName,
      merchantCity: effectivePosPixData.company.city || activeCompany.city || 'BRASIL',
      amount: amount > 0 ? amount : undefined,
      txid: `PDV${Date.now().toString().slice(-8)}`
    });
  }, [effectivePosPixData, activeCompany, paymentInputValue, remainingBalance, totalAmount]);

  // Open Finalize Checkout Modal
  const handleOpenFinalize = () => {
    if (ticketItems.length === 0) {
      addToast('warning', 'Venda vazia', 'Adicione ao menos um item antes de finalizar.');
      return;
    }
    setSplitPayments([]);
    setCurrentPaymentMethod('cash');
    setPaymentInputValue(totalAmount.toFixed(2));
    setChangeAmount(0);
    setIsFinalizeModalOpen(true);
  };

  // Add Partial Payment (from video)
  const handleAddPaymentRecord = () => {
    const val = parseFloat(paymentInputValue.replace(',', '.')) || 0;
    if (val <= 0) {
      addToast('warning', 'Valor inválido', 'Digite o valor recebido.');
      return;
    }

    const methodLabels: Record<PaymentMethod, string> = {
      cash: 'Dinheiro',
      pix: 'PIX',
      credit_card: 'Cartão Crédito',
      debit_card: 'Cartão Débito',
      fiado: 'A Prazo / Fiado',
      multiple: 'Múltiplo'
    };

    if (currentPaymentMethod === 'cash' && val > remainingBalance) {
      const troco = val - remainingBalance;
      setChangeAmount(troco);
      const record: SplitPaymentRecord = {
        id: 'pay_' + Date.now(),
        method: 'cash',
        methodLabel: 'Dinheiro',
        amount: remainingBalance
      };
      setSplitPayments(prev => [...prev, record]);
      setPaymentInputValue('0.00');
    } else {
      const record: SplitPaymentRecord = {
        id: 'pay_' + Date.now(),
        method: currentPaymentMethod,
        methodLabel: methodLabels[currentPaymentMethod] || currentPaymentMethod,
        amount: Math.min(val, remainingBalance)
      };
      setSplitPayments(prev => [...prev, record]);
      const nextRemaining = Math.max(0, remainingBalance - val);
      setPaymentInputValue(nextRemaining > 0 ? nextRemaining.toFixed(2) : '0.00');
      if (val > remainingBalance && currentPaymentMethod === 'cash') {
        setChangeAmount(val - remainingBalance);
      } else {
        setChangeAmount(0);
      }
    }
  };

  const handleRemoveSplitPayment = (id: string) => {
    setSplitPayments(prev => prev.filter(p => p.id !== id));
    setChangeAmount(0);
  };

  // Complete Sale
  const handleConfirmFinishSale = () => {
    if (remainingBalance > 0.01 && splitPayments.length === 0) {
      const finalMethod = currentPaymentMethod;
      const orderObj = executeOrderSave([{
        id: 'pay_1',
        method: finalMethod,
        methodLabel: finalMethod,
        amount: totalAmount
      }]);
      finishFlow(orderObj);
      return;
    }

    if (remainingBalance > 0.01) {
      if (!window.confirm(`Resta um saldo pendente de R$ ${remainingBalance.toFixed(2)}. Deseja lançar o restante como 'A Prazo / Fiado' e concluir?`)) {
        return;
      }
      const completedSplits = [
        ...splitPayments,
        {
          id: 'pay_rem',
          method: 'fiado' as PaymentMethod,
          methodLabel: 'A Prazo / Fiado',
          amount: remainingBalance
        }
      ];
      const orderObj = executeOrderSave(completedSplits);
      finishFlow(orderObj);
      return;
    }

    const orderObj = executeOrderSave(splitPayments);
    finishFlow(orderObj);
  };

  const executeOrderSave = (payments: SplitPaymentRecord[]) => {
    const primaryMethod = payments.length === 1 ? payments[0].method : 'multiple';
    const newOrder = createDirectOrder({
      type: selectedTableNumber ? 'table' : 'counter',
      tableNumber: selectedTableNumber || undefined,
      customerName: customerName || (selectedTableNumber ? `Mesa ${selectedTableNumber}` : 'Cliente Balcão'),
      customerPhone: '',
      items: ticketItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        volume: item.product.volume,
        code: item.product.code
      })),
      subtotal,
      serviceFee: serviceFeeAmount,
      deliveryFee: 0,
      discount: effectiveDiscount,
      total: totalAmount,
      paymentMethod: primaryMethod,
      splitPayments: payments.map(p => ({
        method: p.method,
        methodLabel: p.methodLabel,
        amount: p.amount,
        date: new Date().toISOString()
      })),
      changeFor: changeAmount > 0 ? changeAmount : undefined,
      waiterName: selectedSeller,
      notes: selectedTableNumber ? `Mesa ${selectedTableNumber}` : 'Venda Balcão PDV'
    });

    if (selectedTableNumber) {
      const tbl = tables.find(t => t.number === selectedTableNumber);
      if (tbl) updateTableStatus(tbl.id, 'available');
    }

    return newOrder;
  };

  const finishFlow = (orderObj: any) => {
    setLastFinishedOrder(orderObj);
    setIsFinalizeModalOpen(false);

    setTicketItems([]);
    setSelectedTableNumber(null);
    if (!isAutoServiceEnabled) {
      setServiceFeePercent(0);
      setServiceFeeFixed(0);
    }
    if (!isAutoDiscountEnabled) {
      setDiscountAmount(0);
      setDiscountPercent(0);
    }
    setCustomerName('Cliente Balcão');
    setChangeAmount(0);

    if (autoPrintReceipt) {
      setIsReceiptModalOpen(true);
    } else {
      addToast('success', 'Venda Concluída!', `Cupom #${orderObj.displayId} registrado.`);
    }

    codeInputRef.current?.focus();
  };

  // Preview Receipt
  const handleOpenPreviewReceipt = () => {
    const previewOrder = {
      displayId: '#PRÉ-CONTA',
      createdAt: new Date().toISOString(),
      customerName: customerName || (selectedTableNumber ? `Mesa ${selectedTableNumber}` : 'Cliente Balcão'),
      tableNumber: selectedTableNumber,
      waiterName: selectedSeller,
      items: ticketItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        volume: item.product.volume,
        code: item.product.code
      })),
      subtotal,
      serviceFee: serviceFeeAmount,
      discount: effectiveDiscount,
      total: totalAmount,
      paymentMethod: 'cash',
      splitPayments: []
    };
    setLastFinishedOrder(previewOrder);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] min-h-[640px] bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans select-none">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR (Directly derived from Datacaixa screenshot)             */}
      {/* ========================================================================= */}
      <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Brand & Company Identifiers */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-lg shrink-0">
            🍻
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white uppercase">
                BebêAqui
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                Frente de Caixa
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
              {activeCompany.tradeName} · {activeCompany.phone || '(Balcão)'}
            </p>
          </div>
        </div>

        {/* Center / Right: The Exact Datacaixa Action Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* VENDA Button (Balcão) */}
          <button
            onClick={() => {
              setSelectedTableNumber(null);
              setCustomerName('Cliente Balcão');
              setShowFullHallView(false);
              setActiveTab('venda');
              addToast('info', 'Modo Venda Balcão Ativado', 'Venda direta no balcão sem vincular a nenhuma mesa.');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              !selectedTableNumber && !showFullHallView && activeTab === 'venda'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750'
            }`}
            title="Venda direta no balcão (sem mesa)"
          >
            <Store className="w-4 h-4" />
            <span>Venda Balcão</span>
          </button>

          {/* MESA Button */}
          <button
            onClick={() => {
              setShowFullHallView(false);
              setIsSelectTableModalOpen(true);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedTableNumber
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 font-black'
                : activeTab === 'mesa' && !showFullHallView
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750'
            }`}
            title="Vender para mesa / Escolher mesa"
          >
            <UtensilsCrossed className="w-4 h-4 text-blue-300" />
            <span>{selectedTableNumber ? `Mesa ${selectedTableNumber}` : 'Mesa'}</span>
            {selectedTableNumber ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-900 text-amber-300 font-mono font-bold">
                Ativa
              </span>
            ) : tables.filter(t => t.status === 'occupied').length > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-amber-400 font-mono font-bold">
                {tables.filter(t => t.status === 'occupied').length}
              </span>
            ) : null}
          </button>

          {/* SALÃO DE MESAS (Todas as Mesas) Button */}
          <button
            onClick={() => setShowFullHallView(!showFullHallView)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showFullHallView
                ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750'
            }`}
            title="Painel e visão geral de todas as mesas do salão"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Salão</span>
          </button>

          {/* COMANDA Button */}
          <button
            onClick={() => {
              setShowFullHallView(false);
              setActiveTab('comanda');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'comanda' && !showFullHallView
                ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>Comanda</span>
          </button>

          {/* CARDÁPIO Button (Explicitly requested by user) */}
          <button
            onClick={() => setActivePage('menu')}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-slate-800/90 hover:bg-amber-500/20 hover:text-amber-300 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Abrir Cardápio Digital do Cliente"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Cardápio</span>
          </button>

          {/* DELIVERY Button */}
          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'delivery'
                ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750'
            }`}
          >
            <Bike className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Delivery</span>
          </button>

          {/* CAIXA Button */}
          <button
            onClick={() => setActiveTab('caixa')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'caixa'
                ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750'
            }`}
          >
            <CircleDollarSign className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Caixa</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE (Split Left Grid + Right Ticket Panel OR Mesa Hall View)*/}
      {/* ========================================================================= */}
      {showFullHallView ? (
        /* ========================================================================= */
        /* MESA WORKSPACE: Painel de Controle de Mesas do Salão (PDV)                */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-hidden">
          {/* 1. Header Toolbar for Mesas */}
          <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>Controle de Mesas & Salão</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50 font-mono font-bold">
                    {tables.length} Mesas
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Gerencie mesas, lance pedidos, acompanhe consumo em tempo real e feche contas.
                </p>
              </div>
            </div>

            {/* Actions: + Nova Mesa, QR Codes, Voltar para Venda */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const maxNum = tables.reduce((max, t) => Math.max(max, t.number), 0);
                  setNewTableNum(maxNum + 1);
                  setNewTableName(`Mesa ${(maxNum + 1).toString().padStart(2, '0')}`);
                  setNewTableCapacity('4');
                  setIsAddTableModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Adicionar Nova Mesa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTableForQr(null);
                  setIsTableQrModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Visualizar e imprimir QR Codes das mesas"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">QR Codes</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFullHallView(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Venda (PDV)</span>
              </button>
            </div>
          </div>

          {/* 2. Subbar: Statistics Cards + Filters + Search */}
          <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setTableFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tableFilter === 'all'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                Todas ({tables.length})
              </button>

              <button
                type="button"
                onClick={() => setTableFilter('available')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  tableFilter === 'available'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-emerald-400 hover:bg-slate-750'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Livres ({availableTables.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setTableFilter('occupied')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  tableFilter === 'occupied'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800 text-blue-400 hover:bg-slate-750'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                <span>Ocupadas ({occupiedTables.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setTableFilter('closing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  tableFilter === 'closing'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-800 text-amber-400 hover:bg-slate-750'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span>Fechando ({closingTables.length})</span>
              </button>
            </div>

            {/* Total Aberto in Occupied Tables & Search Input */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400">Total Aberto no Salão:</span>
                <span className="font-mono font-black text-emerald-400">
                  R$ {tables.reduce((sum, t) => sum + getTableTotal(t.number), 0).toFixed(2)}
                </span>
              </div>

              <div className="relative min-w-[200px] sm:min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={tableSearchTerm}
                  onChange={e => setTableSearchTerm(e.target.value)}
                  placeholder="Filtrar por número ou nome..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 focus:border-blue-400 rounded-lg text-xs font-medium text-white placeholder-slate-500 focus:outline-none"
                />
                {tableSearchTerm && (
                  <button
                    onClick={() => setTableSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Main Grid of Tables */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
            {filteredTablesList.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl">
                  🍽️
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nenhuma mesa encontrada</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    {tables.length === 0
                      ? 'Nenhuma mesa cadastrada ainda no salão. Adicione novas mesas para ter controle sobre comandas e pedidos.'
                      : 'Nenhuma mesa corresponde ao filtro ou busca selecionada.'}
                  </p>
                </div>
                {tables.length === 0 ? (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewTableNum(1);
                        setNewTableName('Mesa 01');
                        setNewTableCapacity('4');
                        setIsAddTableModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Mesa 01</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        for (let i = 1; i <= 8; i++) {
                          addTable(i, `Mesa ${i.toString().padStart(2, '0')}`, 4);
                        }
                        addToast('success', 'Mesas Criadas', 'Mesas de 01 a 08 geradas com sucesso!');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                    >
                      <span>Gerar Mesas 01 a 08 Automaticamente</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTableFilter('all');
                      setTableSearchTerm('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5">
                {filteredTablesList.map(table => {
                  const tOrders = getTableOrders(table.number);
                  const tTotal = getTableTotal(table.number);
                  const itemsCount = tOrders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0), 0);

                  return (
                    <div
                      key={table.id}
                      className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 shadow-lg ${
                        table.status === 'occupied'
                          ? 'bg-slate-900/90 border-blue-500/50 hover:border-blue-400 shadow-blue-950/20'
                          : table.status === 'closing'
                          ? 'bg-slate-900/90 border-amber-500/50 hover:border-amber-400 shadow-amber-950/20'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Card Header: Table Number + Status Badge */}
                      <div className="p-3.5 pb-2 border-b border-slate-800/80 flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-white font-mono">
                              Mesa {table.number.toString().padStart(2, '0')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              👥 {table.capacity}p
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-[150px] font-medium mt-0.5">
                            {table.name}
                          </p>
                        </div>

                        {/* Status Badge & Action buttons */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              table.status === 'occupied'
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                                : table.status === 'closing'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {table.status === 'occupied'
                              ? '🔵 Ocupada'
                              : table.status === 'closing'
                              ? '🟠 Fechando'
                              : '🟢 Livre'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditTable(table, e)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer border border-slate-700/60"
                              title="Editar número, nome e capacidade"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenDeleteTable(table, e)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer border border-slate-700/60"
                              title="Apagar / Excluir mesa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Body: Consumption / Items or Available state */}
                      <div className="p-3.5 py-3 flex-1 flex flex-col justify-center">
                        {table.status === 'occupied' || table.status === 'closing' ? (
                          <div className="space-y-1.5">
                            <div className="flex items-baseline justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Consumo Aberto:
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
                              </span>
                            </div>
                            <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                              R$ {tTotal.toFixed(2)}
                            </div>
                            {tOrders.length > 0 && (
                              <p className="text-[10px] text-slate-400 truncate font-mono">
                                Último: {tOrders[tOrders.length - 1].items[0]?.productName || 'Bebida'}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="py-2 text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                            <span className="text-emerald-400/80 text-sm">✓ Pronta para clientes</span>
                            <span className="text-[10px] text-slate-500">Nenhum consumo aberto</span>
                          </div>
                        )}
                      </div>

                      {/* Card Actions Footer */}
                      <div className="p-2.5 pt-2 bg-slate-950/60 rounded-b-2xl border-t border-slate-800/80 flex flex-col gap-1.5">
                        {table.status === 'occupied' || table.status === 'closing' ? (
                          <>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedTableForDetails(table)}
                                className="py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow"
                                title="Ver itens pedidos e lançar bebidas na comanda desta mesa"
                              >
                                <UtensilsCrossed className="w-3.5 h-3.5" />
                                <span>Comanda</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSelectTableForPOS(table)}
                                className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-slate-700 hover:border-amber-500/40 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                title="Carregar no PDV para bipar códigos de barras diretamente nesta mesa"
                              >
                                <Store className="w-3.5 h-3.5 text-amber-400" />
                                <span>Lançar PDV</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTableForDetails(table);
                                  setIsCloseTableModalOpen(true);
                                }}
                                className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Fechar Conta</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setTableForQr(table);
                                  setIsTableQrModalOpen(true);
                                }}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                                title="Ver QR Code do Cardápio desta mesa"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectTableForPOS(table)}
                              className="flex-1 py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Abrir / Vender</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setTableForQr(table);
                                setIsTableQrModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                              title="QR Code do Cardápio"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Deseja realmente remover a Mesa ${table.number} (${table.name})?`)) {
                                  deleteTable(table.id);
                                  addToast('warning', 'Mesa Removida', `Mesa ${table.number} excluída.`);
                                }
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 cursor-pointer"
                              title="Excluir Mesa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* ======================================================================= */}
        {/* LEFT AREA: Categories (2 cols) + Product Grid (3 cols width - Reduzido)  */}
        {/* Diminuído em 3 fileiras/colunas conforme solicitado pelo cliente          */}
        {/* ======================================================================= */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col border-r border-slate-800 overflow-hidden bg-slate-950">
          {/* Top Category Buttons (Compact 2 columns for narrower layout) */}
          <div className="p-2 bg-slate-900/90 border-b border-slate-800 shrink-0">
            <div className="grid grid-cols-2 gap-1.5">
              {categoryButtons.map(cat => {
                const isActive = selectedCategorySlug === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategorySlug(cat.id)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                        : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700/60'
                    }`}
                  >
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid: Reduzido para altura compacta (h-20) e 2 colunas esbeltas */}
          <div className="flex-1 p-2 sm:p-2.5 overflow-y-auto">
            {activeProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl">
                  🍻
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Nenhum produto cadastrado</h3>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                    Carregue as bebidas com 1 clique para operar o caixa.
                  </p>
                </div>
                <button
                  onClick={seedSampleProducts}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Carregar Bebidas</span>
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                Nenhum produto nesta categoria.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {filteredProducts.map(item => {
                  const isOutOfStock = item.stock <= 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => !isOutOfStock && handleAddItem(item)}
                      disabled={isOutOfStock}
                      title={`${item.name} · R$ ${item.price.toFixed(2)}`}
                      className={`group p-1.5 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer relative overflow-hidden active:scale-95 ${
                        isOutOfStock
                          ? 'bg-slate-950/70 border-slate-800 opacity-40 cursor-not-allowed'
                          : 'bg-slate-900 border-slate-800 hover:border-amber-400 hover:bg-slate-850 hover:shadow-lg hover:shadow-amber-500/10'
                      }`}
                    >
                      {/* Top Bar: Icon + Code */}
                      <div className="flex items-start justify-between w-full gap-1">
                        <div className="w-5 h-5 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={e => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-[10px]">
                              {item.alcoholic ? '🍺' : item.name.toLowerCase().includes('gelo') ? '🧊' : item.name.toLowerCase().includes('coxinha') ? '🍗' : '📦'}
                            </span>
                          )}
                        </div>

                        <span className="font-mono text-[8px] font-bold px-1 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          #{item.code}
                        </span>
                      </div>

                      {/* Product Name */}
                      <div className="my-0.5 min-w-0">
                        <h4 className="text-[9px] font-black uppercase text-white truncate leading-tight group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </h4>
                      </div>

                      {/* Price Tag */}
                      <div className="pt-0.5 border-t border-slate-800/80 w-full flex items-center justify-between">
                        <span className="text-[8px] text-slate-500 font-bold">R$</span>
                        <span className="text-[11px] font-black font-mono text-emerald-400 group-hover:text-amber-300">
                          {item.price.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT AREA: Expanded Barcode, Ticket Table, Receber e Refinalizar (9 cols) */}
        {/* Aumentado de 8 para 9 colunas para máximo conforto, clareza e destaque    */}
        {/* ======================================================================= */}
        <div className="lg:col-span-9 xl:col-span-9 flex flex-col bg-slate-900 overflow-hidden">
          {/* Top Barcode & Search Controls */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2.5 shrink-0">
            {/* Comanda Banner when in Comanda mode */}
            {activeTab === 'comanda' && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <ClipboardCheck className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Área da Comanda Presencial (Salão / Balcão)
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      Digite o nome da bebida no campo Código (F3) abaixo para ver exemplos instantâneos e lançar na comanda.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-300">Comanda Nº:</span>
                  <select
                    value={selectedComandaNumber}
                    onChange={e => setSelectedComandaNumber(e.target.value)}
                    className="px-2.5 py-1 bg-slate-950 border border-amber-500/50 rounded-lg text-xs font-mono font-black text-amber-300 focus:outline-none cursor-pointer"
                  >
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'Balcão', 'VIP', 'Piscina'].map(num => (
                      <option key={num} value={num}>Comanda #{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <form onSubmit={handleCodeSubmit} className="flex items-center gap-2">
              {/* Código (F3) / Código de Barras Input with Live Suggestions */}
              <div className="flex-1 relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-amber-400" />
                    <span>
                      {activeTab === 'comanda'
                        ? `Lançar na Comanda #${selectedComandaNumber} — Código de Barras / Código (F3):`
                        : 'Código de Barras / Código (F3):'}
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    Pressione Enter para lançar ou clique na sugestão
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      ref={codeInputRef}
                      type="text"
                      value={codeInput}
                      onChange={e => {
                        setCodeInput(e.target.value);
                        setSelectedSuggestionIndex(-1);
                      }}
                      onFocus={() => setIsCodeInputFocused(true)}
                      onBlur={() => {
                        // Delay closing to allow clicking suggestions
                        setTimeout(() => setIsCodeInputFocused(false), 300);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSelectedSuggestionIndex(prev => Math.min(codeSuggestions.length - 1, prev + 1));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSelectedSuggestionIndex(prev => Math.max(-1, prev - 1));
                        }
                      }}
                      placeholder="Escaneie o código de barras ou digite o nome/código da bebida (ex: Heineken, Brahma, Coca, 01)..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-xl text-xs sm:text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSearchModalOpen(true)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Buscar na lista completa de produtos (F3)"
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Buscar (F3)</span>
                  </button>
                </div>

                {/* ============================================================== */}
                {/* LIVE DROPDOWN: SUGESTÕES DE BEBIDAS DO CARDÁPIO EM TEMPO REAL  */}
                {/* ============================================================== */}
                {(isCodeInputFocused || codeInput.trim().length > 0) && codeInput.trim().length > 0 && (
                  <div
                    ref={suggestionsBoxRef}
                    className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in zoom-in-95"
                  >
                    <div className="p-2 bg-slate-950/90 border-b border-slate-800 text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                      <span>🍻 Bebidas Cadastradas no Cardápio ({codeSuggestions.length} encontradas):</span>
                      <span className="text-slate-400 text-[9px]">Clique para lançar com a quantidade</span>
                    </div>

                    {codeSuggestions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Nenhuma bebida encontrada com "{codeInput}". Digite outro nome ou abra a busca completa com F3.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/80">
                        {codeSuggestions.map((prod, idx) => {
                          const isSelected = selectedSuggestionIndex === idx;
                          return (
                            <div
                              key={prod.id}
                              onMouseDown={() => handleAddItem(prod, quantityInput)}
                              className={`p-2.5 flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected ? 'bg-amber-500/20 text-white' : 'hover:bg-slate-800/90 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0 text-sm overflow-hidden">
                                  {prod.imageUrl ? (
                                    <img src={prod.imageUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{prod.alcoholic ? '🍺' : '🥤'}</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[9px] bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                                      #{prod.code}
                                    </span>
                                    <span className="text-xs font-bold text-white uppercase truncate">
                                      {prod.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                    <span>{prod.volume || 'Unidade'}</span>
                                    <span>·</span>
                                    <span>Estoque: {prod.stock} {prod.unit || 'un'}</span>
                                    {prod.barcode && (
                                      <>
                                        <span>·</span>
                                        <span className="font-mono text-[9px]">Barras: {prod.barcode}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs sm:text-sm font-black font-mono text-emerald-400">
                                  R$ {prod.price.toFixed(2)}
                                </span>
                                <button
                                  type="button"
                                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow"
                                >
                                  <Plus className="w-3 h-3 stroke-[3]" />
                                  <span>Adicionar</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Separator X */}
              <div className="pt-5 text-slate-500 font-bold text-xs">
                ×
              </div>

              {/* Qtde Input with [-] and [+] and [⚖️] */}
              <div className="w-32">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Qtde:
                </label>
                <div className="flex items-center bg-slate-950 border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner">
                  <button
                    type="button"
                    onClick={() => setQuantityInput(prev => Math.max(1, prev - 1))}
                    className="px-2.5 py-2 text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantityInput}
                    onChange={e => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-transparent text-sm font-mono font-black text-amber-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantityInput(prev => prev + 1)}
                    className="px-2.5 py-2 text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => addToast('info', 'Balança Integrada', 'Peso pronto para leitura.')}
                    className="px-2 py-2 border-l border-slate-800 text-slate-400 hover:text-amber-400 cursor-pointer"
                    title="Ler peso da balança"
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>

            {/* ============================================================== */}
            {/* TRAY DE EXEMPLOS DE BEBIDAS CADASTRAIS (Imediato ao digitar)   */}
            {/* ============================================================== */}
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {codeInput.trim().length > 0
                    ? `Bebidas encontradas no cardápio (${quickBeverageExamples.length}):`
                    : 'Exemplos de bebidas cadastradas no cardápio (Clique para adicionar):'}
                </span>
                <span className="text-slate-400 text-[9px] hidden sm:inline">
                  {codeInput.trim().length > 0 ? 'Filtro em tempo real' : 'Mais pedidas no balcão'}
                </span>
              </div>

              {quickBeverageExamples.length === 0 ? (
                <div className="text-[11px] text-slate-500 py-1 italic">
                  Nenhuma bebida cadastrada encontrada para "{codeInput}".
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {quickBeverageExamples.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={() => handleAddItem(p, quantityInput)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-800 hover:border-amber-400/50 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <span>{p.alcoholic ? '🍺' : '🥤'}</span>
                      <span className="font-bold">{p.name}</span>
                      <span className="text-slate-400 text-[10px] font-mono">({p.volume || 'un'})</span>
                      <span className="font-mono font-black text-emerald-400">R$ {p.price.toFixed(2)}</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">+</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Table Notification Banner (When POS is linked to a Table) OR Counter Banner */}
          {selectedTableNumber ? (
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-b-2 border-blue-500/50 px-3.5 py-2.5 flex items-center justify-between shadow-lg shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-300">
                      Mesa {selectedTableNumber} Ativa
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {tables.find(t => t.number === selectedTableNumber)?.name || 'Salão'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Bebidas e produtos bipados serão lançados na comanda desta mesa
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const tbl = tables.find(t => t.number === selectedTableNumber);
                    if (tbl) setSelectedTableForDetails(tbl);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow"
                  title="Ver comandas desta mesa"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Ver Comanda</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSelectTableModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  title="Trocar para outra mesa"
                >
                  Trocar Mesa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTableNumber(null);
                    setCustomerName('Cliente Balcão');
                    addToast('info', 'Mesa Desvinculada', 'Retornado para venda rápida comum no balcão.');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Voltar para venda balcão sem mesa"
                >
                  Voltar Balcão
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-b border-amber-500/30 px-3.5 py-1.5 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Modo Venda Balcão (Venda Direta Sem Mesa)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectTableModalOpen(true)}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer flex items-center gap-1"
              >
                <UtensilsCrossed className="w-3 h-3" />
                <span>Vender para Mesa...</span>
              </button>
            </div>
          )}

          {/* Ticket Table (PRODUTO | QUANTIDADE | UNITÁRIO | TOTAL) - Expanded & Roomy */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/60">
            {/* Table Header with spacious columns */}
            <div className="grid grid-cols-12 bg-slate-900 px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 border-b border-slate-800 shrink-0">
              <span className="col-span-5 flex items-center gap-1.5"><Beer className="w-4 h-4 text-amber-400" /> PRODUTO</span>
              <span className="col-span-3 text-center">QUANTIDADE</span>
              <span className="col-span-2 text-right">UNITÁRIO</span>
              <span className="col-span-2 text-right">TOTAL</span>
            </div>

            {/* Table Rows with generous room and direct quantity adjustment */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-850 p-1.5">
              {ticketItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-600 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xl">
                    <Barcode className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="font-bold text-slate-400 text-sm">Nenhum item lançado na venda atual</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Escaneie o código de barras, digite o nome da bebida no campo acima ou toque nas bebidas do cardápio à esquerda.
                  </p>
                </div>
              ) : (
                ticketItems.map(item => (
                  <div
                    key={item.product.id}
                    className="grid grid-cols-12 px-3 py-2.5 text-xs items-center hover:bg-slate-900/80 rounded-xl transition-colors group"
                  >
                    {/* Produto */}
                    <div className="col-span-5 pr-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-850 text-amber-300 border border-amber-500/20 shrink-0">
                          #{item.product.code}
                        </span>
                        <p className="font-bold text-white uppercase truncate text-xs sm:text-sm">
                          {item.product.name}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 pl-0.5">
                        {item.product.volume || 'Unidade'} · R$ {item.unitPrice.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantidade with inline [-] and [+] buttons */}
                    <div className="col-span-3 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(item.product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                        title="Diminuir quantidade"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-amber-300 text-sm min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(item.product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                        title="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>

                    {/* Unitário */}
                    <div className="col-span-2 text-right font-mono text-slate-300 text-xs sm:text-sm font-semibold">
                      R$ {item.unitPrice.toFixed(2)}
                    </div>

                    {/* Total & Trash */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="font-mono font-black text-emerald-400 text-xs sm:text-sm">
                        R$ {(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Remover item da venda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* VALOR TOTAL DISPLAY & RECEBER E FINALIZAR (Expanded & Prominent)       */}
          {/* ===================================================================== */}
          <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-2.5 shrink-0">
            {/* Quick Service and Discount Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  Subtotal: <strong className="font-mono text-white">R$ {subtotal.toFixed(2)}</strong>
                </span>

                {serviceFeeAmount > 0 && (
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    + Taxa Serviço: R$ {serviceFeeAmount.toFixed(2)} ({serviceFeeMode === 'percent' ? `${serviceFeePercent}%` : 'Fixo'})
                  </span>
                )}

                {effectiveDiscount > 0 && (
                  <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                    - Desconto: R$ {effectiveDiscount.toFixed(2)} ({discountMode === 'percent' ? `${discountPercent}%` : 'R$'})
                  </span>
                )}
              </div>

              {/* Button to quickly adjust service fee and discounts before payment */}
              <button
                type="button"
                onClick={handleOpenFinalize}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ajustar Taxa/Desconto</span>
              </button>
            </div>

            {/* Huge Valor Total Display */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Valor Total da Venda:
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {ticketItems.length} {ticketItems.length === 1 ? 'item' : 'itens'} no pedido
                </span>
              </div>

              <div className="bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-3 sm:p-4 text-right shadow-2xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">
                  Total a Pagar
                </span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                  R$ {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            {selectedTableNumber ? (
              /* MESA MODE ACTIONS */
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-12 gap-2">
                  <button
                    type="button"
                    onClick={handleClearTicket}
                    disabled={ticketItems.length === 0}
                    className="col-span-3 py-3.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/40 disabled:opacity-40 text-xs font-black uppercase transition-all cursor-pointer"
                    title="Limpar itens do pedido atual (Esc)"
                  >
                    Cancelar (Esc)
                  </button>

                  <button
                    type="button"
                    onClick={handleLaunchOrderToTable}
                    disabled={ticketItems.length === 0}
                    className="col-span-9 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/30 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-blue-400"
                    title="Lançar estes produtos na conta da mesa"
                  >
                    <Send className="w-5 h-5 text-white stroke-[2.5]" />
                    <div className="flex flex-col items-center leading-tight">
                      <span className="font-black tracking-wider">Lançar na Mesa {selectedTableNumber} (F2)</span>
                      <span className="text-[10px] text-blue-200 font-bold lowercase tracking-normal">adiciona à comanda sem fechar a conta</span>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const tbl = tables.find(t => t.number === selectedTableNumber);
                      if (tbl) setSelectedTableForDetails(tbl);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-blue-400" />
                    <span>Ver Comanda da Mesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (ticketItems.length > 0) {
                        handleOpenFinalize();
                      } else {
                        const tbl = tables.find(t => t.number === selectedTableNumber);
                        if (tbl) {
                          setSelectedTableForDetails(tbl);
                          setIsCloseTableModalOpen(true);
                        }
                      }
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Receipt className="w-4 h-4 stroke-[2.5]" />
                    <span>Fechar Conta / Receber</span>
                  </button>
                </div>
              </div>
            ) : (
              /* BALCÃO MODE ACTIONS */
              <div className="grid grid-cols-12 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClearTicket}
                  disabled={ticketItems.length === 0}
                  className="col-span-3 sm:col-span-3 py-3.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500/40 disabled:opacity-40 text-xs font-black uppercase transition-all cursor-pointer"
                >
                  Cancelar (Esc)
                </button>

                <button
                  type="button"
                  onClick={handleOpenFinalize}
                  disabled={ticketItems.length === 0}
                  className="col-span-9 sm:col-span-9 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-40 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-emerald-300"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950 stroke-[3]" />
                  <div className="flex flex-col items-center leading-tight">
                    <span className="font-black tracking-wider">Concluir Venda Balcão (F2)</span>
                    <span className="text-[10px] text-slate-900/80 font-bold lowercase tracking-normal">receber pagamento do cliente no balcão</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BOTTOM FOOTER STATUS BAR (Exact Datacaixa Screenshot)                   */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 border-t border-slate-800 px-3 py-1.5 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2 shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <span>Versão BebêAqui 2.4</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">● SERVIDOR ONLINE</span>
          <span className="text-slate-600">|</span>
          <span>Caixa: <strong>CAIXA 01</strong></span>
          <span className="text-slate-600">|</span>
          <span>PDV: <strong>BALCÃO</strong></span>
          <span className="text-slate-600">|</span>
          <span>Usuário: <strong className="text-amber-300">{currentUser?.name || selectedSeller}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span>Impressora: <strong>Térmica 80mm</strong></span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-sky-400">
            <Cloud className="w-3 h-3 text-sky-400" />
            <span>Backup Nuvem OK</span>
          </span>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL: INSTANT SEARCH MODAL ([...] button or typing name)                 */}
      {/* ========================================================================= */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-4 sm:p-5 text-white shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Localizar Produto / Bebida</span>
              </h3>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchModalInputRef}
                autoFocus
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Digite o nome, código (01, 02) ou leia o código de barras..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950">
              {modalSearchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Nenhum produto encontrado.
                </div>
              ) : (
                modalSearchResults.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleAddItem(prod, quantityInput)}
                    className="p-3 text-xs flex items-center justify-between hover:bg-slate-900 cursor-pointer transition-colors"
                  >
                    <div className="pr-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-bold">
                          #{prod.code}
                        </span>
                        <p className="font-bold text-white uppercase truncate">{prod.name}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {prod.volume} · Estoque: {prod.stock} {prod.unit || 'un'}
                      </p>
                    </div>

                    <span className="font-mono font-black text-emerald-400 text-sm shrink-0">
                      R$ {prod.price.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FINALIZAR VENDA COM PAGAMENTO PARCIAL (From user's Datacaixa video) */}
      {/* ========================================================================= */}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 text-white shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Recebimento & Finalização</h3>
                  <p className="text-xs text-slate-400">
                    {selectedTableNumber ? `Mesa #${selectedTableNumber}` : 'Venda Balcão'} · Operador: {currentUser?.name || selectedSeller}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFinalizeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Subtotal</span>
                <span className="font-mono font-bold text-sm text-slate-200">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Serviço</span>
                <span className="font-mono font-bold text-sm text-amber-400">+ R$ {serviceFeeAmount.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Desconto</span>
                <span className="font-mono font-bold text-sm text-red-400">- R$ {effectiveDiscount.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/50">
                <span className="text-[10px] text-emerald-400 uppercase font-black block">Total a Pagar</span>
                <span className="font-mono font-black text-base text-emerald-300">R$ {totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* AJUSTES INTERATIVOS: TAXA DE SERVIÇO & DESCONTOS DA VENDA                 */}
            {/* Permite alterar valores em % ou R$ e definir regras automáticas padrão     */}
            {/* ========================================================================= */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ajuste de Taxa de Serviço & Descontos da Venda</span>
                </span>
                <span className="text-[10px] text-slate-400">Flexível para o caixa e cliente</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. TAXA DE SERVIÇO */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      Taxa de Serviço:
                    </label>
                    {/* Mode: % or R$ */}
                    <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setServiceFeeMode('percent')}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                          serviceFeeMode === 'percent' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        % Porcentagem
                      </button>
                      <button
                        type="button"
                        onClick={() => setServiceFeeMode('fixed')}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                          serviceFeeMode === 'fixed' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        R$ Valor Fixo
                      </button>
                    </div>
                  </div>

                  {/* Input & Value display */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={serviceFeeMode === 'percent' ? (serviceFeePercent || '') : (serviceFeeFixed || '')}
                        onChange={e => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          if (serviceFeeMode === 'percent') {
                            setServiceFeePercent(val);
                          } else {
                            setServiceFeeFixed(val);
                          }
                        }}
                        placeholder={serviceFeeMode === 'percent' ? "0%" : "R$ 0,00"}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
                        {serviceFeeMode === 'percent' ? '%' : 'R$'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                      + R$ {serviceFeeAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {serviceFeeMode === 'percent' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setServiceFeePercent(0)}
                          className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${serviceFeePercent === 0 ? 'bg-slate-800 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          0% (Sem)
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceFeePercent(5)}
                          className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${serviceFeePercent === 5 ? 'bg-slate-800 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          5%
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceFeePercent(10)}
                          className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${serviceFeePercent === 10 ? 'bg-slate-800 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          10% (Padrão)
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceFeePercent(12)}
                          className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${serviceFeePercent === 12 ? 'bg-slate-800 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          12%
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setServiceFeeFixed(0)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          R$ 0
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceFeeFixed(5)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          R$ 5
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceFeeFixed(10)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          R$ 10
                        </button>
                      </>
                    )}
                  </div>

                  {/* Auto Service Checkbox */}
                  <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1.5">
                    <input
                      id="auto-service-check"
                      type="checkbox"
                      checked={isAutoServiceEnabled}
                      onChange={e => handleToggleAutoService(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="auto-service-check" className="text-[10px] text-slate-300 cursor-pointer select-none">
                      Aplicar taxa de serviço automaticamente nas vendas
                    </label>
                  </div>
                </div>

                {/* 2. DESCONTO */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      Desconto na Venda:
                    </label>
                    {/* Mode: % or R$ */}
                    <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setDiscountMode('percent')}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                          discountMode === 'percent' ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        % Porcentagem
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountMode('fixed')}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                          discountMode === 'fixed' ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        R$ Reais
                      </button>
                    </div>
                  </div>

                  {/* Input & Value display */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discountMode === 'percent' ? (discountPercent || '') : (discountAmount || '')}
                        onChange={e => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          if (discountMode === 'percent') {
                            setDiscountPercent(val);
                          } else {
                            setDiscountAmount(val);
                          }
                        }}
                        placeholder={discountMode === 'percent' ? "0%" : "R$ 0,00"}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-red-400 focus:outline-none focus:border-red-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
                        {discountMode === 'percent' ? '%' : 'R$'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-400 shrink-0">
                      - R$ {effectiveDiscount.toFixed(2)}
                    </span>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {discountMode === 'percent' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setDiscountPercent(0)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          Zerar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountPercent(3)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          3%
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountPercent(5)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          5%
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountPercent(10)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          10%
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountPercent(15)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          15%
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setDiscountAmount(0)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          Zerar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountAmount(2)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          R$ 2
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountAmount(5)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          R$ 5
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountAmount(10)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          R$ 10
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountAmount(20)}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 cursor-pointer"
                        >
                          R$ 20
                        </button>
                      </>
                    )}
                  </div>

                  {/* Auto Discount Checkbox */}
                  <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1.5">
                    <input
                      id="auto-discount-check"
                      type="checkbox"
                      checked={isAutoDiscountEnabled}
                      onChange={e => handleToggleAutoDiscount(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-red-500 bg-slate-950 border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="auto-discount-check" className="text-[10px] text-slate-300 cursor-pointer select-none">
                      Aplicar desconto automaticamente nas vendas
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagamento Parcial & Saldo Restante */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Status do Recebimento:</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    Recebido: <strong className="text-emerald-400 font-mono">R$ {totalPaidSoFar.toFixed(2)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Restante: <strong className={`font-mono ${remainingBalance > 0 ? 'text-amber-400 font-black' : 'text-emerald-400'}`}>
                      R$ {remainingBalance.toFixed(2)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Registered Splits */}
              {splitPayments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {splitPayments.map(p => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <span className="font-bold text-amber-300">{p.methodLabel}:</span>
                      <span className="font-mono font-bold text-emerald-400">R$ {p.amount.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSplitPayment(p.id)}
                        className="text-slate-500 hover:text-red-400 ml-1 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Forma de Pagamento:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'cash', label: 'Dinheiro', icon: <Banknote className="w-4 h-4 text-emerald-400" /> },
                  { id: 'pix', label: 'PIX', icon: <QrCode className="w-4 h-4 text-teal-400" /> },
                  { id: 'credit_card', label: 'Cartão Crédito', icon: <CreditCard className="w-4 h-4 text-blue-400" /> },
                  { id: 'debit_card', label: 'Cartão Débito', icon: <CreditCard className="w-4 h-4 text-purple-400" /> },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentPaymentMethod(item.id as PaymentMethod);
                      setPaymentInputValue(remainingBalance > 0 ? remainingBalance.toFixed(2) : totalAmount.toFixed(2));
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currentPaymentMethod === item.id
                        ? 'border-amber-400 bg-amber-500/15 text-white ring-1 ring-amber-400 shadow-md'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Controls with Troco Calculation */}
            {currentPaymentMethod === 'cash' && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-1/2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                      Valor Entregue pelo Cliente (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentInputValue}
                      onChange={e => setPaymentInputValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-lg font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="w-full sm:w-1/2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Atalhos:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[10, 20, 50, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPaymentInputValue(val.toFixed(2))}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200"
                        >
                          R$ {val}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setPaymentInputValue(remainingBalance.toFixed(2))}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold"
                      >
                        Exato
                      </button>
                    </div>
                  </div>
                </div>

                {parseFloat(paymentInputValue || '0') > remainingBalance && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 uppercase">Troco do Cliente:</span>
                    <span className="text-xl font-black font-mono text-emerald-300">
                      R$ {(parseFloat(paymentInputValue) - remainingBalance).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {(currentPaymentMethod === 'credit_card' || currentPaymentMethod === 'debit_card') && (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs font-bold text-white">
                        Venda na Maquininha ({currentPaymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'Cartão de Débito'})
                      </p>
                      <p className="text-[11px] text-slate-400">Insira, aproxime ou passe o cartão do cliente na maquininha Ton/Stone.</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-blue-400">R$ {paymentInputValue || remainingBalance.toFixed(2)}</span>
                </div>

                {/* Prompt: Cliente prefere pagar via PIX na maquininha */}
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-amber-300 block">💡 Cliente prefere pagar via PIX?</span>
                    <span className="text-[11px] text-slate-400">Gere o QR Code Pix exclusivo do perfil cadastrado no BebêAqui na tela.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPaymentMethod('pix')}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer transition-colors shadow"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pagar via PIX</span>
                  </button>
                </div>
              </div>
            )}

            {currentPaymentMethod === 'pix' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
                {/* Seletor de Perfil do BebêAqui (se houver mais de uma distribuidora cadastrada) */}
                {companies.length > 1 && (
                  <div className="space-y-1.5 pb-2 border-b border-slate-800">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-300 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Destino do PIX (Perfil BebêAqui):</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">Chave Única por Conta</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {companies.map(comp => (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => setSelectedPosPixProfile(comp.id)}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            (selectedPosPixProfile === comp.id || (!selectedPosPixProfile && comp.id === activeCompany.id))
                              ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold shadow'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-[10px] text-amber-300 font-bold uppercase truncate">{comp.tradeName}</div>
                          <div className="text-[9px] font-mono text-emerald-400 truncate">
                            {comp.bankDetails?.pixKey || 'Sem chave'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* QR Code Container Scannable */}
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-3 bg-white rounded-2xl shadow-xl shadow-emerald-950/40 border-2 border-emerald-400/50 shrink-0">
                    <QRCodeSVG
                      value={posPixPayload || 'chave-pix-invalida'}
                      size={140}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold justify-center sm:justify-start">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>QR Code PIX Único do Perfil</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Conta / Perfil:</span>
                        <strong className="text-amber-300 truncate max-w-[180px]">{effectivePosPixData.companyName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Chave PIX:</span>
                        <strong className="text-emerald-400 truncate max-w-[180px]">{effectivePosPixData.pixKey}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Favorecido:</span>
                        <span className="text-white truncate max-w-[180px]">{effectivePosPixData.beneficiaryName}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1 text-xs font-black">
                        <span className="text-slate-400">Valor a Transferir:</span>
                        <span className="text-emerald-400 font-mono">
                          R$ {parseFloat(paymentInputValue || '0') > 0 ? parseFloat(paymentInputValue).toFixed(2) : remainingBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyPosPix(posPixPayload)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedPosPixCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">PIX Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-400" />
                            <span>Copiar Código PIX</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditPosPix(effectivePosPixData.company)}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        title="Configurar a chave PIX exclusiva desta conta"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Editar Chave</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Split Register Button */}
            {remainingBalance > 0 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddPaymentRecord}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar Pagamento Parcial</span>
                </button>
                <span className="text-[11px] text-slate-500">
                  (Para dividir conta em dinheiro + PIX/Cartão)
                </span>
              </div>
            )}

            {/* Auto Print */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
              <input
                id="autoprint-pos"
                type="checkbox"
                checked={autoPrintReceipt}
                onChange={e => setAutoPrintReceipt(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
              />
              <label htmlFor="autoprint-pos" className="text-slate-300 cursor-pointer">
                Imprimir cupom de venda automaticamente ao concluir
              </label>
            </div>

            {/* Concluir Venda Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleConfirmFinishSale}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>CONFIRMAR E CONCLUIR VENDA (Enter)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUPOM TÉRMICO DE VENDA (80mm)                                      */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && lastFinishedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                <Printer className="w-4 h-4" />
                <span>Comprovante de Venda / Cupom</span>
              </h3>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal Receipt Paper Simulation (80mm) */}
            <div className="bg-white text-slate-900 p-4 rounded-xl shadow font-mono text-[11px] leading-tight space-y-2 select-text">
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-2">
                <p className="font-black text-sm tracking-tight text-slate-950">
                  🍻 {activeCompany.tradeName}
                </p>
                <p className="text-[10px] text-slate-600">{activeCompany.name}</p>
                <p className="text-[10px] text-slate-600">CNPJ: {activeCompany.cnpj || '00.000.000/0001-00'}</p>
                <p className="text-[10px] text-slate-600">{activeCompany.address}, {activeCompany.number} - {activeCompany.city}/{activeCompany.state}</p>
                <p className="text-[10px] text-slate-600">Tel: {activeCompany.phone}</p>
              </div>

              <div className="py-1 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>PEDIDO: <strong>{lastFinishedOrder.displayId}</strong></span>
                  <span>DATA: {new Date(lastFinishedOrder.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>TIPO: {lastFinishedOrder.tableNumber ? `MESA #${lastFinishedOrder.tableNumber}` : 'BALCÃO'}</span>
                  <span>HORA: {new Date(lastFinishedOrder.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>CLIENTE: {lastFinishedOrder.customerName}</div>
                <div>OPERADOR: {lastFinishedOrder.waiterName || currentUser?.name || selectedSeller}</div>
              </div>

              <div className="py-1 border-b border-dashed border-slate-400 space-y-1">
                <div className="flex justify-between font-bold text-[10px] border-b border-slate-300 pb-0.5">
                  <span>ITEM / DESCRIÇÃO</span>
                  <span>TOTAL (R$)</span>
                </div>
                {lastFinishedOrder.items?.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between items-start text-[10px]">
                    <div className="pr-2">
                      <span>{it.quantity}x {it.productName}</span>
                      <span className="text-[9px] text-slate-500 block">
                        R$ {it.unitPrice?.toFixed(2)} un
                      </span>
                    </div>
                    <span className="font-bold">
                      R$ {((it.unitPrice || 0) * (it.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-1 space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {(lastFinishedOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                {lastFinishedOrder.serviceFee > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Taxa de Serviço:</span>
                    <span>+ R$ {lastFinishedOrder.serviceFee.toFixed(2)}</span>
                  </div>
                )}
                {lastFinishedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span>- R$ {lastFinishedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black border-t border-slate-900 pt-1 text-slate-950">
                  <span>VALOR TOTAL:</span>
                  <span>R$ {(lastFinishedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[9px] text-slate-600 space-y-0.5">
                <p className="font-bold">OBRIGADO PELA PREFERÊNCIA!</p>
                <p>BebêAqui · Sistema para Distribuidoras e Bares</p>
                <p>Cardápio Digital no seu celular pelo QR Code</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Cupom (Ctrl+P)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ADICIONAR NOVA MESA AO SALÃO                                    */}
      {/* ========================================================================= */}
      {isAddTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Cadastrar Nova Mesa</h3>
                  <p className="text-xs text-slate-400">Adicione uma nova mesa para atendimento e comandas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTableModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTable} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                  Número da Mesa:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTableNum}
                  onChange={e => setNewTableNum(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                  Nome / Identificação da Mesa:
                </label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  placeholder="Ex: Mesa 05 - Salão Principal, Varanda 02, VIP"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                  Capacidade de Lugares:
                </label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {['2', '4', '6', '8', '10'].map(cap => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setNewTableCapacity(cap)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        newTableCapacity === cap
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {cap} lug.
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newTableCapacity}
                  onChange={e => setNewTableCapacity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-emerald-400 focus:outline-none"
                  placeholder="Outra capacidade..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Cadastrar Mesa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: COMANDA DA MESA (Ver Itens & Lançar Bebidas)                     */}
      {/* ========================================================================= */}
      {selectedTableForDetails && !isCloseTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white font-mono">
                      Mesa {selectedTableForDetails.number.toString().padStart(2, '0')}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      👥 {selectedTableForDetails.capacity} lugares
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedTableForDetails.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Switcher */}
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-[10px] font-bold">
                  {(['available', 'occupied', 'closing'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateTableStatus(selectedTableForDetails.id, st)}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        selectedTableForDetails.status === st
                          ? st === 'available'
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : st === 'occupied'
                            ? 'bg-blue-600 text-white font-black'
                            : 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'available' ? 'Livre' : st === 'occupied' ? 'Ocupada' : 'Fechando'}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTableForDetails(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Quick Beverage Launcher */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Beer className="w-4 h-4 text-amber-400" />
                    <span>Lançar Bebida na Comanda (Código F3 ou Nome):</span>
                  </label>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">1 clique para lançar na mesa</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={tableDrinkSearchInput}
                    onChange={e => setTableDrinkSearchInput(e.target.value)}
                    placeholder="Digite o nome da bebida (ex: Heineken, Brahma, Coca, 01)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none shadow-inner"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  {tableDrinkSearchInput && (
                    <button
                      onClick={() => setTableDrinkSearchInput('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Instant Beverage Suggestion Chips */}
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    {tableDrinkSearchInput.trim().length > 0 ? 'Bebidas encontradas no cardápio:' : 'Bebidas mais pedidas (Clique para lançar):'}
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {tableDrinkSuggestions.map(drink => (
                      <button
                        key={drink.id}
                        type="button"
                        onClick={() => handleAddDrinkToSelectedTable(drink)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-800 hover:border-amber-400/40 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <span>{drink.alcoholic ? '🍺' : '🥤'}</span>
                        <span className="font-bold">{drink.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({drink.volume || 'un'})</span>
                        <span className="font-mono font-black text-emerald-400">R$ {drink.price.toFixed(2)}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">+</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items Consumed on Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-blue-400" />
                    <span>Itens Lançados nesta Mesa</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedTableOrders.length} pedido(s) · {selectedTableOrders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0), 0)} itens
                  </span>
                </div>

                {selectedTableOrders.length === 0 ? (
                  <div className="py-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 mx-auto flex items-center justify-center text-slate-500">
                      🍽️
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Nenhum consumo registrado nesta mesa no momento.</p>
                    <p className="text-[11px] text-slate-500">
                      Use o campo de bebidas acima para lançar ou clique em <strong>Lançar pelo PDV</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-850">
                    {selectedTableOrders.map(order => (
                      <div key={order.id} className="pt-2 first:pt-0 pb-1 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Pedido #{order.id.slice(-4).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-black text-emerald-400 text-sm">
                            R$ {order.total.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Cancelar este item do pedido?')) {
                                updateOrderStatus(order.id, 'cancelled');
                                addToast('info', 'Item Cancelado', 'Item removido da comanda.');
                              }
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 cursor-pointer"
                            title="Cancelar item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Totals & Bottom Action Bar */}
            <div className="pt-3 border-t border-slate-800 shrink-0 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Consumido:</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  R$ {selectedTableSubtotal.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectTableForPOS(selectedTableForDetails);
                    setSelectedTableForDetails(null);
                  }}
                  className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-slate-700 hover:border-amber-400/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Lançar no PDV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTableForQr(selectedTableForDetails);
                    setIsTableQrModalOpen(true);
                  }}
                  className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>QR Code Cardápio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCloseTableModalOpen(true)}
                  disabled={selectedTableSubtotal === 0}
                  className="py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Receipt className="w-4 h-4 stroke-[3]" />
                  <span>Fechar Conta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: FECHAR CONTA DA MESA (Com Taxa de Serviço e Descontos)          */}
      {/* ========================================================================= */}
      {isCloseTableModalOpen && selectedTableForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    Fechamento de Conta · Mesa {selectedTableForDetails.number}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedTableForDetails.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCloseTableModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subtotal Display */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Subtotal dos Pedidos:</span>
                <span className="text-[10px] text-slate-500 font-mono">{selectedTableOrders.length} pedido(s) lançados</span>
              </div>
              <span className="text-xl font-mono font-bold text-white">
                R$ {selectedTableSubtotal.toFixed(2)}
              </span>
            </div>

            {/* 1. TAXA DE SERVIÇO */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  <span>Taxa de Serviço:</span>
                </label>

                {/* Mode toggle */}
                <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTableServiceFeeMode('percent')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      tableServiceFeeMode === 'percent' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    % Porcentagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableServiceFeeMode('fixed')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      tableServiceFeeMode === 'fixed' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    R$ Valor Fixo
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tableServiceFeeMode === 'percent' ? (tableServiceFeePercent || '') : (tableServiceFeeFixed || '')}
                    onChange={e => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      if (tableServiceFeeMode === 'percent') setTableServiceFeePercent(val);
                      else setTableServiceFeeFixed(val);
                    }}
                    placeholder={tableServiceFeeMode === 'percent' ? '0%' : 'R$ 0,00'}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-amber-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {tableServiceFeeMode === 'percent' ? '%' : 'R$'}
                  </span>
                </div>

                <div className="px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-800 text-right min-w-[90px]">
                  <span className="text-[10px] text-slate-400 block">Calculado:</span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    + R$ {selectedTableServiceVal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {tableServiceFeeMode === 'percent' ? (
                  [0, 5, 10, 12, 15].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTableServiceFeePercent(pct)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        tableServiceFeePercent === pct
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))
                ) : (
                  [0, 5, 10, 15, 20].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTableServiceFeeFixed(val)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        tableServiceFeeFixed === val
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))
                )}
              </div>

              {/* Auto Service Checkbox */}
              <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTableAutoServiceEnabled}
                  onChange={e => handleToggleTableAutoService(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                />
                <span>Salvar taxa de serviço automaticamente nas próximas mesas</span>
              </label>
            </div>

            {/* 2. DESCONTO */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-400" />
                  <span>Desconto:</span>
                </label>

                {/* Mode toggle */}
                <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTableDiscountMode('percent')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      tableDiscountMode === 'percent' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    % Porcentagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableDiscountMode('fixed')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      tableDiscountMode === 'fixed' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    R$ Valor em Reais
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tableDiscountMode === 'percent' ? (tableDiscountPercent || '') : (tableDiscountAmount || '')}
                    onChange={e => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      if (tableDiscountMode === 'percent') setTableDiscountPercent(val);
                      else setTableDiscountAmount(val);
                    }}
                    placeholder={tableDiscountMode === 'percent' ? '0%' : 'R$ 0,00'}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-rose-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {tableDiscountMode === 'percent' ? '%' : 'R$'}
                  </span>
                </div>

                <div className="px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-800 text-right min-w-[90px]">
                  <span className="text-[10px] text-slate-400 block">Desconto:</span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    - R$ {selectedTableDiscountVal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {tableDiscountMode === 'percent' ? (
                  [0, 5, 10, 15, 20].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTableDiscountPercent(pct)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        tableDiscountPercent === pct
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))
                ) : (
                  [0, 5, 10, 15, 20].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTableDiscountAmount(val)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        tableDiscountAmount === val
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))
                )}
              </div>

              {/* Auto Discount Checkbox */}
              <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTableAutoDiscountEnabled}
                  onChange={e => handleToggleTableAutoDiscount(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-400 w-3.5 h-3.5"
                />
                <span>Salvar desconto automaticamente nas próximas mesas</span>
              </label>
            </div>

            {/* Total Final Display */}
            <div className="p-4 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total a Pagar:</span>
                <span className="text-[10px] text-slate-500 block">Subtotal + Taxa - Desconto</span>
              </div>
              <span className="text-3xl font-black font-mono text-emerald-400">
                R$ {selectedTableFinalTotal.toFixed(2)}
              </span>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 block">Forma de Pagamento:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'pix', label: 'PIX', icon: <QrCode className="w-4 h-4 text-emerald-400" /> },
                  { id: 'cash', label: 'Dinheiro', icon: <Banknote className="w-4 h-4 text-emerald-400" /> },
                  { id: 'credit_card', label: 'Crédito', icon: <CreditCard className="w-4 h-4 text-blue-400" /> },
                  { id: 'debit_card', label: 'Débito', icon: <CreditCard className="w-4 h-4 text-amber-400" /> },
                ].map(pm => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setCloseTablePaymentMethod(pm.id as PaymentMethod)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      closeTablePaymentMethod === pm.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {pm.icon}
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Cartão / Maquininha -> PIX */}
            {(closeTablePaymentMethod === 'credit_card' || closeTablePaymentMethod === 'debit_card') && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-amber-300 block">💡 Cliente da mesa prefere pagar via PIX?</span>
                  <span className="text-[11px] text-slate-400">Gere o QR Code Pix exclusivo da distribuidora agora na tela.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCloseTablePaymentMethod('pix')}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow"
                >
                  Pagar no PIX
                </button>
              </div>
            )}

            {/* QR Code PIX para Fechamento da Mesa */}
            {closeTablePaymentMethod === 'pix' && (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2.5">
                <div className="inline-block p-2.5 bg-white rounded-xl shadow-md border border-emerald-400/40">
                  <QRCodeSVG
                    value={closeTablePixPayload || 'chave-pix-invalida'}
                    size={140}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left text-xs font-mono space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Conta BebêAqui:</span>
                    <strong className="text-amber-300 truncate max-w-[170px]">{effectivePosPixData.companyName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chave PIX:</span>
                    <strong className="text-emerald-400 truncate max-w-[170px]">{effectivePosPixData.pixKey}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Favorecido:</span>
                    <span className="text-white truncate max-w-[170px]">{effectivePosPixData.beneficiaryName}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-emerald-400">
                    <span className="text-slate-400">Valor da Mesa:</span>
                    <span>R$ {selectedTableFinalTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPosPix(closeTablePixPayload)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedPosPixCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedPosPixCode ? 'Código PIX Copiado!' : 'Copiar Código PIX Copia e Cola'}</span>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCloseTableModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseTableBill}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Confirmar e Liberar Mesa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: QR CODE DA MESA (Cardápio Digital)                              */}
      {/* ========================================================================= */}
      <TableQrModal
        isOpen={isTableQrModalOpen}
        onClose={() => setIsTableQrModalOpen(false)}
        initialTable={tableForQr}
      />

      {/* ========================================================================= */}
      {/* 8. MODAL: ESCOLHER MESA PARA VENDA / GESTÃO DE MESAS NO PDV               */}
      {/* ========================================================================= */}
      {isSelectTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Selecionar Mesa para Atendimento</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700 font-mono font-bold">
                      {tables.length} Mesas
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Escolha a mesa para lançar os pedidos no PDV ou gerencie novas mesas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const maxNum = tables.reduce((max, t) => Math.max(max, t.number), 0);
                    setNewTableNum(maxNum + 1);
                    setNewTableName(`Mesa ${(maxNum + 1).toString().padStart(2, '0')}`);
                    setNewTableCapacity('4');
                    setIsAddTableModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  title="Cadastrar nova mesa"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Nova Mesa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSelectTableModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Current Active Table / Mode Alert */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-400">Estado Atual do PDV:</span>
                {selectedTableNumber ? (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span>Mesa {selectedTableNumber} Selecionada ({tables.find(t => t.number === selectedTableNumber)?.name || 'Salão'})</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5" />
                    <span>Venda Balcão (Nenhuma Mesa Selecionada)</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTableNumber(null);
                  setCustomerName('Cliente Balcão');
                  setIsSelectTableModalOpen(false);
                  addToast('info', 'Modo Balcão Ativado', 'Venda direta rápida no balcão sem vincular a nenhuma mesa.');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-400/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Vender Direto no Balcão</span>
              </button>
            </div>

            {/* Filter toolbar & Search */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all', label: 'Todas', count: tables.length, color: 'bg-slate-700' },
                  { id: 'available', label: 'Livres', count: availableTables.length, color: 'bg-emerald-500' },
                  { id: 'occupied', label: 'Ocupadas', count: occupiedTables.length, color: 'bg-blue-500' },
                  { id: 'closing', label: 'Fechando', count: closingTables.length, color: 'bg-amber-500' },
                ].map(flt => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setTableFilter(flt.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      tableFilter === flt.id
                        ? 'bg-blue-600 text-white shadow ring-1 ring-blue-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <span>{flt.label}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 font-mono font-bold text-slate-300">
                      {flt.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={tableSearchTerm}
                  onChange={e => setTableSearchTerm(e.target.value)}
                  placeholder="Buscar mesa por número ou nome..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 focus:border-blue-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                {tableSearchTerm && (
                  <button
                    onClick={() => setTableSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Grid of Tables */}
            <div className="flex-1 overflow-y-auto pr-1">
              {filteredTablesList.length === 0 ? (
                <div className="py-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 mx-auto flex items-center justify-center text-slate-400 text-xl">
                    🍽️
                  </div>
                  <p className="text-sm font-bold text-white">Nenhuma mesa encontrada</p>
                  <p className="text-xs text-slate-400">
                    {tables.length === 0 ? 'Cadastre sua primeira mesa para começar.' : 'Tente outro termo na busca ou limpe o filtro.'}
                  </p>
                  {tables.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewTableNum(1);
                        setNewTableName('Mesa 01');
                        setNewTableCapacity('4');
                        setIsAddTableModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer"
                    >
                      Cadastrar Mesa 01
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredTablesList.map(table => {
                    const tOrders = getTableOrders(table.number);
                    const tTotal = getTableTotal(table.number);
                    const itemsCount = tOrders.reduce((acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0), 0);
                    const isCurrentTable = selectedTableNumber === table.number;

                    return (
                      <div
                        key={table.id}
                        className={`rounded-2xl border p-3 flex flex-col justify-between transition-all shadow-md ${
                          isCurrentTable
                            ? 'bg-blue-950/40 border-blue-400 ring-2 ring-blue-500/50'
                            : table.status === 'occupied'
                            ? 'bg-slate-950/80 border-blue-500/40'
                            : table.status === 'closing'
                            ? 'bg-slate-950/80 border-amber-500/40'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-1.5 pb-2 border-b border-slate-800/80">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-base font-black text-white font-mono">
                                Mesa {table.number.toString().padStart(2, '0')}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                👥 {table.capacity}p
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate max-w-[130px] font-medium mt-0.5">
                              {table.name}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                table.status === 'occupied'
                                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                                  : table.status === 'closing'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              {table.status === 'occupied'
                                ? '🔵 Ocupada'
                                : table.status === 'closing'
                                ? '🟠 Fechando'
                                : '🟢 Livre'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditTable(table, e)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer border border-slate-700/60"
                                title="Editar número, nome ou capacidade"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleOpenDeleteTable(table, e)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer border border-slate-700/60"
                                title="Excluir / Apagar mesa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="py-2.5 space-y-1">
                          {table.status === 'occupied' || table.status === 'closing' ? (
                            <div>
                              <div className="flex justify-between items-baseline text-[10px] text-slate-400 uppercase font-bold">
                                <span>Consumo:</span>
                                <span className="font-mono">{itemsCount} itens</span>
                              </div>
                              <div className="text-xl font-black font-mono text-emerald-400">
                                R$ {tTotal.toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <div className="py-1 text-center text-slate-500 text-xs">
                              <span className="text-emerald-400/90 text-xs font-bold">✓ Disponível</span>
                              <p className="text-[10px] text-slate-500">Pronta para receber clientes</p>
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSelectTableForPOS(table)}
                            className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow ${
                              isCurrentTable
                                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                            }`}
                          >
                            <Store className="w-3.5 h-3.5" />
                            <span>{isCurrentTable ? 'Mesa Ativa no PDV' : 'Vender nesta Mesa'}</span>
                          </button>

                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTableForDetails(table);
                              }}
                              className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                            >
                              <UtensilsCrossed className="w-3 h-3 text-blue-400" />
                              <span>Comanda</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setTableForQr(table);
                                setIsTableQrModalOpen(true);
                              }}
                              className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                            >
                              <QrCode className="w-3 h-3 text-amber-400" />
                              <span>QR Code</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                Dica: Escolha a mesa e ela ficará ativa no PDV para adicionar produtos facilmente.
              </span>
              <button
                type="button"
                onClick={() => setIsSelectTableModalOpen(false)}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: EDITAR MESA (Alterar Nome, Número e Capacidade)                  */}
      {/* ========================================================================= */}
      {isEditTableModalOpen && tableToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Pencil className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Editar Dados da Mesa</h3>
                  <p className="text-xs text-slate-400">Alterar identificação, número e lugares</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTableModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTable} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                  Número da Mesa:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editTableNumber}
                  onChange={e => setEditTableNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                  Nome / Identificação da Mesa:
                </label>
                <input
                  type="text"
                  required
                  value={editTableName}
                  onChange={e => setEditTableName(e.target.value)}
                  placeholder="Ex: Mesa 02 - Salão Principal, Varanda VIP"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-300 block mb-1">
                  Capacidade de Lugares:
                </label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {['2', '4', '6', '8', '10'].map(cap => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setEditTableCapacity(cap)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        editTableCapacity === cap
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {cap} lug.
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={editTableCapacity}
                  onChange={e => setEditTableCapacity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  placeholder="Outra capacidade..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditTableModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MODAL: CONFIRMAR EXCLUSÃO DE MESA                                     */}
      {/* ========================================================================= */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-red-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Excluir Mesa {tableToDelete.number}?</h3>
                <p className="text-xs text-slate-400">Esta ação removerá a mesa do salão</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <p className="font-bold text-slate-300">
                Identificação: <span className="text-white">{tableToDelete.name}</span>
              </p>
              <p className="text-slate-400">
                Status atual: <span className="font-semibold text-amber-400">{tableToDelete.status === 'occupied' ? 'Ocupada' : tableToDelete.status === 'closing' ? 'Fechando' : 'Livre'}</span>
              </p>
              {tableToDelete.status !== 'available' && (
                <p className="text-amber-400/90 font-medium pt-1">
                  ⚠️ Esta mesa possui consumo ou comandas em andamento. Certifique-se de que a conta foi encerrada antes de excluir.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTableToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-755 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTable}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Apagar Mesa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: EDITAR / CADASTRAR CHAVE PIX ÚNICA DO PERFIL BEBÊAQUI            */}
      {/* ========================================================================= */}
      {isEditingPosPixModalOpen && posPixCompanyToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold">Chave PIX da Conta</h3>
                  <p className="text-[11px] text-slate-400">Perfil: {posPixCompanyToEdit.tradeName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditingPosPixModalOpen(false);
                  setPosPixCompanyToEdit(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Chave PIX Única deste Perfil</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Esta chave Pix serve única e exclusivamente para a conta deste perfil cadastrado no BebêAqui. Todas as vendas por maquininha e no caixa direcionarão para cá.
              </p>
            </div>

            <form onSubmit={handleSavePosPix} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Tipo de Chave PIX:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['phone', 'cnpj', 'email', 'random'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPosPixEditType(type)}
                      className={`py-1.5 px-2 rounded-lg text-center uppercase font-bold text-[11px] border cursor-pointer ${
                        posPixEditType === type
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {type === 'phone' ? 'Celular' : type === 'cnpj' ? 'CNPJ' : type === 'email' ? 'E-mail' : 'Aleatória'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Chave PIX:
                </label>
                <input
                  type="text"
                  required
                  value={posPixEditKey}
                  onChange={e => setPosPixEditKey(e.target.value)}
                  placeholder={
                    posPixEditType === 'phone'
                      ? '31975346290'
                      : posPixEditType === 'cnpj'
                      ? '00.000.000/0001-00'
                      : posPixEditType === 'email'
                      ? 'contato@distribuidora.com.br'
                      : 'Chave EVP aleatória'
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Nome do Titular / Favorecido:
                </label>
                <input
                  type="text"
                  required
                  value={posPixEditBeneficiary}
                  onChange={e => setPosPixEditBeneficiary(e.target.value)}
                  placeholder="Nome do titular da conta bancária"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPosPixModalOpen(false);
                    setPosPixCompanyToEdit(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Salvar Chave Pix no Perfil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
