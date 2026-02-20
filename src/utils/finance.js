export const calculateInstallments = (purchases, adjustments = []) => {
    // adjustments: array of { purchase_id, parcela_index, is_deleted, custom_value, custom_date }
    // returns array of expected installments with dates and values

    // NOT implementation yet, just helper to normalize purchase flow
}

export const generateProjecao = (cardId, purchases = [], adjustments = []) => {
    if (!cardId) return []
    const meses = []
    const hoje = new Date()

    // Filter purchases
    const cardPurchases = purchases.filter(p => p.cardId === cardId || p.card_id === cardId)

    for (let i = 0; i < 12; i++) {
        const dataReferencia = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 1)
        const mesNome = dataReferencia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

        const devedores = {} // { Name: { total: 0, items: [] } }
        let total = 0

        cardPurchases.forEach(compra => {
            const dataCompra = new Date(compra.dataCompra || compra.data_compra)

            // Assume first installment is next month after purchase
            const startMonthDiff = (dataReferencia.getFullYear() - dataCompra.getFullYear()) * 12 + (dataReferencia.getMonth() - dataCompra.getMonth())

            // Logic: if startMonthDiff == 1, it's installment #1. 
            // If purchase was in Jan, Reference is Feb -> Diff is 1. Installment 1.

            if (startMonthDiff > 0 && startMonthDiff <= compra.numParcelas) {
                const parcelaIndex = startMonthDiff // 1-based

                // Check for adjustments
                const adj = adjustments.find(a =>
                    (a.purchaseId === compra.id || a.purchase_id === compra.id) &&
                    a.parcelaIndex === parcelaIndex
                )

                if (adj?.isDeleted || adj?.is_deleted) return

                let valorParcela = compra.valorTotal / compra.numParcelas
                if (adj?.customValue) valorParcela = parseFloat(adj.customValue)
                if (adj?.custom_value) valorParcela = parseFloat(adj.custom_value)

                // Add to devedor
                const nome = compra.devedorNome || compra.devedor_nome || 'Desconhecido'
                if (!devedores[nome]) {
                    devedores[nome] = { total: 0, items: [] }
                }

                devedores[nome].total += valorParcela
                devedores[nome].items.push({
                    descricao: compra.descricao,
                    parcela: `${parcelaIndex}/${compra.numParcelas}`,
                    valor: valorParcela,
                    purchaseId: compra.id,
                    parcelaIndex: parcelaIndex
                })

                total += valorParcela
            }
        })

        // Simplify devedores object for view
        const devedoresFormatted = {}
        Object.entries(devedores).forEach(([nome, data]) => {
            devedoresFormatted[nome] = data.total
        })

        // Also keep detailed items for the detailed view
        const devedoresDetailed = devedores

        meses.push({
            mes: mesNome,
            total,
            devedores: devedoresFormatted,
            devedoresDetailed: devedoresDetailed,
            numDevedores: Object.keys(devedores).length
        })
    }

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

        // Calculate active installments
        for (let i = 1; i <= numParcelas; i++) {
            // Calculate Month for this installment
            // 1st installment = dataCompra month + 1
            const installmentDate = new Date(dataCompra.getFullYear(), dataCompra.getMonth() + i, 1)

            // Check if already paid (in the past relative to current month/year view? 
            // Usually "paid" means date < now. Or strictly previous months.
            // Dashboard logic says: 
            // "startMonth = dataCompra.getMonth() + 1"
            // "monthsSinceStart = (currentYear - startYear)*12 + (currentMonth - startMonth)"
            // "parcelasPagas = Math.min(monthsSinceStart + 1, numParcelas)"

            // Let's stick to checking date < Next Month Start
            const nextMonthStart = new Date(currentYear, currentMonth + 1, 1)
            const currentMonthStart = new Date(currentYear, currentMonth, 1)

            // Check adjustment
            const adj = adjustments.find(a =>
                (a.purchaseId === compra.id || a.purchase_id === compra.id) &&
                a.parcelaIndex === i
            )

            if (adj?.isDeleted || adj?.is_deleted) continue

            let valorParcela = baseValorParcela
            if (adj?.customValue) valorParcela = parseFloat(adj.customValue)
            if (adj?.custom_value) valorParcela = parseFloat(adj.custom_value)

            // Is it future/unpaid?
            // Assumption: Current month is NOT paid yet unless explicitly marked. 
            // Logic in Dashboard.js seemed to assume previous months are paid.

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
