"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { MembershipTier } from "@/lib/billing-types";
import {
  membershipTiers,
  mockAccountMembership,
  mockPersonalCredits,
} from "@/lib/billing-mock";

interface BillingContextType {
  membershipTier: MembershipTier;
  personalCredits: number;
  setMembershipTier: (tier: MembershipTier) => void;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => boolean;
  currentMembership: typeof mockAccountMembership;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const [membershipTier, setMembershipTierState] = useState<MembershipTier>(
    () => mockAccountMembership.tier
  );
  const [personalCredits, setPersonalCredits] = useState<number>(
    () => mockPersonalCredits.available
  );

  const setMembershipTier = useCallback((tier: MembershipTier) => {
    setMembershipTierState(tier);
  }, []);

  const addCredits = useCallback((amount: number) => {
    setPersonalCredits((prev) => prev + amount);
  }, []);

  const deductCredits = useCallback(
    (amount: number): boolean => {
      if (personalCredits < amount) return false;
      setPersonalCredits((prev) => prev - amount);
      return true;
    },
    [personalCredits]
  );

  const currentMembership = membershipTiers[membershipTier] ?? mockAccountMembership;

  const value: BillingContextType = {
    membershipTier,
    personalCredits,
    setMembershipTier,
    addCredits,
    deductCredits,
    currentMembership,
  };

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
}

export function useBilling() {
  const ctx = useContext(BillingContext);
  if (ctx === undefined) {
    throw new Error("useBilling must be used within BillingProvider");
  }
  return ctx;
}
