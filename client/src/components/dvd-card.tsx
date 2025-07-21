import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Dvd } from "@shared/schema";

interface DvdCardProps {
  dvd: Dvd;
  onEdit: (dvd: Dvd) => void;
  onDelete: (id: number) => void;
}

export function DvdCard({ dvd, onEdit, onDelete }: DvdCardProps) {
  const statusVariant = dvd.status === "owned" ? "default" : "secondary";
  const statusClass = dvd.status === "owned" 
    ? "bg-green-100 text-green-800 hover:bg-green-200" 
    : "bg-orange-100 text-orange-800 hover:bg-orange-200";

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-4">
        {/* Movie poster placeholder */}
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-3 overflow-hidden">
          {dvd.posterUrl ? (
            <img 
              src={dvd.posterUrl} 
              alt={`${dvd.title} poster`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyAxMDBIMTEzVjEyNkg4N1YxMDBaIiBmaWxsPSIjOUM5QzlDIi8+CjxwYXRoIGQ9Ik04NyAxNDBIMTEzVjE0Nkg4N1YxNDBaIiBmaWxsPSIjOUM5QzlDIi8+CjxwYXRoIGQ9Ik04NyAxNTRIMTEzVjIwMEg4N1YxNTRaIiBmaWxsPSIjOUM5QzlDIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3Mjc5IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
              <div className="text-center">
                <div className="text-2xl mb-2">🎬</div>
                <div className="text-sm">No Image</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 truncate" title={dvd.title}>
              {dvd.title}
            </h3>
            <Badge className={statusClass}>
              {dvd.status === "owned" ? "Owned" : "Wishlist"}
            </Badge>
          </div>
          
          {dvd.year && (
            <p className="text-sm text-gray-600">{dvd.year}</p>
          )}
          
          {dvd.genre && (
            <p className="text-sm text-gray-500">{dvd.genre}</p>
          )}
          
          {dvd.director && (
            <p className="text-sm text-gray-500">{dvd.director}</p>
          )}
          
          <div className="flex justify-end space-x-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(dvd)}
              className="text-gray-400 hover:text-primary"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(dvd.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
