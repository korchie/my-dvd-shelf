import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Calendar, Star } from "lucide-react";
import type { Dvd } from "@shared/schema";

interface StatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dvds: Dvd[];
}

export function StatsModal({ open, onOpenChange, dvds }: StatsModalProps) {
  const stats = useMemo(() => {
    const total = dvds.length;
    const owned = dvds.filter(dvd => dvd.status === "owned").length;
    const wishlist = dvds.filter(dvd => dvd.status === "wishlist").length;
    
    // Genre analysis
    const genreCount: Record<string, number> = {};
    dvds.forEach(dvd => {
      if (dvd.genre) {
        const genres = dvd.genre.split(", ");
        genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });
    
    const topGenres = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    // Director analysis
    const directorCount: Record<string, number> = {};
    dvds.forEach(dvd => {
      if (dvd.director) {
        directorCount[dvd.director] = (directorCount[dvd.director] || 0) + 1;
      }
    });
    
    const topDirectors = Object.entries(directorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    // Year analysis
    const years = dvds.filter(dvd => dvd.year).map(dvd => dvd.year!);
    const oldestYear = years.length > 0 ? Math.min(...years) : null;
    const newestYear = years.length > 0 ? Math.max(...years) : null;
    const avgYear = years.length > 0 ? Math.round(years.reduce((a, b) => a + b, 0) / years.length) : null;
    
    return {
      total,
      owned,
      wishlist,
      topGenres,
      topDirectors,
      oldestYear,
      newestYear,
      avgYear,
      completionRate: total > 0 ? Math.round((owned / total) * 100) : 0
    };
  }, [dvds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Collection Statistics
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overview Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collection Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Total DVDs:</span>
                <Badge variant="outline">{stats.total}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Owned:</span>
                <Badge className="bg-green-100 text-green-800">{stats.owned}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Wishlist:</span>
                <Badge className="bg-orange-100 text-orange-800">{stats.wishlist}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Completion Rate:</span>
                <Badge variant="secondary">{stats.completionRate}%</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Year Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Year Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Oldest Movie:</span>
                <Badge variant="outline">{stats.oldestYear || "N/A"}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Newest Movie:</span>
                <Badge variant="outline">{stats.newestYear || "N/A"}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Average Year:</span>
                <Badge variant="secondary">{stats.avgYear || "N/A"}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Top Genres */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-4 w-4" />
                Top Genres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topGenres.length > 0 ? stats.topGenres.map(([genre, count]) => (
                  <div key={genre} className="flex justify-between items-center">
                    <span className="text-sm">{genre}</span>
                    <Badge variant="outline" className="text-xs">
                      {count} movie{count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No genre data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Directors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top Directors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topDirectors.length > 0 ? stats.topDirectors.map(([director, count]) => (
                  <div key={director} className="flex justify-between items-center">
                    <span className="text-sm truncate">{director}</span>
                    <Badge variant="outline" className="text-xs">
                      {count} movie{count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No director data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}