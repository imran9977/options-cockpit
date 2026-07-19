import { useEffect, useState } from "react";
import type { CommodityRibbon } from "../models/CommodityRibbon";
import { getCommodityRibbon } from "../services/dhanApi";

function MarketRibbon() {

  const [commodities, setCommodities] =
    useState<CommodityRibbon[]>([]);

  useEffect(() => {

    async function loadCommodityRibbon() {
      try {
        const response = await getCommodityRibbon();
        setCommodities(response.commodities);
      } catch (error) {
        console.error(
          "Failed to load commodity ribbon:",
          error
        );
      }
    }

    loadCommodityRibbon();

    const intervalId = setInterval(
      loadCommodityRibbon,
      300000
    );


    return () => clearInterval(intervalId);

  }, []);

  const itemStyle = {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  };

  function formatIndianNumber(value: number) {
    return value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  }

  return (
    <section
      style={{
        display: "flex",
        gap: "28px",
        padding: "12px 24px",
        borderBottom: "1px solid #ddd",
        background: "#fafafa",
        fontSize: "14px",
      }}
    >
      {commodities.map((commodity) => (
        <div
          key={commodity.name}
          style={itemStyle}
        >
          <strong>{commodity.name}</strong>
          <span>{formatIndianNumber(commodity.ltp)}</span>

          <span
            style={{
              color:
                commodity.change >= 0
                  ? "green"
                  : "red",
            }}
          >
            (
            {commodity.change >= 0 ? "+" : ""}
            {formatIndianNumber(commodity.change)}
            )
          </span>
        </div>
      ))}
    </section>
  );
}

export default MarketRibbon;