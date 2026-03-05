import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, TrendingDown, ChevronDown, Sparkles, PartyPopper, Wallet, Receipt, CreditCard, User, Filter, X, Calculator, Edit2 } from 'lucide-react'
import { useCards } from '../contexts/CardContext'
import { generateProjecao } from '../utils/finance'
import SimuladorFatura from '../components/SimuladorFatura'
import FaturaEditModal from '../components/FaturaEditModal'

function FaturaCard({ fatura, index, isFiltered, onEditItem }) {
    const [isExpanded, setIsExpanded] = useState(index === 0 || isFiltered)
    const maxValor = Math.max(...Object.values(fatura.devedores), 1)

    const getBarWidth = (valor, max) => {
        return `${(valor / max) * 100}%`
    }

    return (
        <div
            className="group bg-[#131620] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5 animate-fadeInUp"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div
                className="p-6 lg:p-8 cursor-pointer flex items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${fatura.total > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'} ring-1 ring-white/5`}>
                        {fatura.total > 0 ? <Receipt size={24} /> : <PartyPopper size={24} />}
                    </div>

                    <div>
                        <h3 className="font-bold text-xl text-white capitalize tracking-tight mb-1">{fatura.mes}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            {fatura.total > 0 ? (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    {fatura.numDevedores} {fatura.numDevedores === 1 ? 'devedor' : 'devedores'}
                                </>
                            ) : (
                                <span className="text-emerald-400 font-medium">Mês quitado</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                        <p className={`text-2xl font-bold tracking-tight ${fatura.total > 0 ? 'text-white' : 'text-emerald-400'}`}>
                            R$ {fatura.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Valor Previsto</p>
                    </div>

                    {fatura.numDevedores > 0 && (
                        <div className={`p-2 rounded-lg transition-all duration-300 ${isExpanded ? 'bg-indigo-500/20 text-indigo-400 rotate-180' : 'bg-slate-800 text-slate-400'}`}>
                            <ChevronDown size={20} />
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && fatura.numDevedores > 0 && (
                <div className="border-t border-slate-800/50 bg-[#0B0F19]/50 p-6 lg:p-8 space-y-8">
                    {Object.entries(fatura.devedores).map(([nome, valor], idx) => (
                        <div key={nome} className="animate-fadeInUp" style={{ animationDelay: `${idx * 50}ms` }}>

                            {/* Devedor Header */}
                            <div className="flex items-center gap-6 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
                                    {nome.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-200 text-lg">{nome}</span>
                                        <span className="font-bold text-indigo-300">
                                            R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full relative"
                                            style={{ width: getBarWidth(valor, maxValor) }}
                                        >
                                            <div className="absolute inset-0 bg-white/20" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detalhes das Compras */}
                            <div className="ml-16 space-y-2">
                                {fatura.devedoresDetailed[nome]?.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/item">
                                        <div className='flex items-center gap-3'>
                                            <div className="w-1 h-8 rounded-full bg-indigo-500/30"></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-300 group-hover/item:text-white transition-colors">
                                                    {item.descricao}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                                                    Parcela {item.parcela}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-sm font-bold text-slate-400 group-hover/item:text-indigo-300 transition-colors">
                                                R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onEditItem(item)
                                                }}
                                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 opacity-0 group-hover/item:opacity-100 transition-all"
                                                title="Editar Parcela"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {isExpanded && fatura.numDevedores === 0 && (
                <div className="border-t border-emerald-500/10 bg-emerald-500/5 p-8 text-center">
                    <p className="text-emerald-400 font-medium">Nenhum débito para este mês. Tudo limpo! 🎉</p>
                </div>
            )}
        </div>
    )
}

export default function Faturas() {
    const navigate = useNavigate()
    const { cards, selectedCard, setSelectedCardId, purchases, devedores, adjustments } = useCards() || {
        cards: [],
        selectedCard: { nome: 'Demo', id: 1 },
        setSelectedCardId: () => { },
        purchases: [],
        devedores: [],
        adjustments: []
    }
    const [isCardMenuOpen, setIsCardMenuOpen] = useState(false)
    const [selectedDevedorId, setSelectedDevedorId] = useState('')
    const [isSimuladorOpen, setIsSimuladorOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    // Generate projection using centralized utility
    const fullProjecao = useMemo(() =>
        generateProjecao(selectedCardId, purchases, adjustments),
        [selectedCardId, purchases, adjustments]
    )

    // Filter projection if debtor selected
    const projecao = useMemo(() => {
        if (!selectedDevedorId) return fullProjecao

        // Filter functionality: Keep months but only show selected debtor data
        return fullProjecao.map(mes => {
            const devedorNome = devedores.find(d => d.id === parseInt(selectedDevedorId))?.nome
            if (!devedorNome) return mes

            // Check if this debtor has debt in this month
            if (!mes.devedores[devedorNome]) {
                // Return empty/zeroed month for this view or skip? 
                // Better to show month with 0 if we want to keep timeline, 
                // or just modify the 'devedores' obj.
                // Let's modify so FaturaCard only shows this debtor.
                return {
                    ...mes,
                    total: 0,
                    devedores: {},
                    devedoresDetailed: {},
                    numDevedores: 0
                }
            }

            const valor = mes.devedores[devedorNome]
            const details = mes.devedoresDetailed[devedorNome]

            return {
                ...mes,
                total: valor,
                devedores: { [devedorNome]: valor },
                devedoresDetailed: { [devedorNome]: details },
                numDevedores: 1
            }
        })
    }, [fullProjecao, selectedDevedorId, devedores])

    // Totais (baseado na projeção filtrada)
    const totalGeral = projecao.reduce((acc, f) => acc + f.total, 0)
    const mesesComFatura = projecao.filter(f => f.total > 0).length
    const ultimaFaturaIndex = projecao.findIndex(f => f.total === 0)
    const quitacaoMeses = ultimaFaturaIndex === -1 ? 12 : ultimaFaturaIndex

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 animate-fadeInUp relative z-30">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Calendar size={24} className="text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Projeção de Faturas</h1>
                    </div>
                    <p className="text-slate-400 max-w-2xl mb-4">
                        Visualize e planeje seus pagamentos futuros para os próximos 12 meses.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {/* Card Selector */}
                        <div className="relative inline-block z-50">
                            <button
                                onClick={() => setIsCardMenuOpen(!isCardMenuOpen)}
                                className="flex items-center gap-3 bg-[#131620] border border-white/10 hover:border-indigo-500/50 px-4 py-2.5 rounded-xl transition-all min-w-[240px] justify-between group shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                        <CreditCard size={14} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Cartão Atual</p>
                                        <p className="text-white font-bold">{selectedCardId === 'all' ? 'Todos os Cartões' : selectedCard?.nome}</p>
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
                                            <button
                                                onClick={() => {
                                                    setSelectedCardId('all')
                                                    setIsCardMenuOpen(false)
                                                }}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${selectedCardId === 'all'
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <div className="w-2 h-8 rounded-full bg-slate-400" />
                                                <div className="flex-1 text-left">
                                                    <p className="font-bold text-sm">Todos os Cartões</p>
                                                    <p className="text-[10px] opacity-70 uppercase tracking-wider">Visão Consolidada</p>
                                                </div>
                                                {selectedCardId === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                            </button>

                                            {cards.map(card => (
                                                <button
                                                    key={card.id}
                                                    onClick={() => {
                                                        setSelectedCardId(card.id)
                                                        setIsCardMenuOpen(false)
                                                    }}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${selectedCard?.id === card.id
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <div className={`w-2 h-8 rounded-full ${card.cor || 'bg-slate-600'}`} />
                                                    <div className="flex-1 text-left">
                                                        <p className="font-bold text-sm">{card.nome}</p>
                                                        <p className="text-[10px] opacity-70 uppercase tracking-wider">{card.bandeira}</p>
                                                    </div>
                                                    {selectedCard?.id === card.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="p-2 border-t border-white/5 bg-[#0B0F19]/50">
                                            <button
                                                onClick={() => navigate('/gerenciar-cartoes')}
                                                className="w-full py-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                                            >
                                                <div className="w-4 h-4 rounded-full border border-indigo-500/50 flex items-center justify-center">+</div>
                                                Gerenciar Cartões
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Debtor Filter */}
                        <div className="relative inline-block z-40">
                            <div className="flex items-center gap-2 h-full bg-[#131620] border border-white/10 px-3 rounded-xl hover:border-indigo-500/30 transition-colors">
                                <Filter size={16} className="text-slate-500" />
                                <select
                                    value={selectedDevedorId}
                                    onChange={(e) => setSelectedDevedorId(e.target.value)}
                                    className="bg-transparent border-none outline-none text-white text-sm font-medium focus:ring-0 cursor-pointer min-w-[150px] py-2.5"
                                >
                                    <option value="" className="bg-[#131620]">Todos os Devedores</option>
                                    {devedores.map(d => (
                                        <option key={d.id} value={d.id} className="bg-[#131620]">{d.nome}</option>
                                    ))}
                                </select>
                                {selectedDevedorId && (
                                    <button
                                        onClick={() => setSelectedDevedorId('')}
                                        className="p-1 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simulator Button */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setIsSimuladorOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Calculator size={20} />
                        Simular Compra
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                <div className="bg-[#131620] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Wallet size={20} className="text-indigo-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Total a Receber</span>
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tight">
                            R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="bg-[#131620] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400">
                            <Calendar size={16} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Meses com Fatura</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-white">{mesesComFatura}</p>
                        <span className="text-sm text-slate-500">de 12 meses</span>
                    </div>
                </div>

                <div className="bg-[#131620] border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingDown size={20} className="text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">Quitação Estimada</span>
                        </div>
                        <p className="text-3xl font-bold text-emerald-400 tracking-tight">
                            {quitacaoMeses} meses
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5 flex items-start gap-4 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
                <Sparkles size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-indigo-300 mb-1">Como funciona a projeção inteligente?</h4>
                    <p className="text-sm text-indigo-200/70 leading-relaxed">
                        O sistema calcula automaticamente o valor de cada fatura com base nas compras parceladas de todos os devedores.
                        Antecipações de pagamento ou novas compras são refletidas instantaneamente nesta visão.
                    </p>
                </div>
            </div>

            {/* Lista de Faturas */}
            <div className="space-y-6 pb-12">
                {projecao.map((fatura, index) => (
                    <FaturaCard
                        key={fatura.mes}
                        fatura={fatura}
                        index={index}
                        isFiltered={!!selectedDevedorId}
                        onEditItem={(item) => setEditingItem(item)}
                    />
                ))}
            </div>

            {/* Modals */}
            <SimuladorFatura
                isOpen={isSimuladorOpen}
                onClose={() => setIsSimuladorOpen(false)}
                cardId={selectedCard?.id}
                purchases={purchases}
                adjustments={adjustments}
            />

            <FaturaEditModal
                isOpen={!!editingItem}
                onClose={() => setEditingItem(null)}
                selectedItem={editingItem}
            />
        </div>
    )
}
