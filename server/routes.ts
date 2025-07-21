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
      
      const apiKey = process.env.OMDB_API_KEY || process.env.VITE_OMDB_API_KEY || "demo_key";
      const searchTerm = title || barcode;
      
      const response = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(searchTerm)}&apikey=${apiKey}`);
      const data = await response.json();
      
      if (data.Response === "False") {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      const movieData = {
        title: data.Title,
        year: parseInt(data.Year),
        genre: data.Genre,
        director: data.Director,
        posterUrl: data.Poster !== "N/A" ? data.Poster : null,
      };
      
      res.json(movieData);
    } catch (error) {
      res.status(500).json({ message: "Failed to lookup movie data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
