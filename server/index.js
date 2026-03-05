import express from 'express'
import cors from 'cors'
import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const { Pool } = pg

const app = express()
const PORT = process.env.PORT || 3001

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Middleware
app.use(cors())
app.use(express.json())

// Serve static files from the React app build
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

// ============================================
// DASHBOARD ROUTES
// ============================================

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const limiteTotal = 20000

        // Limite usado
        const limiteResult = await pool.query('SELECT valor_usado FROM limite_usado')
        const limiteUsado = parseFloat(limiteResult.rows[0]?.valor_usado || 0)

        // Total devedores
        const devedoresResult = await pool.query('SELECT COUNT(*) FROM devedores')
        const totalDevedores = parseInt(devedoresResult.rows[0].count)

        // Parcelas a vencer (próximos 30 dias)
        const parcelasResult = await pool.query(`
      SELECT COUNT(*) FROM parcelas 
      WHERE pago = FALSE 
      AND data_vencimento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    `)
        const parcelasVencer = parseInt(parcelasResult.rows[0].count)

        // Top devedores
        const topDevedores = await pool.query(`
      SELECT * FROM resumo_devedores 
      WHERE total_devido > 0 
      ORDER BY total_devido DESC 
      LIMIT 5
    `)

        // Próximas faturas (6 meses)
        const faturasResult = await pool.query(`
      SELECT 
        TO_CHAR(data_vencimento, 'Mon/YYYY') AS mes,
        SUM(valor) AS valor
      FROM parcelas
      WHERE pago = FALSE
      AND data_vencimento >= DATE_TRUNC('month', CURRENT_DATE)
      AND data_vencimento < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '6 months'
      GROUP BY TO_CHAR(data_vencimento, 'Mon/YYYY'), DATE_TRUNC('month', data_vencimento)
      ORDER BY DATE_TRUNC('month', data_vencimento)
    `)

        res.json({
            limiteTotal,
            limiteUsado,
            limiteDisponivel: limiteTotal - limiteUsado,
            totalDevedores,
            parcelasVencer,
            topDevedores: topDevedores.rows,
            proximasFaturas: faturasResult.rows
        })
    } catch (error) {
        console.error('Dashboard stats error:', error)
        res.status(500).json({ error: 'Erro ao buscar estatísticas' })
    }
})

// ============================================
// DEVEDORES ROUTES
// ============================================

// Listar todos
app.get('/api/devedores', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM resumo_devedores ORDER BY nome')
        res.json(result.rows)
    } catch (error) {
        console.error('Get devedores error:', error)
        res.status(500).json({ error: 'Erro ao buscar devedores' })
    }
})

// Buscar por ID
app.get('/api/devedores/:id', async (req, res) => {
    try {
        const { id } = req.params
        const devedorResult = await pool.query('SELECT * FROM devedores WHERE id = $1', [id])

        if (devedorResult.rows.length === 0) {
            return res.status(404).json({ error: 'Devedor não encontrado' })
        }

        // Buscar compras com parcelas
        const comprasResult = await pool.query(`
      SELECT 
        c.*,
        json_agg(
          json_build_object(
            'id', p.id,
            'numero_parcela', p.numero_parcela,
            'valor', p.valor,
            'data_vencimento', p.data_vencimento,
            'pago', p.pago,
            'data_pagamento', p.data_pagamento
          ) ORDER BY p.numero_parcela
        ) AS parcelas
      FROM compras c
      LEFT JOIN parcelas p ON p.compra_id = c.id
      WHERE c.devedor_id = $1
      GROUP BY c.id
      ORDER BY c.data_compra DESC
    `, [id])

        res.json({
            ...devedorResult.rows[0],
            compras: comprasResult.rows
        })
    } catch (error) {
        console.error('Get devedor error:', error)
        res.status(500).json({ error: 'Erro ao buscar devedor' })
    }
})

// Criar novo
app.post('/api/devedores', async (req, res) => {
    try {
        const { nome, telefone } = req.body
        const result = await pool.query(
            'INSERT INTO devedores (nome, telefone) VALUES ($1, $2) RETURNING *',
            [nome, telefone]
        )
        res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Create devedor error:', error)
        res.status(500).json({ error: 'Erro ao criar devedor' })
    }
})

// Atualizar
app.put('/api/devedores/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { nome, telefone } = req.body
        const result = await pool.query(
            'UPDATE devedores SET nome = $1, telefone = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [nome, telefone, id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Devedor não encontrado' })
        }
        res.json(result.rows[0])
    } catch (error) {
        console.error('Update devedor error:', error)
        res.status(500).json({ error: 'Erro ao atualizar devedor' })
    }
})

// Deletar
app.delete('/api/devedores/:id', async (req, res) => {
    try {
        const { id } = req.params
        await pool.query('DELETE FROM devedores WHERE id = $1', [id])
        res.status(204).send()
    } catch (error) {
        console.error('Delete devedor error:', error)
        res.status(500).json({ error: 'Erro ao deletar devedor' })
    }
})

// ============================================
// COMPRAS ROUTES
// ============================================

// Criar compra (gera parcelas automaticamente)
app.post('/api/compras', async (req, res) => {
    const client = await pool.connect()

    try {
        const { devedor_id, descricao, valor_total, num_parcelas, data_compra } = req.body

        await client.query('BEGIN')

        // Criar compra
        const compraResult = await client.query(
            `INSERT INTO compras (devedor_id, descricao, valor_total, num_parcelas, data_compra) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [devedor_id, descricao, valor_total, num_parcelas, data_compra]
        )
        const compra = compraResult.rows[0]

        // Gerar parcelas
        const valorParcela = (valor_total / num_parcelas).toFixed(2)
        const dataBase = new Date(data_compra)

        const parcelas = []
        for (let i = 1; i <= num_parcelas; i++) {
            const vencimento = new Date(dataBase)
            vencimento.setMonth(vencimento.getMonth() + i)

            const parcelaResult = await client.query(
                `INSERT INTO parcelas (compra_id, numero_parcela, valor, data_vencimento) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
                [compra.id, i, valorParcela, vencimento.toISOString().split('T')[0]]
            )
            parcelas.push(parcelaResult.rows[0])
        }

        await client.query('COMMIT')

        res.status(201).json({ ...compra, parcelas })
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Create compra error:', error)
        res.status(500).json({ error: 'Erro ao criar compra' })
    } finally {
        client.release()
    }
})

// Deletar compra
app.delete('/api/compras/:id', async (req, res) => {
    try {
        const { id } = req.params
        await pool.query('DELETE FROM compras WHERE id = $1', [id])
        res.status(204).send()
    } catch (error) {
        console.error('Delete compra error:', error)
        res.status(500).json({ error: 'Erro ao deletar compra' })
    }
})

// ============================================
// PARCELAS ROUTES
// ============================================

// Marcar parcela como paga/não paga
app.patch('/api/parcelas/:id/pagar', async (req, res) => {
    try {
        const { id } = req.params
        const { pago } = req.body

        const result = await pool.query(
            `UPDATE parcelas 
       SET pago = $1, 
           data_pagamento = CASE WHEN $1 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
            [pago, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Parcela não encontrada' })
        }

        res.json(result.rows[0])
    } catch (error) {
        console.error('Update parcela error:', error)
        res.status(500).json({ error: 'Erro ao atualizar parcela' })
    }
})

// ============================================
// FATURAS ROUTES
// ============================================

// Projeção de faturas (12 meses)
app.get('/api/faturas/projecao', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        TO_CHAR(p.data_vencimento, 'Mon/YYYY') AS mes,
        DATE_TRUNC('month', p.data_vencimento) AS mes_ordenacao,
        d.id AS devedor_id,
        d.nome AS devedor_nome,
        SUM(p.valor) AS valor
      FROM parcelas p
      INNER JOIN compras c ON p.compra_id = c.id
      INNER JOIN devedores d ON c.devedor_id = d.id
      WHERE p.pago = FALSE
      AND p.data_vencimento >= DATE_TRUNC('month', CURRENT_DATE)
      AND p.data_vencimento < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '12 months'
      GROUP BY TO_CHAR(p.data_vencimento, 'Mon/YYYY'), DATE_TRUNC('month', p.data_vencimento), d.id, d.nome
      ORDER BY mes_ordenacao, d.nome
    `)

        // Agrupar por mês
        const meses = {}
        result.rows.forEach(row => {
            if (!meses[row.mes]) {
                meses[row.mes] = {
                    mes: row.mes,
                    total: 0,
                    devedores: {}
                }
            }
            meses[row.mes].devedores[row.devedor_nome] = parseFloat(row.valor)
            meses[row.mes].total += parseFloat(row.valor)
        })

        res.json(Object.values(meses))
    } catch (error) {
        console.error('Faturas projecao error:', error)
        res.status(500).json({ error: 'Erro ao buscar projeção' })
    }
})

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Catch-all route to serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})
