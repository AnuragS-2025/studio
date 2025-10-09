
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { scanBillAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, FileUp, Loader2, ScanLine, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
          Scanning...
        </>
      ) : (
        <>
          <ScanLine className="mr-2 h-4 w-4" />
          Scan Bill
        </>
      )}
    </Button>
  );
}

export function ScanBillForm() {
  const [state, formAction] = useActionState(scanBillAction, initialState);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.message === 'Validation failed' && state.errors) {
      const errorMessages = Object.values(state.errors).flat().join('\n');
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessages,
      });
    } else if (state.message === 'Success' && state.data) {
      toast({
        title: "Bill Scanned Successfully",
        description: `${state.data.description} for ₹${state.data.amount} has been added.`,
      });
      handleClose();
    } else if (state.message && state.message !== 'Success') {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    setOpen(false);
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <ScanLine className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Scan Bill
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onCloseAutoFocus={handleClose}>
        <DialogHeader>
          <DialogTitle>Scan a Bill or Receipt</DialogTitle>
          <DialogDescription>
            Upload an image of your bill, and we'll automatically extract the details.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="billImage">Bill Image</Label>
                    {!preview ? (
                        <div 
                            className="flex justify-center items-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="text-center">
                                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <img src={preview} alt="Bill preview" className="w-full h-auto rounded-md" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={() => {
                                    setFile(null);
                                    setPreview(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <Input 
                        id="billImage" 
                        name="billImage"
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg" 
                    />
                     {state.errors?.billImage && <p className="text-sm text-destructive">{state.errors.billImage.join(', ')}</p>}
                </div>
            </div>
            <DialogFooter>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
