"use client";

import React from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserRole } from "@/lib/types/user";
import {
  onAuthStateChanged,
  getIdTokenResult,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth, useDb } from "@/firebase";
import { normalizeRole } from "@/lib/constants/roles";
import {
  managedAddressIdFromData,
  managedCenterIdsFromData,
} from "@/lib/access-control";

/* =========================
   Store: simulated role (sessionStorage)
========================= */

interface SimulatedRoleState {
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
  reset: () => void;
}

const useSimulatedRoleStore = create<SimulatedRoleState>()(
  persist(
    (set) => ({
      simulatedRole: null,
      setSimulatedRole: (role) => set({ simulatedRole: role }),
      reset: () => set({ simulatedRole: null }),
    }),
    {
      name: "simulated-role-storage",
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
    }
  )
);

/* =========================
   Helpers
========================= */

// Logic moved to src/lib/constants/roles.ts

type RoleAccess = {
  role: UserRole | null;
  managedAddressId: string | null;
  managedCenterIds: string[];
};

const EMPTY_ACCESS: RoleAccess = {
  role: null,
  managedAddressId: null,
  managedCenterIds: [],
};

function rolesShareOperationalScope(
  first: UserRole | null,
  second: UserRole | null
): boolean {
  if (!first || !second) return true;
  if (first === second) return true;

  const managerRoles: UserRole[] = ["manager", "manager_paris", "manager_orly"];
  const secretaryRoles: UserRole[] = ["secretary_paris", "secretary_orly"];

  return (
    (managerRoles.includes(first) && managerRoles.includes(second)) ||
    (secretaryRoles.includes(first) && secretaryRoles.includes(second))
  );
}

function mergeAccessSources(claims: RoleAccess, profile: RoleAccess): RoleAccess {
  const role =
    !claims.role || claims.role === "client"
      ? profile.role ?? claims.role
      : claims.role;
  const canUseProfileScope = rolesShareOperationalScope(claims.role, profile.role);
  const managedCenterIds = Array.from(
    new Set([
      ...claims.managedCenterIds,
      ...(canUseProfileScope ? profile.managedCenterIds : []),
    ])
  );

  return {
    role,
    managedCenterIds,
    managedAddressId:
      (canUseProfileScope ? profile.managedAddressId : null) ??
      claims.managedAddressId ??
      managedCenterIds[0] ??
      null,
  };
}

function accessFromData(data: any, fallbackRole?: UserRole | null): RoleAccess {
  const role = normalizeRole(data?.role) ?? fallbackRole ?? null;
  const managedCenterIds = managedCenterIdsFromData(data, role);

  return {
    role,
    managedAddressId: managedAddressIdFromData(data, role),
    managedCenterIds,
  };
}

async function fetchAccessFromClaims(
  user: FirebaseUser,
  forceRefresh = false
): Promise<RoleAccess> {
  try {
    const tokenRes = await getIdTokenResult(user, forceRefresh);
    return accessFromData(tokenRes?.claims);
  } catch (e) {
    console.error("Error fetching user role from claims:", e);
    return EMPTY_ACCESS;
  }
}

async function fetchAccessFromFirestore(
  uid: string,
  db: ReturnType<typeof useDb>
): Promise<RoleAccess> {
  try {
    if (!db) return EMPTY_ACCESS;

    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return EMPTY_ACCESS;

    return accessFromData(snap.data());
  } catch (e: any) {
    if (e?.code === 'permission-denied') {
      return EMPTY_ACCESS;
    }
    console.error('Error fetching user role from Firestore:', e);
    return EMPTY_ACCESS;
  }
}

/* =========================
   Hook
========================= */

export const useRole = (): {
  actualRole: UserRole | null;
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
  displayRole: UserRole | null;
  managedAddressId: string | null;
  managedCenterIds: string[];
  actualManagedAddressId: string | null;
  actualManagedCenterIds: string[];
  isLoading: boolean;
} => {
  const auth = useAuth();
  const db = useDb();

  const [actualRole, setActualRole] = React.useState<UserRole | null>(null);
  const [actualManagedAddressId, setActualManagedAddressId] = React.useState<string | null>(null);
  const [actualManagedCenterIds, setActualManagedCenterIds] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const { simulatedRole, setSimulatedRole, reset } = useSimulatedRoleStore();

  React.useEffect(() => {
    if (auth === null) {
      setIsLoading(false);
      setActualRole(null);
      setActualManagedAddressId(null);
      setActualManagedCenterIds([]);
      reset();
      return;
    }

    if (!auth) return;

    let cancelled = false;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return;

      setIsLoading(true);

      if (!user) {
        setActualRole(null);
        setActualManagedAddressId(null);
        setActualManagedCenterIds([]);
        reset();
        setIsLoading(false);
        return;
      }

      let claimsAccess = await fetchAccessFromClaims(user, false);
      const firestoreAccess = await fetchAccessFromFirestore(user.uid, db);

      if (
        !claimsAccess.role ||
        claimsAccess.role === "client" ||
        (firestoreAccess.role && firestoreAccess.role !== claimsAccess.role)
      ) {
        const refreshedAccess = await fetchAccessFromClaims(user, true);
        if (refreshedAccess.role) claimsAccess = refreshedAccess;
      }

      const access = mergeAccessSources(claimsAccess, firestoreAccess);

      let role = access.role;
      if (!role) {
        role = "client";
      }

      setActualRole(role);
      setActualManagedAddressId(access.managedAddressId);
      setActualManagedCenterIds(access.managedCenterIds);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [auth, db, reset]);

  // Reset simulation if actual role is no longer super_admin
  React.useEffect(() => {
    if (actualRole && actualRole !== "super_admin" && simulatedRole) {
      setSimulatedRole(null);
    }
  }, [actualRole, simulatedRole, setSimulatedRole]);

  const displayRole: UserRole | null =
    actualRole === "super_admin" ? simulatedRole ?? actualRole : actualRole;

  const displayAccess = React.useMemo(() => {
    if (actualRole === "super_admin" && simulatedRole) {
      return {
        managedAddressId: managedAddressIdFromData({ role: simulatedRole }, simulatedRole),
        managedCenterIds: managedCenterIdsFromData({ role: simulatedRole }, simulatedRole),
      };
    }

    return {
      managedAddressId: actualManagedAddressId,
      managedCenterIds: actualManagedCenterIds,
    };
  }, [actualRole, simulatedRole, actualManagedAddressId, actualManagedCenterIds]);

  return {
    actualRole,
    simulatedRole,
    setSimulatedRole,
    displayRole,
    managedAddressId: displayAccess.managedAddressId,
    managedCenterIds: displayAccess.managedCenterIds,
    actualManagedAddressId,
    actualManagedCenterIds,
    isLoading,
  };
};
