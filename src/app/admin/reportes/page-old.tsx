"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveFunnel } from "@nivo/funnel";
import { 
  getVisitorsByCountry, 
  getVisitorsByBrowser, 
  getVisitorsByReferrer, 
  getVisitorsByDevice,
  transformForNivoPie,
  transformForNivoBar 
} from "../../../utils/vercelAnalytics";

// Helper to map color name to image URL for fabric
const getFabricImageUrl = (color: string) => {
  // Convert color name to match file naming convention
  const fileName = color.trim().replace(/\s+/g, '_').toUpperCase();
  const imageUrl = `/fabric/${fileName}.png`;
  console.log('Fabric URL for "' + color + '" -> "' + fileName + '" :', imageUrl);
  return imageUrl;
};
// Helper to map color name to image URL for estructura
const getFrameImageUrl = (color: string) => {
  // Convert color name to match file naming convention
  const fileName = color.trim().replace(/\s+/g, '_').toUpperCase();
  const imageUrl = `/estructura/${fileName}.png`;
  console.log('Frame URL for "' + color + '" -> "' + fileName + '" :', imageUrl);
  return imageUrl;
};

export default function ReportesPage() {
  // Date range state
  const [dateRange, setDateRange] = useState<'7D' | '1MO' | '3MO' | '12MO' | '24MO'>('1MO');
  
  // Helper function to get date range
  const getDateRangeFilter = (range: '7D' | '1MO' | '3MO' | '12MO' | '24MO') => {
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7D':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1MO':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3MO':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '12MO':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '24MO':
        startDate.setFullYear(now.getFullYear() - 2);
        break;
    }
    
    return startDate.toISOString();
  };
  
  // Top 10 Most Favorited Products
  const [favoriteData, setFavoriteData] = useState<Array<{ product_name: string; favorite_count: number }>>([]);
  // Most Chosen Fabric Colors
  const [fabricColorData, setFabricColorData] = useState<Array<{ color: string; count: number }>>([]);
  // Most Chosen Frame Colors
  const [frameColorData, setFrameColorData] = useState<Array<{ color: string; count: number }>>([]);
  // Product Views Over Time
  const [viewsData, setViewsData] = useState<any[]>([]);
  // Vercel Analytics Data
  const [countryData, setCountryData] = useState<any[]>([]);
  const [browserData, setBrowserData] = useState<any[]>([]);
  const [referrerData, setReferrerData] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  // Customer Journey Funnel
  const [funnelData, setFunnelData] = useState<any[]>([]);
  // Live Metrics
  const [liveMetrics, setLiveMetrics] = useState({ visitors: 0 });
  
  // Modal state for enlarged chart view
  const [enlargedChart, setEnlargedChart] = useState<{
    type: 'bar' | 'pie' | 'line' | 'funnel';
    title: string;
    data: any;
    config?: any;
  } | null>(null);

  // Common theme for all charts with dark brown tooltips
  const chartTheme = {
    tooltip: {
      container: {
        background: '#ffffff',
        color: '#4B2E09',
        fontSize: '14px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }
    },
    labels: { text: { fill: "#4B2E09" } },
    axis: { ticks: { text: { fill: "#4B2E09" } } }
  };

  useEffect(() => {
    console.log('Starting data fetch...');
    
    // Load customer favorites data from API (uses admin client server-side)
    const startDate = getDateRangeFilter(dateRange);
    const apiUrl = `/api/admin/customer-data?startDate=${encodeURIComponent(startDate)}`;
    
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        console.log('Admin API response:', data);
        
        if (data.error) {
          console.error('API Error:', data.error);
          // Set fallback data
          setFavoriteData([
            { product_name: 'No data (API Error)', favorite_count: 0 }
          ]);
          setFabricColorData([]);
          setFrameColorData([]);
        } else {
          console.log('✅ Successfully loaded customer data from API');
          setFavoriteData(data.favoriteProducts || []);
          setFabricColorData(data.fabricColors || []);
          setFrameColorData(data.frameColors || []);
        }
      })
      .catch(error => {
        console.error('❌ Failed to fetch customer data:', error);
        setFavoriteData([
          { product_name: 'Error Loading Data', favorite_count: 0 }
        ]);
        setFabricColorData([]);
        setFrameColorData([]);
      });
    
    
    // TODO: Fix Vercel Analytics API endpoints (currently returning 404)
    // Load Vercel Analytics data
    /*
    Promise.all([
      getVisitorsByCountry(),
      getVisitorsByBrowser(), 
      getVisitorsByReferrer(),
      getVisitorsByDevice()
    ]).then(([countries, browsers, referrers, devices]) => {
      console.log('Vercel Analytics Data:', { countries, browsers, referrers, devices });
      
      if (countries?.data) {
        setCountryData(transformForNivoPie(countries.data, 'visits', 'country'));
      }
      if (browsers?.data) {
        setBrowserData(transformForNivoPie(browsers.data, 'visits', 'browser'));
      }
      if (referrers?.data) {
        setReferrerData(transformForNivoPie(referrers.data, 'visits', 'referrer'));
      }
      if (devices?.data) {
        setDeviceData(transformForNivoPie(devices.data, 'visits', 'device'));
      }
    }).catch(error => {
      console.error('Error loading Vercel Analytics:', error);
      // Set mock data if API fails
      setCountryData([
        { id: 'Mexico', value: 150 },
        { id: 'USA', value: 89 },
        { id: 'Spain', value: 45 }
      ]);
      setBrowserData([
        { id: 'Chrome', value: 180 },
        { id: 'Safari', value: 65 },
        { id: 'Firefox', value: 35 }
      ]);
    });
    */
    
    // Set mock data for now
    setCountryData([
      { id: 'Mexico', value: 150 },
      { id: 'USA', value: 89 },
      { id: 'Spain', value: 45 }
    ]);
    setBrowserData([
      { id: 'Chrome', value: 180 },
      { id: 'Safari', value: 65 },
      { id: 'Firefox', value: 35 }
    ]);
    setReferrerData([
      { id: 'Direct', value: 120 },
      { id: 'Google', value: 80 },
      { id: 'Social', value: 45 }
    ]);
    setDeviceData([
      { id: 'Mobile', value: 180 },
      { id: 'Desktop', value: 120 },
      { id: 'Tablet', value: 25 }
    ]);
    
    supabase
      .rpc("get_product_views_over_time")
      .then((res) => setViewsData(res.data ?? []));    
    supabase
      .rpc("get_customer_journey_funnel")
      .then((res) => setFunnelData(res.data ?? []));
    // Live Metrics (stub, replace with real-time source)
    setLiveMetrics({ visitors: Math.floor(Math.random() * 100) });
  }, [dateRange]); // Add dateRange as dependency

  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100vh",
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "300px 300px",
      }}
    >
      <h1 style={{ fontSize: "2rem", color: "#4B2E09" }}>Reportes</h1>
      
      {/* Date Range Controls */}
      <div style={{ 
        margin: "1rem 0 2rem 0", 
        display: "flex", 
        gap: "0.5rem", 
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <span style={{ color: "#4B2E09", fontWeight: "bold", marginRight: "1rem" }}>
          Date Range:
        </span>
        {(['7D', '1MO', '3MO', '12MO', '24MO'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            style={{
              padding: "0.5rem 1rem",
              border: "2px solid #8B4513",
              borderRadius: "6px",
              backgroundColor: dateRange === range ? "#8B4513" : "white",
              color: dateRange === range ? "white" : "#8B4513",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              fontSize: "0.9rem"
            }}
            onMouseEnter={(e) => {
              if (dateRange !== range) {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }
            }}
            onMouseLeave={(e) => {
              if (dateRange !== range) {
                e.currentTarget.style.backgroundColor = "white";
              }
            }}
          >
            {range === '7D' ? '7 Days' : 
             range === '1MO' ? '1 Month' : 
             range === '3MO' ? '3 Months' : 
             range === '12MO' ? '12 Months' : 
             '24 Months'}
          </button>
        ))}
      </div>
      
      <div style={{ margin: "2rem 0" }}>
        <h2 style={{ color: "#4B2E09" }}>Most Favorited Products</h2>
        <div 
          style={{ width: "100%", height: 500, cursor: "pointer" }}
          onClick={() => setEnlargedChart({
            type: 'bar',
            title: 'Most Favorited Products',
            data: favoriteData,
            config: {}
          })}
        >
            <ResponsiveBar
              data={favoriteData.length > 0 ? favoriteData : [{ product_name: "No Data", favorite_count: 0 }]}
              keys={["favorite_count"]}
              indexBy="product_name"
              margin={{ top: 40, right: 40, bottom: 80, left: 60 }}
              padding={0.3}
              colors={["#FF6F61", "#FFB347", "#FFD700", "#B0E57C", "#50BFE6", "#FF7F50", "#C2B280", "#B565A7", "#009B77", "#DD4124"]}
              axisBottom={{ tickRotation: 45 }}
              theme={chartTheme}
            />
          </div>
      </div>
      <div style={{ margin: "2rem 0", display: "flex", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "#4B2E09" }}>Most Chosen Fabric Colors</h2>
          <div 
            style={{ width: "100%", height: 400, padding: "2rem 0", cursor: "pointer" }}
            onClick={() => setEnlargedChart({
              type: 'pie',
              title: 'Most Chosen Fabric Colors',
              data: fabricColorData.length > 0
                ? fabricColorData.map((v, index) => ({ 
                    id: v.color, 
                    value: v.count
                  }))
                : [{ id: "No Data", value: 1 }],
              config: {
                defs: fabricColorData.length > 0
                  ? fabricColorData.map((v) => ({
                      id: `fabric-${v.color.replace(/\s+/g, '_')}`,
                      type: 'patternLines',
                      background: 'inherit',
                      color: 'rgba(255, 255, 255, 0.3)',
                      rotation: -45,
                      lineWidth: 6,
                      spacing: 10,
                    }))
                  : [],
                fill: fabricColorData.length > 0
                  ? fabricColorData.map((v) => ({
                      match: { id: v.color },
                      id: `fabric-${v.color.replace(/\s+/g, '_')}`
                    }))
                  : [],
                colors: ["#FF6F61", "#FFB347", "#FFD700", "#B0E57C", "#50BFE6", "#FF7F50", "#C2B280", "#B565A7", "#009B77", "#DD4124"]
              }
            })}
          >
            <ResponsivePie
              data={
                fabricColorData.length > 0
                  ? fabricColorData.map((v, index) => ({ 
                      id: v.color, 
                      value: v.count
                    }))
                  : [{ id: "No Data", value: 1 }]
              }
              defs={
                fabricColorData.length > 0
                  ? fabricColorData.map((v) => ({
                      id: `fabric-${v.color.replace(/\s+/g, '_')}`,
                      type: 'patternLines',
                      background: 'inherit',
                      color: 'rgba(255, 255, 255, 0.3)',
                      rotation: -45,
                      lineWidth: 6,
                      spacing: 10,
                    }))
                  : []
              }
              fill={
                fabricColorData.length > 0
                  ? fabricColorData.map((v) => ({
                      match: { id: v.color },
                      id: `fabric-${v.color.replace(/\s+/g, '_')}`
                    }))
                  : []
              }
              colors={["#FF6F61", "#FFB347", "#FFD700", "#B0E57C", "#50BFE6", "#FF7F50", "#C2B280", "#B565A7", "#009B77", "#DD4124"]}
              theme={chartTheme}
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "#4B2E09" }}>Most Chosen Frame Colors</h2>
          <div 
            style={{ width: "100%", height: 400, padding: "2rem 0", cursor: "pointer" }}
            onClick={() => setEnlargedChart({
              type: 'pie',
              title: 'Most Chosen Frame Colors',
              data: frameColorData.length > 0
                ? frameColorData.map((v, index) => ({ 
                    id: v.color, 
                    value: v.count
                  }))
                : [{ id: "No Data", value: 1 }],
              config: {
                defs: frameColorData.length > 0
                  ? frameColorData.map((v) => ({
                      id: `frame-${v.color.replace(/\s+/g, '_')}`,
                      type: 'patternLines',
                      background: 'inherit',
                      color: 'rgba(255, 255, 255, 0.3)',
                      rotation: 45,
                      lineWidth: 4,
                      spacing: 8,
                    }))
                  : [],
                fill: frameColorData.length > 0
                  ? frameColorData.map((v) => ({
                      match: { id: v.color },
                      id: `frame-${v.color.replace(/\s+/g, '_')}`
                    }))
                  : [],
                colors: ["#8B4513", "#654321", "#A0522D", "#CD853F", "#D2B48C", "#DEB887", "#F5DEB3", "#696969", "#2F4F4F", "#556B2F"]
              }
            })}
          >
            <ResponsivePie
              data={
                frameColorData.length > 0
                  ? frameColorData.map((v, index) => ({ 
                      id: v.color, 
                      value: v.count
                    }))
                  : [{ id: "No Data", value: 1 }]
              }
              defs={
                frameColorData.length > 0
                  ? frameColorData.map((v) => ({
                      id: `frame-${v.color.replace(/\s+/g, '_')}`,
                      type: 'patternDots',
                      background: 'inherit',
                      color: 'rgba(255, 255, 255, 0.3)',
                      size: 4,
                      padding: 1,
                      stagger: true
                    }))
                  : []
              }
              fill={
                frameColorData.length > 0
                  ? frameColorData.map((v) => ({
                      match: { id: v.color },
                      id: `frame-${v.color.replace(/\s+/g, '_')}`
                    }))
                  : []
              }
              colors={["#FFD700", "#FFB347", "#FF7F50", "#C2B280", "#B565A7", "#009B77", "#DD4124", "#45B8AC", "#6B5B95", "#F7CAC9"]}
              theme={chartTheme}
            />
          </div>
        </div>
      </div>
      <div style={{ margin: "2rem 0" }}>
        <h2 style={{ color: "#4B2E09" }}>Product Views Over Time</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveLine
              data={
                Array.isArray(viewsData) && viewsData.length > 0
                  ? viewsData
                  : [
                      {
                        id: "No Data",
                        data: [{ x: 0, y: 0 }],
                      },
                    ]
              }
              colors={["#009B77", "#50BFE6", "#B0E57C", "#FFD700", "#FFB347", "#FF7F50", "#C2B280", "#B565A7", "#DD4124", "#45B8AC"]}
              theme={{ axis: { ticks: { text: { fill: "#4B2E09" } } } }}
            />
          </div>
      </div>
      <div style={{ margin: "2rem 0" }}>
        <h2 style={{ color: "#4B2E09" }}>Visitors by Country</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsivePie
              data={
                Array.isArray(countryData) && countryData.length > 0
                  ? countryData
                  : [{ id: "No Data", value: 1 }]
              }
              colors={["#FFD700", "#FFB347", "#FF7F50", "#C2B280", "#B565A7", "#009B77", "#DD4124", "#45B8AC", "#6B5B95", "#F7CAC9"]}
              theme={{ labels: { text: { fill: "#4B2E09" } } }}
            />
          </div>
      </div>
      <div style={{ margin: "2rem 0", display: "flex", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "#4B2E09" }}>Visitors by Browser</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsivePie
              data={
                Array.isArray(browserData) && browserData.length > 0
                  ? browserData
                  : [{ id: "No Data", value: 1 }]
              }
              colors={["#FF6F61", "#FFB347", "#FFD700", "#B0E57C", "#50BFE6"]}
              theme={{ labels: { text: { fill: "#4B2E09" } } }}
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "#4B2E09" }}>Visitors by Device</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsivePie
              data={
                Array.isArray(deviceData) && deviceData.length > 0
                  ? deviceData
                  : [{ id: "No Data", value: 1 }]
              }
              colors={["#009B77", "#50BFE6", "#B0E57C", "#FFD700", "#FFB347"]}
              theme={{ labels: { text: { fill: "#4B2E09" } } }}
            />
          </div>
        </div>
      </div>
      <div style={{ margin: "2rem 0" }}>
        <h2 style={{ color: "#4B2E09" }}>Traffic Source Breakdown</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsivePie
              data={
                Array.isArray(referrerData) && referrerData.length > 0
                  ? referrerData
                  : [{ id: "No Data", value: 1 }]
              }
              colors={["#FFD700", "#FFB347", "#FF7F50", "#C2B280", "#B565A7", "#009B77", "#DD4124", "#45B8AC", "#6B5B95", "#F7CAC9"]}
              theme={{ labels: { text: { fill: "#4B2E09" } } }}
            />
          </div>
      </div>
      <div style={{ margin: "2rem 0" }}>
        <h2 style={{ color: "#4B2E09" }}>Customer Journey Funnel</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveFunnel
              data={
                Array.isArray(funnelData) && funnelData.length > 0
                  ? funnelData.map((d) => ({
                      id: d.id ?? d.stage ?? "Unknown",
                      value: d.value ?? d.count ?? 0,
                    }))
                  : [
                      { id: "No Data", value: 1 }
                    ]
              }
              colors={["#F7CAC9", "#45B8AC", "#FFB347", "#FFD700", "#B0E57C", "#50BFE6", "#FF7F50", "#C2B280", "#B565A7", "#009B77"]}
              theme={{ labels: { text: { fill: "#4B2E09" } } }}
            />
          </div>
      </div>
      <div style={{ margin: "2rem 0" }}>
        <h2 style={{ color: "#4B2E09" }}>Live Metrics</h2>
        <div style={{ fontSize: "3rem", color: "#4B2E09", background: "#F8F5F0", borderRadius: "1rem", padding: "2rem", textAlign: "center" }}>
          Total Visitors Right Now: {liveMetrics.visitors}
        </div>
      </div>
      
      {/* Chart Enlargement Modal */}
      {enlargedChart && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEnlargedChart(null);
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '90vw',
              height: '80vh',
              maxWidth: '1000px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: "#4B2E09", margin: 0 }}>{enlargedChart.title}</h2>
              <button
                onClick={() => setEnlargedChart(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.5rem'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              {enlargedChart.type === 'pie' && (
                <ResponsivePie
                  data={enlargedChart.data}
                  theme={chartTheme}
                  margin={{ top: 60, right: 80, bottom: 60, left: 80 }}
                  innerRadius={0.4}
                  padAngle={2}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#4B2E09"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  colors={enlargedChart.config.colors}
                  defs={enlargedChart.config.defs}
                  fill={enlargedChart.config.fill}
                  animate={true}
                />
              )}
              {enlargedChart.type === 'bar' && (
                <ResponsiveBar
                  data={enlargedChart.data}
                  theme={chartTheme}
                  keys={['count']}
                  indexBy="name"
                  margin={{ top: 60, right: 130, bottom: 80, left: 80 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={['#8B4513']}
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Products',
                    legendPosition: 'middle',
                    legendOffset: 60
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Favorites',
                    legendPosition: 'middle',
                    legendOffset: -60
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  animate={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
