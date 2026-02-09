
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCards } from '../contexts/CardContext'
import {
    Search,
    Plus,
    MoreVertical,
    Trash2,
    Eye,
    Phone,
    X,
    UserPlus,
    Wallet,
    ShoppingBag,
    Users
} from 'lucide-react'

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div
                className="relative bg-[#131620] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-fadeInUp"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default function Devedores() {
    const {
        selectedCard,
        devedores,
        addDevedor,
        removeDevedor,
        purchases
    } = useCards() || {
        selectedCard: { nome: 'Cartão' },
        devedores: [],
        addDevedor: () => { },
        removeDevedor: () => { },
        purchases: []
    }

    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newDevedor, setNewDevedor] = useState({ nome: '', telefone: '' })
    const [selectedDevedores, setSelectedDevedores] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Calcular estatísticas dos devedores dinamicamente
    const devedoresWithStats = useMemo(() => {
        return devedores.map(d => {
            // Filtrar compras deste devedor (considerando o cartão selecionado se desejar, mas "Devedores" geralmente é global ou filtrado na view)
            // O código original filtrava apenas por "Gerenciando usuários do cartão X", mas os devedores eram globais mocked.
            // Vamos assumir que queremos ver dívidas NESSE cartão específico selecionado, ou Geral?
            // O título diz "Gerenciando usuários do cartão X". Vamos filtrar as dívidas por cartão para o "Total Devido".

            const devedorPurchases = purchases.filter(p =>
                p.devedorId === d.id &&
                (selectedCard ? p.cardId === selectedCard.id : true)
            )

            const totalDevido = devedorPurchases.reduce((acc, p) => acc + (p.valorTotal || 0), 0)
            const parcelas = devedorPurchases.reduce((acc, p) => acc + (p.numParcelas || 0), 0) // Isso é meio vago, mas mantendo a lógica anterior de "qtd parcelas" como soma ou contagem
            // Na verdade, "parcelas restantes" seria mais complexo. Vamos usar "compras" count.

            return {
                ...d,
                totalDevido,
                parcelas: devedorPurchases.length > 0 ? devedorPurchases.length + ' compras' : '0', // Simplificado para UI
                compras: devedorPurchases.length
            }
        })
    }, [devedores, purchases, selectedCard])

    const filteredDevedores = devedoresWithStats.filter(d =>
        d.nome.toLowerCase().includes(search.toLowerCase())
    )

    const toggleSelectAll = () => {
        if (selectedDevedores.length === filteredDevedores.length && filteredDevedores.length > 0) {
            setSelectedDevedores([])
        } else {
            setSelectedDevedores(filteredDevedores.map(d => d.id))
        }
    }

    const toggleSelectDevedor = (id) => {
        if (selectedDevedores.includes(id)) {
            setSelectedDevedores(selectedDevedores.filter(dId => dId !== id))
        } else {
            setSelectedDevedores([...selectedDevedores, id])
        }
    }

    const handleAddDevedor = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        await addDevedor({
            nome: newDevedor.nome,
            telefone: newDevedor.telefone
        })
        setNewDevedor({ nome: '', telefone: '' })
        setIsModalOpen(false)
        setIsSubmitting(false)
    }

    const handleDelete = async (id) => {
        if (confirm('Tem certeza que deseja excluir este devedor? O histórico de compras dele pode ser afetado.')) {
            await removeDevedor(id)
        }
    }

    const handleBulkDelete = async () => {
        if (confirm(`Tem certeza que deseja excluir ${selectedDevedores.length} devedores selecionados?`)) {
            for (const id of selectedDevedores) {
                await removeDevedor(id)
            }
            setSelectedDevedores([])
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-fadeInUp">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Users size={24} className="text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Devedores</h1>
                    </div>
                    <p className="text-slate-400 text-lg">
                        Gerenciando usuários do cartão <span className="text-white font-semibold">{selectedCard?.nome}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    {selectedDevedores.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="btn-secondary bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={20} />
                            <span>Excluir ({selectedDevedores.length})</span>
                        </button>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                        <UserPlus size={20} />
                        <span>Novo Devedor</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#131620] border border-white/5 p-4 rounded-2xl flex items-center gap-4 animate-fadeInUp relative group focus-within:border-indigo-500/50 transition-colors" style={{ animationDelay: '100ms' }}>
                <Search className="text-slate-500 ml-2" size={20} />
                <input
                    type="text"
                    placeholder="Buscar devedor por nome..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 w-full h-full py-2 text-lg"
                />
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-[#131620] border border-white/5 rounded-2xl overflow-hidden animate-fadeInUp shadow-xl" style={{ animationDelay: '200ms' }}>
                <table className="modern-table w-full">
                    <thead>
                        <tr>
                            <th className="w-12">
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedDevedores.length === filteredDevedores.length && filteredDevedores.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900 cursor-pointer"
                                    />
                                </div>
                            </th>
                            <th>Nome</th>
                            <th>Contato</th>
                            <th>Total Devido (Neste Cartão)</th>
                            <th>Status</th>
                            <th>Atividade</th>
                            <th className="text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDevedores.map((devedor) => (
                            <tr key={devedor.id} className={`group transition-colors duration-200 ${selectedDevedores.includes(devedor.id) ? 'bg-indigo-500/5' : ''}`}>
                                <td className="text-center">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedDevedores.includes(devedor.id)}
                                            onChange={() => toggleSelectDevedor(devedor.id)}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900 cursor-pointer"
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {devedor.nome.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{devedor.nome}</p>
                                            <p className="text-xs text-slate-500">ID: #{devedor.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded-lg w-fit">
                                        <Phone size={14} />
                                        <span className="text-sm font-medium">{devedor.telefone || '-'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`text-lg font-bold tracking-tight ${devedor.totalDevido > 0 ? 'text-white' : 'text-emerald-400'}`}>
                                        R$ {devedor.totalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td>
                                    {devedor.compras > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/10">
                                            <Wallet size={12} />
                                            {devedor.compras} compras ativas
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/10">
                                            Sem dívidas
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <ShoppingBag size={14} />
                                        <span>{devedor.compras} registro(s)</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            to={`/devedores/${devedor.id}`}
                                            className="p-2 hover:bg-indigo-500/20 rounded-lg text-indigo-400 transition-colors"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(devedor.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards List */}
            <div className="lg:hidden space-y-4">
                {filteredDevedores.map((devedor, index) => (
                    <div
                        key={devedor.id}
                        className="bg-[#131620] border border-white/5 rounded-2xl p-5 animate-fadeInUp"
                        style={{ animationDelay: `${(index + 2) * 100}ms` }}
                    >
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {devedor.nome.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{devedor.nome}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-400 font-medium">#{devedor.id}</div>
                                    </div>
                                </div>
                            </div>

                            <button className="text-slate-500 hover:text-white transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-slate-800/30 rounded-xl p-3 border border-white/5">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Total Devido</p>
                                <p className="text-xl font-bold text-white">
                                    R$ {devedor.totalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="bg-slate-800/30 rounded-xl p-3 border border-white/5">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Compras</p>
                                <p className="text-xl font-bold text-indigo-400">
                                    {devedor.compras}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                to={`/devedores/${devedor.id}`}
                                className="flex-1 btn-secondary text-center py-2 text-sm"
                            >
                                Detalhes
                            </Link>
                            <button onClick={() => handleDelete(devedor.id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredDevedores.length === 0 && (
                <div className="bg-[#131620] border border-white/5 rounded-2xl p-16 text-center animate-fadeInUp">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                        <UserPlus size={36} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Nenhum devedor encontrado</h3>
                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">Não encontramos ninguém com esse nome. Que tal adicionar um novo?</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Adicionar Devedor
                    </button>
                </div>
            )}

            {/* Add Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Devedor">
                <form onSubmit={handleAddDevedor} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Nome Completo</label>
                        <input
                            type="text"
                            value={newDevedor.nome}
                            onChange={(e) => setNewDevedor({ ...newDevedor, nome: e.target.value })}
                            className="input-field"
                            placeholder="Ex: João da Silva"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Telefone (opcional)</label>
                        <input
                            type="tel"
                            value={newDevedor.telefone}
                            onChange={(e) => setNewDevedor({ ...newDevedor, telefone: e.target.value })}
                            className="input-field"
                            placeholder="(00) 00000-0000"
                        />
                    </div>

                    <div className="pt-2 flex gap-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary flex-1 justify-center"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary flex-1 justify-center shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
