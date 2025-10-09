
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
import { Camera, FileUp, Loader2, ScanLine, X, CameraIcon, RefreshCw } from 'lucide-react';
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [isCameraOpen, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        
        // Create a new File object to ensure the form state is updated correctly
        const newFile = new File([selectedFile], selectedFile.name, { type: selectedFile.type });
        setFile(newFile);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            setPreview(dataUri);

            canvas.toBlob(blob => {
                if (blob) {
                    const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    setFile(capturedFile);
                }
            }, 'image/jpeg');
        }
        setIsCameraOpen(false);
    }
  };


  const handleClose = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    setIsCameraOpen(false);
    setHasCameraPermission(null);
    setOpen(false);
  };
  
  const resetPreview = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  }

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (file) {
      formData.set('billImage', file, file.name);
    }
    formAction(formData);
  }

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
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onCloseAutoFocus={handleClose}>
        <DialogHeader>
          <DialogTitle>Scan a Bill or Receipt</DialogTitle>
          <DialogDescription>
            Upload or take a picture of your bill to automatically extract the details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="billImage">Bill Image</Label>
                    {isCameraOpen ? (
                        <div className="space-y-2">
                             <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                             {hasCameraPermission === false && (
                                <Alert variant="destructive">
                                    <CameraIcon className="h-4 w-4" />
                                    <AlertTitle>Camera Access Denied</AlertTitle>
                                    <AlertDescription>
                                        Please grant camera permission in your browser settings to use this feature.
                                    </AlertDescription>
                                </Alert>
                             )}
                             <canvas ref={canvasRef} className="hidden" />
                        </div>
                    ) : !preview ? (
                        <div 
                            className="flex flex-col justify-center items-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="text-center">
                                <FileUp className="mx-auto h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag & drop</p>
                                <p className="text-xs text-muted-foreground">PNG or JPG, up to 5MB</p>
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
                                onClick={resetPreview}
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

                <div className="flex justify-center items-center gap-2">
                    {!isCameraOpen ? (
                        <Button type="button" variant="outline" onClick={() => setIsCameraOpen(true)} className="w-full">
                            <CameraIcon className="mr-2 h-4 w-4" /> Use Camera
                        </Button>
                    ) : (
                        <>
                            <Button type="button" variant="secondary" onClick={() => setIsCameraOpen(false)} className="w-full">
                                Close Camera
                            </Button>
                            <Button type="button" onClick={handleCapture} disabled={hasCameraPermission === false} className="w-full">
                                <Camera className="mr-2 h-4 w-4" /> Capture
                            </Button>
                        </>
                    )}
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
