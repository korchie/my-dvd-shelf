import { Card, CardContent } from "@/components/ui/card";
import { Disc, CheckCircle, Heart } from "lucide-react";

interface CollectionStatsProps {
  total: number;
  owned: number;
  wishlist: number;
}

export function CollectionStats({ total, owned, wishlist }: CollectionStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Disc className="text-primary text-xl" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{total}</h3>
              <p className="text-sm text-gray-600">Total DVDs</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{owned}</h3>
              <p className="text-sm text-gray-600">Owned</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Heart className="text-orange-600 text-xl" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{wishlist}</h3>
              <p className="text-sm text-gray-600">Wishlist</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
