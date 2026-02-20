import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCards } from '../contexts/CardContext'
import { calculateDashboardStats } from '../utils/finance'
import {
    TrendingUp,
    Users,
    CreditCard,
    AlertCircle,
    ArrowRight,
    Sparkles,
    PiggyBank,
    Receipt,
    Plus,
    X,
    Check,
    ChevronDown
} from 'lucide-react'

function AddCardModal({ isOpen, onClose }) {
    const { addCard } = useCards()
    const [formData, setFormData] = useState({
        nome: '',
        limite: '',
        fechamento: '',
        vencimento: ''
    })

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        addCard(formData)
        setFormData({ nome: '', limite: '', fechamento: '', vencimento: '' })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#131620] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-fadeInUp" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white tracking-tight">Adicionar Cartão</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Nome do Cartão</label>
                            <input
                                type="text"
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                className="input-field"
                                placeholder="Ex: Nubank, Inter, XP..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Limite Total (R$)</label>
                            <input
                                type="number"
                                value={formData.limite}
                                onChange={e => setFormData({ ...formData, limite: e.target.value })}
                                className="input-field"
                                placeholder="0,00"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Dia Fechamento</label>
                                <input
                                    type="number"
                                    min="1" max="31"
                                    value={formData.fechamento}
                                    onChange={e => setFormData({ ...formData, fechamento: e.target.value })}
                                    className="input-field"
                                    placeholder="Dia"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Dia Vencimento</label>
                                <input
                                    type="number"
                                    min="1" max="31"
                                    value={formData.vencimento}
                                    onChange={e => setFormData({ ...formData, vencimento: e.target.value })}
                                    className="input-field"
                                    placeholder="Dia"
                                    required
                                />
                            </div>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
                            <button type="submit" className="btn-primary flex-1 justify-center shadow-lg shadow-indigo-500/20">Salvar Cartão</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, sublabel, colorClass, delay = 0 }) {
    return (
        <div
            className="group relative bg-[#131620] border border-white/5 p-6 rounded-2xl hover:border-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 animate-fadeInUp flex flex-col justify-between h-full"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles size={14} className="text-white/20" />
            </div>

            <div className="flex items-start justify-between mb-6">
                <div className={`p-3.5 rounded-xl ${colorClass} bg-opacity-10 ring-1 ring-white/10`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>

            <div>
                <p className="text-3xl font-bold text-white mb-2 tracking-tight">{value}</p>
                <p className="text-slate-400 text-sm font-medium">{label}</p>
                {sublabel && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {sublabel}
                    </div>
                )}
            </div>
        </div>
    )
}

function LimiteCard({ usado, total }) {
    const porcentagem = Math.min((usado / total) * 100, 100)
    const disponivel = Math.max(total - usado, 0)

    return (
        <div className="lg:col-span-2 relative bg-gradient-to-br from-[#131620] to-[#0f1119] border border-white/5 p-8 rounded-2xl overflow-hidden group hover:border-indigo-500/20 transition-all duration-300 shadow-xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-600/15 transition-all duration-500" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <CreditCard size={20} className="text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Limite do Cartão</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Limite Total: <span className="text-white font-semibold">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-bold text-lg">{porcentagem.toFixed(1)}%</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Utilizado</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Progress Bar */}
                    <div className="relative h-4 bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out"
                            style={{ width: `${porcentagem}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                <TrendingUp size={14} className="text-red-400" />
                                Usado
                            </p>
                            <p className="text-2xl font-bold text-white tracking-tight">
                                R$ {usado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="border-l border-white/5 pl-8">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                <PiggyBank size={14} className="text-emerald-400" />
                                Disponível
                            </p>
                            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
                                R$ {disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const navigate = useNavigate()
    const { cards, selectedCard, selectedCardId, setSelectedCardId, purchases, adjustments } = useCards()
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false)
    const [isCardMenuOpen, setIsCardMenuOpen] = useState(false)

    // Using centralized logic for consistency
    const dashboardData = useMemo(() => {
        return calculateDashboardStats(purchases || [], selectedCardId, adjustments || [])
    }, [purchases, selectedCardId, adjustments])

    // Fallback se não houver cartão (não deve acontecer com o context, mas por segurança)
    if (!selectedCard) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <CreditCard size={40} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao CardManager</h2>
                <p className="text-slate-400 mb-8 max-w-md">Para começar a controlar suas finanças, adicione seu primeiro cartão de crédito.</p>
                <button onClick={() => setIsAddCardModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Adicionar Cartão
                </button>
                <AddCardModal isOpen={isAddCardModalOpen} onClose={() => setIsAddCardModalOpen(false)} />
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Page Header with Card Switcher */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fadeInUp relative z-30">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Visão Geral</h1>

                    {/* Card Selector */}
                    <div className="relative mt-4 inline-block z-50">
                        <button
                            onClick={() => setIsCardMenuOpen(!isCardMenuOpen)}
                            className="flex items-center gap-3 bg-[#131620] border border-white/10 hover:border-indigo-500/50 px-4 py-2.5 rounded-xl transition-all w-full md:w-auto min-w-[240px] justify-between group shadow-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                    <CreditCard size={14} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Cartão Selecionado</p>
                                    <p className="text-white font-bold">{selectedCard.nome}</p>
                                </div>
                            </div>
                            <ChevronDown size={18} className={`text-slate-500 transition-transform ${isCardMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isCardMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsCardMenuOpen(false)} />
                                <div className="absolute top-full left-0 mt-2 w-full md:w-[280px] bg-[#131620] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeInUp">
                                    <div className="p-2 border-b border-white/5">
                                        <p className="text-xs font-bold text-slate-500 px-3 py-2 uppercase tracking-wider">Seus Cartões</p>
                                    </div>
                                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                                        {cards.map(card => (
                                            <button
                                                key={card.id}
                                                onClick={() => {
                                                    setSelectedCardId(card.id)
                                                    setIsCardMenuOpen(false)
                                                }}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${selectedCardId === card.id
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <div className={`w-2 h-8 rounded-full ${card.cor || 'bg-slate-600'}`} />
                                                <div className="flex-1 text-left">
                                                    <p className="font-bold text-sm">{card.nome}</p>
                                                    <p className="text-[10px] opacity-70 uppercase tracking-wider">{card.bandeira || 'Cartão'}</p>
                                                </div>
                                                {selectedCardId === card.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-white/5 bg-slate-900/50">
                                        <button
                                            onClick={() => {
                                                navigate('/gerenciar-cartoes')
                                                setIsCardMenuOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 p-3 text-sm text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors font-medium justify-center"
                                        >
                                            <Plus size={16} /> Gerenciar Cartões
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to="/nova-compra"
                        className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                    >
                        <span>Nova Compra</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LimiteCard usado={dashboardData.limiteUsado} total={selectedCard.limite} />

                <StatCard
                    icon={Users}
                    label="Total de Devedores"
                    value={dashboardData.totalDevedores}
                    sublabel="Pessoas ativas no cartão"
                    colorClass="icon-bg-cyan"
                    delay={200}
                />

                <StatCard
                    icon={AlertCircle}
                    label="Parcelas a Vencer"
                    value={dashboardData.parcelasVencer}
                    sublabel="Nos próximos 30 dias"
                    colorClass="icon-bg-warning"
                    delay={300}
                />
            </div>

            {/* Lower Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Devedores List */}
                <div className="xl:col-span-2 bg-[#131620] border border-white/5 rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Users size={20} className="text-indigo-400" />
                                Maiores Devedores
                            </h2>
                        </div>
                        <Link to="/devedores" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                            Ver todos tabela &rarr;
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {dashboardData.devedores.length > 0 ? (
                            dashboardData.devedores.map((devedor, index) => (
                                <div key={devedor.id} className="group flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-transparent hover:border-indigo-500/20 hover:bg-slate-800/50 transition-all duration-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-sm">
                                            {devedor.nome.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{devedor.nome}</p>
                                            <p className="text-xs text-slate-400">{devedor.parcelas} parcelas restantes</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-400 font-bold">R$ {devedor.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>Nenhum devedor com saldo neste cartão.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Invoices */}
                <div className="bg-[#131620] border border-white/5 rounded-2xl p-8 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Receipt size={20} className="text-purple-400" />
                            Próximas Faturas
                        </h2>
                        <Link to="/faturas" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                            Ver detalhes &rarr;
                        </Link>
                    </div>

                    <div className="relative border-l border-slate-800 ml-3 space-y-8 pl-8 py-2">
                        {dashboardData.proximasFaturas.length > 0 ? (
                            dashboardData.proximasFaturas.map((fatura, index) => (
                                <div key={fatura.mes} className="relative group">
                                    <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-[#131620] bg-slate-700 group-hover:bg-purple-500 transition-colors duration-300" />

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">{fatura.mes}</p>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Estimativa</p>
                                        </div>
                                        <p className="text-white font-bold">R$ {fatura.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-500 text-sm">Nenhuma fatura futura projetada.</div>
                        )}
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-sm text-purple-200/80 leading-relaxed">
                        <Sparkles size={16} className="inline mr-2 text-purple-400" />
                        Os valores das faturas futuras são calculados automaticamente com base nas parcelas cadastradas.
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddCardModal isOpen={isAddCardModalOpen} onClose={() => setIsAddCardModalOpen(false)} />
        </div>
    )
}
