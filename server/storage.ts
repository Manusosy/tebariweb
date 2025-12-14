import { type User, type InsertUser, type Hotspot, type InsertHotspot, type Collection, type InsertCollection, type CollectionItem, type InsertItem } from "@shared/schema";
import { supabase } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<(User & { assignedHotspot: Hotspot | null })[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  getHotspots(): Promise<Hotspot[]>;
  createHotspot(hotspot: InsertHotspot): Promise<Hotspot>;
  updateHotspot(id: number, updates: Partial<Hotspot>): Promise<Hotspot>;
  deleteHotspot(id: number): Promise<void>;

  getCollections(userId?: number): Promise<(Collection & { items: CollectionItem[], hotspot: Hotspot | null })[]>;
  createCollection(collection: InsertCollection, items: InsertItem[]): Promise<Collection>;
  updateCollectionStatus(id: number, status: string): Promise<Collection>;
  deleteCollection(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert(insertUser)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as User;
  }

  async getHotspots(): Promise<Hotspot[]> {
    const { data, error } = await supabase.from("hotspots").select("*");
    if (error) throw new Error(error.message);
    return (data || []) as Hotspot[];
  }

  async createHotspot(hotspot: InsertHotspot): Promise<Hotspot> {
    const { data, error } = await supabase
      .from("hotspots")
      .insert(hotspot)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Hotspot;
  }

  async updateHotspot(id: number, updates: Partial<Hotspot>): Promise<Hotspot> {
    // Map camelCase to snake_case for database columns
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.estimatedVolume !== undefined) dbUpdates.estimated_volume = updates.estimatedVolume;
    if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude;
    if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude;

    const { data, error } = await supabase
      .from("hotspots")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      status: data.status,
      estimatedVolume: data.estimated_volume,
      createdAt: data.created_at ? new Date(data.created_at) : null
    };
  }

  async deleteHotspot(id: number): Promise<void> {
    const { error } = await supabase.from("hotspots").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getCollections(userId?: number): Promise<(Collection & { items: CollectionItem[], hotspot: Hotspot | null })[]> {
    let query = supabase
      .from("collections")
      .select("*, items:collection_items(*), hotspot:hotspots(*)")
      .order("collected_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    // Map Supabase response to domain types
    return (data || []).map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      hotspotId: c.hotspot_id,
      isNewHotspot: c.is_new_hotspot,
      newHotspotName: c.new_hotspot_name,
      gpsLatitude: c.gps_latitude,
      gpsLongitude: c.gps_longitude,
      status: c.status,
      notes: c.notes,
      imageUrl: c.image_url,
      collectedAt: c.collected_at ? new Date(c.collected_at) : null,

      items: (c.items || []).map((i: any) => ({
        id: i.id,
        collectionId: i.collection_id,
        materialType: i.material_type,
        weight: i.weight
      })),
      hotspot: c.hotspot ? {
        id: c.hotspot.id,
        name: c.hotspot.name,
        description: c.hotspot.description,
        latitude: c.hotspot.latitude,
        longitude: c.hotspot.longitude,
        status: c.hotspot.status,
        estimatedVolume: c.hotspot.estimated_volume,
        createdAt: c.hotspot.created_at ? new Date(c.hotspot.created_at) : null
      } : null
    }));
  }

  async createCollection(collection: InsertCollection, items: InsertItem[]): Promise<Collection> {
    const collectionPayload = {
      user_id: collection.userId,
      hotspot_id: collection.hotspotId,
      is_new_hotspot: collection.isNewHotspot,
      new_hotspot_name: collection.newHotspotName,
      gps_latitude: collection.gpsLatitude?.toString(),
      gps_longitude: collection.gpsLongitude?.toString(),
      status: 'pending',
      notes: collection.notes,
      image_url: collection.imageUrl
    };

    const { data: newCollection, error: colError } = await supabase
      .from("collections")
      .insert(collectionPayload)
      .select()
      .single();

    if (colError) throw new Error(colError.message);

    if (items.length > 0) {
      const itemsPayload = items.map(item => ({
        collection_id: newCollection.id,
        material_type: item.materialType,
        weight: item.weight
      }));

      const { error: itemsError } = await supabase
        .from("collection_items")
        .insert(itemsPayload);

      if (itemsError) throw new Error(itemsError.message);
    }

    return {
      id: newCollection.id,
      userId: newCollection.user_id,
      hotspotId: newCollection.hotspot_id,
      isNewHotspot: newCollection.is_new_hotspot,
      newHotspotName: newCollection.new_hotspot_name,
      gpsLatitude: newCollection.gps_latitude,
      gpsLongitude: newCollection.gps_longitude,
      status: newCollection.status,
      notes: newCollection.notes,
      imageUrl: newCollection.image_url,
      collectedAt: newCollection.collected_at ? new Date(newCollection.collected_at) : null
    };
  }

  async deleteCollection(id: number): Promise<void> {
    // Rely on cascade or delete explicitly
    // Delete items first if no cascade (Supabase generated SQL didn't specify ON DELETE CASCADE explicitly in my output, but usually safer to delete items)
    await supabase.from("collection_items").delete().eq("collection_id", id);
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async updateCollectionStatus(id: number, status: string): Promise<Collection> {
    const { data: updated, error } = await supabase
      .from("collections")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If verified and isNewHotspot, we might want to auto-create a hotspot?
    // User requirement said "areas where submissions have been done to be marked as hotspots".
    // For now status update is enough.

    return {
      id: updated.id,
      userId: updated.user_id,
      hotspotId: updated.hotspot_id,
      isNewHotspot: updated.is_new_hotspot,
      newHotspotName: updated.new_hotspot_name,
      gpsLatitude: updated.gps_latitude,
      gpsLongitude: updated.gps_longitude,
      status: updated.status,
      notes: updated.notes,
      imageUrl: updated.image_url,
      collectedAt: updated.collected_at ? new Date(updated.collected_at) : null
    };
  }

  async getUsers(): Promise<(User & { assignedHotspot: Hotspot | null })[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*, assignedHotspot:hotspots(*)")
      .order("id");

    if (error) throw new Error(error.message);

    return (data || []).map((u: any) => ({
      id: u.id,
      username: u.username,
      password: u.password,
      role: u.role,
      name: u.name,
      email: u.email,
      organization: u.organization,
      status: u.status,
      assignedHotspotId: u.assigned_hotspot_id,
      assignedHotspot: u.assignedHotspot ? {
        id: u.assignedHotspot.id,
        name: u.assignedHotspot.name,
        description: u.assignedHotspot.description,
        latitude: u.assignedHotspot.latitude,
        longitude: u.assignedHotspot.longitude,
        status: u.assignedHotspot.status,
        estimatedVolume: u.assignedHotspot.estimated_volume,
        createdAt: u.assignedHotspot.created_at ? new Date(u.assignedHotspot.created_at) : null
      } : null
    }));
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    // Map camelCase updates to snake_case db columns
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.assignedHotspotId !== undefined) dbUpdates.assigned_hotspot_id = updates.assignedHotspotId;
    // Add other fields if editable

    const { data, error } = await supabase
      .from("users")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      username: data.username,
      password: data.password,
      role: data.role,
      name: data.name,
      email: data.email,
      organization: data.organization,
      status: data.status,
      assignedHotspotId: data.assigned_hotspot_id
    };
  }
}

export const storage = new DatabaseStorage();
