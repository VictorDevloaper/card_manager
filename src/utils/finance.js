export const calculateInstallments = (purchases, adjustments = []) => {
    // adjustments: array of { purchase_id, parcela_index, is_deleted, custom_value, custom_date }
    // returns array of expected installments with dates and values

    // NOT implementation yet, just helper to normalize purchase flow
}

export const generateProjecao = (cardId, purchases = [], adjustments = []) => {
    if (!cardId) return []
    const meses = []
    const hoje = new Date()

    // Filter purchases for this card
    const cardPurchases = (cardId === 'all' || !cardId)
        ? purchases
        : purchases.filter(p => p.cardId === cardId || p.card_id === cardId)

    // Pre-generate 12 months of reference dates and names
    const monthRefs = []
    for (let i = 0; i < 12; i++) {
        const dataReferencia = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 1)
        const mesNome = dataReferencia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        monthRefs.push({
            date: dataReferencia,
            mesNome,
            month: dataReferencia.getMonth(),
            year: dataReferencia.getFullYear(),
            devedores: {},
            total: 0
        })
    }

    // For each purchase, resolve each installment to its target month
    cardPurchases.forEach(compra => {
        const dataCompra = new Date(compra.dataCompra || compra.data_compra)
        const numParcelas = compra.numParcelas || compra.num_parcelas
        const valorTotal = compra.valorTotal || compra.valor_total
        const parcelasPagas = compra.parcelasPagas || compra.parcelas_pagas || 0
        const nome = compra.devedorNome || compra.devedor_nome || 'Desconhecido'
        const baseValorParcela = valorTotal / numParcelas

        for (let parcelaIndex = 1; parcelaIndex <= numParcelas; parcelaIndex++) {
            // Skip already-paid installments
            if (parcelaIndex <= parcelasPagas) continue

            // Check for adjustments
            const adj = adjustments.find(a =>
                (a.purchaseId === compra.id || a.purchase_id === compra.id) &&
                (a.parcelaIndex === parcelaIndex || a.parcela_index === parcelaIndex)
            )

            if (adj?.isDeleted || adj?.is_deleted) continue

            // Resolve the value
            let valorParcela = baseValorParcela
            if (adj?.customValue) valorParcela = parseFloat(adj.customValue)
            if (adj?.custom_value) valorParcela = parseFloat(adj.custom_value)

            // Resolve the target month
            let targetMonth, targetYear

            const customDate = adj?.customDate || adj?.custom_date
            if (customDate) {
                // Use the custom date to determine the month
                const d = new Date(customDate)
                targetMonth = d.getMonth()
                targetYear = d.getFullYear()
            } else {
                // Default: installment N goes to purchaseMonth + N
                const installmentDate = new Date(dataCompra.getFullYear(), dataCompra.getMonth() + parcelaIndex, 1)
                targetMonth = installmentDate.getMonth()
                targetYear = installmentDate.getFullYear()
            }

            // Find the matching month bucket
            const bucket = monthRefs.find(m => m.month === targetMonth && m.year === targetYear)
            if (!bucket) continue // Outside the 12-month window

            // Add to devedor in this bucket
            if (!bucket.devedores[nome]) {
                bucket.devedores[nome] = { total: 0, items: [] }
            }

            bucket.devedores[nome].total += valorParcela
            bucket.devedores[nome].items.push({
                descricao: compra.descricao,
                parcela: `${parcelaIndex}/${numParcelas}`,
                valor: valorParcela,
                purchaseId: compra.id,
                parcelaIndex: parcelaIndex,
                numParcelas: numParcelas,
                parcelasPagas: parcelasPagas
            })

            bucket.total += valorParcela
        }
    })

    // Format output
    monthRefs.forEach(bucket => {
        const devedoresFormatted = {}
        Object.entries(bucket.devedores).forEach(([nome, data]) => {
            devedoresFormatted[nome] = data.total
        })

        meses.push({
            mes: bucket.mesNome,
            total: bucket.total,
            devedores: devedoresFormatted,
            devedoresDetailed: bucket.devedores,
            numDevedores: Object.keys(bucket.devedores).length
        })
    })

    return meses
}

export const calculateDashboardStats = (purchases, currentCardId, adjustments = []) => {
    if (!currentCardId) return {
        limiteUsado: 0,
        totalDevedores: 0,
        parcelasVencer: 0,
        devedores: [],
        proximasFaturas: []
    }

    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    const cardPurchases = purchases.filter(p => p.cardId === currentCardId || p.card_id === currentCardId)

    let limiteUsado = 0
    let parcelasVencerProximos30Dias = 0
    const devedoresMap = {} // { id: { id, nome, total, parcelas } }
    const faturasMap = {} // { 'Mm/Yyyy': value }

    cardPurchases.forEach(compra => {
        const valorTotal = parseFloat(compra.valorTotal || compra.valor_total)
        const numParcelas = parseInt(compra.numParcelas || compra.num_parcelas)
        const baseValorParcela = valorTotal / numParcelas
        const dataCompra = new Date(compra.dataCompra || compra.data_compra)
        const devedorId = compra.devedorId || compra.devedor_id
        const devedorNome = compra.devedorNome || compra.devedor_nome || 'Devedor'
        const parcelasPagas = compra.parcelasPagas || compra.parcelas_pagas || 0

        // Calculate active installments
        for (let i = 1; i <= numParcelas; i++) {
            // Skip already-paid installments
            if (i <= parcelasPagas) continue

            // Check adjustment
            const adj = adjustments.find(a =>
                (a.purchaseId === compra.id || a.purchase_id === compra.id) &&
                (a.parcelaIndex === i || a.parcela_index === i)
            )

            if (adj?.isDeleted || adj?.is_deleted) continue

            let valorParcela = baseValorParcela
            if (adj?.customValue) valorParcela = parseFloat(adj.customValue)
            if (adj?.custom_value) valorParcela = parseFloat(adj.custom_value)

            // Resolve installment date (respect custom_date)
            let installmentDate
            const customDate = adj?.customDate || adj?.custom_date
            if (customDate) {
                installmentDate = new Date(customDate)
            } else {
                installmentDate = new Date(dataCompra.getFullYear(), dataCompra.getMonth() + i, 1)
            }

            const currentMonthStart = new Date(currentYear, currentMonth, 1)

            if (installmentDate >= currentMonthStart) {
                // It is outstanding
                limiteUsado += valorParcela

                // Aggregate by Devedor
                if (!devedoresMap[devedorId]) {
                    devedoresMap[devedorId] = {
                        id: devedorId,
                        nome: devedorNome,
                        total: 0,
                        parcelas: 0
                    }
                }
                devedoresMap[devedorId].total += valorParcela
                devedoresMap[devedorId].parcelas += 1

                // Parcelas a vencer (Próximo mês? No, visual says "Parcelas a Vencer" usually means "Current Bill")
                // Dashboard original: `monthsSinceStart` logic... 
                // Let's assume if installmentDate is THIS month (currentMonth), it is "a vencer".
                if (installmentDate.getMonth() === currentMonth && installmentDate.getFullYear() === currentYear) {
                    parcelasVencerProximos30Dias += 1
                }

                // Projeção Faturas (Future)
                // Original logic: `for (let i = 0; i < Math.min(parcelasRestantes, 12); i++)` ...
                // Here we iterate all.
                const key = installmentDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                if (!faturasMap[key]) faturasMap[key] = 0
                faturasMap[key] += valorParcela
            }
        }
    })

    const devedores = Object.values(devedoresMap).sort((a, b) => b.total - a.total).slice(0, 5)

    // Sort faturas
    // Only take next 4 months for "Proximas Faturas" widget
    // We need to order them. 
    const sortedFaturas = Object.entries(faturasMap)
        .sort((a, b) => { // a[0] is 'mmm/yyyy'
            // Need proper sort logic or just rely on generating keys in order. 
            // Since we iterate installments which are ordered in time, but we mix purchases..
            // Better generate keys for next 12 months and fill.
            return 0 // Placeholder, we fix below
        })

    // Better approach: Generate next 4 months keys and pick from map
    const proximasFaturas = []
    for (let i = 1; i <= 4; i++) {
        const d = new Date(currentYear, currentMonth + i, 1)
        const key = d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        if (faturasMap[key]) {
            proximasFaturas.push({ mes: key.replace('.', ''), valor: faturasMap[key] })
        }
    }

    return {
        limiteUsado,
        totalDevedores: Object.keys(devedoresMap).length,
        parcelasVencer: parcelasVencerProximos30Dias,
        devedores,
        proximasFaturas
    }
}
