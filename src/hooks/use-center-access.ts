"use client";

import * as React from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { useDb } from "@/firebase";
import { useRole } from "@/hooks/use-simulated-role";
import { allAddresses, type AddressStatus } from "@/lib/addresses";
import { isStaffRole, normalizeCenterId } from "@/lib/access-control";

type ManagedCenterState = {
  id: string;
  name: string;
  status: AddressStatus;
};

function buildDefaultCenterState(centerId: string): ManagedCenterState {
  const fallbackAddress = allAddresses.find((address) => normalizeCenterId(address.id) === centerId);

  return {
    id: centerId,
    name: fallbackAddress?.name ?? centerId,
    status: fallbackAddress?.status ?? "active",
  };
}

export function useCenterAccess() {
  const roleState = useRole();
  const db = useDb();

  const normalizedActualManagedCenterIds = React.useMemo(() => {
    return Array.from(
      new Set(
        (roleState.actualManagedCenterIds ?? [])
          .map((centerId) => normalizeCenterId(centerId))
          .filter((centerId): centerId is string => Boolean(centerId))
      )
    );
  }, [roleState.actualManagedCenterIds]);

  const [centersById, setCentersById] = React.useState<Record<string, ManagedCenterState>>({});
  const [isCenterAccessLoading, setIsCenterAccessLoading] = React.useState(false);

  const requiresManagedCenterChecks = React.useMemo(() => {
    return (
      !!roleState.actualRole &&
      roleState.actualRole !== "super_admin" &&
      isStaffRole(roleState.actualRole) &&
      normalizedActualManagedCenterIds.length > 0
    );
  }, [roleState.actualRole, normalizedActualManagedCenterIds]);

  React.useEffect(() => {
    if (!db || !requiresManagedCenterChecks) {
      setCentersById({});
      setIsCenterAccessLoading(false);
      return;
    }

    const expectedIds = new Set(normalizedActualManagedCenterIds);
    setIsCenterAccessLoading(true);

    const fallbackStates = normalizedActualManagedCenterIds.reduce<Record<string, ManagedCenterState>>(
      (acc, centerId) => {
        acc[centerId] = buildDefaultCenterState(centerId);
        return acc;
      },
      {}
    );
    let hasSettled = false;
    const loadingTimeout = window.setTimeout(() => {
      if (hasSettled) return;
      setCentersById(fallbackStates);
      setIsCenterAccessLoading(false);
    }, 5000);

    const unsubscribe = onSnapshot(
      collection(db, "centers"),
      (snapshot) => {
        hasSettled = true;
        window.clearTimeout(loadingTimeout);
        const nextStates = normalizedActualManagedCenterIds.reduce<Record<string, ManagedCenterState>>(
          (acc, centerId) => {
            acc[centerId] = buildDefaultCenterState(centerId);
            return acc;
          },
          {}
        );

        snapshot.docs.forEach((centerDoc) => {
          const centerId = normalizeCenterId(centerDoc.id);
          if (!centerId || !expectedIds.has(centerId)) return;

          const data = centerDoc.data() as Record<string, unknown>;
          nextStates[centerId] = {
            id: centerId,
            name:
              (typeof data.name === "string" && data.name.trim()) ||
              nextStates[centerId]?.name ||
              centerId,
            status: data.status === "inactive" ? "inactive" : "active",
          };
        });

        setCentersById(nextStates);
        setIsCenterAccessLoading(false);
      },
      (error) => {
        hasSettled = true;
        window.clearTimeout(loadingTimeout);
        console.error("[useCenterAccess] Failed to observe centers:", error);
        setCentersById(fallbackStates);
        setIsCenterAccessLoading(false);
      }
    );

    return () => {
      window.clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [db, requiresManagedCenterChecks, normalizedActualManagedCenterIds]);

  React.useEffect(() => {
    if (!isCenterAccessLoading) return;

    const timeout = window.setTimeout(() => {
      setIsCenterAccessLoading(false);
    }, 7000);

    return () => window.clearTimeout(timeout);
  }, [isCenterAccessLoading]);
  const suspendedCenters = React.useMemo(() => {
    return normalizedActualManagedCenterIds
      .map((centerId) => centersById[centerId] ?? buildDefaultCenterState(centerId))
      .filter((center) => center.status === "inactive");
  }, [centersById, normalizedActualManagedCenterIds]);

  const activeActualManagedCenterIds = React.useMemo(() => {
    if (!requiresManagedCenterChecks) return normalizedActualManagedCenterIds;

    return normalizedActualManagedCenterIds.filter((centerId) => {
      const center = centersById[centerId] ?? buildDefaultCenterState(centerId);
      return center.status !== "inactive";
    });
  }, [centersById, normalizedActualManagedCenterIds, requiresManagedCenterChecks]);

  const effectiveManagedCenterIds =
    roleState.actualRole === "super_admin"
      ? roleState.managedCenterIds
      : activeActualManagedCenterIds;

  const effectiveActualManagedAddressId =
    roleState.actualRole === "super_admin"
      ? roleState.actualManagedAddressId
      : activeActualManagedCenterIds[0] ?? null;

  const effectiveManagedAddressId =
    roleState.actualRole === "super_admin"
      ? roleState.managedAddressId
      : effectiveActualManagedAddressId;

  const isBlockedByCenterSuspension =
    requiresManagedCenterChecks &&
    !isCenterAccessLoading &&
    normalizedActualManagedCenterIds.length > 0 &&
    activeActualManagedCenterIds.length === 0;

  const hasPartiallySuspendedCenters =
    requiresManagedCenterChecks &&
    suspendedCenters.length > 0 &&
    activeActualManagedCenterIds.length > 0;

  return {
    ...roleState,
    isLoading: roleState.isLoading || isCenterAccessLoading,
    managedCenterIds: effectiveManagedCenterIds,
    managedAddressId: effectiveManagedAddressId,
    actualManagedCenterIds:
      roleState.actualRole === "super_admin"
        ? roleState.actualManagedCenterIds
        : activeActualManagedCenterIds,
    actualManagedAddressId: effectiveActualManagedAddressId,
    isCenterAccessLoading,
    suspendedCenters,
    hasPartiallySuspendedCenters,
    isBlockedByCenterSuspension,
  };
}
