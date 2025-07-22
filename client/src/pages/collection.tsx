import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CollectionStats } from "@/components/collection-stats";
import { SidebarFilters } from "@/components/sidebar-filters";
import { DvdCard } from "@/components/dvd-card";
import { AddDvdModal } from "@/components/add-dvd-modal";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { StatsModal } from "@/components/stats-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Dvd } from "@shared/schema";

interface FilterState {
  status: string[];
  genres: string[];
  yearRange: number[];
}

export default function Collection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    genres: [],
    yearRange: [1950, 2024],
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDvd, setEditingDvd] = useState<(Dvd) | undefined>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dvds = [], isLoading } = useQuery<Dvd[]>({
    queryKey: ["/api/dvds"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/dvds/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dvds"] });
      toast({ title: "DVD deleted successfully!" });
    },
    onError: (error) => {
      if (error.message?.includes("401") && error.message?.includes("Unauthorized")) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Failed to delete DVD", variant: "destructive" });
    },
  });

  const filteredDvds = useMemo(() => {
    let filtered = dvds;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dvd =>
        dvd.title.toLowerCase().includes(query) ||
        dvd.director?.toLowerCase().includes(query) ||
        dvd.genre?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(dvd => filters.status.includes(dvd.status));
    }

    // Genre filter
    if (filters.genres.length > 0) {
      filtered = filtered.filter(dvd => 
        dvd.genre && filters.genres.some(genre => dvd.genre?.includes(genre))
      );
    }

    // Year range filter
    filtered = filtered.filter(dvd => {
      if (!dvd.year) return true;
      return dvd.year >= filters.yearRange[0] && dvd.year <= filters.yearRange[1];
    });

    return filtered;
  }, [dvds, searchQuery, filters]);

  const stats = useMemo(() => {
    const total = dvds.length;
    const owned = dvds.filter(dvd => dvd.status === "owned").length;
    const wishlist = dvds.filter(dvd => dvd.status === "wishlist").length;
    return { total, owned, wishlist };
  }, [dvds]);

  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dvds.forEach(dvd => {
      if (dvd.genre) {
        const genres = dvd.genre.split(", ");
        genres.forEach(genre => {
          counts[genre] = (counts[genre] || 0) + 1;
        });
      }
    });
    return counts;
  }, [dvds]);

  const handleEdit = (dvd: Dvd) => {
    setEditingDvd(dvd);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this DVD?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingDvd(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">💿</div>
              <h1 className="text-xl font-semibold text-gray-900">My DVD Shelf</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search your collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <ProfileDropdown onOpenStats={() => setIsStatsModalOpen(true)} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <SidebarFilters
            filters={filters}
            onFiltersChange={setFilters}
            genreCounts={genreCounts}
            totalCount={stats.total}
            ownedCount={stats.owned}
            wishlistCount={stats.wishlist}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Collection Stats */}
            <CollectionStats
              total={stats.total}
              owned={stats.owned}
              wishlist={stats.wishlist}
            />

            {/* Collection Grid */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Your Collection
                    {filteredDvds.length !== stats.total && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({filteredDvds.length} of {stats.total})
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {filteredDvds.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📀</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery || filters.status.length > 0 || filters.genres.length > 0
                        ? "No DVDs match your filters"
                        : "No DVDs in your collection yet"
                      }
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery || filters.status.length > 0 || filters.genres.length > 0
                        ? "Try adjusting your search or filters"
                        : "Start building your collection by adding your first DVD"
                      }
                    </p>
                    {(!searchQuery && filters.status.length === 0 && filters.genres.length === 0) && (
                      <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First DVD
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-4"
                  }>
                    {filteredDvds.map((dvd) => (
                      <DvdCard
                        key={dvd.id}
                        dvd={dvd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        onClick={() => setIsAddModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add/Edit DVD Modal */}
      <AddDvdModal
        open={isAddModalOpen}
        onOpenChange={handleModalClose}
        editingDvd={editingDvd}
      />

      {/* Stats Modal */}
      <StatsModal
        open={isStatsModalOpen}
        onOpenChange={setIsStatsModalOpen}
        dvds={dvds}
      />
    </div>
  );
}
