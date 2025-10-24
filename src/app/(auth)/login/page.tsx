
'use client';
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CuraFlowLogo } from "@/components/icons";
import { User, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

const PIN_LENGTH = 4;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPinVisible, setIsPinVisible] = useState(false);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUser');
    const savedPin = localStorage.getItem('rememberedPin');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
    if (savedPin) {
       setPin(savedPin.split(''));
    }
  }, []);
  
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < PIN_LENGTH - 1) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if(pastedData.length === PIN_LENGTH) {
        const newPin = pastedData.split('');
        setPin(newPin);
        pinInputRefs.current[PIN_LENGTH - 1]?.focus();
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const enteredPin = pin.join('');

    if (rememberMe) {
      localStorage.setItem('rememberedUser', username);
      localStorage.setItem('rememberedPin', enteredPin);
    } else {
      localStorage.removeItem('rememberedUser');
      localStorage.removeItem('rememberedPin');
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, pin: enteredPin }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Login Successful",
          description: `Welcome back to ${data.clinic.name}!`,
        });

        // Store session data for multi-tenancy
        sessionStorage.setItem('clinicId', data.clinic.id);
        sessionStorage.setItem('clinicName', data.clinic.name);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        router.push('/');
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorData.error || "Invalid credentials. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Could not connect to the server. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <CuraFlowLogo className="w-16 h-16 mx-auto text-primary" />
        <h1 className="text-3xl font-bold mt-4">CuraFlow</h1>
        <p className="text-muted-foreground">Clinic & Hospital Management</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your clinic's dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  className="pl-10"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="pin-0">4-Digit PIN</Label>
                <div className="relative flex items-center gap-2">
                   <div className="flex justify-center gap-2" onPaste={handlePinPaste}>
                     {pin.map((digit, index) => (
                        <Input
                            key={index}
                            id={`pin-${index}`}
                            ref={el => pinInputRefs.current[index] = el}
                            type={isPinVisible ? 'text' : 'password'}
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(e, index)}
                            onKeyDown={(e) => handlePinKeyDown(e, index)}
                            className="w-12 h-12 text-center text-2xl font-bold"
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                     ))}
                   </div>
                   <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => setIsPinVisible(!isPinVisible)}
                      disabled={isLoading}
                      aria-label="Toggle PIN visibility"
                   >
                     {isPinVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                   </Button>
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
             <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                    <Switch 
                      id="remember-me" 
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                      disabled={isLoading} 
                    />
                    <Label htmlFor="remember-me" className="font-normal">Remember me</Label>
                </div>
                <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot PIN?
                </Link>
             </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
