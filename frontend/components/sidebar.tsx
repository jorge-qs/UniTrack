"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Home, BarChart3, MessageSquare, Clock, User, Settings, HelpCircle } from "lucide-react"

const menuItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/courses", label: "Currícula", icon: BookOpen },
  { href: "/plan", label: "Mi Plan", icon: BarChart3 },
  { href: "/resources", label: "Recursos", icon: MessageSquare },
  { href: "/history", label: "Historial", icon: Clock },
  { href: "/profile", label: "Perfil", icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">U</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">UniTrack</h1>
            <p className="text-xs text-sidebar-foreground/60">Asesor Académico</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <HelpCircle className="w-5 h-5" />
          Ayuda
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="w-5 h-5" />
          Configuración
        </button>
      </div>
    </aside>
  )
}
