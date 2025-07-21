import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDvdSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all DVDs
  app.get("/api/dvds", async (req, res) => {
    try {
      const { search, status, genre, year } = req.query;
      
      let dvds;
      if (search) {
        dvds = await storage.searchDvds(search as string);
      } else if (status || genre || year) {
        dvds = await storage.filterDvds({
          status: status as string,
          genre: genre as string,
          year: year ? parseInt(year as string) : undefined,
        });
      } else {
        dvds = await storage.getAllDvds();
      }
      
      res.json(dvds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch DVDs" });
    }
  });

  // Get single DVD
  app.get("/api/dvds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dvd = await storage.getDvd(id);
      
      if (!dvd) {
        return res.status(404).json({ message: "DVD not found" });
      }
      
      res.json(dvd);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch DVD" });
    }
  });

  // Create new DVD
  app.post("/api/dvds", async (req, res) => {
    try {
      const validation = insertDvdSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid DVD data", 
          errors: validation.error.errors 
        });
      }
      
      const dvd = await storage.createDvd(validation.data);
      res.status(201).json(dvd);
    } catch (error) {
      res.status(500).json({ message: "Failed to create DVD" });
    }
  });

  // Update DVD
  app.patch("/api/dvds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertDvdSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid DVD data", 
          errors: validation.error.errors 
        });
      }
      
      const dvd = await storage.updateDvd(id, validation.data);
      if (!dvd) {
        return res.status(404).json({ message: "DVD not found" });
      }
      
      res.json(dvd);
    } catch (error) {
      res.status(500).json({ message: "Failed to update DVD" });
    }
  });

  // Delete DVD
  app.delete("/api/dvds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDvd(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "DVD not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete DVD" });
    }
  });

  // Lookup movie by barcode/title using OMDB API
  app.post("/api/lookup", async (req, res) => {
    try {
      const { title, barcode } = req.body;
      
      if (!title && !barcode) {
        return res.status(400).json({ message: "Title or barcode required" });
      }
      
      const apiKey = process.env.OMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "OMDB API key not configured" });
      }
      
      // Test the API key first
      const testUrl = `http://www.omdbapi.com/?t=test&apikey=${apiKey}`;
      const testResponse = await fetch(testUrl);
      const testData = await testResponse.json();
      
      if (testData.Error === "Invalid API key!") {
        return res.status(401).json({ 
          message: "Invalid OMDB API key. Please check your API key at http://www.omdbapi.com/apikey.aspx",
          error: "API_KEY_INVALID"
        });
      }
      
      const searchTerm = title || barcode;
      let url = `http://www.omdbapi.com/?apikey=${apiKey}`;
      
      // If it looks like a barcode (numeric), search by IMDb ID or title
      if (/^\d+$/.test(searchTerm)) {
        // For barcode, try searching by title first, then fallback to search
        url += `&s=${encodeURIComponent(searchTerm)}`;
      } else {
        // For title search
        url += `&t=${encodeURIComponent(searchTerm)}`;
      }
      
      console.log(`Looking up movie: ${searchTerm} with URL: ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`OMDB response:`, data);
      
      if (data.Response === "False") {
        return res.status(404).json({ 
          message: data.Error || "Movie not found",
          searchTerm 
        });
      }
      
      let movieData;
      
      // Handle search results (when using 's' parameter)
      if (data.Search && Array.isArray(data.Search)) {
        // Take the first result from search
        const firstResult = data.Search[0];
        if (!firstResult) {
          return res.status(404).json({ 
            message: "No movies found in search results",
            searchTerm 
          });
        }
        
        // Get detailed info for the first result
        const detailUrl = `http://www.omdbapi.com/?i=${firstResult.imdbID}&apikey=${apiKey}`;
        const detailResponse = await fetch(detailUrl);
        const detailData = await detailResponse.json();
        
        if (detailData.Response === "False") {
          return res.status(404).json({ 
            message: "Movie details not found",
            searchTerm 
          });
        }
        
        movieData = {
          title: detailData.Title,
          year: parseInt(detailData.Year),
          genre: detailData.Genre,
          director: detailData.Director,
          posterUrl: detailData.Poster !== "N/A" ? detailData.Poster : null,
          barcode: barcode || null,
        };
      } else {
        // Handle direct movie result (when using 't' parameter)
        movieData = {
          title: data.Title,
          year: parseInt(data.Year),
          genre: data.Genre,
          director: data.Director,
          posterUrl: data.Poster !== "N/A" ? data.Poster : null,
          barcode: barcode || null,
        };
      }
      
      console.log(`Movie data found:`, movieData);
      res.json(movieData);
    } catch (error) {
      console.error("Movie lookup error:", error);
      res.status(500).json({ message: "Failed to lookup movie data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
