import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const CardContext = createContext()

export function CardProvider({ children }) {
    const [loading, setLoading] = useState(true)
    const [cards, setCards] = useState([])
    const [devedores, setDevedores] = useState([])
    const [purchases, setPurchases] = useState([])
    const [adjustments, setAdjustments] = useState([])
    const [selectedCardId, setSelectedCardId] = useState(null)

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            const [
                { data: cardsData, error: cardsError },
                { data: devedoresData, error: devedoresError },
                { data: purchasesData, error: purchasesError },
                { data: adjustmentsData, error: adjustmentsDataError }
            ] = await Promise.all([
                supabase.from('cards').select('*').order('nome'),
                supabase.from('devedores').select('*').order('nome'),
                supabase.from('purchases').select('*').order('data_compra', { ascending: false }),
                supabase.from('purchase_adjustments').select('*')
            ])

            if (cardsError) throw cardsError
            if (devedoresError) throw devedoresError
            if (purchasesError) throw purchasesError

            // Auto-mark installments whose due date has passed
            const now = new Date()
            const updatedPurchases = await autoMarkPaidInstallments(purchasesData || [], now)

            setCards(cardsData || [])
            setDevedores(devedoresData || [])
            setPurchases(updatedPurchases)
            setAdjustments(adjustmentsData || [])

            const savedCardId = localStorage.getItem('selectedCardId')
            if (savedCardId && cardsData?.find(c => c.id === parseInt(savedCardId))) {
                setSelectedCardId(parseInt(savedCardId))
            } else if (cardsData?.length > 0) {
                setSelectedCardId(cardsData[0].id)
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    // Auto-mark installments as paid when their due month has passed
    const autoMarkPaidInstallments = async (purchasesList, now) => {
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() // 0-indexed

        const updates = []

        for (const purchase of purchasesList) {
            const dataCompra = new Date(purchase.data_compra)
            const numParcelas = purchase.num_parcelas || 0
            const currentPagas = purchase.parcelas_pagas || 0

            // Calculate how many installments have a due date <= end of previous month
            // Installment i (1-based) is due at: dataCompra month + i
            let shouldBePaid = 0
            for (let i = 1; i <= numParcelas; i++) {
                const dueDate = new Date(dataCompra.getFullYear(), dataCompra.getMonth() + i, dataCompra.getDate())
                // If the due date is before the 1st of the current month, it should be paid
                const firstOfCurrentMonth = new Date(currentYear, currentMonth, 1)
                if (dueDate < firstOfCurrentMonth) {
                    shouldBePaid = i
                }
            }

            // Only update if we need to mark MORE as paid (never decrease)
            if (shouldBePaid > currentPagas) {
                updates.push({ id: purchase.id, parcelas_pagas: shouldBePaid })
            }
        }

        // Batch update in DB
        if (updates.length > 0) {
            console.log(`Auto-marcando ${updates.length} compras com parcelas vencidas...`)
            for (const update of updates) {
                const { error } = await supabase
                    .from('purchases')
                    .update({ parcelas_pagas: update.parcelas_pagas })
                    .eq('id', update.id)

                if (error) {
                    console.error('Erro ao auto-marcar parcela:', error, update)
                }
            }

            // Update local data
            return purchasesList.map(p => {
                const upd = updates.find(u => u.id === p.id)
                return upd ? { ...p, parcelas_pagas: upd.parcelas_pagas } : p
            })
        }

        return purchasesList
    }

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        if (selectedCardId) {
            localStorage.setItem('selectedCardId', selectedCardId)
        }
    }, [selectedCardId])

    const selectedCard = cards.find(c => c.id === selectedCardId) || null

    const addCard = async (cardData) => {
        const { data, error } = await supabase
            .from('cards')
            .insert([{ ...cardData }])
            .select()
            .single()

        if (error) {
            console.error('Erro ao adicionar cartão:', error)
            return null
        }
        setCards(prev => [...prev, data])
        // Sempre seleciona o novo cartão quando adicionado
        setSelectedCardId(data.id)
        return data
    }

    const removeCard = async (id) => {
        const { error } = await supabase.from('cards').delete().eq('id', id)
        if (error) {
            console.error('Erro ao remover cartão:', error)
            return
        }
        const newCards = cards.filter(c => c.id !== id)
        setCards(newCards)
        if (selectedCardId === id) setSelectedCardId(newCards[0]?.id || null)
    }

    const updateCard = async (id, updatedData) => {
        const { data, error } = await supabase
            .from('cards')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar cartão:', error)
            return
        }
        setCards(prev => prev.map(c => c.id === id ? data : c))
    }

    const addDevedor = async (devedorData) => {
        const { data, error } = await supabase
            .from('devedores')
            .insert([devedorData])
            .select()
            .single()

        if (error) {
            console.error('Erro ao adicionar devedor:', error)
            return null
        }
        setDevedores(prev => [...prev, data])
        return data
    }

    const removeDevedor = async (id) => {
        const { error } = await supabase.from('devedores').delete().eq('id', id)
        if (error) {
            console.error('Erro ao remover devedor:', error)
            return
        }
        setDevedores(prev => prev.filter(d => d.id !== id))
    }

    const addPurchase = async (purchaseData) => {
        const { data, error } = await supabase
            .from('purchases')
            .insert([{
                card_id: purchaseData.cardId,
                devedor_id: purchaseData.devedorId,
                devedor_nome: purchaseData.devedorNome,
                descricao: purchaseData.descricao,
                valor_total: parseFloat(purchaseData.valorTotal),
                num_parcelas: parseInt(purchaseData.numParcelas),
                parcelas_pagas: parseInt(purchaseData.parcelasPagas || 0),
                data_compra: purchaseData.dataCompra
            }])
            .select()
            .single()

        if (error) {
            console.error('Erro ao adicionar compra:', error)
            return null
        }
        setPurchases(prev => [data, ...prev])
        return data
    }

    const removePurchase = async (id) => {
        const { error } = await supabase.from('purchases').delete().eq('id', id)
        if (error) {
            console.error('Erro ao remover compra:', error)
            return
        }
        setPurchases(prev => prev.filter(p => p.id !== id))
    }

    const updatePurchase = async (id, updatedFields) => {
        const { data, error } = await supabase
            .from('purchases')
            .update(updatedFields)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar compra:', error)
            alert('Erro ao atualizar compra.')
            return null
        }
        setPurchases(prev => prev.map(p => p.id === id ? data : p))
        return data
    }

    const addAdjustment = async (adjustmentData) => {
        const { data, error } = await supabase
            .from('purchase_adjustments')
            .insert([{
                purchase_id: adjustmentData.purchaseId,
                parcela_index: adjustmentData.parcelaIndex,
                is_deleted: adjustmentData.isDeleted || false,
                custom_value: adjustmentData.customValue,
                custom_date: adjustmentData.customDate
            }])
            .select()
            .single()

        if (error) {
            console.error('Erro ao adicionar ajuste:', error)
            alert('Erro ao salvar ajuste. Verifique se a tabela purchase_adjustments existe.')
            return null
        }
        setAdjustments(prev => [...prev, data])
        return data
    }

    // Normalizing DB snake_case to app camelCase for backward compatibility
    const normalizedAdjustments = adjustments.map(a => ({
        ...a,
        purchaseId: a.purchase_id,
        parcelaIndex: a.parcela_index,
        isDeleted: a.is_deleted,
        customValue: a.custom_value,
        customDate: a.custom_date
    }))

    // Normalizing DB snake_case to app camelCase for backward compatibility
    const normalizedPurchases = purchases.map(p => ({
        ...p,
        cardId: p.card_id,
        devedorId: p.devedor_id,
        devedorNome: p.devedor_nome,
        valorTotal: p.valor_total,
        numParcelas: p.num_parcelas,
        parcelasPagas: p.parcelas_pagas || 0,
        dataCompra: p.data_compra
    }))
    // Also ensuring purchases have normal camelCase if they come from DB directly as snake_case in fetchInitialData
    // The previous implementation of normalizedPurchases was map over 'purchases'.
    // If 'purchases' comes from select('*'), it is snake_case.
    // So 'p.cardId' might be undefined if not mapped yet.
    // The previous code mapped p.card_id to cardId. Correct.


    return (
        <CardContext.Provider value={{
            loading,
            cards,
            selectedCard,
            selectedCardId,
            setSelectedCardId,
            addCard,
            removeCard,
            updateCard,
            devedores,
            addDevedor,
            removeDevedor,
            purchases: normalizedPurchases,
            addPurchase,
            removePurchase,
            updatePurchase,
            adjustments: normalizedAdjustments,
            addAdjustment
        }}>
            {children}
        </CardContext.Provider>
    )
}

export function useCards() {
    return useContext(CardContext)
}
