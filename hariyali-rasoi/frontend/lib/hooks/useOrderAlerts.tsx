"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getOrders, updateOrderStatus } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { startOrderAlarm, stopOrderAlarm } from "@/lib/utils/orderAlarm";
import { buildOrderSummaryText, buildWhatsAppShareLink } from "@/lib/utils/whatsapp";

const POLL_MS = 12_000;
const SOUND_KEY = "hariyali-admin-order-sound";
const WHATSAPP_NOTIFY_KEY = "hariyali-admin-whatsapp-notify";

interface OrderAlertContextValue {
  alertOrders: Order[];
  soundEnabled: boolean;
  whatsappNotifyEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  setWhatsappNotifyEnabled: (value: boolean) => void;
  dismissOrder: (orderId: string) => void;
  acceptOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string) => Promise<void>;
  stopSound: () => void;
}

const OrderAlertContext = createContext<OrderAlertContextValue | null>(null);

function readBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (stored === null) return fallback;
  return stored === "true";
}

function writeBool(key: string, value: boolean) {
  localStorage.setItem(key, String(value));
}

export function OrderAlertProvider({ children }: { children: ReactNode }) {
  const [alertOrders, setAlertOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [whatsappNotifyEnabled, setWhatsappNotifyEnabledState] = useState(true);
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    setSoundEnabledState(readBool(SOUND_KEY, true));
    setWhatsappNotifyEnabledState(readBool(WHATSAPP_NOTIFY_KEY, true));
  }, []);

  const setSoundEnabled = useCallback((value: boolean) => {
    setSoundEnabledState(value);
    writeBool(SOUND_KEY, value);
    if (!value) stopOrderAlarm();
  }, []);

  const setWhatsappNotifyEnabled = useCallback((value: boolean) => {
    setWhatsappNotifyEnabledState(value);
    writeBool(WHATSAPP_NOTIFY_KEY, value);
  }, []);

  const dismissOrder = useCallback((orderId: string) => {
    setAlertOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const stopSound = useCallback(() => {
    stopOrderAlarm();
  }, []);

  const acceptOrder = useCallback(
    async (orderId: string) => {
      await updateOrderStatus(orderId, "accepted");
      dismissOrder(orderId);
    },
    [dismissOrder]
  );

  const rejectOrder = useCallback(
    async (orderId: string) => {
      await updateOrderStatus(orderId, "rejected");
      dismissOrder(orderId);
    },
    [dismissOrder]
  );

  const notifyNewOrder = useCallback(
    (order: Order) => {
      setAlertOrders((prev) => {
        if (prev.some((o) => o.id === order.id)) return prev;
        return [order, ...prev];
      });

      if (soundEnabled) {
        startOrderAlarm();
      }

      if (whatsappNotifyEnabled && !soundEnabled) {
        const link = buildWhatsAppShareLink(buildOrderSummaryText(order));
        if (link) {
          window.open(link, "_blank", "noopener,noreferrer");
        }
      }
    },
    [soundEnabled, whatsappNotifyEnabled]
  );

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const pending = await getOrders("pending");
        if (cancelled) return;

        if (!initialized.current) {
          pending.forEach((o) => seenIds.current.add(o.id));
          initialized.current = true;
          return;
        }

        const fresh = pending.filter((o) => !seenIds.current.has(o.id));
        fresh.forEach((o) => {
          seenIds.current.add(o.id);
          notifyNewOrder(o);
        });
      } catch {
        // ignore poll errors (e.g. logged out)
      }
    };

    void poll();
    const timer = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
      stopOrderAlarm();
    };
  }, [notifyNewOrder]);

  useEffect(() => {
    if (alertOrders.length === 0) {
      stopOrderAlarm();
    } else if (soundEnabled) {
      startOrderAlarm();
    }
  }, [alertOrders.length, soundEnabled]);

  return (
    <OrderAlertContext.Provider
      value={{
        alertOrders,
        soundEnabled,
        whatsappNotifyEnabled,
        setSoundEnabled,
        setWhatsappNotifyEnabled,
        dismissOrder,
        acceptOrder,
        rejectOrder,
        stopSound,
      }}
    >
      {children}
    </OrderAlertContext.Provider>
  );
}

export function useOrderAlerts() {
  const ctx = useContext(OrderAlertContext);
  if (!ctx) {
    throw new Error("useOrderAlerts must be used within OrderAlertProvider");
  }
  return ctx;
}
