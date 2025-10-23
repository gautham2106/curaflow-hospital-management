
'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import type { Doctor } from '@/lib/types';


const doctorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  specialty: z.string().min(1, 'Specialty is required'),
  sessions: z.array(z.object({
      name: z.enum(["Morning", "Afternoon", "Evening"]),
      limit: z.coerce.number().min(1, 'Limit must be at least 1').default(20)
  })).optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface AddDoctorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddDoctor: (doctor: Omit<Doctor, 'id' | 'status' | 'avatar' | 'todaysSessions'>) => void;
  departments: string[];
}

const sessionOptions: ("Morning" | "Afternoon" | "Evening")[] = ['Morning', 'Afternoon', 'Evening'];

export function AddDoctorDialog({ isOpen, onOpenChange, onAddDoctor, departments }: AddDoctorDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      phone: '',
      specialty: '',
      sessions: [
        { name: 'Morning', limit: 20 },
        { name: 'Afternoon', limit: 20 },
        { name: 'Evening', limit: 20 },
      ]
    },
  });

  const onSubmit = (data: DoctorFormData) => {
    onAddDoctor(data);
    reset();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Doctor</DialogTitle>
          <DialogDescription>
            Enter the details for the new doctor. This can be changed later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="specialty">Specialty</Label>
             <Controller
                name="specialty"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="specialty"><SelectValue placeholder="Select specialty" /></SelectTrigger>
                        <SelectContent>
                            {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.specialty && <p className="text-xs text-destructive">{errors.specialty.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          
          <div>
            <Label>Default Session Token Limits</Label>
             <p className="text-xs text-muted-foreground">Sets default patient limits for sessions.</p>
            <div className="space-y-2 mt-2">
              {sessionOptions.map((session, index) => (
                    <div key={session} className="flex items-center gap-2">
                      <Label htmlFor={`session-${session}`} className="w-24 font-normal">{session}</Label>
                      <Input
                        id={`session-${session}`}
                        type="number"
                        {...register(`sessions.${index}.limit`)}
                      />
                    </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Doctor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
