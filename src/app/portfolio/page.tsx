import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getInvestments, getPortfolioValue } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PortfolioPage() {
  const investments = getInvestments();
  const portfolioValue = getPortfolioValue();

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="flex items-center">
        <div className="grid gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
            <p className="text-muted-foreground">
                Total Value: <span className="font-bold text-foreground">${portfolioValue.toLocaleString()}</span>
            </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Investment
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Investment</DialogTitle>
                <DialogDescription>
                  Add a new stock, bond, or cryptocurrency to your portfolio.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" defaultValue="Apple Inc." className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input id="quantity" type="number" defaultValue="10" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input id="price" type="number" defaultValue="175" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Investment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Quantity</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell>
                    <div className="font-medium">{investment.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {investment.symbol}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                        investment.type === 'stock' && 'border-sky-500 text-sky-500',
                        investment.type === 'crypto' && 'border-amber-500 text-amber-500',
                        investment.type === 'bond' && 'border-lime-500 text-lime-500',
                    )}>
                      {investment.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{investment.quantity}</TableCell>
                  <TableCell className="hidden md:table-cell">${investment.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${investment.value.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
