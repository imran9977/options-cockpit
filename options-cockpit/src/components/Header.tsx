import { useEffect, useState } from "react";
import type { CommodityRibbon } from "../models/CommodityRibbon";
import { getCommodityRibbon } from "../services/dhanApi";

function formatIndianNumber(value: number): string {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function CommodityIcon({ name }: { name: string }) {

  switch (name) {

    case "Gold":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <rect x="3" y="7" width="14" height="9" rx="1.5" fill="#D4A017" />
          <rect x="3" y="7" width="14" height="3" rx="1.5" fill="#F2C94C" />
        </svg>
      );

    case "Silver":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <rect x="3" y="7" width="14" height="9" rx="1.5" fill="#9CA3AF" />
          <rect x="3" y="7" width="14" height="3" rx="1.5" fill="#E5E7EB" />
        </svg>
      );

    case "Crude Oil":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 2.5c2.6 3.4 5 6.4 5 9.3a5 5 0 0 1-10 0c0-2.9 2.4-5.9 5-9.3z"
            fill="#3F3F46"
          />
        </svg>
      );

    case "Natural Gas":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 2c1 2.2-1.5 3-1.5 5A2.5 2.5 0 0 0 11 9.5c0-1 .5-1.5.5-1.5.8 1 1.5 2.2 1.5 3.7a4 4 0 1 1-8 0C5 8 8 5.5 10 2z"
            fill="#2563EB"
          />
          <path
            d="M10 2c1 2.2-1.5 3-1.5 5A2.5 2.5 0 0 0 11 9.5c0-1 .5-1.5.5-1.5.8 1 1.5 2.2 1.5 3.7 0 .6-.1 1.1-.3 1.6a2.6 2.6 0 0 0-2.2-4c.3 2-1.5 2.4-1.5 3.9a1.5 1.5 0 0 0 1.3 1.5A2.6 2.6 0 0 1 6 12.7c0-2.6 2.6-5.4 4-10.7z"
            fill="#F97316"
          />
        </svg>
      );

    default:
      return null;
  }
}

function Header() {

  const [commodities, setCommodities] =
    useState<CommodityRibbon[]>([]);

  useEffect(() => {

    async function loadCommodityRibbon() {
      try {
        const response = await getCommodityRibbon();
        setCommodities(response.commodities);
      } catch (error) {
      }
    }

    loadCommodityRibbon();

    const intervalId = setInterval(
      loadCommodityRibbon,
      300000
    );

    return () => clearInterval(intervalId);

  }, []);

  return (
    <header
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid #ddd",
        background: "#ffffff",
      }}
    >
      <h2>
        <img
          src="/logo.svg"
          alt="Logo"
          style={{
            height: "20px",
            marginRight: "12px",
          }}
        />
        Options Cockpit
      </h2>

      <div className="header-commodities">
        {commodities.map((commodity) => (
          <div className="commodity-chip" key={commodity.name}>
            <CommodityIcon name={commodity.name} />
            <span className="commodity-chip-name">{commodity.name}</span>
            <span className="commodity-chip-price">{formatIndianNumber(commodity.ltp)}</span>
            <span
              className={
                commodity.change >= 0
                  ? "commodity-chip-change decision-positive"
                  : "commodity-chip-change decision-negative"
              }
            >
              {commodity.change >= 0 ? "+" : ""}
              {formatIndianNumber(commodity.change)}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}

export default Header;
