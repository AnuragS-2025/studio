
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
  Target,
} from "lucide-react";
import { Icons } from "./icons";

const navItems = [
  { href: "#dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "#portfolio", icon: Wallet, label: "Portfolio" },
  { href: "#market", icon: CandlestickChart, label: "Market" },
  { href: "#expenses", icon: PiggyBank, label: "Expenses" },
  { href: "#budget", icon: GanttChartSquare, label: "Budget" },
  { href: "#advisor", icon: Sparkles, label: "AI Advisor" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2 text-lg font-medium">
      <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold mb-4"
        >
          <Icons.logo className="h-6 w-6" />
          <span className="sr-only">WealthWise AI</span>
        </Link>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
    </nav>
  );
}
