
import Link from "next/link";
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Search,
  ShoppingCart,
  Users,
  Sparkles,
  Target,
  Wallet,
  CandlestickChart,
  PiggyBank,
  GanttChartSquare,
  LayoutDashboard
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "./user-nav";
import { Icons } from "./icons";
import { MainNav } from "./main-nav";
import { ThemeSwitcher } from "./theme-switcher";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Icons.logo className="h-6 w-6" />
          <span className="sr-only">WealthWise AI</span>
        </Link>
        <Link
          href="#dashboard"
          className="text-foreground transition-colors hover:text-foreground"
        >
          Dashboard
        </Link>
        <Link
          href="#portfolio"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Portfolio
        </Link>
        <Link
          href="#market"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Market
        </Link>
        <Link
          href="#expenses"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Expenses
        </Link>
        <Link
          href="#budget"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Budget
        </Link>
        <Link
          href="#goals"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Goals
        </Link>
        <Link
          href="#advisor"
          className="text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
        >
          AI Advisor
        </Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <MainNav />
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Can add a search bar here if needed */}
        </div>
        <ThemeSwitcher />
        <UserNav />
      </div>
    </header>
  );
}
