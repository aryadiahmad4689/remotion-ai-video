import React from "react";
import { AbsoluteFill } from "remotion";
import { ActiveStockVideo } from "./generated/ActiveStockVideo";

/**
 * StockVideoComposition: Master Composition for Microstock Stock Footage
 * Adobe Stock & Shutterstock Compliant (No Audio, 5-6s, 4K/1080p, Seamless Loop)
 */
export const StockVideoComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <ActiveStockVideo />
    </AbsoluteFill>
  );
};
