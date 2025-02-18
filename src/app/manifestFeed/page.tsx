"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/index";
import TokenPriceChart from "@/components/chart";

// More complex trade data type for chart
type TradeData = {
  date: number;
  price: number;
  volume: number;
  slot: number;
};

// Event type for the feed. Either a fill or a placeOrder
type Event =
  | {
      type: "fill";
      data: FillLogResult;
    }
  | {
      type: "placeOrder";
      data: PlaceOrderLogResult;
    };

const ManifestPriceFeed = () => {
  // Price state. Only use the SETTERS to update the state in the useEffect.
  // Depending on the values will cause the component to re-render, and re-start the websocket connection.
  const [price, setPrice] = useState<number>(0);
  const [priceDelta, setPriceDelta] = useState<number>(0);
  const [tradeData, setTradeData] = useState<TradeData[]>([]);

  useEffect(() => {
    // const feedUrl = "wss://fillfeed-production.up.railway.app";
    const feedUrl = "ws://localhost:1234";
    // Keep track of trades by slot for VWAP calculation
    // VWAP is Volume Weighted Average Price
    const tradesBySlot = new Map<number, TradeData>();
    const processTradeData = (event: Event) => {
      // Get the slot number from the event
      const slotNumber = event.data.slot;
      // Get the price from the event
      const price = Number(
        event.type === "fill" ? event.data.priceAtoms : event.data.price
      );
      // Get the volume from the event
      const volume = Number(event.data.baseAtoms);

      // Get or initialize slot data in the map. We only want one price point per slot.
      const currentSlotData = tradesBySlot.get(slotNumber) || {
        volume: 0,
        price: 0,
        date: Date.now(),
        slot: slotNumber,
      };

      // Update VWAP calculation
      const newTotalVolume = currentSlotData.volume + volume;
      const newWeightedPrice =
        (currentSlotData.price * currentSlotData.volume + price * volume) /
        newTotalVolume;

      const time = currentSlotData.date;

      // Store updated values in the map
      tradesBySlot.set(slotNumber, {
        volume: newTotalVolume,
        price: newWeightedPrice,
        date: time,
        slot: slotNumber,
      });

      // Update the price state
      setPrice(newWeightedPrice);
      setPriceDelta(newWeightedPrice - price);
      const tradeDataInner = Array.from(tradesBySlot.values()).sort(
        (a, b) => a.date - b.date
      );
      // Update trade data with new VWAP price
      setTradeData(tradeDataInner);
    };
    if (!feedUrl) {
      throw new Error("NEXT_PUBLIC_FEED_URL not set");
    }
    const ws = new WebSocket(feedUrl);

    ws.onopen = () => {
      console.log("Connected to server");
    };

    ws.onclose = (event) => {
      console.log("Disconnected from server", event);
    };

    ws.onmessage = async (message): Promise<void> => {
      const event: Event = JSON.parse(message.data);
      if (event.type === "fill") {
        processTradeData(event);
      } else if (event.type === "placeOrder") {
        // Normally we would not process placeOrder events, but since there are not many fills on the manifest market,
        // we will use orders to display the functionality of components and the chart.
        processTradeData(event);
      }
    };

    return () => {
      // If the websocket is still open, close it when the component unmounts
      ws.close();
    };
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Manifest Price Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{price}</div>
          <div
            className={`text-2xl font-bold ${
              priceDelta > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {/* Price delta */}
            {priceDelta > 0 ? " ↑ $" : " ↓ $"}
            {/* Price delta in decimal with 8 decimals */}
            {priceDelta.toFixed(8).replace("-", "")}
          </div>
        </div>
      </CardContent>
      <TokenPriceChart data={tradeData} />
    </Card>
  );
};

export default ManifestPriceFeed;

export type FillLogResult = {
  /** Public key for the market as base58. */
  market: string;
  /** Public key for the maker as base58. */
  maker: string;
  /** Public key for the taker as base58. */
  taker: string;
  /** Number of base atoms traded. */
  baseAtoms: string;
  /** Number of quote atoms traded. */
  quoteAtoms: string;
  /** Price as float. Quote atoms per base atom. Client is responsible for translating to tokens. */
  priceAtoms: number;
  /** Boolean to indicate which side the trade was. */
  takerIsBuy: boolean;
  /** Boolean to indicate whether the maker side is global. */
  isMakerGlobal: boolean;
  /** Sequential number for every order placed / matched wraps around at u64::MAX */
  makerSequenceNumber: string;
  /** Sequential number for every order placed / matched wraps around at u64::MAX */
  takerSequenceNumber: string;
  /** Slot number of the fill. */
  slot: number;
  /** Signature of the tx where the fill happened. */
  signature: string;
};

export type PlaceOrderLogResult = {
  /** Public key for the market as base58. */
  market: string;
  /** Public key for the trader as base58. */
  trader: string;
  /** Number of base atoms traded. */
  baseAtoms: string;
  /** Number of quote atoms traded. */
  price: number;
  /** Sequential number for every order placed / matched wraps around at u64::MAX */
  orderSequenceNumber: string;
  /** Index of the order in the orderbook. */
  orderIndex: number;
  /** Slot number of the order. */
  lastValidSlot: number;
  /** Type of the order. */
  orderType: "limit" | "market";
  /** Boolean to indicate whether the order is a bid. */
  isBid: boolean;
  /** Padding to make the account size 128 bytes. */
  padding: number[];

  /** Slot number of the fill. */
  slot: number;
  /** Signature of the tx where the fill happened. */
  signature: string;
};
