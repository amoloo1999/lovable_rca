import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WWG MCP Server REST API
const MCP_BASE_URL = 'https://mcp.wwgmcpserver.com';
const MCP_API_KEY = Deno.env.get('WWG_MCP_API_KEY') || '';

async function mcpRequest(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${MCP_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }

  console.log(`MCP Request: ${url.toString()}`);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${MCP_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`MCP API Error: ${response.status} - ${errorText}`);
    throw new Error(`MCP API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Health check for the MCP server
async function healthCheck() {
  const response = await fetch(`${MCP_BASE_URL}/health`);
  return { healthy: response.ok, status: response.status };
}

// Get list of available databases
async function getDatabases() {
  return await mcpRequest('/databases');
}

// Get sites with optional filtering
async function getSites(params?: { state?: string; city?: string }) {
  return await mcpRequest('/sites', params as Record<string, string>);
}

// Get Stortrack data - these endpoints may vary based on your MCP server setup
async function getStortrackData(endpoint: string, params?: Record<string, string>) {
  // Stortrack endpoints might be under a specific path
  return await mcpRequest(`/stortrack${endpoint}`, params);
}

// Query a specific database/table
async function queryDatabase(database: string, table: string, params?: Record<string, string>) {
  return await mcpRequest(`/${database}/${table}`, params);
}

// Get analytics data (ECRI, etc.)
async function getAnalytics(type: string) {
  return await mcpRequest(`/analytics/${type}`);
}

// Get StorEDGE live data
async function getStorEdgeData(endpoint: string, params?: Record<string, string>) {
  return await mcpRequest(`/storedge/${endpoint}`, params);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    console.log(`Database query action: ${action}`, params);

    let result;

    switch (action) {
      case 'healthCheck':
        result = await healthCheck();
        break;
      
      case 'getDatabases':
        result = await getDatabases();
        break;
      
      case 'getSites':
        result = await getSites(params);
        break;
      
      case 'getStortrackData':
        result = await getStortrackData(params.endpoint, params.queryParams);
        break;
      
      case 'queryDatabase':
        result = await queryDatabase(params.database, params.table, params.queryParams);
        break;
      
      case 'getAnalytics':
        result = await getAnalytics(params.type);
        break;
      
      case 'getStorEdgeData':
        result = await getStorEdgeData(params.endpoint, params.queryParams);
        break;

      // Legacy actions mapped to new API
      case 'getTrailing12MonthRates':
        // Map to appropriate Stortrack endpoint
        result = await getStortrackData('/rates', {
          storeIds: params.storeIds?.join(','),
          fromDate: params.fromDate,
          toDate: params.toDate,
        });
        break;
      
      case 'getStoreInfo':
        result = await getStortrackData('/stores', {
          storeIds: params.storeIds?.join(','),
        });
        break;
      
      case 'getSalesforceMatches':
        result = await mcpRequest('/salesforce/matches', {
          storeName: params.storeName,
          streetAddress: params.streetAddress,
          topN: params.topN?.toString(),
        });
        break;
      
      case 'getLatestRates':
        result = await getStortrackData('/rates/latest', {
          storeIds: params.storeIds?.join(','),
          daysBack: params.daysBack?.toString(),
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Database query error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
