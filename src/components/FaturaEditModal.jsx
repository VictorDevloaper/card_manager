import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Edit2, Trash2, X, AlertTriangle, Save, Calendar } from 'lucide-react'
import { useCards } from '../contexts/CardContext'

export default function FaturaEditModal({ isOpen, onClose, selectedItem }) {
    const { addAdjustment } = useCards()
    const [mode, setMode] = useState('menu') // menu, edit, delete
    const [editValue, setEditValue] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen || !selectedItem) return null

    const handleSave = async () => {
        setIsSubmitting(true)
        try {
            await addAdjustment({
                purchaseId: selectedItem.purchaseId,
                parcelaIndex: selectedItem.parcelaIndex,
                isDeleted: mode === 'delete',
                customValue: mode === 'edit' ? parseFloat(editValue) : null,
                // customDate: null // Not implementing date shift for now to keep simple
            })
            onClose()
            setMode('menu')
            setEditValue('')
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 min-h-screen overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-[#131620] border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl animate-fadeInUp my-auto" onClick={e => e.stopPropagation()}>

                <div className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-[#131620] rounded-t-2xl z-10">
                    <h3 className="font-bold text-white">Editar Parcela</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6">
                    <div className="mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Item Selecionado</p>
                        <p className="text-white font-medium break-words">{selectedItem.descricao}</p>
                        <div className="flex justify-between mt-2 text-sm">
                            <span className="text-slate-400">Parcela {selectedItem.parcela}</span>
                            <span className="text-white font-bold">R$ {selectedItem.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {mode === 'menu' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => { setMode('edit'); setEditValue(selectedItem.valor.toString()) }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-400 hover:border-indigo-500/30 border border-transparent transition-all group"
                            >
                                <div className="p-2 bg-slate-700 rounded-lg group-hover:bg-indigo-500/20 text-slate-300 group-hover:text-indigo-400">
                                    <Edit2 size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-200">Editar Valor</p>
                                    <p className="text-xs text-slate-500">Alterar o valor desta parcela específica</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setMode('delete')}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-all group"
                            >
                                <div className="p-2 bg-slate-700 rounded-lg group-hover:bg-red-500/20 text-slate-300 group-hover:text-red-400">
                                    <Trash2 size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-200">Remover Parcela</p>
                                    <p className="text-xs text-slate-500">Excluir apenas esta parcela da fatura</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {mode === 'edit' && (
                        <div className="space-y-4 animate-fadeInUp">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Novo Valor (R$)</label>
                                <input
                                    type="number"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    className="input-field"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setMode('menu')} className="btn-secondary flex-1">Voltar</button>
                                <button onClick={handleSave} disabled={isSubmitting} className="btn-primary flex-1 flex justify-center items-center gap-2">
                                    {isSubmitting ? 'Salvando...' : <><Save size={18} /> Salvar</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'delete' && (
                        <div className="space-y-4 animate-fadeInUp text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-red-500">
                                <AlertTriangle size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-white">Tem certeza?</h4>
                            <p className="text-slate-400 text-sm">
                                Você vai remover a parcela <span className="text-white font-bold">{selectedItem.parcela}</span> desta compra na fatura atual. O valor será abatido do total.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setMode('menu')} className="btn-secondary flex-1">Cancelar</button>
                                <button onClick={handleSave} disabled={isSubmitting} className="w-full py-2.5 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg shadow-red-500/20 flex-1 flex justify-center items-center gap-2">
                                    {isSubmitting ? 'Removendo...' : <><Trash2 size={18} /> Confirmar</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
