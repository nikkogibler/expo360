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
  getPageViews,
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

  useEffect(() => {
    // Get all customer favorites data and count ourselves
    supabase
      .from("customer_favorites")
      .select("product_id")
      .then((res) => {
        console.log('Customer favorites response:', res);
        if (res.error) {
          console.error('Supabase error (customer_favorites):', res.error);
          setFavoriteData([]);
        } else if (res.data) {
          console.log('Raw customer_favorites data:', res.data);
          
          // Count occurrences of each product_id
          const productCounts: Record<string, number> = {};
          res.data.forEach((row: any) => {
            if (row.product_id) {
              productCounts[row.product_id] = (productCounts[row.product_id] || 0) + 1;
            }
          });
          
          console.log('Product counts:', productCounts);
          
          // Get the product IDs and sort by count
          const sortedProductIds = Object.entries(productCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([productId, count]) => ({ productId, count }));
          
          console.log('Top 10 product IDs:', sortedProductIds);
          
          // Now fetch the actual product names for these IDs
          if (sortedProductIds.length > 0) {
            const productIds = sortedProductIds.map(p => p.productId);
            console.log('Fetching product names for IDs:', productIds);
            supabase
              .from("products")
              .select("id, name")
              .in("id", productIds)
              .then((productRes) => {
                console.log('Product names response:', productRes);
                if (productRes.error) {
                  console.error('Error fetching product names:', productRes.error);
                  // Fallback to using IDs
                  const fallbackData = sortedProductIds.map(p => ({
                    product_name: `Product ${p.productId.slice(0, 8)}...`,
                    favorite_count: p.count
                  }));
                  setFavoriteData(fallbackData);
                } else if (productRes.data) {
                  console.log('Product names data:', productRes.data);
                  
                  // Create a map of product ID to product name
                  const productNameMap: Record<string, string> = {};
                  productRes.data.forEach((product: any) => {
                    productNameMap[product.id] = product.name;
                  });
                  
                  console.log('Product name map:', productNameMap);
                  
                  // Combine counts with product names
                  const favoriteProducts = sortedProductIds.map(p => ({
                    product_name: productNameMap[p.productId] || `Product ${p.productId.slice(0, 8)}...`,
                    favorite_count: p.count
                  }));
                  
                  console.log('Final favorite products with names:', favoriteProducts);
                  setFavoriteData(favoriteProducts);
                }
              });
          } else {
            setFavoriteData([]);
          }
        }
      });
    supabase
      .from("customer_favorites")
      .select("fabric_color, frame_color")
      .then((res) => {
        if (res.error) {
          console.error('Supabase error (customer_favorites):', res.error);
        }
        // Count occurrences of each fabric_color
        const fabricMap: Record<string, number> = {};
        // Count occurrences of each frame_color
        const frameMap: Record<string, number> = {};
        (res.data ?? []).forEach((row: { fabric_color?: string; frame_color?: string }) => {
          if (row.fabric_color) {
            fabricMap[row.fabric_color] = (fabricMap[row.fabric_color] || 0) + 1;
          }
          if (row.frame_color) {
            frameMap[row.frame_color] = (frameMap[row.frame_color] || 0) + 1;
          }
        });
        console.log('Fabric color data:', fabricColorData);
        setFabricColorData(Object.entries(fabricMap).map(([color, count]) => ({ color, count })));
        console.log('Frame color data:', frameColorData);
        setFrameColorData(Object.entries(frameMap).map(([color, count]) => ({ color, count })));
      });
    supabase
      .rpc("get_product_views_over_time")
      .then((res) => setViewsData(res.data ?? []));
    
    // Load Vercel Analytics data
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
    
    supabase
      .rpc("get_customer_journey_funnel")
      .then((res) => setFunnelData(res.data ?? []));
    // Live Metrics (stub, replace with real-time source)
    setLiveMetrics({ visitors: Math.floor(Math.random() * 100) });
  }, []);

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
      <div style={{ margin: "2rem 0" }}>
        <h2 style={{ color: "#4B2E09" }}>Top 10 Most Favorited Products</h2>
          <div style={{ width: "100vw", maxWidth: "100%", height: 300, overflowX: "auto" }}>
            <ResponsiveBar
              data={favoriteData.length > 0 ? favoriteData : [{ product_name: "No Data", favorite_count: 0 }]}
              keys={["favorite_count"]}
              indexBy="product_name"
              margin={{ top: 40, right: 40, bottom: 80, left: 60 }}
              padding={0.3}
              colors={["#FF6F61", "#FFB347", "#FFD700", "#B0E57C", "#50BFE6", "#FF7F50", "#C2B280", "#B565A7", "#009B77", "#DD4124"]}
              axisBottom={{ tickRotation: 45 }}
              theme={{ axis: { ticks: { text: { fill: "#4B2E09" } } } }}
            />
          </div>
      </div>
      <div style={{ margin: "2rem 0", display: "flex", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "#4B2E09" }}>Most Chosen Fabric Colors</h2>
          <div style={{ width: "100%", height: 350, padding: "1rem 0" }}>
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
              theme={{ labels: { text: { fill: "#4B2E09" } } }}
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "#4B2E09" }}>Most Chosen Frame Colors</h2>
          <div style={{ width: "100%", height: 350, padding: "1rem 0" }}>
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
              theme={{ labels: { text: { fill: "#4B2E09" } } }}
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
    </div>
  );
}
