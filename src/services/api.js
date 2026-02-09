import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Devedores
export const getDevedores = () => api.get('/devedores')
export const getDevedor = (id) => api.get(`/devedores/${id}`)
export const createDevedor = (data) => api.post('/devedores', data)
export const updateDevedor = (id, data) => api.put(`/devedores/${id}`, data)
export const deleteDevedor = (id) => api.delete(`/devedores/${id}`)

// Compras
export const getCompras = (devedorId) => api.get(`/compras?devedor_id=${devedorId}`)
export const createCompra = (data) => api.post('/compras', data)
export const deleteCompra = (id) => api.delete(`/compras/${id}`)

// Parcelas
export const getParcelas = (compraId) => api.get(`/parcelas?compra_id=${compraId}`)
export const updateParcela = (id, data) => api.put(`/parcelas/${id}`, data)
export const marcarParcela = (id, pago) => api.patch(`/parcelas/${id}/pagar`, { pago })

// Faturas
export const getFaturasFuturas = () => api.get('/faturas/projecao')
export const getFaturaDevedor = (devedorId) => api.get(`/faturas/devedor/${devedorId}`)

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')

export default api
