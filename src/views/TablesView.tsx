import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Table, Order, Product } from '../types';
import { initialProducts } from '../data/initialData';
import { TableQrModal } from '../components/TableQrModal';
import { QRCodeSVG } from 'qrcode.react';
import { generatePixPayload } from '../utils/pix';
import {
  UtensilsCrossed,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Receipt,
  X,
  PlusCircle,
  CreditCard,
  QrCode,
  DollarSign,
  Printer,
  Search,
  Sparkles,
  Beer,
  SlidersHorizontal,
  Percent,
  Tag,
  Barcode,
  Pencil,
  Trash2,
  Check,
  Store,
  Copy,
  Building2
} from 'lucide-react';

export const TablesView: React.FC = () => {
  const {
    tables,
    orders,
    products,
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    activeCompany,
    setActivePage,
    closeTableBill,
    createDirectOrder,
    addToast
  } = useApp();

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState(tables.length + 1);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');

  // Edit table states
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<Table | null>(null);
  const [editTableNumber, setEditTableNumber] = useState<number>(1);
  const [editTableName, setEditTableName] = useState('');
  const [editTableCapacity, setEditTableCapacity] = useState('4');

  // Delete table state
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  // Drink search input within table comanda
  const [drinkSearchInput, setDrinkSearchInput] = useState('');

  // QR Code modal state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);

  // Payment close modal
  const [isCloseBillModalOpen, setIsCloseBillModalOpen] = useState(false);
  const [closePaymentMethod, setClosePaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash'>('pix');

  // Service fee state for table bill closing
  const [serviceFeeMode, setServiceFeeMode] = useState<'percent' | 'fixed'>('percent');
  const [serviceFeePercent, setServiceFeePercent] = useState<number>(() => {
    try {
      return localStorage.getItem('bebeaqui_pos_auto_service') === 'true'
        ? parseFloat(localStorage.getItem('bebeaqui_pos_auto_service_val') || '10')
        : 0;
    } catch {
      return 0;
    }
  });
  const [serviceFeeFixed, setServiceFeeFixed] = useState<number>(0);
  const [isAutoServiceEnabled, setIsAutoServiceEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bebeaqui_pos_auto_service') === 'true';
    } catch {
      return false;
    }
  });

  // Discount state for table bill closing
  const [discountMode, setDiscountMode] = useState<'percent' | 'fixed'>('percent');
  const [discountPercent, setDiscountPercent] = useState<number>(() => {
    try {
      return localStorage.getItem('bebeaqui_pos_auto_discount') === 'true'
        ? parseFloat(localStorage.getItem('bebeaqui_pos_auto_discount_val') || '5')
        : 0;
    } catch {
      return 0;
    }
  });
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isAutoDiscountEnabled, setIsAutoDiscountEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bebeaqui_pos_auto_discount') === 'true';
    } catch {
      return false;
    }
  });

  // Text normalizer to ignore accents and uppercase
  const normalizeStr = (str: string): string => {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  // Live drink suggestions for the Comanda input
  const matchingDrinks = useMemo(() => {
    const list = products.length > 0 ? products : initialProducts;
    const activeList = list.filter(p => p.active !== false);
    const q = normalizeStr(drinkSearchInput);
    if (!q) return activeList.slice(0, 8);
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
    }).slice(0, 8);
  }, [drinkSearchInput, products]);

  // Handler to quickly add beverage to the selected table's comanda
  const handleAddDrinkToTable = (product: Product) => {
    if (!selectedTable) return;
    createDirectOrder({
      type: 'table',
      tableId: selectedTable.id,
      tableNumber: selectedTable.number,
      customerName: `Mesa ${selectedTable.number}`,
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
    updateTableStatus(selectedTable.id, 'occupied');
    addToast('success', `${product.name} lançado!`, `Adicionado à comanda da Mesa ${selectedTable.number}.`);
    setDrinkSearchInput('');
  };

  // Toggle Auto Service Handler
  const handleToggleAutoService = (enabled: boolean) => {
    setIsAutoServiceEnabled(enabled);
    try {
      localStorage.setItem('bebeaqui_pos_auto_service', String(enabled));
      localStorage.setItem('bebeaqui_pos_auto_service_mode', serviceFeeMode);
      localStorage.setItem('bebeaqui_pos_auto_service_val', String(serviceFeeMode === 'percent' ? serviceFeePercent : serviceFeeFixed));
    } catch {}
    if (enabled) {
      addToast('success', 'Taxa Automática Ativada', 'Taxa padrão aplicada automaticamente nas comandas.');
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
      addToast('success', 'Desconto Automático Ativado', 'Desconto padrão aplicado automaticamente nas comandas.');
    } else {
      addToast('info', 'Desconto Automático Desativado', 'Desconto não será aplicado automaticamente.');
    }
  };

  // Summary counts
  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const billCount = tables.filter(t => t.status === 'closing').length;

  const handleOpenTableDetails = (table: Table) => {
    setSelectedTable(table);
  };

  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    addTable(Number(newTableNum), newTableName.trim() || `Mesa ${newTableNum}`, Number(newTableCapacity) || 4);
    setIsAddTableModalOpen(false);
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

    if (selectedTable?.id === tableToEdit.id) {
      setSelectedTable(prev => prev ? { ...prev, number: num, name, capacity: cap } : null);
    }

    setIsEditTableModalOpen(false);
    setTableToEdit(null);
    addToast('success', 'Mesa Atualizada!', `${name} atualizada com sucesso.`);
  };

  const handleOpenDeleteTable = (table: Table, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTableToDelete(table);
  };

  const handleConfirmDeleteTable = () => {
    if (!tableToDelete) return;
    if (selectedTable?.id === tableToDelete.id) {
      setSelectedTable(null);
    }
    deleteTable(tableToDelete.id);
    addToast('warning', 'Mesa Excluída', `Mesa ${tableToDelete.number} foi removida.`);
    setTableToDelete(null);
  };

  // Get active orders for selected table
  const tableOrders = selectedTable
    ? orders.filter(o => o.tableNumber === selectedTable.number && o.status !== 'cancelled' && o.status !== 'delivered')
    : [];

  const tableSubtotal = tableOrders.reduce((sum, o) => sum + o.total, 0);

  const serviceFeeVal = useMemo(() => {
    if (serviceFeeMode === 'fixed') return serviceFeeFixed;
    return (tableSubtotal * serviceFeePercent) / 100;
  }, [tableSubtotal, serviceFeeMode, serviceFeePercent, serviceFeeFixed]);

  const discountVal = useMemo(() => {
    if (discountMode === 'percent') return (tableSubtotal * discountPercent) / 100;
    return discountAmount;
  }, [tableSubtotal, discountMode, discountPercent, discountAmount]);

  const finalBillTotal = useMemo(() => {
    return Math.max(0, tableSubtotal + serviceFeeVal - discountVal);
  }, [tableSubtotal, serviceFeeVal, discountVal]);

  const [copiedPixCode, setCopiedPixCode] = useState(false);

  const tablePixPayload = useMemo(() => {
    if (!activeCompany.bankDetails?.pixKey || finalBillTotal <= 0) return '';
    return generatePixPayload({
      pixKey: activeCompany.bankDetails.pixKey,
      pixKeyType: activeCompany.bankDetails.pixKeyType,
      merchantName: activeCompany.bankDetails.beneficiaryName || activeCompany.tradeName,
      merchantCity: activeCompany.city || 'BRASIL',
      amount: finalBillTotal,
      txid: `MESA${selectedTable?.number || '00'}${Date.now().toString().slice(-6)}`
    });
  }, [activeCompany, finalBillTotal, selectedTable]);

  const handleCopyTablePix = () => {
    if (!tablePixPayload) return;
    navigator.clipboard.writeText(tablePixPayload);
    setCopiedPixCode(true);
    addToast('success', 'Código PIX Copiado!', 'Cole no app do banco ou envie ao cliente.');
    setTimeout(() => setCopiedPixCode(false), 3000);
  };

  const handleFinalizeBill = () => {
    if (!selectedTable) return;
    closeTableBill(selectedTable.number, closePaymentMethod);
    setIsCloseBillModalOpen(false);
    setSelectedTable(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-amber-400" />
            <span>Gestão de Mesas e Comandas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mapa interativo do salão da <strong>{activeCompany.tradeName}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              setQrModalTable(null);
              setIsQrModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Central de QR Codes / Imprimir</span>
          </button>

          <button
            onClick={() => {
              setNewTableNum(tables.length + 1);
              setNewTableName(`Mesa ${(tables.length + 1).toString().padStart(2, '0')}`);
              setIsAddTableModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Mesa</span>
          </button>
        </div>
      </div>

      {/* Hall Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 font-semibold uppercase">Mesas Livres</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">{availableCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-400 font-semibold uppercase">Mesas Ocupadas</span>
            <div className="text-2xl font-extrabold font-mono text-rose-400 mt-1">{occupiedCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-400 font-semibold uppercase">Pediram a Conta</span>
            <div className="text-2xl font-extrabold font-mono text-blue-400 mt-1">{billCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tables Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map(table => {
          const isAvailable = table.status === 'available';
          const isClosing = table.status === 'closing';

          return (
            <button
              key={table.id}
              onClick={() => handleOpenTableDetails(table)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all hover:scale-[1.02] cursor-pointer ${
                isAvailable
                  ? 'bg-slate-900 border-emerald-500/30 hover:border-emerald-500/60'
                  : isClosing
                  ? 'bg-blue-950/40 border-blue-500/50 hover:border-blue-400'
                  : 'bg-slate-900 border-rose-500/40 hover:border-rose-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-extrabold text-white">
                  Mesa {table.number.toString().padStart(2, '0')}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={(e) => handleOpenEditTable(table, e)}
                    title="Editar mesa"
                    className="p-1 rounded-md bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </span>
                  <span
                    onClick={(e) => handleOpenDeleteTable(table, e)}
                    title="Excluir mesa"
                    className="p-1 rounded-md bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isAvailable ? 'bg-emerald-400' : isClosing ? 'bg-blue-400 animate-pulse' : 'bg-rose-400'
                  }`} />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-300 truncate">{table.name}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                  <Users className="w-3 h-3" />
                  <span>{table.capacity} lugares</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isAvailable ? 'text-emerald-400' : isClosing ? 'text-blue-400' : 'text-rose-400'
                }`}>
                  {isAvailable ? 'Livre' : isClosing ? 'Pediu Conta' : 'Ocupada'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrModalTable(table);
                      setIsQrModalOpen(true);
                    }}
                    title="Ver QR Code desta mesa"
                    className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-amber-400 font-bold">Ver →</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Table Comanda Drawer / Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono">
                  {selectedTable.number.toString().padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Mesa {selectedTable.number} — {selectedTable.name}</h3>
                  <p className="text-[11px] text-slate-400">Capacidade: {selectedTable.capacity} pessoas</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setQrModalTable(selectedTable);
                    setIsQrModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Ver QR Code desta mesa"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <button
                onClick={() => updateTableStatus(selectedTable.id, 'available')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  selectedTable.status === 'available'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Livre
              </button>
              <button
                onClick={() => updateTableStatus(selectedTable.id, 'occupied')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  selectedTable.status === 'occupied'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Ocupada
              </button>
              <button
                onClick={() => updateTableStatus(selectedTable.id, 'closing')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  selectedTable.status === 'closing'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Pediu Conta
              </button>
            </div>

            {/* Orders on Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Comanda em Aberto</span>
                <span className="text-xs text-slate-400 font-mono">{tableOrders.length} pedido(s)</span>
              </div>

              {tableOrders.length === 0 ? (
                <div className="py-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                  <p className="text-xs text-slate-400">Nenhum consumo registrado no momento nesta mesa.</p>
                  <button
                    onClick={() => {
                      setSelectedTable(null);
                      setActivePage('pos');
                    }}
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    + Lançar Bebidas na Comanda (Abrir PDV)
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {tableOrders.map(order => (
                    <div key={order.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>Pedido #{order.id.slice(-4).toUpperCase()} ({order.customerName})</span>
                        <span className="font-mono text-emerald-400">R$ {order.total.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Drink Launcher into Table Comanda */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Beer className="w-4 h-4 text-amber-400" />
                  <span>Código (F3) / Lançar Bebida na Comanda:</span>
                </label>
                <span className="text-[10px] text-slate-400">1 clique para lançar</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={drinkSearchInput}
                  onChange={e => setDrinkSearchInput(e.target.value)}
                  placeholder="Digite o nome da bebida (ex: Heineken, Brahma, Coca, 01)..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Quick drink chips matching search */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  {drinkSearchInput.trim().length > 0 ? 'Bebidas encontradas no cardápio:' : 'Exemplos de bebidas do cardápio:'}
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {matchingDrinks.map(drink => (
                    <button
                      key={drink.id}
                      type="button"
                      onClick={() => handleAddDrinkToTable(drink)}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-800 hover:border-amber-400/40 text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <span>{drink.alcoholic ? '🍺' : '🥤'}</span>
                      <span className="font-bold">{drink.name}</span>
                      <span className="font-mono font-bold text-emerald-400">R$ {drink.price.toFixed(2)}</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">+</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtotal & Actions */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Subtotal Acumulado</span>
                <span className="font-mono font-extrabold text-2xl text-amber-400">
                  R$ {tableSubtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedTable(null);
                    setActivePage('pos');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Abrir PDV Completo</span>
                </button>

                {tableOrders.length > 0 && (
                  <button
                    onClick={() => setIsCloseBillModalOpen(true)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Fechar Conta / Liberar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Bill Payment Modal */}
      {isCloseBillModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Fechamento — Mesa {selectedTable.number} ({selectedTable.name})</h3>
              </div>
              <button
                onClick={() => setIsCloseBillModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subtotal Display */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Subtotal dos Pedidos</span>
              <span className="text-lg font-mono font-bold text-white">R$ {tableSubtotal.toFixed(2)}</span>
            </div>

            {/* 1. TAXA DE SERVIÇO */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  <span>Taxa de Serviço:</span>
                </label>
                {/* Mode toggle */}
                <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[10px]">
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
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
                    {serviceFeeMode === 'percent' ? '%' : 'R$'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                  + R$ {serviceFeeVal.toFixed(2)}
                </span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1 text-[10px]">
                {serviceFeeMode === 'percent' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setServiceFeePercent(0)}
                      className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${serviceFeePercent === 0 ? 'bg-slate-800 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      0% (Sem)
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceFeePercent(5)}
                      className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${serviceFeePercent === 5 ? 'bg-slate-800 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      5%
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceFeePercent(10)}
                      className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${serviceFeePercent === 10 ? 'bg-slate-800 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      10% (Padrão)
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceFeePercent(12)}
                      className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${serviceFeePercent === 12 ? 'bg-slate-800 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      12%
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setServiceFeeFixed(0)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer"
                    >
                      R$ 0
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceFeeFixed(5)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer"
                    >
                      R$ 5
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceFeeFixed(10)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer"
                    >
                      R$ 10
                    </button>
                  </>
                )}
              </div>

              {/* Auto Service Checkbox */}
              <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1.5">
                <input
                  id="auto-table-service-check"
                  type="checkbox"
                  checked={isAutoServiceEnabled}
                  onChange={e => handleToggleAutoService(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
                />
                <label htmlFor="auto-table-service-check" className="text-[10px] text-slate-300 cursor-pointer select-none">
                  Aplicar taxa de serviço automaticamente nas comandas
                </label>
              </div>
            </div>

            {/* 2. DESCONTO */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-red-400" />
                  <span>Desconto na Conta:</span>
                </label>
                {/* Mode toggle */}
                <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[10px]">
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
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-red-400 focus:outline-none focus:border-red-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
                    {discountMode === 'percent' ? '%' : 'R$'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-red-400 shrink-0">
                  - R$ {discountVal.toFixed(2)}
                </span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1 text-[10px]">
                {discountMode === 'percent' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setDiscountPercent(0)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer"
                    >
                      Zerar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountPercent(5)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer"
                    >
                      5%
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountPercent(10)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer"
                    >
                      10%
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDiscountAmount(0)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer"
                    >
                      Zerar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountAmount(5)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer"
                    >
                      R$ 5
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountAmount(10)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 cursor-pointer"
                    >
                      R$ 10
                    </button>
                  </>
                )}
              </div>

              {/* Auto Discount Checkbox */}
              <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1.5">
                <input
                  id="auto-table-discount-check"
                  type="checkbox"
                  checked={isAutoDiscountEnabled}
                  onChange={e => handleToggleAutoDiscount(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-red-500 bg-slate-950 border-slate-700 cursor-pointer"
                />
                <label htmlFor="auto-table-discount-check" className="text-[10px] text-slate-300 cursor-pointer select-none">
                  Aplicar desconto automaticamente nas comandas
                </label>
              </div>
            </div>

            {/* Total Display */}
            <div className="text-center py-3 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl space-y-1 shadow-inner">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Valor Total a Pagar</span>
              <div className="text-3xl font-black font-mono text-emerald-400">
                R$ {finalBillTotal.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Forma de Pagamento:</label>
              <div className="grid grid-cols-2 gap-2">
                {(['pix', 'credit_card', 'debit_card', 'cash'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setClosePaymentMethod(method)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold capitalize cursor-pointer ${
                      closePaymentMethod === method
                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300'
                    }`}
                  >
                    {method === 'pix' ? 'PIX' : method === 'credit_card' ? 'Cartão Crédito' : method === 'debit_card' ? 'Cartão Débito' : 'Dinheiro'}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Cartão / Maquininha -> PIX */}
            {(closePaymentMethod === 'credit_card' || closePaymentMethod === 'debit_card') && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-amber-300 block">💡 Cliente prefere pagar via PIX?</span>
                  <span className="text-[11px] text-slate-400">Gere o QR Code Pix exclusivo da conta cadastrada no BebêAqui.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setClosePaymentMethod('pix')}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow"
                >
                  Pagar no PIX
                </button>
              </div>
            )}

            {/* QR Code PIX Dinâmico com a Chave Única da Empresa */}
            {closePaymentMethod === 'pix' && (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2.5">
                <div className="inline-block p-2.5 bg-white rounded-xl shadow-md border border-emerald-400/40">
                  <QRCodeSVG
                    value={tablePixPayload || 'chave-pix-invalida'}
                    size={140}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left text-xs font-mono space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Perfil BebêAqui:</span>
                    <strong className="text-amber-300 truncate max-w-[170px]">{activeCompany.tradeName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chave PIX:</span>
                    <strong className="text-emerald-400 truncate max-w-[170px]">{activeCompany.bankDetails?.pixKey}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Favorecido:</span>
                    <span className="text-white truncate max-w-[170px]">{activeCompany.bankDetails?.beneficiaryName || activeCompany.tradeName}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTablePix}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedPixCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedPixCode ? 'Código PIX Copiado!' : 'Copiar Código PIX Copia e Cola'}</span>
                </button>
              </div>
            )}

            <button
              onClick={handleFinalizeBill}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              Receber R$ {finalBillTotal.toFixed(2)} e Liberar Mesa
            </button>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold">Cadastrar Nova Mesa</h3>
              <button
                onClick={() => setIsAddTableModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTable} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Número da Mesa *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTableNum}
                  onChange={e => setNewTableNum(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Identificação / Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Varanda 01, Salão Principal"
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Capacidade de Pessoas</label>
                <input
                  type="number"
                  min="1"
                  value={newTableCapacity}
                  onChange={e => setNewTableCapacity(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Salvar Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table QR Codes Management & Print Modal */}
      <TableQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        initialTable={qrModalTable}
      />

      {/* Edit Table Modal */}
      {isEditTableModalOpen && tableToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2 text-amber-400">
                <Pencil className="w-4 h-4" />
                <span>Editar Mesa {tableToEdit.number}</span>
              </h3>
              <button
                onClick={() => setIsEditTableModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTable} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Número da Mesa</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editTableNumber}
                  onChange={e => setEditTableNumber(parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Nome / Identificação</label>
                <input
                  type="text"
                  required
                  value={editTableName}
                  onChange={e => setEditTableName(e.target.value)}
                  placeholder="Ex: Mesa 02 - Salão Principal"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Capacidade de Pessoas</label>
                <input
                  type="number"
                  min="1"
                  value={editTableCapacity}
                  onChange={e => setEditTableCapacity(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditTableModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Table Modal */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Mesa {tableToDelete.number}?</h3>
                <p className="text-xs text-slate-400">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-300 space-y-1">
              <p>Mesa: <strong>{tableToDelete.name}</strong></p>
              <p>Capacidade: <strong>{tableToDelete.capacity} lugares</strong></p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTableToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTable}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
