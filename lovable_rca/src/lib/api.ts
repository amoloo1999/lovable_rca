import { supabase } from "@/integrations/supabase/client";
import type { Store, RateRecord } from "@/types/rca";

// StorTrack API Functions
export async function searchStoresByAddress(params: {
  state: string;
  city: string;
  zip: string;
  storeName?: string;
  companyName?: string;
}): Promise<Store[]> {
  const { data, error } = await supabase.functions.invoke('stortrack-api', {
    body: {
      action: 'findStoresByAddress',
      params: {
        country: 'United States',
        state: params.state,
        city: params.city,
        zip: params.zip,
        storename: params.storeName || '',
        companyname: params.companyName || '',
      },
    },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);

  return data.data.map((store: any) => ({
    storeId: store.storeid || store.id,
    masterId: store.masterid,
    storeName: store.storename || store.name || '',
    address: store.address || '',
    city: store.city || '',
    state: store.state || '',
    zip: store.zip || '',
    distance: store.distance || 0,
    latitude: store.latitude,
    longitude: store.longitude,
  }));
}

export async function findCompetitors(params: {
  storeId: number;
  radius: number;
}): Promise<{ subject: Store; competitors: Store[] }> {
  const { data, error } = await supabase.functions.invoke('stortrack-api', {
    body: {
      action: 'findCompetitors',
      params: {
        storeid: params.storeId,
        coveragezone: params.radius,
      },
    },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);

  const result = data.data;
  
  // Extract subject store
  const subjectData = result.subjectstore || result;
  const subject: Store = {
    storeId: subjectData.storeid,
    masterId: subjectData.masterid,
    storeName: subjectData.storename || '',
    address: subjectData.address || '',
    city: subjectData.city || '',
    state: subjectData.state || '',
    zip: subjectData.zip || '',
    distance: 0,
  };

  // Extract competitors
  const competitorsData = result.competitorstores || [];
  const competitors: Store[] = competitorsData.map((comp: any) => ({
    storeId: comp.storeid,
    masterId: comp.masterid,
    storeName: comp.storename || '',
    address: comp.address || '',
    city: comp.city || '',
    state: comp.state || '',
    zip: comp.zip || '',
    distance: comp.distance || 0,
  }));

  return { subject, competitors };
}

export async function fetchHistoricalData(params: {
  storeId: number;
  fromDate: string;
  toDate: string;
}): Promise<RateRecord[]> {
  const { data, error } = await supabase.functions.invoke('stortrack-api', {
    body: {
      action: 'fetchHistoricalData',
      params: {
        storeid: params.storeId,
        from: params.fromDate,
        to: params.toDate,
      },
    },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);

  // Transform API response to RateRecord format
  const records: RateRecord[] = [];
  
  for (const storeData of data.data) {
    const rates = storeData.rates || storeData.rateinfo || [];
    for (const rate of rates) {
      records.push({
        storeId: params.storeId,
        storeName: storeData.storename || '',
        address: storeData.address || '',
        city: storeData.city || '',
        state: storeData.state || '',
        zip: storeData.zip || '',
        unitType: rate.spacetype || rate.unittype || '',
        size: rate.size || rate.unitsize || '',
        width: rate.width,
        length: rate.length,
        height: rate.height,
        features: rate.features || '',
        tag: rate.tag || rate.spacetype || '',
        climateControlled: rate.climate_controlled || rate.cc || false,
        humidityControlled: rate.humidity_controlled || false,
        driveUp: rate.drive_up || rate.driveup || false,
        elevator: rate.elevator || false,
        outdoorAccess: rate.outdoor_access || false,
        walkInPrice: rate.regular_rate || rate.regularrate || rate.rate,
        onlinePrice: rate.online_rate || rate.onlinerate,
        date: rate.date_collected || rate.datecollected || rate.date || '',
        promo: rate.promo || rate.promotion || '',
        source: 'API' as const,
      });
    }
  }

  return records;
}

// WWG MCP Server Functions

// Check if MCP server is healthy
export async function checkMCPHealth(): Promise<{ healthy: boolean; status: number }> {
  const { data, error } = await supabase.functions.invoke('database-query', {
    body: { action: 'healthCheck', params: {} },
  });

  if (error) throw error;
  return data.data;
}

// Get available databases from MCP server
export async function getMCPDatabases(): Promise<any[]> {
  const { data, error } = await supabase.functions.invoke('database-query', {
    body: { action: 'getDatabases', params: {} },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// Get sites with optional state/city filtering
export async function getMCPSites(params?: { state?: string; city?: string }): Promise<any[]> {
  const { data, error } = await supabase.functions.invoke('database-query', {
    body: { action: 'getSites', params: params || {} },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// Query Stortrack data via MCP server
export async function queryStortrackData(endpoint: string, queryParams?: Record<string, string>): Promise<any> {
  const { data, error } = await supabase.functions.invoke('database-query', {
    body: { action: 'getStortrackData', params: { endpoint, queryParams } },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// Generic database query via MCP
export async function queryMCPDatabase(database: string, table: string, queryParams?: Record<string, string>): Promise<any> {
  const { data, error } = await supabase.functions.invoke('database-query', {
    body: { action: 'queryDatabase', params: { database, table, queryParams } },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// Legacy functions - now routed through MCP server
export async function getTrailing12MonthRates(params: {
  storeIds: number[];
  fromDate?: string;
  toDate?: string;
}): Promise<{ ratesByStore: Record<number, RateRecord[]>; datesByStore: Record<number, string[]> }> {
  const { data, error } = await supabase.functions.invoke('database-query', {
    body: { action: 'getTrailing12MonthRates', params },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function getSalesforceMatches(params: {
  storeName: string;
  streetAddress: string;
  topN?: number;
}): Promise<Array<{
  salesforceName: string;
  parsedStoreName: string;
  parsedAddress: string;
  squareFootage: number | null;
  yearBuilt: number | null;
  combinedScore: number;
}>> {
  const { data, error } = await supabase.functions.invoke('database-query', {
    body: { action: 'getSalesforceMatches', params },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function getStoreInfo(storeIds: number[]): Promise<Record<number, {
  storeId: number;
  storeName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}>> {
  const { data, error } = await supabase.functions.invoke('database-query', {
    body: { action: 'getStoreInfo', params: { storeIds } },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error);
  return data.data;
}
