"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/index";
import { HermesClient } from "@pythnetwork/hermes-client";
import TokenPriceChart from "@/components/chart";

// Price feed types for hermes feed
interface PriceInfo {
  price: string;
  conf: string;
  expo: number;
  publish_time: number;
}

interface PythMetadata {
  slot: number;
  proof_available_time: number;
  prev_publish_time: number;
}

interface PythParsedPrice {
  id: string;
  price: PriceInfo;
  ema_price: PriceInfo;
  metadata: PythMetadata;
}

interface PythBinaryData {
  encoding: "hex";
  data: string[];
}

interface PythWebSocketResponse {
  binary: PythBinaryData;
  parsed: PythParsedPrice[];
}

// Trade data type for chart
type TradeData = {
  date: number;
  price: number;
};

// Price feed component
const PythPriceFeed = () => {
  // Price feed state. Only use the SETTERS to update the state in the useEffect.
  // Depending on the values will cause the component to re-render, and re-start the websocket connection.
  const [price, setPrice] = useState<string>("Loading...");
  const [priceInDecimal, setPriceInDecimal] = useState<number>(0);
  const [priceDelta, setPriceDelta] = useState<number>(0);
  const [tradeData, setTradeData] = useState<TradeData[]>([]);

  useEffect(() => {
    // SOL/USD price feed ID on Pyth mainnet
    const connection = new HermesClient("https://hermes.pyth.network", {});
    let lastPrice = 0;
    // SOL/USD price feed ID on Pyth mainnet
    const priceId =
      "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
    // Hold a local array of trade data to pass to the chart
    const tradeDataInner: TradeData[] = [];
    let eventSource: EventSource;
    // The getPriceUpdatesStream function is async, so to await it we need to call it.
    // Use effects cannot be async, so we need to define a new function and call it.
    const startConnection = async () => {
      // Get the price updates stream for the price ID
      eventSource = await connection.getPriceUpdatesStream([priceId]);

      // The eventSource.onmessage function is called when a new price update is received.
      eventSource.onmessage = (event: any) => {
        const data: PythWebSocketResponse = JSON.parse(event.data);
        console.log("Received price update:", data);
        //  Raw price with 8 decimals
        setPrice(data.parsed[0].price.price);
        // Price in decimal with 8 decimals
        const newPriceInDecimal = Number(data.parsed[0].price.price) / 10 ** 8;
        setPriceInDecimal(newPriceInDecimal);
        // Price delta
        setPriceDelta(newPriceInDecimal - lastPrice);
        lastPrice = newPriceInDecimal;
        // Trade data for chart
        tradeDataInner.push({
          date: data.parsed[0].ema_price.publish_time,
          price: newPriceInDecimal,
        });
        setTradeData(tradeDataInner);
      };
      // The eventSource.onerror function is called when an error occurs.
      eventSource.onerror = (error: any) => {
        console.error("Error receiving updates:", error);
        eventSource.close();
      };

      await new Promise((resolve) => setTimeout(resolve, 5000));
    };
    // Start the connection
    startConnection();

    // To stop listening to the updates, you can call eventSource.close()
    return () => {
      // If the eventSource is still open, close it when the component unmounts
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>SOL/USD Price Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{price}</div>
          <div
            className={`text-2xl font-bold ${
              priceDelta > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {/* Price in decimal with 8 decimals */}${priceInDecimal.toFixed(8)}{" "}
            {priceDelta > 0 ? " ↑ $" : " ↓ $"}
            {priceDelta.toFixed(8).replace("-", "")}
          </div>
        </div>
        <TokenPriceChart data={tradeData} />
      </CardContent>
    </Card>
  );
};

export default PythPriceFeed;
