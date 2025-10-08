
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  CandlestickChart,
  PiggyBank,
  GanttChartSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/portfolio", icon: Wallet, label: "Portfolio" },
  { href: "/market", icon: CandlestickChart, label: "Market" },
  { href: "/expenses", icon: PiggyBank, label: "Expenses" },
  { href: "/budget", icon: GanttChartSquare, label: "Budget" },
  { href: "/goals", icon: GanttChartSquare, label: "Goals" },
  { href: "/advisor", icon: Sparkles, label: "AI Advisor" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              href={item.href}
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
