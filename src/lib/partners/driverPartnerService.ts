import type { PartnerApplication } from "../types";
import { mockPartnerApplications, mockPartners } from "../../data/mockPartners";

let applications: PartnerApplication[] = [...mockPartnerApplications];

export function createPartnerApplication(payload: Omit<PartnerApplication, "id" | "status" | "createdAt">) {
  const application: PartnerApplication = {
    ...payload,
    id: `PA-${Date.now()}`,
    status: "NEW_APPLICATION",
    createdAt: new Date().toISOString(),
  };
  applications = [application, ...applications];
  return application;
}

export function approvePartner(applicationId: string) {
  applications = applications.map((application) =>
    application.id === applicationId ? { ...application, status: "APPROVED" } : application,
  );
  return applications.find((application) => application.id === applicationId);
}

export function rejectPartner(applicationId: string) {
  applications = applications.map((application) =>
    application.id === applicationId ? { ...application, status: "REJECTED" } : application,
  );
  return applications.find((application) => application.id === applicationId);
}

export function getVerifiedDriversByRoute(province: string) {
  return mockPartners.filter((partner) => partner.verificationStatus === "VERIFIED" && partner.provinces.includes(province));
}

export function addPartnerToGroup() {
  return { success: true };
}

export function getPartnerApplications() {
  return applications;
}

