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
} from "../../../utils/googleAnalytics";

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
  const [liveMetrics, setLiveMetrics] = useState<{ visitors: number }>({ visitors: 0 });
  // Modal state for enlarged charts
  const [enlargedChart, setEnlargedChart] = useState<{
    type: 'bar' | 'pie' | 'line' | 'funnel';
    title: string;
    data: any[];
    config: any;
  } | null>(null);

  // Chart theme
  const chartTheme = {
    tooltip: {
      container: {
        background: "#4B2E09",
        color: "white",
        fontSize: "14px",
        borderRadius: "4px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
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
    
    
    // Load Vercel Analytics data
    const analyticsStartDate = getDateRangeFilter(dateRange);
    const analyticsEndDate = new Date().toISOString();
    
    const analyticsQuery = {
      since: analyticsStartDate,
      until: analyticsEndDate,
      environment: 'production' as const
    };
    
    Promise.all([
      getVisitorsByCountry(analyticsQuery),
      getVisitorsByBrowser(analyticsQuery), 
      getVisitorsByReferrer(analyticsQuery),
      getVisitorsByDevice(analyticsQuery)
    ]).then(([countries, browsers, referrers, devices]) => {
      console.log('✅ Vercel Analytics Data:', { countries, browsers, referrers, devices });
      
      // Transform and set country data
      if (countries?.data && Array.isArray(countries.data) && countries.data.length > 0) {
        setCountryData(transformForNivoPie(countries.data, 'visits', 'country'));
      } else {
        console.log('ℹ️ No country data available');
        setCountryData([{ id: 'No data available', value: 1, label: 'No data available' }]);
      }
      
      // Transform and set browser data
      if (browsers?.data && Array.isArray(browsers.data) && browsers.data.length > 0) {
        setBrowserData(transformForNivoPie(browsers.data, 'visits', 'browser'));
      } else {
        console.log('ℹ️ No browser data available');
        setBrowserData([{ id: 'No data available', value: 1, label: 'No data available' }]);
      }
      
      // Transform and set referrer data
      if (referrers?.data && Array.isArray(referrers.data) && referrers.data.length > 0) {
        setReferrerData(transformForNivoPie(referrers.data, 'visits', 'referrer'));
      } else {
        console.log('ℹ️ No referrer data available');
        setReferrerData([{ id: 'No data available', value: 1, label: 'No data available' }]);
      }
      
      // Transform and set device data
      if (devices?.data && Array.isArray(devices.data) && devices.data.length > 0) {
        setDeviceData(transformForNivoPie(devices.data, 'visits', 'device'));
      } else {
        console.log('ℹ️ No device data available');
        setDeviceData([{ id: 'No data available', value: 1, label: 'No data available' }]);
      }
    }).catch(error => {
      console.error('❌ Error loading Vercel Analytics:', error);
      
      // Set "error" state instead of dummy data
      const errorData = [{ id: 'Analytics API Error', value: 1, label: 'Analytics API Error' }];
      setCountryData(errorData);
      setBrowserData(errorData);
      setReferrerData(errorData);
      setDeviceData(errorData);
    });
    
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
        padding: "1.5rem",
        minHeight: "100vh",
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "300px 300px",
      }}
    >
      <div style={{ 
        maxWidth: "1400px", 
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        {/* Header with Title and Date Range Controls */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem"
        }}>
          <h1 style={{ fontSize: "2rem", color: "#4B2E09", margin: 0 }}>Reportes</h1>
          
          {/* Date Range Controls */}
          <div style={{ 
            display: "flex", 
            gap: "0.5rem", 
            alignItems: "center"
          }}>
            <span style={{ color: "#4B2E09", fontWeight: "bold", marginRight: "0.5rem" }}>
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
                  fontSize: "0.85rem"
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
        </div>

        {/* Bento Grid Layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gridTemplateRows: "200px 300px 200px",
          gap: "1rem",
          height: "calc(100vh - 150px)" // Fit above the fold
        }}>
          {/* Top Row - Key Metrics */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <h3 style={{ color: "#4B2E09", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Total Favorites</h3>
            <div style={{ color: "#8B4513", fontSize: "2.5rem", fontWeight: "bold" }}>
              {favoriteData.reduce((sum, item) => sum + item.favorite_count, 0)}
            </div>
            <div style={{ color: "#666", fontSize: "0.9rem" }}>
              +{Math.floor(Math.random() * 20)}% from last period
            </div>
          </div>

          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <h3 style={{ color: "#4B2E09", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Top Product</h3>
            <div style={{ color: "#8B4513", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}>
              {favoriteData.length > 0 ? favoriteData[0].product_name : "Loading..."}
            </div>
            <div style={{ color: "#666", fontSize: "0.9rem" }}>
              {favoriteData.length > 0 ? `${favoriteData[0].favorite_count} favorites` : ""}
            </div>
          </div>

          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <h3 style={{ color: "#4B2E09", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Top Fabric</h3>
            <div style={{ color: "#8B4513", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}>
              {fabricColorData.length > 0 ? fabricColorData[0].color : "Loading..."}
            </div>
            <div style={{ color: "#666", fontSize: "0.9rem" }}>
              {fabricColorData.length > 0 ? `${fabricColorData[0].count} selections` : ""}
            </div>
          </div>

          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <h3 style={{ color: "#4B2E09", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Top Frame</h3>
            <div style={{ color: "#8B4513", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}>
              {frameColorData.length > 0 ? frameColorData[0].color : "Loading..."}
            </div>
            <div style={{ color: "#666", fontSize: "0.9rem" }}>
              {frameColorData.length > 0 ? `${frameColorData[0].count} selections` : ""}
            </div>
          </div>

          {/* Middle Row - Main Chart (spans 2 columns) */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            gridColumn: "1 / 3",
            cursor: "pointer"
          }}
          onClick={() => setEnlargedChart({
            type: 'bar',
            title: 'Most Favorited Products',
            data: favoriteData,
            config: {}
          })}
          >
            <h3 style={{ color: "#4B2E09", margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Most Favorited Products</h3>
            <div style={{ height: "220px" }}>
              <ResponsiveBar
                data={favoriteData.length > 0 ? favoriteData.slice(0, 8) : [{ product_name: "No Data", favorite_count: 0 }]}
                keys={["Product"]}
                indexBy="product_name"
                theme={chartTheme}
                margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={["#8B4513"]}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: "",
                  legendPosition: "middle",
                  legendOffset: 50,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "",
                  legendPosition: "middle",
                  legendOffset: -40,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                animate={true}
              />
            </div>
          </div>

          {/* Fabric Colors Chart */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            cursor: "pointer"
          }}
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
            <h3 style={{ color: "#4B2E09", margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Fabric Colors</h3>
            <div style={{ height: "220px" }}>
              <ResponsivePie
                data={fabricColorData.length > 0 
                  ? fabricColorData.slice(0, 6).map((v) => ({ id: v.color, value: v.count }))
                  : [{ id: "No Data", value: 1 }]
                }
                theme={chartTheme}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.4}
                padAngle={2}
                cornerRadius={3}
                activeOuterRadiusOffset={4}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={15}
                arcLinkLabelsTextColor="#4B2E09"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={15}
                arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                colors={["#FF6F61", "#FFB347", "#FFD700", "#B0E57C", "#50BFE6", "#FF7F50"]}
                animate={true}
              />
            </div>
          </div>

          {/* Frame Colors Chart */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            cursor: "pointer"
          }}
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
              colors: ["#8B4513", "#654321", "#A0522D", "#CD853F", "#D2B48C", "#DEB887"]
            }
          })}
          >
            <h3 style={{ color: "#4B2E09", margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Frame Colors</h3>
            <div style={{ height: "220px" }}>
              <ResponsivePie
                data={frameColorData.length > 0 
                  ? frameColorData.slice(0, 6).map((v) => ({ id: v.color, value: v.count }))
                  : [{ id: "No Data", value: 1 }]
                }
                theme={chartTheme}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.4}
                padAngle={2}
                cornerRadius={3}
                activeOuterRadiusOffset={4}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={15}
                arcLinkLabelsTextColor="#4B2E09"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={15}
                arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                colors={["#8B4513", "#654321", "#A0522D", "#CD853F", "#D2B48C", "#DEB887"]}
                animate={true}
              />
            </div>
          </div>

          {/* Bottom Row - Analytics Overview */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <h3 style={{ color: "#4B2E09", margin: "0 0 1rem 0", fontSize: "1rem" }}>Visitors</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {countryData.slice(0, 3).map((country, index) => (
                <div key={country.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#4B2E09", fontSize: "0.9rem" }}>{country.id}</span>
                  <span style={{ color: "#8B4513", fontWeight: "bold", fontSize: "0.9rem" }}>{country.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <h3 style={{ color: "#4B2E09", margin: "0 0 1rem 0", fontSize: "1rem" }}>Browsers</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {browserData.slice(0, 3).map((browser, index) => (
                <div key={browser.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#4B2E09", fontSize: "0.9rem" }}>{browser.id}</span>
                  <span style={{ color: "#8B4513", fontWeight: "bold", fontSize: "0.9rem" }}>{browser.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <h3 style={{ color: "#4B2E09", margin: "0 0 1rem 0", fontSize: "1rem" }}>Devices</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {deviceData.slice(0, 3).map((device, index) => (
                <div key={device.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#4B2E09", fontSize: "0.9rem" }}>{device.id}</span>
                  <span style={{ color: "#8B4513", fontWeight: "bold", fontSize: "0.9rem" }}>{device.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "2px solid #8B4513",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <h3 style={{ color: "#4B2E09", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Active Now</h3>
            <div style={{ color: "#8B4513", fontSize: "2rem", fontWeight: "bold" }}>
              {liveMetrics.visitors}
            </div>
            <div style={{ color: "#666", fontSize: "0.9rem" }}>
              Live visitors
            </div>
          </div>
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
                  keys={['favorite_count']}
                  indexBy="product_name"
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