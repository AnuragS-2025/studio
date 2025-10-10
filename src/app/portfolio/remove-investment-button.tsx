
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { removeInvestmentAction } from '@/lib/actions';
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

export function RemoveInvestmentButton({ investmentId }: { investmentId: string }) {
  const [state, formAction] = useActionState(removeInvestmentAction, initialState);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!state) return;

    if (state.message === 'Success' && state.data) {
        const { userId, investmentId } = state.data;
        if (firestore && userId && investmentId) {
            const docRef = doc(firestore, 'users', userId, 'investments', investmentId);
            deleteDoc(docRef).then(() => {
                 toast({
                    title: "Investment Removed",
                    description: "The investment has been successfully deleted.",
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
          <span className="sr-only">Remove Investment</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <input type="hidden" name="investmentId" value={investmentId} />
          <input type="hidden" name="userId" value={user?.uid || ''} />
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this investment from your portfolio.
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
