import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disc3, Search, Camera, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Disc3 className="h-16 w-16 text-purple-400 mr-4" />
            <h1 className="text-5xl font-bold text-white">DVD Collection Manager</h1>
          </div>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Organize your DVD collection with ease. Scan barcodes, track your movies, and manage your wishlist all in one place.
          </p>
          <Button 
            size="lg" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Sign in with Google
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader className="text-center">
              <Camera className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <CardTitle>Barcode Scanning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Quickly add DVDs to your collection by scanning barcodes with your camera
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader className="text-center">
              <Search className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <CardTitle>Movie Database</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Automatic movie data lookup with posters, directors, genres, and release years
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader className="text-center">
              <Disc3 className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <CardTitle>Collection Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Track owned DVDs and maintain a wishlist of movies you want to buy
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                View detailed statistics about your collection including genre breakdown and director analysis
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sign In</h3>
              <p className="text-slate-300">Sign in with your Google account to get started</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Add Movies</h3>
              <p className="text-slate-300">Scan barcodes or search by title to add DVDs to your collection</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Organize</h3>
              <p className="text-slate-300">Track what you own and maintain a wishlist of movies to buy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}