
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { removeTransactionAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { doc, deleteDoc } from 'firebase/firestore';

const initialState = {
  message: '',
  errors: null,
  data: null
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        </>
      ) : (
        'Delete'
      )}
    </Button>
  );
}

export function RemoveTransactionButton({ transactionId }: { transactionId: string }) {
  const [state, formAction] = useActionState(removeTransactionAction, initialState);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!state) return;

    if (state.message === 'Success' && state.data) {
        const { userId, transactionId } = state.data;
        if (firestore && userId && transactionId) {
            const docRef = doc(firestore, 'users', userId, 'transactions', transactionId);
            deleteDoc(docRef).then(() => {
                 toast({
                    title: "Transaction Removed",
                    description: "The transaction has been successfully deleted.",
                });
            }).catch((e) => {
                 toast({
                    variant: "destructive",
                    title: "Error deleting from database",
                    description: e.message,
                });
            });
        }
    } else if (state.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast, firestore]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove Transaction</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <input type="hidden" name="transactionId" value={transactionId} />
          <input type="hidden" name="userId" value={user?.uid || ''} />
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this transaction from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <SubmitButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
