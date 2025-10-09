
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addExpenseAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

const initialState = {
  message: '',
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        'Add Expense'
      )}
    </Button>
  );
}

export function AddExpenseForm() {
  const [state, formAction] = useActionState(addExpenseAction, initialState);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.message === 'Validation failed' && state.errors) {
      const errorMessages = Object.values(state.errors).flat().join('\n');
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessages,
      });
    } else if (state.message === 'Success' && state.data) {
        if (user) {
            const transactionsColRef = collection(firestore, 'users', user.uid, 'transactions');
            addDoc(transactionsColRef, { ...state.data, type: 'expense' }).then(() => {
                 toast({
                    title: "Expense Added",
                    description: `${state.data.description} for ₹${state.data.amount} has been added.`,
                });
                setOpen(false);
            }).catch((e) => {
                 toast({
                    variant: "destructive",
                    title: "Error writing to database",
                    description: e.message,
                });
            });
        }
    } else if (state.message && state.message !== 'Success' && !state.errors) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast, user, firestore]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Expense
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Manually enter the details of your expense.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="userId" value={user?.uid || ''} />
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="e.g., Coffee with friend" />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="e.g., 5.00" />
              {state.errors?.amount && <p className="text-sm text-destructive">{state.errors.amount.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              {state.errors?.date && <p className="text-sm text-destructive">{state.errors.date.join(', ')}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue="Other">
                <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
            {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category.join(', ')}</p>}
          </div>
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
