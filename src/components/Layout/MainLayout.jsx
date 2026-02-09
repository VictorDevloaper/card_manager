import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

export default function MainLayout({ children }) {
    // Inicializar estado do localStorage (padrão expandido em telas grandes)
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarCollapsed')
            return saved === 'true'
        }
        return false
    })

    // Persistir estado
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed)
    }, [isCollapsed])

    return (
        <div className="min-h-screen bg-[#050510] flex flex-col lg:flex-row relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">

            {/* Sidebar Component */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Main Content Area */}
            <main
                className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{
                    marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
                        ? (isCollapsed ? '5.5rem' : '18rem')
                        : '0'
                }}
            >
                {/* Mobile Header Spacer */}
                <div className="h-16 lg:h-0" />

                {/* Content Container - Full Width & Centered content strategy */}
                <div className="flex-1 w-full p-6 lg:p-10 max-w-[1920px] mx-auto animate-fadeInUp">
                    {children}
                </div>

                {/* Footer (Optional) */}
                <footer className="p-6 text-center text-slate-600 text-sm border-t border-indigo-500/5 mt-auto">
                    <p>© 2026 CardManager Pro. Todos os direitos reservados.</p>
                </footer>
            </main>

            {/* Background Ambient Effects - Subtle & Professional */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-600/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
            </div>

            {/* Mobile Reset Script */}
            <script dangerouslySetInnerHTML={{
                __html: `
        window.addEventListener('resize', () => {
          const main = document.querySelector('main');
          if(window.innerWidth < 1024) {
            main.style.marginLeft = '0';
          } else {
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            main.style.marginLeft = isCollapsed ? '5.5rem' : '18rem';
          }
        });
      `}} />
        </div>
    )
}
