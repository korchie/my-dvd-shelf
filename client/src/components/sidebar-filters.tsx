import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface FilterState {
  status: string[];
  genres: string[];
  yearRange: number[];
}

interface SidebarFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  genreCounts: Record<string, number>;
  totalCount: number;
  ownedCount: number;
  wishlistCount: number;
}

export function SidebarFilters({
  filters,
  onFiltersChange,
  genreCounts,
  totalCount,
  ownedCount,
  wishlistCount,
}: SidebarFiltersProps) {
  const [showAllGenres, setShowAllGenres] = useState(false);

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleGenreChange = (genre: string, checked: boolean) => {
    const newGenres = checked
      ? [...filters.genres, genre]
      : filters.genres.filter(g => g !== genre);
    onFiltersChange({ ...filters, genres: newGenres });
  };

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, showAllGenres ? undefined : 5);

  return (
    <div className="lg:w-64 flex-shrink-0">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
          
          {/* Status Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-items"
                    checked={filters.status.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFiltersChange({ ...filters, status: [] });
                      }
                    }}
                  />
                  <label htmlFor="all-items" className="text-sm">All Items</label>
                </div>
                <span className="text-xs text-gray-500">{totalCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="owned"
                    checked={filters.status.includes("owned")}
                    onCheckedChange={(checked) => handleStatusChange("owned", !!checked)}
                  />
                  <label htmlFor="owned" className="text-sm">Owned</label>
                </div>
                <span className="text-xs text-gray-500">{ownedCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wishlist"
                    checked={filters.status.includes("wishlist")}
                    onCheckedChange={(checked) => handleStatusChange("wishlist", !!checked)}
                  />
                  <label htmlFor="wishlist" className="text-sm">Wishlist</label>
                </div>
                <span className="text-xs text-gray-500">{wishlistCount}</span>
              </div>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Genre</h4>
            <div className="space-y-2">
              {topGenres.map(([genre, count]) => (
                <div key={genre} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre}`}
                      checked={filters.genres.includes(genre)}
                      onCheckedChange={(checked) => handleGenreChange(genre, !!checked)}
                    />
                    <label htmlFor={`genre-${genre}`} className="text-sm">{genre}</label>
                  </div>
                  <span className="text-xs text-gray-500">{count}</span>
                </div>
              ))}
            </div>
            {Object.keys(genreCounts).length > 5 && (
              <button
                className="text-primary text-sm mt-2 hover:underline"
                onClick={() => setShowAllGenres(!showAllGenres)}
              >
                {showAllGenres ? "Show less genres" : "Show more genres"}
              </button>
            )}
          </div>

          {/* Year Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Release Year</h4>
            <div className="space-y-3">
              <Slider
                value={filters.yearRange}
                onValueChange={(value) => onFiltersChange({ ...filters, yearRange: value })}
                max={2024}
                min={1950}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{filters.yearRange[0] || 1950}</span>
                <span>{filters.yearRange[1] || 2024}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
