import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCards } from '../contexts/CardContext'
import { CreditCard, Calendar, Check, X, ArrowLeft } from 'lucide-react'

export default function NovoCartao() {
    const navigate = useNavigate()
    const { addCard } = useCards()
    const [formData, setFormData] = useState({
        nome: '',
        limite: '',
        fechamento: '',
        vencimento: '',
        bandeira: 'Mastercard',
        cor: 'bg-purple-600'
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        addCard(formData)
        navigate('/') // Volta para o dashboard após cadastrar
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeInUp">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Adicionar Novo Cartão</h1>
                    <p className="text-slate-400">Cadastre um novo cartão de crédito para gerenciar seus gastos.</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-[#131620] border border-white/5 rounded-2xl p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Nome e Bandeira */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Nome do Cartão</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    className="input-field pl-12"
                                    placeholder="Ex: Nubank Violeta"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Bandeira</label>
                            <select
                                value={formData.bandeira}
                                onChange={e => setFormData({ ...formData, bandeira: e.target.value })}
                                className="input-field appearance-none"
                            >
                                <option value="Mastercard">Mastercard</option>
                                <option value="Visa">Visa</option>
                                <option value="Elo">Elo</option>
                                <option value="Amex">American Express</option>
                                <option value="Hipercard">Hipercard</option>
                            </select>
                        </div>
                    </div>

                    {/* Limite */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Limite Total (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.limite}
                            onChange={e => setFormData({ ...formData, limite: e.target.value })}
                            className="input-field text-lg font-semibold"
                            placeholder="0,00"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-2">O valor total do limite disponível no cartão.</p>
                    </div>

                    {/* Datas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-800/30 rounded-xl border border-white/5">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                <Calendar size={16} /> Dia de Fechamento
                            </label>
                            <input
                                type="number"
                                min="1" max="31"
                                value={formData.fechamento}
                                onChange={e => setFormData({ ...formData, fechamento: e.target.value })}
                                className="input-field text-center"
                                placeholder="DD"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                <Calendar size={16} /> Dia de Vencimento
                            </label>
                            <input
                                type="number"
                                min="1" max="31"
                                value={formData.vencimento}
                                onChange={e => setFormData({ ...formData, vencimento: e.target.value })}
                                className="input-field text-center"
                                placeholder="DD"
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-white/5 mt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex items-center gap-2 px-8 shadow-lg shadow-indigo-500/20"
                        >
                            <Check size={20} />
                            Cadastrar Cartão
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
