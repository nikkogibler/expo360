"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { supabase } from "../../../../lib/supabaseClient";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveFunnel } from "@nivo/funnel";
import BurgerMenu from "../../../components/BurgerMenu";
import { 
  getVisitorsByCountry, 
  getVisitorsByBrowser, 
  getVisitorsByReferrer, 
  getVisitorsByDevice,
  transformForNivoPie,
  transformForNivoBar 
} from "../../../utils/vercelAnalytics";

// Reusable Card Component with Pin functionality
const DashboardCard = ({ 
  cardId, 
  children, 
  isPinned, 
  onTogglePin, 
  onClick,
  style = {} 
}: {
  cardId: string;
  children: React.ReactNode;
  isPinned: boolean;
  onTogglePin: (cardId: string) => void;
  onClick?: () => void;
  style?: React.CSSProperties;
}) => {
  return (
    <div 
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "12px",
        padding: "1.5rem",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        ...style
      }}
      onClick={onClick}
    >
      {/* Pin Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(cardId);
        }}
        style={{
          position: "absolute",
          top: "0.5rem",
          right: "0.5rem",
          background: isPinned ? "#42A5F5" : "rgba(255, 255, 255, 0.9)",
          color: isPinned ? "white" : "#42A5F5",
          border: isPinned ? "none" : "1px solid #42A5F5",
          borderRadius: "4px",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "bold",
          zIndex: 10
        }}
        title={isPinned ? "Unpin card" : "Pin card"}
      >
        📌
      </button>
      {children}
    </div>
  );
};

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

// Date Range Menu Component
const DateRangeMenu = ({ open, setOpen, dateRange, setDateRange }: {
  open: boolean;
  setOpen: (open: boolean) => void;
  dateRange: '7D' | '1MO' | '3MO' | '12MO' | '24MO';
  setDateRange: (range: '7D' | '1MO' | '3MO' | '12MO' | '24MO') => void;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  const dateRangeOptions = [
    { label: '7 Days', value: '7D' as const },
    { label: '1 Month', value: '1MO' as const },
    { label: '3 Months', value: '3MO' as const },
    { label: '12 Months', value: '12MO' as const },
    { label: '24 Months', value: '24MO' as const },
  ];

  const handleDateRangeClick = (value: '7D' | '1MO' | '3MO' | '12MO' | '24MO') => {
    setDateRange(value);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        minWidth: '150px'
      }}
    >
      {dateRangeOptions.map((option) => (
        <div
          key={option.value}
          onClick={() => handleDateRangeClick(option.value)}
          style={{
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: dateRange === option.value ? '#f5f5f5' : 'white',
            color: dateRange === option.value ? '#42A5F5' : '#42A5F5',
            fontWeight: dateRange === option.value ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = dateRange === option.value ? '#f5f5f5' : 'white';
          }}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};

export default function ReportesPage() {
  // Date range state - default to 3MO
  const [dateRange, setDateRange] = useState<'7D' | '1MO' | '3MO' | '12MO' | '24MO'>('3MO');
  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Dashboard navigation state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 2;
  
  // Pinned cards state
  const [pinnedCards, setPinnedCards] = useState<Set<string>>(new Set());
  
  // Helper function to toggle pinned cards
  const togglePinCard = (cardId: string) => {
    setPinnedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };
  
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
  // Random percentage for growth display
  const [growthPercentage, setGrowthPercentage] = useState<number>(0);
  // Client-side hydration flag
  const [isClient, setIsClient] = useState(false);
  // Modal state for enlarged charts
  const [enlargedChart, setEnlargedChart] = useState<{
    type: 'bar' | 'pie' | 'line' | 'funnel';
    title: string;
    data: any[];
    config: any;
  } | null>(null);

  // Blue gradient color palette (darkest to lightest)
  const blueGradientColors = [
    "#42A5F5", // Middle Blue (darkest)
    "#64B5F6", // Mid-Light
    "#90CAF9", // Second Lightest
    "#BBDEFB"  // Lightest Blue
  ];

  // Frame Colors palette
  const frameColorspalette = [
    "#6CDA41", // Bright Green
    "#FD319B", // Bright Pink
    "#FF9900", // Orange
    "#33CCFF", // Light Blue
    "#FF0066", // Deep Pink
  ];

  // Function to assign colors based on data values (highest gets darkest blue)
  const assignBarColors = (data: Array<{ product_name: string; favorite_count: number }>) => {
    if (data.length === 0) return ["#42A5F5"];
    
    // Sort data by favorite_count to determine ranking
    const sortedData = [...data].sort((a, b) => b.favorite_count - a.favorite_count);
    
    // Create color map based on ranking
    return data.map(item => {
      const rank = sortedData.findIndex(d => d.product_name === item.product_name);
      const colorIndex = Math.min(rank, blueGradientColors.length - 1);
      return blueGradientColors[colorIndex];
    });
  };

  // Function to assign frame colors based on data values (highest gets first color)
  const assignFrameColors = (data: Array<{ color: string; count: number }>) => {
    if (data.length === 0) return [frameColorspalette[0]];
    
    // Sort data by count to determine ranking
    const sortedData = [...data].sort((a, b) => b.count - a.count);
    
    // Create color map based on ranking
    return data.map(item => {
      const rank = sortedData.findIndex(d => d.color === item.color);
      const colorIndex = Math.min(rank, frameColorspalette.length - 1);
      return frameColorspalette[colorIndex];
    });
  };

  // Chart theme
  const chartTheme = {
    tooltip: {
      container: {
        background: "#42A5F5",
        color: "white",
        fontSize: "14px",
        borderRadius: "4px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }
    },
    labels: { text: { fill: "#42A5F5" } },
    axis: { ticks: { text: { fill: "#42A5F5" } } }
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
    
    
    // Set mock data for analytics
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
    
    // Set random values only on client side to avoid hydration mismatch
    setIsClient(true);
    setLiveMetrics({ visitors: Math.floor(Math.random() * 100) });
    setGrowthPercentage(Math.floor(Math.random() * 20));
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
        {/* Kusam Logo */}
        <div style={{ height: '80px', width: '100%', position: 'relative', marginTop: '1.0rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Image
              src="/kusam_main.webp"
              alt="Kusam Logo"
              width={200}
              height={60}
              style={{ objectFit: 'contain', display: 'block', margin: '0 auto', maxWidth: '100%', maxHeight: '100%' }}
              priority
            />
          </div>
          {/* Date Range Menu - absolutely positioned like admin page */}
          <div style={{ position: 'absolute', top: '72%', right: 'calc(50% - 695px)', transform: 'translateY(-50%)', zIndex: 10 }}>
            <div style={{ 
              display: "flex", 
              gap: "1rem", 
              alignItems: "center",
              position: "relative"
            }}>
              {/* Navigation arrows */}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    background: currentPage === 1 ? '#e0e0e0' : '#42A5F5',
                    color: currentPage === 1 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  ←
                </button>
                
                <span style={{ 
                  color: "#42A5F5", 
                  fontSize: "0.9rem", 
                  fontWeight: "bold",
                  minWidth: "40px",
                  textAlign: "center"
                }}>
                  {currentPage}/{totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    background: currentPage === totalPages ? '#e0e0e0' : '#42A5F5',
                    color: currentPage === totalPages ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  →
                </button>
              </div>
              
              <span style={{ color: "#42A5F5", fontWeight: "bold", marginRight: "0.5rem", fontSize: "0.9rem" }}>
                Date Range: {dateRange === '7D' ? '7 Days' : 
                            dateRange === '1MO' ? '1 Month' : 
                            dateRange === '3MO' ? '3 Months' : 
                            dateRange === '12MO' ? '12 Months' : 
                            '24 Months'}
              </span>
              <div style={{ position: "relative" }}>
                <BurgerMenu isOpen={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
                <DateRangeMenu 
                  open={menuOpen} 
                  setOpen={setMenuOpen} 
                  dateRange={dateRange} 
                  setDateRange={setDateRange} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout with Navigation */}
        <div style={{ position: "relative", width: "100%" }}>
          {/* Navigation arrows positioned on sides */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              position: "absolute",
              left: "-50px",
              top: "50%",
              transform: "translateY(-50%)",
              background: currentPage === 1 ? '#e0e0e0' : '#42A5F5',
              color: currentPage === 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              zIndex: 10
            }}
          >
            ←
          </button>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              position: "absolute",
              right: "-50px",
              top: "50%",
              transform: "translateY(-50%)",
              background: currentPage === totalPages ? '#e0e0e0' : '#42A5F5',
              color: currentPage === totalPages ? '#999' : 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              zIndex: 10
            }}
          >
            →
          </button>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gridTemplateRows: "200px 300px 200px",
            gap: "1rem",
            height: "calc(100vh - 150px)" // Fit above the fold
          }}>
          {currentPage === 1 && (
            <>
              {/* Page 1 - Main Analytics */}
              {/* Top Row - Key Metrics */}
              <DashboardCard
                cardId="total-favorites"
                isPinned={pinnedCards.has("total-favorites")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Total Favorites</h3>
                <div style={{ color: "#42A5F5", fontSize: "2.5rem", fontWeight: "bold" }}>
                  {favoriteData.reduce((sum, item) => sum + item.favorite_count, 0)}
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  <p className="text-sm text-green-600">
                    {isClient ? `+${growthPercentage}% desde ayer` : '+0% desde ayer'}
                  </p>
                </div>
              </DashboardCard>

              <DashboardCard
                cardId="top-product"
                isPinned={pinnedCards.has("top-product")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Top Product</h3>
                <div style={{ color: "#42A5F5", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}>
                  {favoriteData.length > 0 ? favoriteData[0].product_name : "Loading..."}
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  {favoriteData.length > 0 ? `${favoriteData[0].favorite_count} favorites` : ""}
                </div>
              </DashboardCard>

              <DashboardCard
                cardId="top-fabric"
                isPinned={pinnedCards.has("top-fabric")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Top Fabric</h3>
                <div style={{ color: "#42A5F5", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}>
                  {fabricColorData.length > 0 ? fabricColorData[0].color : "Loading..."}
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  {fabricColorData.length > 0 ? `${fabricColorData[0].count} selections` : ""}
                </div>
              </DashboardCard>

              <DashboardCard 
                cardId="top-frame"
                isPinned={pinnedCards.has("top-frame")}
                onTogglePin={togglePinCard}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Top Frame</h3>
                <div style={{ color: "#42A5F5", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}>
                  {frameColorData.length > 0 ? frameColorData[0].color : "Loading..."}
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  {frameColorData.length > 0 ? `${frameColorData[0].count} selections` : ""}
                </div>
              </DashboardCard>

              {/* Middle Row - Main Chart (spans 2 columns) */}
              <DashboardCard
                cardId="favorite-products-chart"
                isPinned={pinnedCards.has("favorite-products-chart")}
                onTogglePin={togglePinCard}
                style={{ gridColumn: "1 / 3" }}
                onClick={() => setEnlargedChart({
                  type: 'bar',
                  title: 'Most Favorited Products',
                  data: favoriteData,
                  config: {}
                })}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Most Favorited Products</h3>
                <div style={{ height: "220px" }}>
                  <ResponsiveBar
                    data={favoriteData.length > 0 ? favoriteData.slice(0, 8) : [{ product_name: "No Data", favorite_count: 0 }]}
                    keys={["favorite_count"]}
                    indexBy="product_name"
                    theme={chartTheme}
                    margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
                    padding={0.3}
                    valueScale={{ type: "linear" }}
                    indexScale={{ type: "band", round: true }}
                    colors={(datum) => {
                      const dataToUse = favoriteData.length > 0 ? favoriteData.slice(0, 8) : [{ product_name: "No Data", favorite_count: 0 }];
                      const colors = assignBarColors(dataToUse);
                      const index = dataToUse.findIndex(item => item.product_name === datum.indexValue);
                      return colors[index] || blueGradientColors[0];
                    }}
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
              </DashboardCard>

              {/* Fabric Colors Chart */}
              <DashboardCard
                cardId="fabric-colors-chart"
                isPinned={pinnedCards.has("fabric-colors-chart")}
                onTogglePin={togglePinCard}
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
                <h3 style={{ color: "#42A5F5", margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Fabric Colors</h3>
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
                    arcLinkLabelsTextColor="#42A5F5"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsSkipAngle={15}
                    arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                    colors={["#FF6F61", "#FFB347", "#FFD700", "#B0E57C", "#50BFE6", "#FF7F50"]}
                    animate={true}
                  />
                </div>
              </DashboardCard>

              {/* Frame Colors Chart */}
              <DashboardCard
                cardId="frame-colors-chart"
                isPinned={pinnedCards.has("frame-colors-chart")}
                onTogglePin={togglePinCard}
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
                    colors: frameColorspalette
                  }
                })}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Frame Colors</h3>
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
                    arcLinkLabelsTextColor="#42A5F5"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsSkipAngle={15}
                    arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                    colors={(datum) => {
                      const dataToUse = frameColorData.length > 0 ? frameColorData.slice(0, 6) : [{ color: "No Data", count: 1 }];
                      const colors = assignFrameColors(dataToUse);
                      const index = dataToUse.findIndex(item => item.color === datum.id);
                      return colors[index] || frameColorspalette[0];
                    }}
                    animate={true}
                  />
                </div>
              </DashboardCard>

              {/* Bottom Row - Analytics Overview */}
              <DashboardCard
                cardId="visitors-analytics"
                isPinned={pinnedCards.has("visitors-analytics")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 1rem 0", fontSize: "1rem" }}>Visitors</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {countryData.slice(0, 3).map((country, index) => (
                    <div key={country.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#42A5F5", fontSize: "0.9rem" }}>{country.id}</span>
                      <span style={{ color: "#42A5F5", fontWeight: "bold", fontSize: "0.9rem" }}>{country.value}</span>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard
                cardId="browsers-analytics"
                isPinned={pinnedCards.has("browsers-analytics")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 1rem 0", fontSize: "1rem" }}>Browsers</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {browserData.slice(0, 3).map((browser, index) => (
                    <div key={browser.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#42A5F5", fontSize: "0.9rem" }}>{browser.id}</span>
                      <span style={{ color: "#42A5F5", fontWeight: "bold", fontSize: "0.9rem" }}>{browser.value}</span>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard
                cardId="devices-analytics"
                isPinned={pinnedCards.has("devices-analytics")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 1rem 0", fontSize: "1rem" }}>Devices</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {deviceData.slice(0, 3).map((device, index) => (
                    <div key={device.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#42A5F5", fontSize: "0.9rem" }}>{device.id}</span>
                      <span style={{ color: "#42A5F5", fontWeight: "bold", fontSize: "0.9rem" }}>{device.value}</span>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard
                cardId="active-now"
                isPinned={pinnedCards.has("active-now")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Active Now</h3>
                <div style={{ color: "#42A5F5", fontSize: "2rem", fontWeight: "bold" }}>
                  {liveMetrics.visitors}
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  Live visitors
                </div>
              </DashboardCard>
            </>
          )}

          {currentPage === 2 && (
            <>
              {/* Page 2 - Performance Analytics */}
              {/* Show pinned cards first if any */}
              {Array.from(pinnedCards).map((cardId) => {
                // Render pinned cards from page 1 if this is page 2
                if (cardId === "total-favorites") {
                  return (
                    <DashboardCard
                      key={cardId}
                      cardId="total-favorites"
                      isPinned={true}
                      onTogglePin={togglePinCard}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Total Favorites</h3>
                      <div style={{ color: "#42A5F5", fontSize: "2.5rem", fontWeight: "bold" }}>
                        {favoriteData.reduce((sum, item) => sum + item.favorite_count, 0)}
                      </div>
                      <div style={{ color: "#666", fontSize: "0.9rem" }}>
                        <p className="text-sm text-green-600">
                          {isClient ? `+${growthPercentage}% desde ayer` : '+0% desde ayer'}
                        </p>
                      </div>
                    </DashboardCard>
                  );
                }
                // Add more pinned card templates here as needed
                return null;
              })}

              {/* Fill remaining slots with new Page 2 content */}
              <DashboardCard
                cardId="conversion-rate"
                isPinned={pinnedCards.has("conversion-rate")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Conversion Rate</h3>
                <div style={{ color: "#42A5F5", fontSize: "2.5rem", fontWeight: "bold" }}>
                  3.2%
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  <p className="text-sm text-green-600">
                    +0.5% this week
                  </p>
                </div>
              </DashboardCard>

              <DashboardCard
                cardId="avg-session"
                isPinned={pinnedCards.has("avg-session")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Avg Session</h3>
                <div style={{ color: "#42A5F5", fontSize: "1.8rem", fontWeight: "bold" }}>
                  2m 34s
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  Session duration
                </div>
              </DashboardCard>

              <DashboardCard
                cardId="bounce-rate"
                isPinned={pinnedCards.has("bounce-rate")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Bounce Rate</h3>
                <div style={{ color: "#42A5F5", fontSize: "2rem", fontWeight: "bold" }}>
                  42%
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  Exit rate
                </div>
              </DashboardCard>

              <DashboardCard
                cardId="revenue"
                isPinned={pinnedCards.has("revenue")}
                onTogglePin={togglePinCard}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Revenue</h3>
                <div style={{ color: "#42A5F5", fontSize: "1.8rem", fontWeight: "bold" }}>
                  $12,450
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  This month
                </div>
              </DashboardCard>

              {/* Add more Page 2 specific cards to fill the grid */}
              <div style={{ gridColumn: "1 / 5", textAlign: "center", color: "#42A5F5", fontSize: "1.2rem" }}>
                🚧 Page 2 - Performance Analytics Dashboard 🚧
              </div>
            </>
          )}
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
              <h2 style={{ color: "#42A5F5", margin: 0 }}>{enlargedChart.title}</h2>
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
                  arcLinkLabelsTextColor="#42A5F5"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  colors={(datum) => {
                    // Check if this is frame colors data based on the title
                    if (enlargedChart.title === 'Most Chosen Frame Colors') {
                      const colors = assignFrameColors(enlargedChart.data.map(d => ({ color: d.id, count: d.value })));
                      const index = enlargedChart.data.findIndex(item => item.id === datum.id);
                      return colors[index] || frameColorspalette[0];
                    }
                    // Fallback to config colors for other charts
                    return enlargedChart.config.colors[enlargedChart.data.findIndex(item => item.id === datum.id)] || enlargedChart.config.colors[0];
                  }}
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
                  colors={(datum) => {
                    const colors = assignBarColors(enlargedChart.data);
                    const index = enlargedChart.data.findIndex(item => item.product_name === datum.indexValue);
                    return colors[index] || blueGradientColors[0];
                  }}
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

      {/* Footer */}
      <footer
        className="px-8 text-xs text-center font-bold"
        style={{ background: 'transparent', marginTop: '0rem', paddingTop: '0.25rem', paddingBottom: '0.25rem' }}
      >
        <span>
          <span style={{ color: 'black', fontWeight: 'normal' }}>
            &copy; 2025
          </span>
          {' '}
          <a
            href="https://ekt.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #8B5CF6, #2563EB, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              textDecoration: 'none',
              padding: '0 2px',
            }}
          >
            Interzekt.com
          </a>
          <span style={{ color: 'black', fontWeight: 'normal' }}>
            {' '}All rights reserved.
          </span>
        </span>
      </footer>
    </div>
  );
}