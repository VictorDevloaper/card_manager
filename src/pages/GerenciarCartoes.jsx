import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCards } from '../contexts/CardContext'
import {
    ArrowLeft,
    CreditCard,
    Edit2,
    Trash2,
    Save,
    X,
    Check,
    Plus
} from 'lucide-react'

export default function GerenciarCartoes() {
    const navigate = useNavigate()
    const { cards, updateCard, removeCard } = useCards()
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})

    const startEditing = (card) => {
        setEditingId(card.id)
        setEditForm({ ...card })
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditForm({})
    }

    const handleSave = () => {
        updateCard(editingId, editForm)
        setEditingId(null)
    }

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja remover este cartão? Todas as informações associadas serão perdidas.')) {
            removeCard(id)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeInUp">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Voltar
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <CreditCard size={24} className="text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Gerenciar Cartões</h1>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/novo-cartao')}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Adicionar Novo Cartão
                </button>
            </div>

            {/* Lista de Cartões */}
            <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                {cards.map((card) => (
                    <div
                        key={card.id}
                        className={`bg-[#131620] border ${editingId === card.id ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-white/5'} rounded-2xl p-6 transition-all duration-300`}
                    >
                        {editingId === card.id ? (
                            // Modo Edição
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Edit2 size={18} className="text-indigo-400" />
                                        Editando Cartão
                                    </h3>
                                    <button onClick={cancelEditing} className="text-slate-500 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Nome do Cartão</label>
                                        <input
                                            type="text"
                                            name="nome"
                                            value={editForm.nome}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="Ex: Nubank"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Limite Total (R$)</label>
                                        <input
                                            type="number"
                                            name="limite"
                                            value={editForm.limite}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Bandeira</label>
                                        <input
                                            type="text"
                                            name="bandeira"
                                            value={editForm.bandeira}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="Mastercard, Visa..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Fechamento</label>
                                            <input
                                                type="number"
                                                name="fechamento"
                                                min="1" max="31"
                                                value={editForm.fechamento}
                                                onChange={handleChange}
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Vencimento</label>
                                            <input
                                                type="number"
                                                name="vencimento"
                                                min="1" max="31"
                                                value={editForm.vencimento}
                                                onChange={handleChange}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-400">Cor do Cartão</label>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            'bg-purple-600',
                                            'bg-indigo-600',
                                            'bg-blue-600',
                                            'bg-emerald-600',
                                            'bg-amber-600',
                                            'bg-rose-600',
                                            'bg-slate-600',
                                            'bg-pink-600'
                                        ].map((cor) => (
                                            <button
                                                key={cor}
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, cor })}
                                                className={`w-8 h-8 rounded-full ${cor} transition-transform hover:scale-110 ${editForm.cor === cor ? 'ring-2 ring-white ring-offset-2 ring-offset-[#131620] scale-110' : 'opacity-70 hover:opacity-100'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={cancelEditing} className="btn-secondary flex-1 justify-center">
                                        Cancelar
                                    </button>
                                    <button onClick={handleSave} className="btn-primary flex-1 justify-center shadow-lg shadow-indigo-500/20 gap-2">
                                        <Save size={18} />
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Modo Visualização
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className={`w-14 h-14 rounded-2xl ${card.cor || 'bg-slate-600'} flex items-center justify-center shadow-lg`}>
                                        <CreditCard size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{card.nome}</h3>
                                        <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">{card.bandeira || 'Cartão de Crédito'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full md:w-auto text-center md:text-left">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Limite</p>
                                        <p className="font-semibold text-white">R$ {card.limite?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Fechamento</p>
                                        <p className="font-semibold text-white">Dia {card.fechamento}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Vencimento</p>
                                        <p className="font-semibold text-white">Dia {card.vencimento}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                    <button
                                        onClick={() => startEditing(card)}
                                        className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-transparent hover:border-slate-600"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(card.id)}
                                        className="p-2.5 rounded-xl bg-slate-800 text-red-400 hover:text-white hover:bg-red-500 transition-all border border-transparent hover:border-red-400"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {cards.length === 0 && (
                    <div className="bg-[#131620] border border-white/5 rounded-2xl p-16 text-center animate-fadeInUp">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                            <CreditCard size={36} className="text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Nenhum cartão cadastrado</h3>
                        <p className="text-slate-400 mb-6 max-w-sm mx-auto">Adicione seu primeiro cartão para começar a controlar seus gastos.</p>
                        <button
                            onClick={() => navigate('/novo-cartao')}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Adicionar Cartão
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
