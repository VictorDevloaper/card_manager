import React, { useState } from 'react'
import { Sparkles, Calculator, X } from 'lucide-react'
import { generateProjecao } from '../utils/finance'

export default function SimuladorFatura({ isOpen, onClose, cardId, purchases, adjustments }) {
    const [simulation, setSimulation] = useState({
        valor: '',
        parcelas: 1
    })

    if (!isOpen) return null

    // Create a virtual purchase
    const valorFloat = parseFloat(simulation.valor || 0)
    const parcelasInt = parseInt(simulation.parcelas || 1)

    // Calculate projection WITHOUT simulation
    const currentProjection = generateProjecao(cardId, purchases, adjustments)

    // Calculate projection WITH simulation
    // We add a virtual purchase to the existing list
    const virtualPurchase = {
        id: 'sim-1',
        cardId: cardId,
        valorTotal: valorFloat,
        numParcelas: parcelasInt,
        dataCompra: new Date().toISOString(), // Today
        devedorNome: 'Simulação',
        descricao: 'Nova Compra Simulada'
    }

    const simulatedProjection = generateProjecao(
        cardId,
        [...purchases, virtualPurchase],
        adjustments
    )

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#131620] border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl animate-fadeInUp flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

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
                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Valor (R$)</label>
                            <input
                                type="number"
                                value={simulation.valor}
                                onChange={e => setSimulation(prev => ({ ...prev, valor: e.target.value }))}
                                className="input-field"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Parcelas</label>
                            <select
                                value={simulation.parcelas}
                                onChange={e => setSimulation(prev => ({ ...prev, parcelas: e.target.value }))}
                                className="input-field"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map(n => (
                                    <option key={n} value={n}>{n}x</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results */}
                    {valorFloat > 0 && (
                        <div className="space-y-4 animate-fadeInUp">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={16} className="text-emerald-400" />
                                <h3 className="font-bold text-white">Impacto nas Próximas Faturas</h3>
                            </div>

                            <div className="space-y-2">
                                {simulatedProjection.slice(0, 12).map((mesSim, idx) => {
                                    const mesReal = currentProjection[idx] || { total: 0 }
                                    const diff = mesSim.total - mesReal.total

                                    if (diff < 0.01) return null

                                    return (
                                        <div key={mesSim.mes} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                            <span className="text-slate-300 font-medium capitalize">{mesSim.mes}</span>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="text-slate-500 line-through">
                                                    R$ {mesReal.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-emerald-400 font-bold">
                                                    R$ {mesSim.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs font-bold ml-1">
                                                    +{diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                                <p className="text-slate-400 text-sm">
                                    Total da Compra: <span className="text-white font-bold">R$ {valorFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <span className="mx-2">•</span>
                                    Parcela Mensal: <span className="text-white font-bold">R$ {(valorFloat / parcelasInt).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
