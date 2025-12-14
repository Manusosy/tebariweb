import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCollectionSchema, insertHotspotSchema, insertItemSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure Multer storage
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication middleware and routes
  setupAuth(app);

  // Serve uploaded files statically
  app.use("/uploads", express.static(uploadDir));

  // Hotspots API
  app.get("/api/hotspots", async (req, res) => {
    // Optional: Check auth if needed, currently public for field officers?
    // if (!req.isAuthenticated()) return res.sendStatus(401);
    const hotspots = await storage.getHotspots();
    res.json(hotspots);
  });

  app.post("/api/hotspots", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const parsed = insertHotspotSchema.parse(req.body);
      const hotspot = await storage.createHotspot(parsed);
      res.status(201).json(hotspot);
    } catch (e) {
      res.status(400).json(e);
    }
  });

  app.patch("/api/hotspots/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;

    // Only admin/Super Admin can update hotspots
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.sendStatus(403);
    }

    const hotspotId = parseInt(req.params.id);
    const updates = req.body;

    try {
      const updated = await storage.updateHotspot(hotspotId, updates);
      res.json(updated);
    } catch (e) {
      console.error("Update hotspot error:", e);
      res.status(500).send("Failed to update hotspot");
    }
  });

  app.delete("/api/hotspots/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;

    // Only admin/Super Admin can delete hotspots
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.sendStatus(403);
    }

    const hotspotId = parseInt(req.params.id);

    try {
      await storage.deleteHotspot(hotspotId);
      res.sendStatus(204);
    } catch (e) {
      console.error("Delete hotspot error:", e);
      res.status(500).send("Failed to delete hotspot");
    }
  });

  // Collections API
  app.get("/api/collections", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Explicitly cast req.user to our User type from schema
    // In a real app we'd augment Express.User
    const user = req.user as any;

    const userId = user.role === 'field_officer' ? user.id : undefined;
    // Admins see all, field officers see theirs? 
    // Logic: If admin/super_admin/partner, see all (or filtered). If field_officer, see own?
    // For now, let's allow admins to see all, field officers to see own.

    // Actually, partner might want to see all too using userId filter
    const collections = await storage.getCollections(userId);
    res.json(collections);
  });

  app.post("/api/collections", upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const user = req.user as any;

    try {
      // When using FormData, basic types come as strings
      // items will be a JSON string
      const itemsRaw = req.body.items ? JSON.parse(req.body.items) : [];

      // Parse other fields safely
      const collectionBody = {
        ...req.body,
        hotspotId: req.body.hotspotId ? Number(req.body.hotspotId) : null,
        isNewHotspot: req.body.isNewHotspot === 'true',
        // Add image URL if file exists
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
      };

      // Allow schema to validate/coerce
      const { items, ...collectionData } = { ...collectionBody, items: itemsRaw };

      const parsedCollection = insertCollectionSchema.parse({
        ...collectionData,
        userId: user.id, // Ensure user ID is from session
      });

      // Validate items array
      if (!Array.isArray(itemsRaw)) {
        return res.status(400).send("Items must be an array");
      }

      // We accept raw items, needs validation loop or schema array
      const parsedItems = itemsRaw.map((i: any) => insertItemSchema.parse(i));

      const collection = await storage.createCollection(parsedCollection, parsedItems);
      res.status(201).json(collection);
    } catch (e) {
      console.error("Collection submission error:", e);
      res.status(400).json(e);
    }
  });

  app.delete("/api/collections/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const user = req.user as any;
    const collectionId = parseInt(req.params.id);

    try {
      const allMyCollections = await storage.getCollections(user.role === 'field_officer' ? user.id : undefined);
      const collection = allMyCollections.find(c => c.id === collectionId);

      if (!collection) {
        return res.status(404).send("Collection not found or unauthorized");
      }

      // Check ownership/permissions
      if (user.role === 'field_officer') {
        if (collection.userId !== user.id) {
          return res.sendStatus(403);
        }
        if (collection.status !== 'pending') {
          return res.status(403).send("Cannot delete processed submissions");
        }
      }

      await storage.deleteCollection(collectionId);
      res.sendStatus(204);
    } catch (e) {
      console.error("Delete error:", e);
      res.status(500).send("Failed to delete");
    }
  });

  app.patch("/api/collections/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;

    // Only admin/Super Admin can update status
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.sendStatus(403);
    }

    const collectionId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).send("Invalid status");
    }

    try {
      const updated = await storage.updateCollectionStatus(collectionId, status);
      res.json(updated);
    } catch (e) {
      console.error("Update status error:", e);
      res.status(500).send("Failed to update status");
    }
  });

  // Users API
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;

    // Only admin/Super Admin can list users
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.sendStatus(403);
    }

    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.sendStatus(403);
    }

    const targetUserId = parseInt(req.params.id);
    const updates = req.body;

    try {
      const updatedUser = await storage.updateUser(targetUserId, updates);
      res.json(updatedUser);
    } catch (e) {
      console.error("Update user error:", e);
      res.status(500).send("Failed to update user");
    }
  });

  return httpServer;
}

