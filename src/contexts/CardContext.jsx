import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const CardContext = createContext()

export function CardProvider({ children }) {
    const [loading, setLoading] = useState(true)
    const [cards, setCards] = useState([])
    const [devedores, setDevedores] = useState([])
    const [purchases, setPurchases] = useState([])
    const [selectedCardId, setSelectedCardId] = useState(null)

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            const [
                { data: cardsData, error: cardsError },
                { data: devedoresData, error: devedoresError },
                { data: purchasesData, error: purchasesError }
            ] = await Promise.all([
                supabase.from('cards').select('*').order('nome'),
                supabase.from('devedores').select('*').order('nome'),
                supabase.from('purchases').select('*').order('data_compra', { ascending: false })
            ])

            if (cardsError) throw cardsError
            if (devedoresError) throw devedoresError
            if (purchasesError) throw purchasesError

            setCards(cardsData || [])
            setDevedores(devedoresData || [])
            setPurchases(purchasesData || [])

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

    // Normalizing DB snake_case to app camelCase for backward compatibility
    const normalizedPurchases = purchases.map(p => ({
        ...p,
        cardId: p.card_id,
        devedorId: p.devedor_id,
        devedorNome: p.devedor_nome,
        valorTotal: p.valor_total,
        numParcelas: p.num_parcelas,
        dataCompra: p.data_compra
    }))

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
            removePurchase
        }}>
            {children}
        </CardContext.Provider>
    )
}

export function useCards() {
    return useContext(CardContext)
}
