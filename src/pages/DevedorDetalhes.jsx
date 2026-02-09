import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ArrowLeft,
    Phone,
    ShoppingBag,
    Calendar,
    Check,
    Clock,
    Plus,
    ChevronDown,
    ChevronUp,
    Wallet,
    CheckCircle2,
    Circle,
    Sparkles
} from 'lucide-react'

// Mock data
const mockDevedor = {
    id: 1,
    nome: 'João Silva',
    telefone: '(11) 99999-1234',
    totalDevido: 4500.00,
    compras: [
        {
            id: 1,
            descricao: 'iPhone 15 Pro Max',
            valorTotal: 8999.00,
            numParcelas: 12,
            dataCompra: '2025-01-15',
            parcelas: [
                { id: 1, numero: 1, valor: 749.92, vencimento: '2025-02-15', pago: true },
                { id: 2, numero: 2, valor: 749.92, vencimento: '2025-03-15', pago: true },
                { id: 3, numero: 3, valor: 749.92, vencimento: '2025-04-15', pago: false },
                { id: 4, numero: 4, valor: 749.92, vencimento: '2025-05-15', pago: false },
                { id: 5, numero: 5, valor: 749.92, vencimento: '2025-06-15', pago: false },
                { id: 6, numero: 6, valor: 749.92, vencimento: '2025-07-15', pago: false },
                { id: 7, numero: 7, valor: 749.92, vencimento: '2025-08-15', pago: false },
                { id: 8, numero: 8, valor: 749.92, vencimento: '2025-09-15', pago: false },
                { id: 9, numero: 9, valor: 749.92, vencimento: '2025-10-15', pago: false },
                { id: 10, numero: 10, valor: 749.92, vencimento: '2025-11-15', pago: false },
                { id: 11, numero: 11, valor: 749.92, vencimento: '2025-12-15', pago: false },
                { id: 12, numero: 12, valor: 749.92, vencimento: '2026-01-15', pago: false },
            ]
        },
        {
            id: 2,
            descricao: 'Notebook Dell Inspiron',
            valorTotal: 4500.00,
            numParcelas: 10,
            dataCompra: '2025-02-20',
            parcelas: [
                { id: 13, numero: 1, valor: 450.00, vencimento: '2025-03-20', pago: true },
                { id: 14, numero: 2, valor: 450.00, vencimento: '2025-04-20', pago: false },
                { id: 15, numero: 3, valor: 450.00, vencimento: '2025-05-20', pago: false },
                { id: 16, numero: 4, valor: 450.00, vencimento: '2025-06-20', pago: false },
                { id: 17, numero: 5, valor: 450.00, vencimento: '2025-07-20', pago: false },
                { id: 18, numero: 6, valor: 450.00, vencimento: '2025-08-20', pago: false },
                { id: 19, numero: 7, valor: 450.00, vencimento: '2025-09-20', pago: false },
                { id: 20, numero: 8, valor: 450.00, vencimento: '2025-10-20', pago: false },
                { id: 21, numero: 9, valor: 450.00, vencimento: '2025-11-20', pago: false },
                { id: 22, numero: 10, valor: 450.00, vencimento: '2025-12-20', pago: false },
            ]
        }
    ]
}

function CompraCard({ compra, onToggleParcela }) {
    const [isExpanded, setIsExpanded] = useState(false)

    const parcelasPagas = compra.parcelas.filter(p => p.pago).length
    const parcelasRestantes = compra.numParcelas - parcelasPagas
    const valorRestante = compra.parcelas.filter(p => !p.pago).reduce((acc, p) => acc + p.valor, 0)
    const progresso = (parcelasPagas / compra.numParcelas) * 100

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('pt-BR')
    }

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
                                Compra em {formatDate(compra.dataCompra)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-bold text-xl">
                                R$ {compra.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-slate-400">
                                {compra.numParcelas}x de R$ {(compra.valorTotal / compra.numParcelas).toFixed(2)}
                            </p>
                        </div>
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isExpanded ? 'bg-indigo-500/20 rotate-180' : 'bg-slate-700/50'}`}>
                            <ChevronDown size={20} className={isExpanded ? 'text-indigo-400' : ''} />
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2 text-slate-400">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            {parcelasPagas} de {compra.numParcelas} pagas
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
                        {compra.parcelas.map((parcela, index) => (
                            <div
                                key={parcela.id}
                                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 
                  ${parcela.pago
                                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                                        : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                                    }`}
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onToggleParcela(compra.id, parcela.id)
                                        }}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 
                      ${parcela.pago
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                : 'border-2 border-slate-500 hover:border-indigo-500 hover:bg-indigo-500/10'
                                            }`}
                                    >
                                        {parcela.pago && <Check size={16} />}
                                    </button>
                                    <div>
                                        <p className={`font-medium ${parcela.pago ? 'line-through text-slate-400' : ''}`}>
                                            Parcela {parcela.numero}/{compra.numParcelas}
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
    const [devedor, setDevedor] = useState(mockDevedor)

    const totalParcelas = devedor.compras.reduce((acc, c) => acc + c.numParcelas, 0)
    const parcelasPagas = devedor.compras.reduce((acc, c) => acc + c.parcelas.filter(p => p.pago).length, 0)
    const totalDevido = devedor.compras.reduce((acc, c) =>
        acc + c.parcelas.filter(p => !p.pago).reduce((a, p) => a + p.valor, 0), 0
    )

    const handleToggleParcela = (compraId, parcelaId) => {
        setDevedor(prev => ({
            ...prev,
            compras: prev.compras.map(compra =>
                compra.id === compraId
                    ? {
                        ...compra,
                        parcelas: compra.parcelas.map(parcela =>
                            parcela.id === parcelaId
                                ? { ...parcela, pago: !parcela.pago }
                                : parcela
                        )
                    }
                    : compra
            )
        }))
    }

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
                                <Phone size={18} /> {devedor.telefone}
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
                    <p className="text-3xl font-bold">{devedor.compras.length}</p>
                </div>
            </div>

            {/* Compras */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-2xl font-bold">Compras</h2>
                    <span className="badge badge-info">{devedor.compras.length} itens</span>
                </div>
                <div className="space-y-5">
                    {devedor.compras.map((compra, index) => (
                        <div key={compra.id} style={{ animationDelay: `${(index + 2) * 100}ms` }}>
                            <CompraCard
                                compra={compra}
                                onToggleParcela={handleToggleParcela}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
