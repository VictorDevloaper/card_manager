import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCards } from '../contexts/CardContext'
import {
    ArrowLeft,
    ShoppingBag,
    Calendar,
    DollarSign,
    Hash,
    User,
    Check,
    Sparkles,
    CreditCard
} from 'lucide-react'

// Mock devedores
// Devedores carregados do localStorage dentro do componente

export default function NovaCompra() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { cards, selectedCard: currentCard, addPurchase, devedores } = useCards() || { cards: [], selectedCard: null, addPurchase: () => { }, devedores: [] }
    const preSelectedDevedor = searchParams.get('devedor')

    const [formData, setFormData] = useState({
        cardId: currentCard?.id || '',
        devedorId: preSelectedDevedor || '',
        descricao: '',
        valorTotal: '',
        numParcelas: '1',
        dataCompra: new Date().toISOString().split('T')[0],
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const valorParcela = formData.valorTotal && formData.numParcelas
        ? (parseFloat(formData.valorTotal) / parseInt(formData.numParcelas)).toFixed(2)
        : '0.00'

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Salvar compra real
        // Encontrar nome do devedor para facilitar exibição (idealmente seria relacionamento por ID, mas vamos simplificar)
        // Encontrar nome do devedor
        const devedorNome = devedores.find(d => d.id === parseInt(formData.devedorId))?.nome || 'Desconhecido'

        await addPurchase({
            ...formData,
            cardId: parseInt(formData.cardId),
            devedorNome // Persistindo o nome também por enquanto
        })

        await new Promise(resolve => setTimeout(resolve, 800)) // Pequeno delay para UX

        setSuccess(true)
        setTimeout(() => {
            navigate(`/`)
        }, 1500)
    }

    if (success) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="card p-10 text-center animate-scaleIn max-w-md w-full">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl icon-bg-success flex items-center justify-center animate-float">
                        <Check size={36} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Compra Registrada!</h2>
                    <p className="text-slate-400 mb-4">As parcelas foram geradas automaticamente</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-indigo-400">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        Redirecionando...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="animate-fadeInUp">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Voltar
                </button>

                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-xl icon-bg-primary">
                        <CreditCard size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Nova Compra</h1>
                        <p className="text-slate-400">Registre uma nova compra parcelada</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="card p-8 space-y-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>

                {/* Seleção de Cartão */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <div className="p-1.5 rounded-lg bg-indigo-500/20">
                            <CreditCard size={14} className="text-indigo-400" />
                        </div>
                        Cartão Utilizado
                    </label>
                    <select
                        name="cardId"
                        value={formData.cardId}
                        onChange={handleChange}
                        className="input-field"
                        required
                    >
                        <option value="">Selecione um cartão</option>
                        {cards.map(card => (
                            <option key={card.id} value={card.id}>{card.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Devedor */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <div className="p-1.5 rounded-lg bg-cyan-500/20">
                            <User size={14} className="text-cyan-400" />
                        </div>
                        Devedor
                    </label>
                    <select
                        name="devedorId"
                        value={formData.devedorId}
                        onChange={handleChange}
                        className="input-field"
                        required
                    >
                        <option value="">Selecione um devedor</option>
                        {devedores.map(d => (
                            <option key={d.id} value={d.id}>{d.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <div className="p-1.5 rounded-lg bg-purple-500/20">
                            <ShoppingBag size={14} className="text-purple-400" />
                        </div>
                        Descrição da Compra
                    </label>
                    <input
                        type="text"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Ex: iPhone 15 Pro Max, Samsung TV 65..."
                        required
                    />
                </div>

                {/* Valor e Parcelas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                            <div className="p-1.5 rounded-lg bg-emerald-500/20">
                                <DollarSign size={14} className="text-emerald-400" />
                            </div>
                            Valor Total (R$)
                        </label>
                        <input
                            type="number"
                            name="valorTotal"
                            value={formData.valorTotal}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="0,00"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                            <div className="p-1.5 rounded-lg bg-amber-500/20">
                                <Hash size={14} className="text-amber-400" />
                            </div>
                            Número de Parcelas
                        </label>
                        <select
                            name="numParcelas"
                            value={formData.numParcelas}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map(n => (
                                <option key={n} value={n}>{n}x {n === 1 ? '(à vista)' : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Data */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <div className="p-1.5 rounded-lg bg-pink-500/20">
                            <Calendar size={14} className="text-pink-400" />
                        </div>
                        Data da Compra
                    </label>
                    <input
                        type="date"
                        name="dataCompra"
                        value={formData.dataCompra}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                </div>

                {/* Preview */}
                {formData.valorTotal && (
                    <div className="card p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 border-indigo-500/20 animate-fadeInUp">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={18} className="text-indigo-400" />
                            <p className="text-sm font-semibold text-slate-300">Resumo das Parcelas</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold gradient-text">
                                    {formData.numParcelas}x de R$ {valorParcela}
                                </p>
                                <p className="text-sm text-slate-400 mt-2">
                                    Primeira parcela vencerá no próximo mês
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Total</p>
                                <p className="text-xl font-bold">
                                    R$ {parseFloat(formData.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-secondary flex-1"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Salvando...</span>
                            </>
                        ) : (
                            <>
                                <Check size={20} />
                                <span>Registrar Compra</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
