import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Devedores from './pages/Devedores'
import DevedorDetalhes from './pages/DevedorDetalhes'
import NovaCompra from './pages/NovaCompra'
import NovoCartao from './pages/NovoCartao'
import GerenciarCartoes from './pages/GerenciarCartoes'
import Faturas from './pages/Faturas'

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devedores" element={<Devedores />} />
          <Route path="/devedores/:id" element={<DevedorDetalhes />} />
          <Route path="/nova-compra" element={<NovaCompra />} />
          <Route path="/nov-compra" element={<NovaCompra />} />
          <Route path="/novo-cartao" element={<NovoCartao />} />
          <Route path="/gerenciar-cartoes" element={<GerenciarCartoes />} />
          <Route path="/faturas" element={<Faturas />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
