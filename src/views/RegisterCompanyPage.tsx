import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  AlertCircle,
  Hash,
  Loader2,
  Eye,
  EyeOff,
  XCircle,
  RefreshCw,
  MessageCircle,
  ExternalLink,
  User,
  Smartphone,
  CreditCard,
  HelpCircle,
  KeyRound,
  Landmark
} from 'lucide-react';
import {
  formatCNPJ,
  formatCPF,
  validateCPF,
  formatPhone,
  formatCEP,
  formatAddressNumber,
  formatPixKeyByType,
  getDigitCount
} from '../utils/masks';
import { fetchAddressByCep } from '../utils/cep';
import { consultRealCNPJ, CNPJValidationResult } from '../utils/cnpj';

export const RegisterCompanyPage: React.FC = () => {
  const { registerCompany, setActivePage, addToast } = useApp();

  const [step, setStep] = useState<'details' | 'pix_payment'>('details');

  // Tipo de Inscrição: CPF (Pessoa Física / Adega sem CNPJ) ou CNPJ (Pessoa Jurídica)
  const [docType, setDocType] = useState<'cpf' | 'cnpj'>('cpf');
  const [cpf, setCpf] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepSuccess, setCepSuccess] = useState(false);

  // Configuração da Chave PIX Única da Distribuidora (definida pelo assinante)
  const [subscriberPixType, setSubscriberPixType] = useState<'phone' | 'cpf' | 'cnpj' | 'email' | 'random'>('cpf');
  const [subscriberPixKey, setSubscriberPixKey] = useState('');
  const [subscriberBeneficiary, setSubscriberBeneficiary] = useState('');
  const [subscriberBankName, setSubscriberBankName] = useState('Nubank');

  // CNPJ Receita Federal verification state
  const [isVerifyingCnpj, setIsVerifyingCnpj] = useState(false);
  const [cnpjResult, setCnpjResult] = useState<CNPJValidationResult | null>(null);

  // PIX verification state
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixPayerName, setPixPayerName] = useState('');
  const [hasPaidPix, setHasPaidPix] = useState(true);
  type PixCheckStatus = 'idle' | 'checking' | 'success' | 'error';
  const [pixStatus, setPixStatus] = useState<PixCheckStatus>('idle');
  const [pixErrorMsg, setPixErrorMsg] = useState<string>('');
  const [pixTransactionId, setPixTransactionId] = useState<string>('');

  const PLATFORM_PIX_PHONE = '31975346290';
  const PLATFORM_PIX_PHONE_FORMATTED = '(31) 97534-6290';

  // Handler para troca de tipo de chave PIX com preenchimento automático inteligente
  const handleSelectSubscriberPixType = (type: 'phone' | 'cpf' | 'cnpj' | 'email' | 'random') => {
    setSubscriberPixType(type);
    if (type === 'cpf' && cpf) {
      setSubscriberPixKey(cpf);
    } else if (type === 'cnpj' && cnpj) {
      setSubscriberPixKey(cnpj);
    } else if (type === 'phone' && phone) {
      setSubscriberPixKey(phone);
    } else if (type === 'email' && email) {
      setSubscriberPixKey(email);
    } else if (type === 'random') {
      setSubscriberPixKey('');
    }
  };

  const handleSubscriberPixKeyChange = (val: string) => {
    setSubscriberPixKey(formatPixKeyByType(val, subscriberPixType));
  };

  const handleCpfChange = (val: string) => {
    const formatted = formatCPF(val);
    setCpf(formatted);
    if (subscriberPixType === 'cpf') {
      setSubscriberPixKey(formatted);
    }
  };

  // Auto-fill example helper for fast evaluation
  const handleAutoFillExample = (forcedType?: 'cpf' | 'cnpj') => {
    const targetType = forcedType || docType;
    if (targetType === 'cpf') {
      setDocType('cpf');
      setCpf('421.890.348-12');
      setCompanyName('Carlos Eduardo da Silva');
      setTradeName('Adega & Distribuidora Silva Express');
      setPhone('(11) 98765-4321');
      setEmail('carlos.adega@gmail.com');
      setZipCode('01001-000');
      setAddress('Praça da Sé');
      setNumber('100');
      setNeighborhood('Sé');
      setCity('São Paulo');
      setState('SP');
      setPassword('senha1234');
      setConfirmPassword('senha1234');
      setCepSuccess(true);
      setSubscriberPixType('cpf');
      setSubscriberPixKey('421.890.348-12');
      setSubscriberBeneficiary('Carlos Eduardo da Silva');
      setSubscriberBankName('Nubank');
    } else {
      setDocType('cnpj');
      setCnpj('35.918.442/0001-90');
      setCompanyName('DISTRIBUIDORA BEBEAQUI PRIME COMERCIO DE BEBIDAS LTDA');
      setTradeName('BEBEAQUI PRIME DISTRIBUIDORA & ATACADO');
      setPhone('(11) 98765-4321');
      setEmail('contato@bebeaqui.com.br');
      setZipCode('01001-000');
      setAddress('Praça da Sé');
      setNumber('100');
      setNeighborhood('Sé');
      setCity('São Paulo');
      setState('SP');
      setPassword('senha1234');
      setConfirmPassword('senha1234');
      setCepSuccess(true);
      setSubscriberPixType('phone');
      setSubscriberPixKey('(11) 98765-4321');
      setSubscriberBeneficiary('BEBEAQUI PRIME DISTRIBUIDORA');
      setSubscriberBankName('Banco Inter');
      setCnpjResult({
        valid: true,
        cleanCnpj: '35918442000190',
        formattedCnpj: '35.918.442/0001-90',
        isRealAndActive: true,
        companyData: {
          cnpj: '35.918.442/0001-90',
          razaoSocial: 'DISTRIBUIDORA BEBEAQUI PRIME COMERCIO DE BEBIDAS LTDA',
          nomeFantasia: 'BEBEAQUI PRIME DISTRIBUIDORA & ATACADO',
          situacaoCadastral: 'ATIVA',
          isAtiva: true,
          cnaeDescricao: 'Comércio atacadista de cerveja, chope e refrigerante'
        }
      });
    }
  };

  // Real-time CNPJ validation with Receita Federal / BrasilAPI
  const handleVerifyCnpjDirectly = async (cnpjToVerify?: string) => {
    const target = cnpjToVerify || cnpj;
    const clean = target.replace(/\D/g, '');

    if (clean.length !== 14) {
      setCnpjResult({
        valid: false,
        cleanCnpj: clean,
        formattedCnpj: formatCNPJ(clean),
        error: 'O CNPJ deve conter exatamente 14 números.'
      });
      return;
    }

    setIsVerifyingCnpj(true);
    setCnpjResult(null);

    try {
      const result = await consultRealCNPJ(clean);
      setCnpjResult(result);

      if (result.valid && result.isRealAndActive && result.companyData) {
        setCompanyName(result.companyData.razaoSocial);
        setTradeName(result.companyData.nomeFantasia || result.companyData.razaoSocial);

        if (result.companyData.cep) {
          setZipCode(result.companyData.cep);
          if (result.companyData.logradouro) setAddress(result.companyData.logradouro);
          if (result.companyData.numero) setNumber(result.companyData.numero);
          if (result.companyData.bairro) setNeighborhood(result.companyData.bairro);
          if (result.companyData.municipio) setCity(result.companyData.municipio);
          if (result.companyData.uf) setState(result.companyData.uf);
          setCepSuccess(true);
        }

        if (result.companyData.telefone) {
          setPhone(formatPhone(result.companyData.telefone));
        }

        if (result.companyData.email) {
          setEmail(result.companyData.email);
        }

        addToast(
          'success',
          'CNPJ Real e Ativo na Receita!',
          `${result.companyData.razaoSocial} localizado e preenchido automaticamente.`
        );
      } else {
        addToast('error', 'CNPJ Inválido', result.error || 'CNPJ não encontrado na Receita Federal.');
      }
    } catch {
      setCnpjResult({
        valid: false,
        cleanCnpj: clean,
        formattedCnpj: formatCNPJ(clean),
        error: 'Erro ao consultar a Receita Federal.'
      });
    } finally {
      setIsVerifyingCnpj(false);
    }
  };

  const handleCnpjChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setCnpj(formatted);
    setCnpjResult(null);

    if (formatted.replace(/\D/g, '').length === 14) {
      handleVerifyCnpjDirectly(formatted);
    }
  };

  // Automatic CEP lookup that pre-fills rua, bairro, cidade and UF
  const handleCepChange = async (value: string) => {
    const formatted = formatCEP(value);
    setZipCode(formatted);
    const cleanCep = formatted.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      setIsSearchingCep(true);
      setCepSuccess(false);
      try {
        const addressData = await fetchAddressByCep(cleanCep);
        if (addressData) {
          if (addressData.street) setAddress(addressData.street);
          if (addressData.neighborhood) setNeighborhood(addressData.neighborhood);
          if (addressData.city) setCity(addressData.city);
          if (addressData.state) setState(addressData.state);
          setCepSuccess(true);
          addToast(
            'success',
            'Endereço localizado!',
            `${addressData.street ? addressData.street + ', ' : ''}${addressData.neighborhood} - ${addressData.city}/${addressData.state}`
          );
        }
      } catch {
        // Fallback silently if any unexpected error
      } finally {
        setIsSearchingCep(false);
      }
    } else {
      setCepSuccess(false);
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (docType === 'cpf') {
      const cleanCpf = cpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        setErrorMsg('O CPF deve conter exatamente 11 números.');
        return;
      }
      if (!validateCPF(cleanCpf)) {
        setErrorMsg('O CPF informado é inválido. Por favor, verifique os números digitados.');
        return;
      }
      if (!companyName.trim()) {
        setErrorMsg('Informe o nome completo do titular / responsável legal.');
        return;
      }
      if (!tradeName.trim()) {
        setErrorMsg('Informe o nome fantasia da sua distribuidora / adega.');
        return;
      }
    } else {
      const cleanCnpj = cnpj.replace(/\D/g, '');
      if (cleanCnpj.length !== 14) {
        setErrorMsg('O CNPJ deve conter exatamente 14 números.');
        return;
      }

      if (cnpjResult && (!cnpjResult.valid || !cnpjResult.isRealAndActive)) {
        setErrorMsg(cnpjResult.error || 'O CNPJ informado é inválido ou não foi localizado na Receita Federal. Por favor, informe um CNPJ real e ativo.');
        return;
      }
      if (!companyName.trim()) {
        setErrorMsg('Informe a Razão Social da empresa.');
        return;
      }
      if (!tradeName.trim()) {
        setErrorMsg('Informe o nome fantasia da distribuidora.');
        return;
      }
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('O telefone comercial deve conter DDD e ao menos 10 números (celular ou fixo).');
      return;
    }

    const cleanCep = zipCode.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setErrorMsg('O CEP deve conter exatamente 8 números.');
      return;
    }

    if (!number.trim()) {
      setErrorMsg('Informe o número do estabelecimento.');
      return;
    }

    // Validação da Chave PIX Exclusiva da Distribuidora (definida pelo assinante)
    const cleanPix = subscriberPixKey.trim();
    if (!cleanPix) {
      setErrorMsg('Por favor, informe a Chave PIX da sua distribuidora para recebimento das vendas.');
      return;
    }

    if (subscriberPixType === 'cpf') {
      const c = cleanPix.replace(/\D/g, '');
      if (c.length !== 11 || !validateCPF(c)) {
        setErrorMsg('A Chave PIX informada como CPF é inválida.');
        return;
      }
    } else if (subscriberPixType === 'cnpj') {
      const c = cleanPix.replace(/\D/g, '');
      if (c.length !== 14) {
        setErrorMsg('A Chave PIX informada como CNPJ deve conter exatamente 14 dígitos.');
        return;
      }
    } else if (subscriberPixType === 'phone') {
      const c = cleanPix.replace(/\D/g, '');
      if (c.length < 10) {
        setErrorMsg('A Chave PIX celular deve conter DDD e número completo (ao menos 10 dígitos).');
        return;
      }
    } else if (subscriberPixType === 'email') {
      if (!cleanPix.includes('@') || !cleanPix.includes('.')) {
        setErrorMsg('A Chave PIX de e-mail informada é inválida.');
        return;
      }
    }

    if (!subscriberBeneficiary.trim()) {
      setErrorMsg('Informe o nome do titular / favorecido da sua conta bancária PIX.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas informadas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    // Advance to step 2 (PIX payment of the plan)
    setStep('pix_payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PLATFORM_PIX_PHONE);
    setCopiedPix(true);
    addToast('success', 'Chave PIX copiada!', `${PLATFORM_PIX_PHONE_FORMATTED} pronto para colar.`);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  // PIX verification check (Success vs. Error)
  const handleVerifyPix = (forceError = false) => {
    if (!pixPayerName.trim()) {
      addToast('error', 'Nome do titular obrigatório', 'Informe quem realizou o Pix para conferência bancária.');
      return;
    }

    setPixStatus('checking');
    setPixErrorMsg('');

    setTimeout(() => {
      if (forceError || !hasPaidPix) {
        setPixStatus('error');
        setPixErrorMsg(
          'O Banco Central não confirmou a liquidação de R$ 80,00 na chave telefone (31) 97534-6290. Verifique se o PIX foi concluído no seu banco ou se os dados informados estão corretos.'
        );
        addToast('error', 'PIX Não Localizado!', 'Nenhum valor de R$ 80,00 foi confirmado ainda nesta chave.');
      } else {
        const transId = `E2E975346290-${Date.now().toString().slice(-6)}`;
        setPixTransactionId(transId);
        setPixStatus('success');
        addToast('success', 'PIX Identificado com Sucesso!', 'Pagamento liquidado. Acesso ao BebêAqui liberado!');
      }
    }, 1800);
  };

  const handleFinalizeRegistration = () => {
    setLoading(true);

    setTimeout(() => {
      const docFormatted = docType === 'cpf' ? cpf : cnpj;
      registerCompany({
        name: companyName,
        tradeName: tradeName || companyName,
        documentType: docType,
        document: docFormatted,
        cnpj: docFormatted, // backward compatibility
        phone,
        email,
        zipCode,
        address,
        number,
        neighborhood,
        city,
        state,
        password,
        bankDetails: {
          pixKeyType: subscriberPixType,
          pixKey: subscriberPixKey,
          beneficiaryName: subscriberBeneficiary || tradeName || companyName,
          bankName: subscriberBankName || 'Nubank',
          agency: '0001',
          account: '12345-6',
          accountType: 'corrente',
          document: docFormatted
        },
        paymentMethodText: `PIX Plataforma Confirmado (Telefone: ${PLATFORM_PIX_PHONE}) - Transação: ${pixTransactionId || 'E2E-OK'}`
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ambiente Oficial BebêAqui</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            🍻 Cadastre sua Distribuidora
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Crie a conta da sua empresa no <strong>BebêAqui</strong> e tenha cardápio digital, mesas, controle de estoque e vendas no mesmo painel.
          </p>

          {step === 'details' && (
            <button
              type="button"
              onClick={() => handleAutoFillExample()}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              ⚡ Preencher dados de exemplo para teste rápido
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-xs font-semibold">
          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              step === 'details'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">Etapa 1</span>
            <span>1. Dados Cadastrais</span>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              step === 'pix_payment'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">Etapa 2</span>
            <span>2. Pagamento PIX (R$ 80)</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              {/* Section 1: Dados da Empresa / Assinante */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>1. Dados Cadastrais do Assinante / Distribuidora</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {docType === 'cpf' ? 'Pessoa Física (Sem CNPJ)' : 'Pessoa Jurídica'}
                  </span>
                </div>

                {/* Seletor CPF ou CNPJ */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300 block">
                    Como deseja cadastrar sua distribuidora?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDocType('cpf');
                        setErrorMsg('');
                        if (subscriberPixType === 'cnpj') {
                          setSubscriberPixType('cpf');
                          if (cpf) setSubscriberPixKey(cpf);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        docType === 'cpf'
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${
                        docType === 'cpf' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <span>Cadastro por CPF</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">
                            Recomendado
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-tight">
                          Ideal para adegas, depósitos e distribuidoras que não possuem CNPJ.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDocType('cnpj');
                        setErrorMsg('');
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        docType === 'cnpj'
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${
                        docType === 'cnpj' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-sm">
                          <span>Cadastro por CNPJ</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-tight">
                          Para distribuidoras formalizadas como LTDA, EIRELI ou MEI com CNPJ ativo.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Campos quando for CPF */}
                {docType === 'cpf' ? (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                          <span>CPF do Responsável / Titular *</span>
                          <div className="flex items-center gap-1.5">
                            {getDigitCount(cpf) === 11 && validateCPF(cpf) && (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> CPF Válido
                              </span>
                            )}
                            {getDigitCount(cpf) === 11 && !validateCPF(cpf) && (
                              <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                                <AlertCircle className="w-3 h-3" /> CPF Inválido
                              </span>
                            )}
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              getDigitCount(cpf) === 11
                                ? validateCPF(cpf) ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-rose-500/20 text-rose-400 font-bold'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {getDigitCount(cpf)}/11
                            </span>
                          </div>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={14}
                          required
                          placeholder="000.000.000-00"
                          value={cpf}
                          onChange={e => handleCpfChange(e.target.value)}
                          className={`w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white font-mono focus:outline-none transition-colors ${
                            getDigitCount(cpf) === 11 && validateCPF(cpf)
                              ? 'border-emerald-500/60 focus:border-emerald-400'
                              : getDigitCount(cpf) === 11 && !validateCPF(cpf)
                              ? 'border-rose-500 focus:border-rose-400'
                              : 'border-slate-700 focus:border-amber-400'
                          }`}
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Apenas números (11 dígitos com validação)</p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-slate-300">Nome Completo do Titular (Responsável Legal) *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Carlos Eduardo da Silva"
                          value={companyName}
                          onChange={e => {
                            setCompanyName(e.target.value);
                            if (!subscriberBeneficiary) setSubscriberBeneficiary(e.target.value);
                          }}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Nome do assinante ou proprietário da distribuidora</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300">Nome da sua Distribuidora / Nome Fantasia *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Adega & Distribuidora Silva Express, Distribuidora Central..."
                        value={tradeName}
                        onChange={e => setTradeName(e.target.value)}
                        className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Como seus clientes reconhecerão seu comércio no cardápio e nos comprovantes</p>
                    </div>
                  </div>
                ) : (
                  /* Campos quando for CNPJ */
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                          <span>CNPJ da Distribuidora *</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            getDigitCount(cnpj) === 14
                              ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {getDigitCount(cnpj)}/14 dígitos
                          </span>
                        </label>
                        <div className="relative mt-1.5">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={18}
                            required
                            placeholder="00.000.000/0001-00"
                            value={cnpj}
                            onChange={e => handleCnpjChange(e.target.value)}
                            className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-sm text-white font-mono focus:outline-none transition-colors ${
                              cnpjResult?.valid && cnpjResult.isRealAndActive
                                ? 'border-emerald-500/60 focus:border-emerald-400'
                                : cnpjResult && !cnpjResult.valid
                                ? 'border-rose-500 focus:border-rose-400'
                                : 'border-slate-700 focus:border-amber-400'
                            }`}
                          />
                          {isVerifyingCnpj && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-amber-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-[10px]">Consultando Receita...</span>
                            </div>
                          )}
                        </div>

                        {cnpjResult?.valid && cnpjResult.isRealAndActive && (
                          <div className="mt-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-0.5">
                            <div className="flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>CNPJ Real & Ativo na Receita Federal</span>
                            </div>
                            <p className="text-[10px] text-slate-300 truncate">
                              {cnpjResult.companyData?.razaoSocial}
                            </p>
                          </div>
                        )}

                        {cnpjResult && !cnpjResult.valid && (
                          <div className="mt-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 space-y-0.5">
                            <div className="flex items-center gap-1 font-bold">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>CNPJ Inválido ou Não Localizado</span>
                            </div>
                            <p className="text-[10px] text-rose-300/90 leading-tight">
                              {cnpjResult.error}
                            </p>
                          </div>
                        )}

                        {!cnpjResult && !isVerifyingCnpj && (
                          <p className="text-[10px] text-slate-500 mt-1">Validação automática e consulta à Receita Federal</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-slate-300">Razão Social da Empresa *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Distribuidora Silva & Cia Ltda"
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300">Nome Fantasia (Como o cliente conhece) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Distribuidora Central de Bebidas"
                        value={tradeName}
                        onChange={e => setTradeName(e.target.value)}
                        className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* Contatos comuns (Telefone e E-mail) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Telefone / WhatsApp Comercial *</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        getDigitCount(phone) >= 10
                          ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {getDigitCount(phone)}/11 dígitos
                      </span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={15}
                      required
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={e => {
                        const fmt = formatPhone(e.target.value);
                        setPhone(fmt);
                        if (subscriberPixType === 'phone') {
                          setSubscriberPixKey(fmt);
                        }
                      }}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Limite máx. 11 números (DDD + 9 dígitos)</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">E-mail de Acesso e Contato *</label>
                    <input
                      type="email"
                      required
                      placeholder="contato@distribuidora.com"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (subscriberPixType === 'email') {
                          setSubscriberPixKey(e.target.value);
                        }
                      }}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Utilizado para login e avisos da conta</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Localização */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <MapPin className="w-4 h-4" />
                  <span>2. Endereço do Estabelecimento</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>CEP *</span>
                      <div className="flex items-center gap-1.5">
                        {isSearchingCep && (
                          <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
                          </span>
                        )}
                        {cepSuccess && !isSearchingCep && (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Localizado!
                          </span>
                        )}
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          getDigitCount(zipCode) === 8
                            ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {getDigitCount(zipCode)}/8
                        </span>
                      </div>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={9}
                      required
                      placeholder="00000-000"
                      value={zipCode}
                      onChange={e => handleCepChange(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Preenche rua, bairro e cidade automaticamente</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-300">Endereço (Rua, Av.) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Rua das Cervejas"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Logradouro do ponto comercial</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Número *</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        máx. 6 núm.
                      </span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      placeholder="120"
                      value={number}
                      onChange={e => setNumber(formatAddressNumber(e.target.value, 6))}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Apenas números (máx. 6)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300">Bairro *</label>
                    <input
                      type="text"
                      required
                      placeholder="Centro"
                      value={neighborhood}
                      onChange={e => setNeighborhood(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Cidade *</label>
                    <input
                      type="text"
                      required
                      placeholder="São Paulo"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">Estado (UF) *</label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="SP">SP - São Paulo</option>
                      <option value="RJ">RJ - Rio de Janeiro</option>
                      <option value="MG">MG - Minas Gerais</option>
                      <option value="RS">RS - Rio Grande do Sul</option>
                      <option value="PR">PR - Paraná</option>
                      <option value="SC">SC - Santa Catarina</option>
                      <option value="BA">BA - Bahia</option>
                      <option value="PE">PE - Pernambuco</option>
                      <option value="DF">DF - Distrito Federal</option>
                      <option value="GO">GO - Goiás</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Chave PIX Única da Distribuidora */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>3. Chave PIX Exclusiva da Distribuidora (Recebimento de Vendas)</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Chave Única no Sistema
                  </span>
                </div>

                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-xs text-emerald-300">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-400 block text-sm">
                      Você escolhe qual Chave PIX deseja usar na sua linha do sistema
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Esta chave será <strong>única e exclusiva da sua distribuidora</strong> no BebêAqui. Quando qualquer cliente pagar no balcão (PDV), nas mesas pelo cardápio digital ou nas maquininhas de cartão com PIX, o dinheiro será creditado <strong>diretamente nesta conta</strong>, sem intermediários!
                    </p>
                  </div>
                </div>

                {/* Seletor de Tipo de Chave */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Tipo de Chave PIX da sua Conta:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectSubscriberPixType('cpf')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all flex flex-col items-center gap-1 ${
                        subscriberPixType === 'cpf'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>CPF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectSubscriberPixType('phone')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all flex flex-col items-center gap-1 ${
                        subscriberPixType === 'phone'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Celular</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectSubscriberPixType('email')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all flex flex-col items-center gap-1 ${
                        subscriberPixType === 'email'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      <span>E-mail</span>
                    </button>

                    {docType === 'cnpj' && (
                      <button
                        type="button"
                        onClick={() => handleSelectSubscriberPixType('cnpj')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all flex flex-col items-center gap-1 ${
                          subscriberPixType === 'cnpj'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>CNPJ</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSelectSubscriberPixType('random')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all flex flex-col items-center gap-1 ${
                        subscriberPixType === 'random'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Aleatória (EVP)</span>
                    </button>
                  </div>
                </div>

                {/* Atalhos rápidos de preenchimento */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Preenchimento rápido:</span>
                  {cpf && (
                    <button
                      type="button"
                      onClick={() => {
                        setSubscriberPixType('cpf');
                        setSubscriberPixKey(cpf);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium border border-slate-700 cursor-pointer"
                    >
                      Usar meu CPF ({cpf})
                    </button>
                  )}
                  {phone && (
                    <button
                      type="button"
                      onClick={() => {
                        setSubscriberPixType('phone');
                        setSubscriberPixKey(phone);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium border border-slate-700 cursor-pointer"
                    >
                      Usar meu Celular ({phone})
                    </button>
                  )}
                  {email && (
                    <button
                      type="button"
                      onClick={() => {
                        setSubscriberPixType('email');
                        setSubscriberPixKey(email);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium border border-slate-700 cursor-pointer"
                    >
                      Usar meu E-mail ({email})
                    </button>
                  )}
                </div>

                {/* Input da Chave PIX e dados bancários */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Chave PIX Cadastrada *</span>
                      {subscriberPixType === 'cpf' && (
                        <span className="text-[10px] font-mono text-slate-400">{getDigitCount(subscriberPixKey)}/11</span>
                      )}
                      {subscriberPixType === 'phone' && (
                        <span className="text-[10px] font-mono text-slate-400">{getDigitCount(subscriberPixKey)}/11</span>
                      )}
                      {subscriberPixType === 'cnpj' && (
                        <span className="text-[10px] font-mono text-slate-400">{getDigitCount(subscriberPixKey)}/14</span>
                      )}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        subscriberPixType === 'cpf'
                          ? '000.000.000-00'
                          : subscriberPixType === 'phone'
                          ? '(11) 98765-4321'
                          : subscriberPixType === 'cnpj'
                          ? '00.000.000/0001-00'
                          : subscriberPixType === 'email'
                          ? 'financeiro@distribuidora.com'
                          : 'Cole a chave aleatória (EVP)'
                      }
                      value={subscriberPixKey}
                      onChange={e => handleSubscriberPixKeyChange(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {subscriberPixType === 'cpf' ? 'Chave CPF do titular' : subscriberPixType === 'phone' ? 'Celular com DDD' : subscriberPixType === 'email' ? 'E-mail bancário' : 'Chave exclusiva da distribuidora'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      Nome do Titular da Conta / Favorecido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo da Silva"
                      value={subscriberBeneficiary}
                      onChange={e => setSubscriberBeneficiary(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Nome exibido no comprovante do cliente</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      Banco / Instituição Financeira *
                    </label>
                    <select
                      value={subscriberBankName}
                      onChange={e => setSubscriberBankName(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Nubank">Nubank</option>
                      <option value="Banco Inter">Banco Inter</option>
                      <option value="Itaú Unibanco">Itaú Unibanco</option>
                      <option value="Bradesco">Bradesco</option>
                      <option value="Santander">Santander</option>
                      <option value="Mercado Pago">Mercado Pago</option>
                      <option value="Caixa Econômica">Caixa Econômica</option>
                      <option value="Banco do Brasil">Banco do Brasil</option>
                      <option value="PagBank">PagBank (PagSeguro)</option>
                      <option value="C6 Bank">C6 Bank</option>
                      <option value="Sicredi">Sicredi</option>
                      <option value="Sicoob">Sicoob</option>
                      <option value="Outro Banco">Outro Banco</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">Onde está aberta a conta do PIX</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Segurança */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Lock className="w-4 h-4" />
                  <span>4. Senha de Acesso do Administrador</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Senha de Acesso *</span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver senha</span>
                          </>
                        )}
                      </button>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                        title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Mínimo de 6 caracteres</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Confirmar Senha *</span>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {showConfirmPassword ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver senha</span>
                          </>
                        )}
                      </button>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Repita a mesma senha"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                        title={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {password && confirmPassword ? (
                        password === confirmPassword ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Senhas conferem
                          </span>
                        ) : (
                          <span className="text-rose-400 font-medium">As senhas não coincidem</span>
                        )
                      ) : (
                        'Deve ser idêntica à senha informada'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Advance to PIX */}
              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Avançar para Pagamento PIX do Plano (R$ 80,00)</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-xs text-slate-400">
                  Já possui uma conta cadastrada?{' '}
                  <button
                    type="button"
                    onClick={() => setActivePage('login')}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    Entrar agora
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* STEP 2: PIX PAYMENT OF THE PLAN */
            <form onSubmit={handleFinalizeRegistration} className="space-y-6">
              {/* Back button */}
              <button
                type="button"
                onClick={() => setStep('details')}
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar e editar dados cadastrais</span>
              </button>

              {/* Title & Important Notice */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 text-sm font-bold">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Controle de Cadastro & Ativação de Plano BebêAqui</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para garantir a segurança e o controle dos estabelecimentos cadastrados na plataforma <strong>BebêAqui</strong>,
                  o pagamento da mensalidade de <strong>R$ 80,00</strong> é feito via <strong>PIX</strong> diretamente no número de telefone do administrador abaixo:
                </p>
              </div>

              {/* PIX Box */}
              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-amber-500/40 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Plano Mensal Selecionado
                    </span>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                      <span>🍻 Plano Distribuidora BebêAqui</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Empresa: <strong>{tradeName || companyName}</strong> ({docType === 'cpf' ? `CPF: ${cpf}` : `CNPJ: ${cnpj}`})
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400">Valor da Assinatura</span>
                    <div className="text-3xl font-extrabold text-amber-400 font-mono">
                      R$ 80,00<span className="text-xs text-slate-400 font-sans font-normal">/mês</span>
                    </div>
                  </div>
                </div>

                {/* Box da Chave PIX Única da Distribuidora Cadastrada */}
                <div className="p-3.5 bg-slate-900 border border-emerald-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Sua Chave PIX exclusiva (onde você receberá suas vendas):</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Chave {subscriberPixType.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-base text-emerald-400 font-mono font-bold">
                    {subscriberPixKey}
                  </div>
                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                    <span>Titular: <strong className="text-slate-200">{subscriberBeneficiary || tradeName || companyName}</strong></span>
                    <span>Banco: <strong className="text-slate-200">{subscriberBankName}</strong></span>
                  </div>
                </div>

                {/* PIX Key Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>Chave PIX Oficial da Plataforma BebêAqui</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Chave Telefone Ativa
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 px-4 py-3.5 bg-slate-900 border border-amber-500/40 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-mono">Chave Telefone</span>
                        <span className="text-lg sm:text-xl font-mono font-extrabold text-amber-300 tracking-wider">
                          {PLATFORM_PIX_PHONE_FORMATTED}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                        ({PLATFORM_PIX_PHONE})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 cursor-pointer shrink-0"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>Chave Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-950" />
                          <span>Copiar Chave PIX</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Steps to pay */}
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                  <div className="font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Como pagar sua ativação:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>Abra o aplicativo do seu banco ou carteira digital.</li>
                    <li>Escolha a opção <strong>PIX</strong> e selecione o tipo de chave <strong>Telefone</strong>.</li>
                    <li>Cole ou digite a chave: <strong className="text-amber-300 font-mono">31975346290</strong>.</li>
                    <li>Confirme o valor de <strong className="text-amber-300 font-mono">R$ 80,00</strong> e conclua a transferência.</li>
                  </ol>
                </div>

                {/* Verification field */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      Nome do Titular da Conta que enviou o Pix (ou WhatsApp) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Silveira"
                      value={pixPayerName}
                      onChange={e => setPixPayerName(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Com essa informação o sistema confere se o valor foi creditado na conta do administrador para liberar seu acesso.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPaidPix}
                      onChange={e => setHasPaidPix(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs text-slate-200">
                      Confirmo que enviei o valor de <strong>R$ 80,00</strong> para o PIX telefone <strong>(31) 97534-6290</strong>.
                    </span>
                  </label>
                </div>
              </div>

              {/* Status Display Area */}
              {pixStatus === 'checking' && (
                <div className="p-8 rounded-2xl bg-slate-900 border border-amber-500/40 text-center space-y-4 animate-in fade-in">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
                    <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Consultando Liquidação do PIX...</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Conferindo se o PIX de <strong>R$ 80,00</strong> foi recebido na chave <strong>(31) 97534-6290</strong> em nome de <strong>{pixPayerName || 'sua conta'}</strong>...
                    </p>
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-slate-950 text-[11px] font-mono text-slate-400 border border-slate-800">
                    Aguarde alguns segundos para confirmação bancária
                  </div>
                </div>
              )}

              {pixStatus === 'success' && (
                <div className="p-6 sm:p-8 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                      <span>✓ Pagamento Confirmado</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white">
                      🎉 Acesso ao BebêAqui Liberado!
                    </h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Identificamos com sucesso o recebimento de <strong>R$ 80,00</strong> na chave PIX <strong>(31) 97534-6290</strong>. Sua conta está ativa.
                    </p>
                  </div>

                  {/* Receipt Box */}
                  <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/30 text-left text-xs space-y-2 font-mono">
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Distribuidora:</span>
                      <span className="font-bold text-white font-sans">{tradeName || companyName} ({docType === 'cpf' ? `CPF: ${cpf}` : `CNPJ: ${cnpj}`})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Sua Chave PIX de Vendas:</span>
                      <span className="text-emerald-300 font-bold">{subscriberPixKey} ({subscriberPixType.toUpperCase()})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Titular Pagador:</span>
                      <span className="text-slate-200">{pixPayerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Valor Pago:</span>
                      <span className="text-emerald-400 font-bold">R$ 80,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Código E2E / Autenticação:</span>
                      <span className="text-slate-300 text-[11px]">{pixTransactionId}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinalizeRegistration}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>{loading ? 'Entrando no painel...' : 'Entrar no Painel da sua Distribuidora'}</span>
                  </button>
                </div>
              )}

              {pixStatus === 'error' && (
                <div className="p-6 sm:p-8 rounded-2xl bg-rose-950/30 border-2 border-rose-500/50 space-y-5 animate-in shake">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center shrink-0 border border-rose-500/40">
                      <XCircle className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded uppercase">
                        Não Concluído
                      </div>
                      <h4 className="text-lg font-bold text-white">
                        Pagamento PIX Não Identificado ou Não Concluído
                      </h4>
                      <p className="text-xs text-rose-200 leading-relaxed">
                        {pixErrorMsg || 'Ainda não identificamos a transferência de R$ 80,00 na chave telefone (31) 97534-6290.'}
                      </p>
                    </div>
                  </div>

                  {/* Diagnostic details */}
                  <div className="p-4 bg-slate-950/90 rounded-xl border border-rose-500/20 text-xs space-y-2.5 text-slate-300">
                    <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Possíveis motivos da não identificação:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                      <li><strong>Transferência ainda não concluída no banco:</strong> Verifique no seu aplicativo bancário se o comprovante final foi gerado.</li>
                      <li><strong>Chave incorreta:</strong> A chave oficial deve ser o telefone celular <strong className="text-amber-300 font-mono">31975346290</strong>.</li>
                      <li><strong>Valor divergente:</strong> O valor do plano é exatamente <strong className="text-amber-300 font-mono">R$ 80,00</strong>.</li>
                      <li><strong>Lentidão do Banco Central:</strong> Em horários de pico, pode levar até 2 minutos para liquidação.</li>
                    </ul>
                  </div>

                  {/* Actions to fix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleVerifyPix(false)}
                      className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Conferir PIX Novamente</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700"
                    >
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Copiar Chave Novamente</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-center">
                    <a
                      href={`https://wa.me/5531975346290?text=${encodeURIComponent(
                        `Olá, realizei o PIX de R$ 80,00 do plano BebêAqui para a distribuidora ${tradeName || companyName} e gostaria de confirmar.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Falar com o administrador no WhatsApp (31 97534-6290)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons for Idle or Error */}
              {pixStatus !== 'success' && pixStatus !== 'checking' && (
                <div className="pt-2 space-y-4">
                  <button
                    type="button"
                    onClick={() => handleVerifyPix(false)}
                    disabled={loading || !hasPaidPix || !pixPayerName.trim()}
                    className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Conferir e Confirmar Pagamento do PIX (R$ 80,00)</span>
                  </button>

                  {/* Fast Simulation Bar */}
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Testar respostas da plataforma:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!pixPayerName.trim()) setPixPayerName('Carlos Silva (Titular Teste)');
                          handleVerifyPix(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Simular Pix Pago (Liberar)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!pixPayerName.trim()) setPixPayerName('Carlos Silva');
                          handleVerifyPix(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Simular Erro / Não Concluído</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-[11px] text-slate-400">
                    O administrador do BebêAqui fará o acompanhamento do seu PIX na chave (31) 97534-6290. Assim que identificado, seu acesso será liberado.
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

