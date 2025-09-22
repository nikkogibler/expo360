"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import BurgerMenu from "../../../components/BurgerMenu";
import { useAdminAuth } from "../../../hooks/useAdminAuth";
import { 
  getVisitorsByCountry, 
  getVisitorsByBrowser, 
  getVisitorsByDevice,
  transformForNivoPie
} from "../../../utils/googleAnalytics";

// Reusable Card Component with Pin functionality and Drag & Drop
const DashboardCard = ({ 
  cardId, 
  children, 
  isPinned, 
  onTogglePin, 
  onClick,
  style = {},
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging = false
}: {
  cardId: string;
  children: React.ReactNode;
  isPinned: boolean;
  onTogglePin: (cardId: string) => void;
  onClick?: () => void;
  style?: React.CSSProperties;
  onDragStart?: (e: React.DragEvent, cardId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetCardId: string) => void;
  isDragging?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect if device supports touch
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Determine if buttons should be visible
  const shouldShowButtons = isTouchDevice ? isTouched : isHovered;
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, cardId);
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (onDragOver) {
      onDragOver(e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDrop) {
      onDrop(e, cardId);
    }
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
      onMouseLeave={() => !isTouchDevice && setIsHovered(false)}
      onTouchStart={() => isTouchDevice && setIsTouched(true)}
      onTouchEnd={() => isTouchDevice && setTimeout(() => setIsTouched(false), 3000)} // Hide after 3s
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "12px",
        padding: "1.5rem",
        position: "relative",
        cursor: onClick ? "pointer" : "grab",
        transform: isDragging 
          ? "rotate(5deg) scale(1.05)" 
          : shouldShowButtons 
            ? "scale(1.02) translateY(-2px)" 
            : "scale(1) translateY(0px)",
        opacity: isDragging ? 0.8 : 1,
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        boxShadow: isDragging 
          ? "0 8px 25px rgba(0,0,0,0.15)" 
          : shouldShowButtons 
            ? "0 8px 20px rgba(0,0,0,0.12)" 
            : "0 2px 8px rgba(0,0,0,0.1)",
        zIndex: isDragging ? 1000 : shouldShowButtons ? 10 : 1,
        ...style
      }}
      onClick={onClick}
      onMouseDown={() => {
        // Change cursor to grabbing when mouse is down
        if (!onClick) {
          document.body.style.cursor = 'grabbing';
        }
      }}
      onMouseUp={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* Drag Handle - visible on hover/touch */}
      <div
        style={{
          position: "absolute",
          top: "0.5rem",
          left: "0.5rem",
          background: "rgba(66, 165, 245, 0.1)",
          color: "#42A5F5",
          border: "1px solid rgba(66, 165, 245, 0.3)",
          borderRadius: "4px",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          fontSize: "12px",
          fontWeight: "bold",
          zIndex: 20,
          opacity: shouldShowButtons ? 1 : 0,
          visibility: shouldShowButtons ? "visible" : "hidden",
          transform: shouldShowButtons ? "scale(1)" : "scale(0.8)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          pointerEvents: shouldShowButtons ? "auto" : "none"
        }}
        title="Drag to reorder"
      >
        ⋮⋮
      </div>

      {/* Pin Button - visible on hover/touch */}
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
          zIndex: 20,
          opacity: shouldShowButtons ? 1 : 0,
          visibility: shouldShowButtons ? "visible" : "hidden",
          transform: shouldShowButtons ? "scale(1)" : "scale(0.8)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          pointerEvents: shouldShowButtons ? "auto" : "none"
        }}
        title={isPinned ? "Unpin card" : "Pin card"}
      >
        📌
      </button>

      {/* Expand Icon - centered overlay on hover/touch */}
      {onClick && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) ${shouldShowButtons ? "scale(1)" : "scale(0.7)"}`,
            opacity: shouldShowButtons ? 0.6 : 0,
            visibility: shouldShowButtons ? "visible" : "hidden",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            pointerEvents: "none",
            zIndex: 15
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              color: "#666",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
      )}
      {children}
    </div>
  );
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
  // Authentication check
  const isAuthenticated = useAdminAuth();
  
  // All hooks must be called before any conditional returns
  // Date range state - default to 3MO
  const [dateRange, setDateRange] = useState<'7D' | '1MO' | '3MO' | '12MO' | '24MO'>('3MO');
  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Dashboard navigation state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 2;
  
  // Pinned cards state
  const [pinnedCards, setPinnedCards] = useState<Set<string>>(new Set());
  
  // Drag and drop state
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [cardOrder, setCardOrder] = useState<{[key: number]: string[]}>({
    1: [
      "total-favorites", "top-product", "top-fabric", "top-frame",
      "favorite-products-chart", "fabric-colors-chart", "frame-colors-chart",
      "visitors-analytics", "browsers-analytics", "devices-analytics", "active-now"
    ],
    2: [
      "conversion-rate", "avg-session", "bounce-rate", "revenue"
    ]
  });
  
  // Data state hooks
  const [favoriteData, setFavoriteData] = useState<Array<{ product_name: string; favorite_count: number }>>([]);
  const [fabricColorData, setFabricColorData] = useState<Array<{ color: string; count: number }>>([]);
  const [frameColorData, setFrameColorData] = useState<Array<{ color: string; count: number }>>([]);
  const [countryData, setCountryData] = useState<Array<{ id: string; value: number; label?: string }>>([]);
  const [browserData, setBrowserData] = useState<Array<{ id: string; value: number; label?: string }>>([]);
  const [deviceData, setDeviceData] = useState<Array<{ id: string; value: number; label?: string }>>([]);
  const [liveMetrics, setLiveMetrics] = useState<{ visitors: number }>({ visitors: 0 });
  const [growthPercentage, setGrowthPercentage] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [enlargedChart, setEnlargedChart] = useState<{
    type: 'bar' | 'pie' | 'line' | 'funnel';
    title: string;
    data: unknown;
    config: Record<string, unknown>;
  } | null>(null);

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

  // Data fetching useEffect - must be called before conditional rendering
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
          setFavoriteData(data.favoriteProducts || []);
          setFabricColorData(data.fabricColors || []);
          setFrameColorData(data.frameColors || []);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setFavoriteData([
          { product_name: 'Error loading data', favorite_count: 0 }
        ]);
        setFabricColorData([]);
        setFrameColorData([]);
      });

    // Load Google Analytics data
    const analyticsStartDate = getDateRangeFilter(dateRange);
    const analyticsEndDate = new Date().toISOString();
    
    const analyticsQuery = {
      since: analyticsStartDate,
      until: analyticsEndDate,
      environment: 'production' as const
    };
    
    console.log('📊 Loading Google Analytics data...');
    
    Promise.all([
      getVisitorsByCountry(analyticsQuery),
      getVisitorsByBrowser(analyticsQuery), 
      getVisitorsByDevice(analyticsQuery)
    ]).then(([countries, browsers, devices]) => {
      console.log('✅ Google Analytics Data loaded:', { countries, browsers, devices });
      
      // Transform and set country data
      if (countries?.data && Array.isArray(countries.data) && countries.data.length > 0) {
        setCountryData(transformForNivoPie(countries.data, 'visits', 'country') as Array<{ id: string; value: number; label?: string }>);
      } else {
        console.log('ℹ️ No country data available - this is normal for a new GA4 property');
        setCountryData([{ id: 'No data yet', value: 1, label: 'New GA4 property - data will appear after site visits' }]);
      }
      
      // Transform and set browser data
      if (browsers?.data && Array.isArray(browsers.data) && browsers.data.length > 0) {
        setBrowserData(transformForNivoPie(browsers.data, 'visits', 'browser') as Array<{ id: string; value: number; label?: string }>);
      } else {
        console.log('ℹ️ No browser data available - this is normal for a new GA4 property');
        setBrowserData([{ id: 'No data yet', value: 1, label: 'New GA4 property - data will appear after site visits' }]);
      }
      
      // Transform and set device data
      if (devices?.data && Array.isArray(devices.data) && devices.data.length > 0) {
        setDeviceData(transformForNivoPie(devices.data, 'visits', 'device') as Array<{ id: string; value: number; label?: string }>);
      } else {
        console.log('ℹ️ No device data available - this is normal for a new GA4 property');
        setDeviceData([{ id: 'No data yet', value: 1, label: 'New GA4 property - data will appear after site visits' }]);
      }
    }).catch(error => {
      console.error('❌ Error loading Google Analytics:', error);
      
      // Set "error" state
      const errorData = [{ id: 'Analytics Error', value: 1, label: 'Error loading analytics data' }];
      setCountryData(errorData);
      setBrowserData(errorData);
      setDeviceData(errorData);
    });
    
    // Set random values only on client side to avoid hydration mismatch
    setIsClient(true);
    setLiveMetrics({ visitors: Math.floor(Math.random() * 100) });
    setGrowthPercentage(Math.floor(Math.random() * 20));
  }, [dateRange]); // Add dateRange as dependency

  // Conditional rendering logic - all hooks must be called before this
  // Don't render anything while authentication is being checked
  if (isAuthenticated === null) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
      }}>
        <div style={{ color: '#444', fontSize: '18px' }}>Verificando autenticación...</div>
      </div>
    );
  }

  // Don't render the page if not authenticated (redirect will happen in useAdminAuth)
  if (!isAuthenticated) {
    return null;
  }
  
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCard(cardId);
    // Add visual feedback
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    document.body.style.cursor = 'default';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard === targetCardId) {
      return;
    }

    setCardOrder(prev => {
      const newOrder = { ...prev };
      
      // Find which page contains the dragged card and target card
      let sourcePage = 0;
      let targetPage = 0;
      
      for (const [page, cards] of Object.entries(newOrder)) {
        if (cards.includes(draggedCard)) sourcePage = parseInt(page);
        if (cards.includes(targetCardId)) targetPage = parseInt(page);
      }

      // Remove dragged card from its current position
      if (sourcePage > 0) {
        newOrder[sourcePage] = newOrder[sourcePage].filter(id => id !== draggedCard);
      }

      // Add dragged card to target position
      if (targetPage > 0 && newOrder[targetPage]) {
        const targetIndex = newOrder[targetPage].indexOf(targetCardId);
        newOrder[targetPage].splice(targetIndex, 0, draggedCard);
      }

      return newOrder;
    });

    setDraggedCard(null);
  };

  // Helper function to render a card based on its ID
  const renderCard = (cardId: string) => {
    const commonProps = {
      cardId,
      isPinned: pinnedCards.has(cardId),
      onTogglePin: togglePinCard,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      isDragging: draggedCard === cardId
    };

    switch (cardId) {
      case "total-favorites":
        return (
          <DashboardCard
            {...commonProps}
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

      case "top-product":
        return (
          <DashboardCard
            {...commonProps}
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
        );

      case "top-fabric":
        return (
          <DashboardCard
            {...commonProps}
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
        );

      case "top-frame":
        return (
          <DashboardCard
            {...commonProps}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <h3 style={{ color: "#42A5F5", margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Top Frame</h3>
            <div style={{ color: "#42A5F5", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}>
              {frameColorData.length > 0 ? frameColorData[0].color : "Loading..."}
            </div>
            <div style={{ color: "#666", fontSize: "0.9rem" }}>
              {frameColorData.length > 0 ? `${frameColorData[0].count} selections` : ""}
            </div>
          </DashboardCard>
        );

      case "favorite-products-chart":
        return (
          <DashboardCard
            {...commonProps}
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
        );

      case "fabric-colors-chart":
        return (
          <DashboardCard
            {...commonProps}
            onClick={() => setEnlargedChart({
              type: 'pie',
              title: 'Most Chosen Fabric Colors',
              data: fabricColorData.length > 0
                ? fabricColorData.map((v) => ({ 
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
        );

      case "frame-colors-chart":
        return (
          <DashboardCard
            {...commonProps}
            onClick={() => setEnlargedChart({
              type: 'pie',
              title: 'Most Chosen Frame Colors',
              data: frameColorData.length > 0
                ? frameColorData.map((v) => ({ 
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
        );

      case "visitors-analytics":
        return (
          <DashboardCard
            {...commonProps}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <h3 style={{ color: "#42A5F5", margin: "0 0 1rem 0", fontSize: "1rem" }}>Visitors</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {countryData.slice(0, 3).map((country) => (
                <div key={country.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#42A5F5", fontSize: "0.9rem" }}>{country.id}</span>
                  <span style={{ color: "#42A5F5", fontWeight: "bold", fontSize: "0.9rem" }}>{country.value}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        );

      case "browsers-analytics":
        return (
          <DashboardCard
            {...commonProps}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <h3 style={{ color: "#42A5F5", margin: "0 0 1rem 0", fontSize: "1rem" }}>Browsers</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {browserData.slice(0, 3).map((browser) => (
                <div key={browser.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#42A5F5", fontSize: "0.9rem" }}>{browser.id}</span>
                  <span style={{ color: "#42A5F5", fontWeight: "bold", fontSize: "0.9rem" }}>{browser.value}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        );

      case "devices-analytics":
        return (
          <DashboardCard
            {...commonProps}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <h3 style={{ color: "#42A5F5", margin: "0 0 1rem 0", fontSize: "1rem" }}>Devices</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {deviceData.slice(0, 3).map((device) => (
                <div key={device.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#42A5F5", fontSize: "0.9rem" }}>{device.id}</span>
                  <span style={{ color: "#42A5F5", fontWeight: "bold", fontSize: "0.9rem" }}>{device.value}</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        );

      case "active-now":
        return (
          <DashboardCard
            {...commonProps}
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
        );

      case "conversion-rate":
        return (
          <DashboardCard
            {...commonProps}
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
        );

      case "avg-session":
        return (
          <DashboardCard
            {...commonProps}
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
        );

      case "bounce-rate":
        return (
          <DashboardCard
            {...commonProps}
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
        );

      case "revenue":
        return (
          <DashboardCard
            {...commonProps}
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
        );

      default:
        return null;
    }
  };
  
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

  return (
    <>
      <style jsx>{`
        @keyframes subtlePulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
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
              top: "45%",
              transform: "translateY(-50%)",
              background: 'transparent',
              border: 'none',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              padding: '8px',
              zIndex: 10,
              opacity: currentPage === 1 ? 0.4 : 1,
              animation: 'subtlePulse 3s ease-in-out infinite'
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))'
              }}
            >
              <path 
                d="M15 18L9 12L15 6" 
                stroke={currentPage === 1 ? '#ccc' : '#666'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              position: "absolute",
              right: "-50px",
              top: "45%",
              transform: "translateY(-50%)",
              background: 'transparent',
              border: 'none',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              padding: '8px',
              zIndex: 10,
              opacity: currentPage === totalPages ? 0.4 : 1,
              animation: 'subtlePulse 3s ease-in-out infinite'
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))'
              }}
            >
              <path 
                d="M9 18L15 12L9 6" 
                stroke={currentPage === totalPages ? '#ccc' : '#666'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gridTemplateRows: "200px 300px 200px",
            gap: "1rem",
            height: "calc(100vh - 150px)" // Fit above the fold
          }}>
          {/* Render cards in custom order */}
          {cardOrder[currentPage]?.map((cardId) => (
            <React.Fragment key={cardId}>
              {renderCard(cardId)}
            </React.Fragment>
          ))}
          
          {/* Show pinned cards from other pages */}
          {currentPage === 2 && Array.from(pinnedCards).map((cardId) => {
            // Only show pinned cards that are not in the current page order
            if (!cardOrder[currentPage]?.includes(cardId)) {
              return (
                <React.Fragment key={`pinned-${cardId}`}>
                  {renderCard(cardId)}
                </React.Fragment>
              );
            }
            return null;
          })}

          {/* Page 2 placeholder if no cards */}
          {currentPage === 2 && (!cardOrder[currentPage] || cardOrder[currentPage].length === 0) && (
            <div style={{ gridColumn: "1 / 5", textAlign: "center", color: "#42A5F5", fontSize: "1.2rem" }}>
              🚧 Page 2 - Performance Analytics Dashboard 🚧
            </div>
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
                  data={enlargedChart.data as Array<{ id: string; value: number }>}
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
                      const data = enlargedChart.data as Array<{ id: string; value: number }>;
                      const colors = assignFrameColors(data.map(d => ({ color: d.id, count: d.value })));
                      const index = data.findIndex(item => item.id === datum.id);
                      return colors[index] || frameColorspalette[0];
                    }
                    // Fallback to config colors for other charts
                    const data = enlargedChart.data as Array<{ id: string; value: number }>;
                    const colors = enlargedChart.config.colors as string[];
                    return colors[data.findIndex(item => item.id === datum.id)] || colors[0];
                  }}
                  defs={enlargedChart.config.defs as Array<{ id: string; [key: string]: unknown }>}
                  fill={enlargedChart.config.fill as Array<{ id: string; match: Record<string, unknown> }>}
                  animate={true}
                />
              )}
              {enlargedChart.type === 'bar' && (
                <ResponsiveBar
                  data={enlargedChart.data as Array<{ product_name: string; favorite_count: number }>}
                  theme={chartTheme}
                  keys={['favorite_count']}
                  indexBy="product_name"
                  margin={{ top: 60, right: 130, bottom: 80, left: 80 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={(datum) => {
                    const data = enlargedChart.data as Array<{ product_name: string; favorite_count: number }>;
                    const colors = assignBarColors(data);
                    const index = data.findIndex(item => item.product_name === datum.indexValue);
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
    </>
  );
}