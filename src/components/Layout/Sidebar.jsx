import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Receipt,
    Menu,
    X,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react'

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/devedores', icon: Users, label: 'Devedores' },
    { path: '/nova-compra', icon: ShoppingCart, label: 'Nova Compra' },
    { path: '/novo-cartao', icon: CreditCard, label: 'Adicionar Cartão' },
    { path: '/faturas', icon: Receipt, label: 'Faturas' },
]

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const location = useLocation()

    // Fechar menu mobile ao navegar
    useEffect(() => {
        setIsMobileOpen(false)
    }, [location.pathname])

    return (
        <>
            {/* Mobile Topbar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-b border-indigo-500/10 z-50 px-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-2 rounded-xl text-slate-300 hover:bg-white/5 active:scale-95 transition-all"
                    >
                        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        CardManager
                    </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <CreditCard size={18} className="text-white" />
                </div>
            </div>

            {/* Overlay Mobile */}
            <div
                className={`
          lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity duration-300
          ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
                onClick={() => setIsMobileOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={`
          fixed top-0 left-0 z-50 h-full bg-[#0B0F19] border-r border-indigo-500/5
          transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          flex flex-col shadow-2xl
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
                style={{
                    width: isCollapsed ? '5.5rem' : '18rem'
                }}
            >
                {/* Logo Section */}
                <div className={`
          hidden lg:flex items-center h-24 border-b border-indigo-500/5 mb-2
          ${isCollapsed ? 'justify-center px-0' : 'justify-start px-8 gap-4'}
        `}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        <CreditCard size={22} className="text-white" />
                    </div>

                    <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        <h1 className="font-bold text-xl text-white tracking-tight">CardManager</h1>
                        <p className="text-[11px] font-semibold text-indigo-400 tracking-wider uppercase mt-0.5">Pro Edition</p>
                    </div>
                </div>

                {/* Mobile Header Spacer */}
                <div className="lg:hidden h-20 shrink-0" />

                {/* Menu Items */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                  flex items-center rounded-xl transition-all duration-300 group relative
                  ${isCollapsed
                                        ? 'justify-center px-0 py-3.5 mx-auto w-12 h-12'
                                        : 'px-5 py-3.5 gap-4 w-full'
                                    }
                  ${isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'text-slate-400 hover:bg-indigo-500/5 hover:text-white'
                                    }
                `}
                            >
                                <Icon
                                    size={isCollapsed ? 24 : 20}
                                    className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />

                                <span className={`
                  font-medium whitespace-nowrap transition-all duration-300
                  ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100 relative'}
                `}>
                                    {item.label}
                                </span>

                                {/* Active Indicator (Left Border) - Optional design choice */}
                                {!isCollapsed && isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-r-full hidden" />
                                )}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="fixed left-20 px-3 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[60] shadow-xl border border-indigo-500/20 translate-x-2 group-hover:translate-x-0">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer / Toggle */}
                <div className="p-4 border-t border-indigo-500/5 bg-[#080b14]/50">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`
              hidden lg:flex items-center rounded-xl w-full border border-transparent
              text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200
              ${isCollapsed ? 'justify-center py-3' : 'justify-start px-4 py-3 gap-3'}
            `}
                    >
                        {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
                        <span className={`font-medium ${isCollapsed ? 'hidden' : 'block'}`}>Recolher Menu</span>
                    </button>

                    {/* User Profile Snippet (Optional - adds professional feel) */}
                    {!isCollapsed && (
                        <div className="hidden lg:flex items-center gap-3 mt-4 pt-4 border-t border-indigo-500/10 px-2 transition-all duration-300 animate-fadeInUp">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                                JM
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">João Melo</p>
                                <p className="text-xs text-emerald-400 truncate">Online</p>
                            </div>
                            <button className="text-slate-500 hover:text-red-400 transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Styles Reset */}
            <style>{`
        @media (max-width: 1024px) {
          aside { width: 18rem !important; }
        }
      `}</style>
        </>
    )
}
