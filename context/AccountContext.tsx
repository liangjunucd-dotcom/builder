"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, BuilderSpace, DataCenterRegion, BuilderSpaceRole } from "../lib/account-types";

interface AccountContextType {
  account: Account | null;
  spaces: BuilderSpace[];
  currentSpaceId: string | null;
  setCurrentSpaceId: (id: string) => void;
  currentSpace: BuilderSpace | null;
  createTeamBuilderSpace: (params: { name: string; companyId?: string; region?: DataCenterRegion }) => void;
  upgradeToCompanyBuilderSpace: (params: { companyName: string }) => void;
  setBuilderSpaceParentCompany: (teamSpaceId: string, companyId: string | undefined) => void;
  updateSpace: (spaceId: string, patch: Partial<BuilderSpace>) => void;
  resetToDefault: () => void;
  myRoleInCurrentSpace: BuilderSpaceRole | undefined;
}

const defaultAccount: Account = {
  id: "acc-1",
  name: "Jun",
  email: "jun@example.com",
};

const defaultSpaces: BuilderSpace[] = [
  {
    id: "space-1",
    name: "Jun's Workspace",
    kind: "personal",
    plan: "free",
    members: [{ accountId: "acc-1", role: "owner" }],
    studioIds: ["studio-1", "studio-3"],
    projectIds: ["proj-1"],
    region: "CN",
    createdAt: "2023-01-01T00:00:00Z",
    businessFeatures: false,
  },
  {
    id: "space-2",
    name: "Aqara Delivery Ops",
    kind: "team",
    plan: "team",
    members: [{ accountId: "acc-1", role: "admin" }],
    studioIds: ["studio-2"],
    projectIds: [],
    region: "US",
    createdAt: "2023-02-01T00:00:00Z",
    businessFeatures: true,
  },
];

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(defaultAccount);
  const [spaces, setSpaces] = useState<BuilderSpace[]>(defaultSpaces);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);

  useEffect(() => {
    const storedSpaceId = localStorage.getItem("currentSpaceId");
    if (storedSpaceId && spaces.find((s) => s.id === storedSpaceId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentSpaceId(storedSpaceId);
    } else if (spaces.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentSpaceId(spaces[0].id);
    }
  }, [spaces]);

  const handleSetCurrentSpaceId = (id: string) => {
    setCurrentSpaceId(id);
    localStorage.setItem("currentSpaceId", id);
  };

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || null;

  const myRoleInCurrentSpace = currentSpace?.members.find((m) => m.accountId === account?.id)?.role;

  const createTeamBuilderSpace = ({ name, companyId, region }: { name: string; companyId?: string; region?: DataCenterRegion }) => {
    const newSpace: BuilderSpace = {
      id: `space-${Date.now()}`,
      name,
      kind: "team",
      plan: "team",
      members: [{ accountId: account?.id || "acc-1", role: "owner" }],
      studioIds: [],
      projectIds: [],
      region: region ?? "CN",
      parentCompanyId: companyId,
      createdAt: new Date().toISOString(),
    };
    setSpaces((prev) => [...prev, newSpace]);
    handleSetCurrentSpaceId(newSpace.id);
  };

  const upgradeToCompanyBuilderSpace = ({ companyName }: { companyName: string }) => {
    if (!currentSpace) return;
    
    const newCompanySpace: BuilderSpace = {
      id: `space-${Date.now()}`,
      name: companyName,
      kind: "company",
      plan: "enterprise",
      members: [{ accountId: account?.id || "acc-1", role: "owner" }],
      studioIds: [],
      projectIds: [],
      region: "CN",
      createdAt: new Date().toISOString(),
    };
    
    setSpaces((prev) => {
      const updatedSpaces = prev.map(s => 
        s.id === currentSpace.id ? { ...s, parentCompanyId: newCompanySpace.id } : s
      );
      return [...updatedSpaces, newCompanySpace];
    });
    handleSetCurrentSpaceId(newCompanySpace.id);
  };

  const setBuilderSpaceParentCompany = (teamSpaceId: string, companyId: string | undefined) => {
    setSpaces((prev) => prev.map(s => s.id === teamSpaceId ? { ...s, parentCompanyId: companyId } : s));
  };

  const updateSpace = (spaceId: string, patch: Partial<BuilderSpace>) => {
    setSpaces((prev) => prev.map(s => s.id === spaceId ? { ...s, ...patch } : s));
  };

  const resetToDefault = () => {
    setSpaces([defaultSpaces[0]]);
    handleSetCurrentSpaceId(defaultSpaces[0].id);
  };

  return (
    <AccountContext.Provider
      value={{
        account,
        spaces,
        currentSpaceId,
        setCurrentSpaceId: handleSetCurrentSpaceId,
        currentSpace,
        createTeamBuilderSpace,
        upgradeToCompanyBuilderSpace,
        setBuilderSpaceParentCompany,
        updateSpace,
        resetToDefault,
        myRoleInCurrentSpace,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
