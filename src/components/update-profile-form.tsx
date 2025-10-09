
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfileAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { updateProfile } from 'firebase/auth';

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
          Saving...
        </>
      ) : (
        'Save Changes'
      )}
    </Button>
  );
}

interface UpdateProfileFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpdateProfileForm({ open, onOpenChange }: UpdateProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const { toast } = useToast();
  const auth = useAuth();
  
  useEffect(() => {
    if (!state) return;

    if (state.message === 'Validation failed' && state.errors) {
      const errorMessages = Object.values(state.errors).flat().join('\n');
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessages,
      });
    } else if (state.message === 'Success' && state.data) {
        if (auth.currentUser) {
            updateProfile(auth.currentUser, {
                displayName: state.data.displayName,
            }).then(() => {
                toast({
                    title: "Profile Updated",
                    description: "Your name has been successfully updated.",
                });
                onOpenChange(false);
            }).catch((e) => {
                toast({
                    variant: "destructive",
                    title: "Error updating profile",
                    description: e.message,
                });
            });
        }
    } else if (state.message && state.message !== 'Success') {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast, auth.currentUser, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogDescription>
            Change your display name here.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" name="displayName" defaultValue={auth.currentUser?.displayName || ''} />
            {state.errors?.displayName && <p className="text-sm text-destructive">{state.errors.displayName.join(', ')}</p>}
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
