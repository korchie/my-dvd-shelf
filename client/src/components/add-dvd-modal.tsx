import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BarcodeScanner } from "./barcode-scanner";
import { Camera } from "lucide-react";
import { insertDvdSchema, type InsertDvd } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertDvdSchema.extend({
  title: z.string().min(1, "Title is required"),
  status: z.enum(["owned", "wishlist"]),
});

interface AddDvdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDvd?: InsertDvd & { id: number };
}

export function AddDvdModal({ open, onOpenChange, editingDvd }: AddDvdModalProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editingDvd?.title || "",
      year: editingDvd?.year || undefined,
      genre: editingDvd?.genre || "",
      director: editingDvd?.director || "",
      status: (editingDvd?.status as "owned" | "wishlist") || "owned",
      posterUrl: editingDvd?.posterUrl || "",
      barcode: editingDvd?.barcode || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertDvd) => {
      const response = await apiRequest("POST", "/api/dvds", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dvds"] });
      toast({ title: "DVD added successfully!" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to add DVD", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertDvd) => {
      const response = await apiRequest("PATCH", `/api/dvds/${editingDvd!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dvds"] });
      toast({ title: "DVD updated successfully!" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update DVD", variant: "destructive" });
    },
  });

  const lookupMovie = async (title: string) => {
    setIsLookingUp(true);
    try {
      const response = await apiRequest("POST", "/api/lookup", { title });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401 && errorData.error === "API_KEY_INVALID") {
          toast({ 
            title: "API Key Issue", 
            description: "Please check your OMDB API key configuration. You can get a free key at omdbapi.com",
            variant: "destructive" 
          });
          return;
        }
        
        throw new Error(errorData.message || "Movie lookup failed");
      }
      
      const movieData = await response.json();
      
      form.setValue("title", movieData.title);
      form.setValue("year", movieData.year);
      form.setValue("genre", movieData.genre);
      form.setValue("director", movieData.director);
      if (movieData.posterUrl) {
        form.setValue("posterUrl", movieData.posterUrl);
      }
      
      toast({ 
        title: "Movie data found!", 
        description: `Found: ${movieData.title} (${movieData.year})`
      });
    } catch (error) {
      console.error("Movie lookup error:", error);
      toast({ 
        title: "Movie not found", 
        description: "Please enter the details manually or check the movie title.",
        variant: "destructive" 
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    setShowScanner(false);
    form.setValue("barcode", barcode);
    lookupMovie(barcode);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingDvd) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const genres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "Horror", "Music", "Mystery", "Romance",
    "Sci-Fi", "Thriller", "War", "Western"
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDvd ? "Edit DVD" : "Add New DVD"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!editingDvd && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-center text-white">
                  <Camera className="mx-auto h-12 w-12 mb-4 opacity-90" />
                  <h4 className="text-lg font-medium mb-2">Scan Barcode</h4>
                  <p className="text-sm opacity-90 mb-4">
                    Use your camera to scan the DVD barcode
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => setShowScanner(true)}
                    disabled={isLookingUp}
                    className="w-full"
                  >
                    Start Scanner
                  </Button>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-center text-white">
                  <div className="mx-auto h-12 w-12 mb-4 opacity-90 text-4xl">🔍</div>
                  <h4 className="text-lg font-medium mb-2">Search Movie</h4>
                  <p className="text-sm opacity-90 mb-4">
                    Search by movie title for auto-fill
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const title = prompt("Enter movie title to search:");
                      if (title) lookupMovie(title);
                    }}
                    disabled={isLookingUp}
                    className="w-full"
                  >
                    Search Movie
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center text-gray-500 text-sm">
              {editingDvd ? "Edit details below" : "or enter details manually below"}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter DVD title"
                  disabled={isLookingUp}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    {...form.register("year", { valueAsNumber: true })}
                    placeholder="2023"
                    min="1900"
                    max="2024"
                    disabled={isLookingUp}
                  />
                </div>

                <div>
                  <Label>Genre</Label>
                  <Select 
                    value={form.watch("genre") || ""} 
                    onValueChange={(value) => form.setValue("genre", value)}
                    disabled={isLookingUp}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  {...form.register("director")}
                  placeholder="Enter director name"
                  disabled={isLookingUp}
                />
              </div>

              <div>
                <Label>Status</Label>
                <RadioGroup
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as "owned" | "wishlist")}
                  className="flex space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owned" id="owned" />
                    <Label htmlFor="owned">Owned</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wishlist" id="wishlist" />
                    <Label htmlFor="wishlist">Wishlist</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending || isLookingUp}
                >
                  {isLookingUp 
                    ? "Looking up..." 
                    : editingDvd 
                      ? "Update DVD" 
                      : "Add to Collection"
                  }
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
