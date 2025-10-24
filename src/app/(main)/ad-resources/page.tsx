
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Image as ImageIcon, Video, Trash2, Edit, GripVertical, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { AddResourceDialog } from '@/components/ad-resources/add-resource-dialog';
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
} from '@/components/ui/alert-dialog';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AdResource } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFetch } from '@/hooks/use-api';

const SortableResourceCard = ({ resource, onRemove, onEdit }: { resource: AdResource, onRemove: (id: string) => void, onEdit: (resource: AdResource) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: resource.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 'auto',
    };
    
    return (
        <div ref={setNodeRef} style={style}>
            <Card className="overflow-hidden group relative">
              <div {...attributes} {...listeners} className="absolute top-1/2 -left-3 -translate-y-1/2 z-10 p-2 text-muted-foreground/50 hover:text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical />
              </div>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-muted">
                  {resource.type === 'image' ? (
                    <Image src={resource.url} alt={resource.title} fill className="object-cover" />
                  ) : (
                    <video src={resource.url} className="w-full h-full object-cover" controls={false} muted loop autoPlay />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all"></div>
                   <div className="absolute top-2 left-2">
                        {resource.type === 'image' ? <ImageIcon className="text-white/80" /> : <Video className="text-white/80" />}
                   </div>
                   <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={() => onEdit(resource)}><Edit /></Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/50 hover:text-white"><Trash2 /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete the resource "{resource.title}".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onRemove(resource.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                   </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-lg">{resource.title}</h3>
                    <p className="text-xs">{resource.duration} seconds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
    )
}

export default function AdResourcesPage() {
  const [resources, setResources] = useState<AdResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<AdResource | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const { toast } = useToast();
  const { get, post, put, del } = useFetch();

  useEffect(() => {
    const fetchResources = async () => {
      const clinicId = sessionStorage.getItem('clinicId');
      if (!clinicId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await get('/api/ad-resources');
        if (!response) return;
        const data = await response.json();
        setResources(data);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch ad resources.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, [toast, get]);

  const handleAddResource = async (resource: Omit<AdResource, 'id'>) => {
    try {
      const response = await post('/api/ad-resources', resource);
      if (!response) return;
      const newResource = await response.json();
      setResources((prev) => [...prev, newResource]);
       toast({ title: 'Resource Added', description: `"${newResource.title}" has been successfully added.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add resource.', variant: 'destructive' });
    }
  };
  
  const handleEditResource = async (resource: AdResource) => {
    try {
      const response = await put(`/api/ad-resources/${resource.id}`, resource);
      if (!response) return;
      const updatedResource = await response.json();
      setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r));
      setEditingResource(null);
       toast({ title: 'Resource Updated', description: `"${updatedResource.title}" has been successfully updated.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update resource.', variant: 'destructive' });
    }
  }

  const handleRemoveResource = async (id: string) => {
    try {
      await del(`/api/ad-resources/${id}`);
      setResources((prev) => prev.filter((res) => res.id !== id));
      toast({ title: 'Resource Deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete resource.', variant: 'destructive' });
    }
  };
  
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = resources.findIndex(item => item.id === active.id);
      const newIndex = resources.findIndex(item => item.id === over.id);
      const newOrder = arrayMove(resources, oldIndex, newIndex);
      
      setResources(newOrder);

      try {
        await post('/api/ad-resources/reorder', { orderedIds: newOrder.map(r => r.id) });
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to save new order.', variant: 'destructive' });
        setResources(arrayMove(newOrder, newIndex, oldIndex));
      }
    }
  }

  const openAddDialog = () => {
    setEditingResource(null);
    setAddDialogOpen(true);
  }

  const openEditDialog = (resource: AdResource) => {
    setEditingResource(resource);
    setAddDialogOpen(true);
  }

  return (
    <>
      <AddResourceDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onAddResource={handleAddResource}
        onEditResource={handleEditResource}
        existingResource={editingResource}
      />
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ad Resources</CardTitle>
              <CardDescription>Manage images and videos for the display screen carousel. Drag to reorder.</CardDescription>
            </div>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2" /> Add New Resource
            </Button>
          </CardHeader>
        </Card>
        
        {isLoading ? (
            <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : resources.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={resources.map(r => r.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((res) => (
                  <SortableResourceCard key={res.id} resource={res} onRemove={handleRemoveResource} onEdit={openEditDialog} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
            <Card>
                <CardContent className="py-16 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Ad Resources Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Get started by adding an image or video.</p>
                    <Button className="mt-6" onClick={openAddDialog}>
                        <PlusCircle className="mr-2" /> Add Resource
                    </Button>
                </CardContent>
            </Card>
        )}
      </div>
    </>
  );
}
