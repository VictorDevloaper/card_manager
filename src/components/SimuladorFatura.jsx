import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, Calculator, X, Plus, Trash2, ShoppingBag, Zap } from 'lucide-react'
import { generateProjecao } from '../utils/finance'

export default function SimuladorFatura({ isOpen, onClose, cardId, purchases, adjustments }) {
    const [compras, setCompras] = useState([
        { id: 1, descricao: '', valor: '', parcelas: 1 }
    ])
    const [nextId, setNextId] = useState(2)
    const [custosFixos, setCustosFixos] = useState([
        { id: 1, descricao: 'Água', valor: '' },
        { id: 2, descricao: 'Luz', valor: '' }
    ])
    const [nextCustoId, setNextCustoId] = useState(3)

    if (!isOpen) return null

    // Compras functions
    const addCompra = () => {
        setCompras(prev => [...prev, { id: nextId, descricao: '', valor: '', parcelas: 1 }])
        setNextId(prev => prev + 1)
    }

    const removeCompra = (id) => {
        if (compras.length <= 1) return
        setCompras(prev => prev.filter(c => c.id !== id))
    }

    const updateCompra = (id, field, value) => {
        setCompras(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
    }

    // Custos Fixos functions
    const addCustoFixo = () => {
        setCustosFixos(prev => [...prev, { id: nextCustoId, descricao: '', valor: '' }])
        setNextCustoId(prev => prev + 1)
    }

    const removeCustoFixo = (id) => {
        setCustosFixos(prev => prev.filter(c => c.id !== id))
    }

    const updateCustoFixo = (id, field, value) => {
        setCustosFixos(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
    }

    const totalCustosFixos = custosFixos.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0)

    // Build virtual purchases for simulation
    const virtualPurchases = compras
        .filter(c => parseFloat(c.valor) > 0)
        .map(c => ({
            id: `sim-${c.id}`,
            cardId: cardId,
            valorTotal: parseFloat(c.valor || 0),
            numParcelas: parseInt(c.parcelas || 1),
            dataCompra: new Date().toISOString(),
            devedorNome: 'Simulação',
            descricao: c.descricao || `Compra Simulada ${c.id}`
        }))

    // Calculate projections
    const currentProjection = generateProjecao(cardId, purchases, adjustments)
    const simulatedProjection = generateProjecao(
        cardId,
        [...purchases, ...virtualPurchases],
        adjustments
    )

    // Summary
    const totalSimulado = virtualPurchases.reduce((acc, p) => acc + p.valorTotal, 0)
    const hasSimulation = virtualPurchases.length > 0 || totalCustosFixos > 0

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#131620] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl animate-fadeInUp flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Calculator size={24} className="text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Simulador de Compras</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-6">
                    {/* Compras List */}
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Compras Adicionais</h3>
                            <span className="text-xs text-slate-500">{compras.length} {compras.length === 1 ? 'compra' : 'compras'}</span>
                        </div>

                        {compras.map((compra, index) => (
                            <div key={compra.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 space-y-3 animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag size={14} className="text-indigo-400" />
                                        <span className="text-sm font-medium text-slate-300">Compra {index + 1}</span>
                                    </div>
                                    {compras.length > 1 && (
                                        <button
                                            onClick={() => removeCompra(compra.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Descrição</label>
                                        <input
                                            type="text"
                                            value={compra.descricao}
                                            onChange={e => updateCompra(compra.id, 'descricao', e.target.value)}
                                            className="input-field text-sm"
                                            placeholder="Ex: Celular"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Valor (R$)</label>
                                        <input
                                            type="number"
                                            value={compra.valor}
                                            onChange={e => updateCompra(compra.id, 'valor', e.target.value)}
                                            className="input-field text-sm"
                                            placeholder="0.00"
                                            autoFocus={index === 0}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Parcelas</label>
                                        <select
                                            value={compra.parcelas}
                                            onChange={e => updateCompra(compra.id, 'parcelas', e.target.value)}
                                            className="input-field text-sm"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map(n => (
                                                <option key={n} value={n}>{n}x</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addCompra}
                            className="w-full p-3 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 text-slate-500 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Plus size={16} />
                            Adicionar outra compra
                        </button>
                    </div>

                    {/* Custos Fixos */}
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Zap size={14} className="text-amber-400" />
                                Custos Fixos Mensais
                            </h3>
                            <span className="text-xs text-slate-500">Somados a cada mês</span>
                        </div>

                        <div className="grid gap-2">
                            {custosFixos.map((custo) => (
                                <div key={custo.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                    <input
                                        type="text"
                                        value={custo.descricao}
                                        onChange={e => updateCustoFixo(custo.id, 'descricao', e.target.value)}
                                        className="input-field text-sm flex-1"
                                        placeholder="Ex: Água, Luz, Internet"
                                    />
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-slate-500">R$</span>
                                        <input
                                            type="number"
                                            value={custo.valor}
                                            onChange={e => updateCustoFixo(custo.id, 'valor', e.target.value)}
                                            className="input-field text-sm w-28"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeCustoFixo(custo.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addCustoFixo}
                            className="w-full p-2.5 rounded-xl border-2 border-dashed border-amber-500/20 hover:border-amber-500/40 text-slate-500 hover:text-amber-400 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Plus size={14} />
                            Adicionar custo fixo
                        </button>

                        {totalCustosFixos > 0 && (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 text-sm">
                                <span className="text-amber-300">Total mensal fixo</span>
                                <span className="text-white font-bold">R$ {totalCustosFixos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</span>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {hasSimulation && (
                        <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-indigo-300">Total simulado ({virtualPurchases.length} {virtualPurchases.length === 1 ? 'compra' : 'compras'})</span>
                                <span className="text-white font-bold text-lg">R$ {totalSimulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {hasSimulation && (
                        <div className="space-y-4 animate-fadeInUp">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={16} className="text-emerald-400" />
                                <h3 className="font-bold text-white">Impacto nas Próximas Faturas</h3>
                            </div>

                            <div className="space-y-2">
                                {simulatedProjection.slice(0, 12).map((mesSim, idx) => {
                                    const mesReal = currentProjection[idx] || { total: 0 }
                                    const diff = mesSim.total - mesReal.total

                                    if (diff < 0.01 && totalCustosFixos === 0) return null

                                    const totalWithFixed = mesSim.total + totalCustosFixos
                                    const realWithFixed = mesReal.total + totalCustosFixos

                                    return (
                                        <div key={mesSim.mes} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                            <span className="text-slate-300 font-medium capitalize">{mesSim.mes}</span>
                                            <div className="flex items-center gap-3 text-sm">
                                                {diff > 0.01 && (
                                                    <div className="text-slate-500 line-through">
                                                        R$ {realWithFixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                )}
                                                <div className="text-emerald-400 font-bold">
                                                    R$ {totalWithFixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                                {diff > 0.01 && (
                                                    <div className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs font-bold ml-1">
                                                        +{diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Per-purchase breakdown */}
                            <div className="mt-4 pt-4 border-t border-slate-800">
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Detalhamento por compra</p>
                                <div className="space-y-2">
                                    {virtualPurchases.map(vp => (
                                        <div key={vp.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-800/20">
                                            <span className="text-slate-400">{vp.descricao}</span>
                                            <div className="text-slate-300">
                                                <span className="font-bold text-white">R$ {vp.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                <span className="text-slate-500 ml-1">em {vp.numParcelas}x de R$ {(vp.valorTotal / vp.numParcelas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
