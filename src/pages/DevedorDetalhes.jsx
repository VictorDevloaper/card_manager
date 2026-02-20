import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCards } from '../contexts/CardContext'
import {
    ArrowLeft,
    Phone,
    ShoppingBag,
    Calendar,
    Check,
    Clock,
    Plus,
    ChevronDown,
    Wallet,
    CheckCircle2,
    AlertTriangle,
    Edit2,
    Save,
    X
} from 'lucide-react'

function EditPurchaseModal({ isOpen, onClose, compra, onSave }) {
    const [dataCompra, setDataCompra] = useState('')
    const [parcelasPagas, setParcelasPagas] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen || !compra) return null

    const numParcelas = compra.numParcelas || compra.num_parcelas
    const currentDataCompra = compra.dataCompra || compra.data_compra || ''
    const currentParcelasPagas = compra.parcelasPagas || compra.parcelas_pagas || 0

    const handleOpen = () => {
        setDataCompra(currentDataCompra)
        setParcelasPagas(currentParcelasPagas.toString())
    }

    // Initialize values when modal opens
    if (dataCompra === '' && parcelasPagas === '') {
        setDataCompra(currentDataCompra)
        setParcelasPagas(currentParcelasPagas.toString())
    }

    const handleSave = async () => {
        setIsSubmitting(true)
        try {
            await onSave(compra.id, {
                data_compra: dataCompra,
                parcelas_pagas: parseInt(parcelasPagas) || 0
            })
            onClose()
        } catch (err) {
            console.error('Erro ao salvar:', err)
            alert('Erro ao salvar alterações.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#131620] border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl animate-fadeInUp" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white">Editar Compra</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Compra</p>
                        <p className="text-white font-medium">{compra.descricao}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Data da Compra</label>
                        <input
                            type="date"
                            value={dataCompra}
                            onChange={e => setDataCompra(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Parcelas Já Pagas (de {numParcelas} total)
                        </label>
                        <input
                            type="number"
                            value={parcelasPagas}
                            onChange={e => setParcelasPagas(e.target.value)}
                            className="input-field"
                            min="0"
                            max={numParcelas}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="btn-primary flex-1 flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? 'Salvando...' : <><Save size={18} /> Salvar</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CompraCard({ compra, onToggleParcela, onEditCompra }) {
    const [isExpanded, setIsExpanded] = useState(false)

    const parcelasPagas = compra.parcelasPagas || compra.parcelas_pagas || 0
    const numParcelas = compra.numParcelas || compra.num_parcelas
    const valorTotal = compra.valorTotal || compra.valor_total
    const valorParcela = valorTotal / numParcelas
    const parcelasRestantes = numParcelas - parcelasPagas
    const valorRestante = parcelasRestantes * valorParcela
    const progresso = (parcelasPagas / numParcelas) * 100

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('pt-BR')
    }

    // Generate installment list dynamically
    const parcelas = useMemo(() => {
        const dataCompra = new Date(compra.dataCompra || compra.data_compra)
        const list = []
        for (let i = 1; i <= numParcelas; i++) {
            const vencimento = new Date(dataCompra.getFullYear(), dataCompra.getMonth() + i, dataCompra.getDate())
            list.push({
                numero: i,
                valor: valorParcela,
                vencimento: vencimento.toISOString().split('T')[0],
                pago: i <= parcelasPagas
            })
        }
        return list
    }, [compra, numParcelas, valorParcela, parcelasPagas])

    return (
        <div className="card overflow-hidden animate-fadeInUp">
            {/* Header */}
            <div
                className="p-5 lg:p-6 cursor-pointer hover:bg-slate-700/20 transition-all duration-300"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl icon-bg-primary">
                            <ShoppingBag size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">{compra.descricao}</h3>
                            <p className="text-sm text-slate-400 flex items-center gap-2">
                                <Calendar size={14} />
                                Compra em {formatDate(compra.dataCompra || compra.data_compra)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-bold text-xl">
                                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-slate-400">
                                {numParcelas}x de R$ {valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEditCompra(compra)
                                }}
                                className="p-2 rounded-xl bg-slate-700/50 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-all"
                                title="Editar compra"
                            >
                                <Edit2 size={16} />
                            </button>
                            <div className={`p-2 rounded-xl transition-all duration-300 ${isExpanded ? 'bg-indigo-500/20 rotate-180' : 'bg-slate-700/50'}`}>
                                <ChevronDown size={20} className={isExpanded ? 'text-indigo-400' : ''} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2 text-slate-400">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            {parcelasPagas} de {numParcelas} pagas
                        </span>
                        <span className="font-semibold gradient-text-gold">
                            Restam R$ {valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${progresso}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Parcelas */}
            {isExpanded && (
                <div className="border-t border-slate-700/50 p-5 lg:p-6 bg-slate-800/20 animate-fadeInUp">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold flex items-center gap-2">
                            <Wallet size={16} className="text-indigo-400" />
                            Parcelas
                        </h4>
                        <span className="text-sm text-slate-400">
                            {parcelasRestantes} restantes
                        </span>
                    </div>
                    <div className="grid gap-2">
                        {parcelas.map((parcela, index) => (
                            <div
                                key={parcela.numero}
                                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 
                  ${parcela.pago
                                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                                        : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                                    }`}
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            e.preventDefault()
                                            onToggleParcela(compra.id, parcela.numero, parcela.pago)
                                        }}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer
                      ${parcela.pago
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                : 'border-2 border-slate-500 hover:border-indigo-500 hover:bg-indigo-500/10'
                                            }`}
                                    >
                                        {parcela.pago && <Check size={16} />}
                                    </button>
                                    <div>
                                        <p className={`font-medium ${parcela.pago ? 'line-through text-slate-400' : ''}`}>
                                            Parcela {parcela.numero}/{numParcelas}
                                        </p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock size={12} /> Venc. {formatDate(parcela.vencimento)}
                                        </p>
                                    </div>
                                </div>
                                <p className={`font-bold ${parcela.pago ? 'text-slate-400 line-through' : 'text-white'}`}>
                                    R$ {parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function DevedorDetalhes() {
    const { id } = useParams()
    const { devedores, purchases, selectedCard, updatePurchase } = useCards() || {
        devedores: [],
        purchases: [],
        selectedCard: null,
        updatePurchase: () => { }
    }

    const [editingCompra, setEditingCompra] = useState(null)

    // Find the actual debtor by ID
    const devedor = devedores.find(d => d.id === parseInt(id) || d.id === id)

    // Filter purchases for this debtor
    const devedorPurchases = useMemo(() => {
        if (!devedor) return []
        return purchases.filter(p =>
            (p.devedorId === devedor.id || p.devedor_id === devedor.id) &&
            (selectedCard ? (p.cardId === selectedCard.id || p.card_id === selectedCard.id) : true)
        )
    }, [devedor, purchases, selectedCard])

    const handleToggleParcela = async (purchaseId, parcelaNumero, isPago) => {
        const newParcelasPagas = isPago ? parcelaNumero - 1 : parcelaNumero
        try {
            const result = await updatePurchase(purchaseId, { parcelas_pagas: newParcelasPagas })
            if (!result) {
                console.error('updatePurchase retornou null para purchaseId:', purchaseId)
            }
        } catch (err) {
            console.error('Erro no toggle:', err)
        }
    }

    const handleEditSave = async (purchaseId, updatedFields) => {
        await updatePurchase(purchaseId, updatedFields)
    }

    if (!devedor) {
        return (
            <div className="space-y-8">
                <div className="animate-fadeInUp">
                    <Link
                        to="/devedores"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Voltar para devedores
                    </Link>
                </div>
                <div className="card p-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                        <AlertTriangle size={36} className="text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Devedor não encontrado</h3>
                    <p className="text-slate-400">O devedor com ID #{id} não foi encontrado no sistema.</p>
                </div>
            </div>
        )
    }

    const totalParcelas = devedorPurchases.reduce((acc, c) => acc + (c.numParcelas || c.num_parcelas || 0), 0)
    const parcelasPagas = devedorPurchases.reduce((acc, c) => acc + (c.parcelasPagas || c.parcelas_pagas || 0), 0)
    const totalDevido = devedorPurchases.reduce((acc, c) => {
        const numP = c.numParcelas || c.num_parcelas || 1
        const valT = c.valorTotal || c.valor_total || 0
        const paid = c.parcelasPagas || c.parcelas_pagas || 0
        return acc + ((numP - paid) * (valT / numP))
    }, 0)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="animate-fadeInUp">
                <Link
                    to="/devedores"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Voltar para devedores
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="avatar w-20 h-20 text-3xl">
                            {devedor.nome.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold mb-1">{devedor.nome}</h1>
                            <p className="text-slate-400 flex items-center gap-2 text-lg">
                                <Phone size={18} /> {devedor.telefone || 'Sem telefone'}
                            </p>
                        </div>
                    </div>
                    <Link
                        to={`/nova-compra?devedor=${id}`}
                        className="btn-primary flex items-center justify-center gap-2 group"
                    >
                        <Plus size={20} />
                        <span>Nova Compra</span>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                <div className="card p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                    <div className="flex items-center gap-2 text-amber-400 mb-3">
                        <Wallet size={18} />
                        <span className="text-xs font-medium uppercase tracking-wider">Total Devido</span>
                    </div>
                    <p className="text-3xl font-bold gradient-text-gold">
                        R$ {totalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="card p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-400 mb-3">
                        <CheckCircle2 size={18} />
                        <span className="text-xs font-medium uppercase tracking-wider">Parcelas Pagas</span>
                    </div>
                    <p className="text-3xl font-bold">
                        <span className="text-emerald-400">{parcelasPagas}</span>
                        <span className="text-xl text-slate-400"> / {totalParcelas}</span>
                    </p>
                </div>
                <div className="card p-6">
                    <div className="flex items-center gap-2 text-indigo-400 mb-3">
                        <ShoppingBag size={18} />
                        <span className="text-xs font-medium uppercase tracking-wider">Compras Ativas</span>
                    </div>
                    <p className="text-3xl font-bold">{devedorPurchases.length}</p>
                </div>
            </div>

            {/* Compras */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-2xl font-bold">Compras</h2>
                    <span className="badge badge-info">{devedorPurchases.length} itens</span>
                </div>
                {devedorPurchases.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                            <ShoppingBag size={28} className="text-slate-500" />
                        </div>
                        <p className="text-slate-400">Este devedor não possui compras {selectedCard ? 'neste cartão' : ''}.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {devedorPurchases.map((compra, index) => (
                            <div key={compra.id} style={{ animationDelay: `${(index + 2) * 100}ms` }}>
                                <CompraCard
                                    compra={compra}
                                    onToggleParcela={handleToggleParcela}
                                    onEditCompra={(c) => setEditingCompra(c)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <EditPurchaseModal
                isOpen={!!editingCompra}
                onClose={() => setEditingCompra(null)}
                compra={editingCompra}
                onSave={handleEditSave}
            />
        </div>
    )
}
