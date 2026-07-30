import { where } from "firebase/firestore";

import { legacyCenterKey, normalizeCenterId } from "@/lib/access-control";

export type AdminNotificationKind =
  | "signup"
  | "mail"
  | "follow_up"
  | "daily_summary"
  | "system";

export type AdminNotificationTone = "blue" | "emerald" | "amber" | "rose" | "slate";

export type ActivityLogNotificationSource = {
  id: string;
  type?: string | null;
  actorRole?: string | null;
  centerId?: string | null;
  centerKey?: string | null;
  centerIds?: string[] | null;
  addressKey?: string | null;
  locationKey?: string | null;
  requestUid?: string | null;
  clientId?: string | null;
  clientUid?: string | null;
  targetUid?: string | null;
  mailId?: string | null;
  to?: string | null;
  subject?: string | null;
  reason?: string | null;
  error?: string | null;
  recipientCount?: number | null;
  candidateCount?: number | null;
  emailQueueId?: string | null;
  createdAt?: unknown;
};

export type AdminNotificationSignal = {
  id: string;
  kind: AdminNotificationKind;
  title: string;
  description: string;
  href: string;
  createdAt?: ActivityLogNotificationSource["createdAt"];
  centerLabel: string;
  tone: AdminNotificationTone;
};

export function activityLogDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof (value as any)?.toDate === "function") return (value as any).toDate();
  if (typeof (value as any)?.seconds === "number") {
    return new Date((value as any).seconds * 1000);
  }

  const date = new Date(value as any);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function activityLogDateOrNow(value: unknown): Date {
  return activityLogDate(value) ?? new Date();
}

export function formatActivityLogDate(value: unknown) {
  const date = activityLogDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function activityLogCenterLabel(log: ActivityLogNotificationSource) {
  const raw =
    log.centerId ||
    log.centerKey ||
    log.addressKey ||
    log.locationKey ||
    (log.centerIds?.length === 1 ? log.centerIds[0] : "");

  if ((log.centerIds?.length ?? 0) > 1) return "Réseau";

  const centerId = normalizeCenterId(raw);
  if (centerId === "paris_12e") return "Paris 12e";
  if (centerId === "orly_ville") return "Orly";
  return raw || "Réseau";
}

export function buildActivityCenterFilters(centerIds: string[]) {
  const filters: ReturnType<typeof where>[] = [];
  const seen = new Set<string>();

  centerIds.forEach((rawCenterId) => {
    const centerId = normalizeCenterId(rawCenterId);
    if (!centerId || seen.has(centerId)) return;

    seen.add(centerId);
    filters.push(where("centerId", "==", centerId));

    const legacyKey = legacyCenterKey(centerId);
    if (!legacyKey) return;

    filters.push(
      where("centerId", "==", legacyKey),
      where("centerKey", "==", legacyKey),
      where("addressKey", "==", legacyKey),
      where("locationKey", "==", legacyKey)
    );
  });

  return filters.slice(0, 30);
}

export function adminNotificationFromActivityLog(
  log: ActivityLogNotificationSource
): AdminNotificationSignal | null {
  const type = String(log.type ?? "");
  const target =
    log.clientId ||
    log.clientUid ||
    log.requestUid ||
    log.mailId ||
    log.targetUid ||
    "Événement";
  const centerLabel = activityLogCenterLabel(log);

  if (type === "signup.staff_notification_queued") {
    return {
      id: log.id,
      kind: "signup",
      title: "Alerte inscription envoyée",
      description: `${log.recipientCount ?? 0} destinataire(s) staff pour ${centerLabel}.`,
      href: "/admin/activity",
      createdAt: log.createdAt,
      centerLabel,
      tone: "blue",
    };
  }

  if (type === "signup.staff_notification_skipped") {
    return {
      id: log.id,
      kind: "signup",
      title: "Alerte inscription ignorée",
      description: `Préférence désactivée : ${log.candidateCount ?? 0} membre(s) éligible(s), aucun email staff envoyé.`,
      href: "/admin/activity",
      createdAt: log.createdAt,
      centerLabel,
      tone: "amber",
    };
  }

  if (type === "staff.daily_summary_queued") {
    return {
      id: log.id,
      kind: "daily_summary",
      title: "Résumé quotidien envoyé",
      description: `${log.recipientCount ?? 0} destinataire(s) pour le centre ${centerLabel}.`,
      href: "/admin/activity",
      createdAt: log.createdAt,
      centerLabel,
      tone: "emerald",
    };
  }

  if (type === "mail.received") {
    return {
      id: log.id,
      kind: "mail",
      title: "Nouveau courrier reçu",
      description: `Courrier ${log.mailId || target} enregistré pour ${centerLabel}.`,
      href: "/admin/mails",
      createdAt: log.createdAt,
      centerLabel,
      tone: "emerald",
    };
  }

  if (type === "client.follow_up_prepared" || type === "client.follow_up_sent") {
    return {
      id: log.id,
      kind: "follow_up",
      title: type === "client.follow_up_sent" ? "Relance envoyée" : "Relance à traiter",
      description: log.subject || log.reason || target,
      href: "/admin/clients",
      createdAt: log.createdAt,
      centerLabel,
      tone: type === "client.follow_up_sent" ? "emerald" : "amber",
    };
  }

  if (type === "signup.provisioning_failed") {
    return {
      id: log.id,
      kind: "system",
      title: "Échec de création d'accès client",
      description: log.error || target,
      href: "/admin/activity",
      createdAt: log.createdAt,
      centerLabel,
      tone: "rose",
    };
  }

  if (type === "signup.provisioned") {
    return {
      id: log.id,
      kind: "signup",
      title: "Accès client créé",
      description: target,
      href: "/admin/clients",
      createdAt: log.createdAt,
      centerLabel,
      tone: "blue",
    };
  }

  if (type === "signup.approved" || type === "signup.rejected") {
    return {
      id: log.id,
      kind: "signup",
      title: type === "signup.approved" ? "Dossier approuvé" : "Dossier rejeté",
      description: target,
      href: "/admin/validation",
      createdAt: log.createdAt,
      centerLabel,
      tone: type === "signup.approved" ? "emerald" : "rose",
    };
  }

  return null;
}
