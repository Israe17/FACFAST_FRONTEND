import type {
  Branch,
  CreateBranchInput,
  CreateTerminalInput,
  Terminal,
  UpdateBranchInput,
  UpdateTerminalInput,
} from "./types";

export const branchSensitiveFieldKeys = [
  "activity_code",
  "provider_code",
  "cert_path",
  "crypto_key",
  "hacienda_username",
  "hacienda_password",
  "mail_key",
  "signature_type",
] as const;

export function stripSensitiveBranchFields<
  T extends CreateBranchInput | UpdateBranchInput,
>(values: T, canConfigure: boolean): T {
  if (canConfigure) {
    return values;
  }

  return Object.fromEntries(
    Object.entries(values).filter(
      ([key]) =>
        !branchSensitiveFieldKeys.includes(
          key as (typeof branchSensitiveFieldKeys)[number],
        ),
    ),
  ) as T;
}

export const emptyBranchFormValues: CreateBranchInput = {
  activity_code: "",
  address: "",
  branch_number: "",
  business_name: "",
  canton: "",
  cedula_juridica: "",
  cert_path: "",
  city: "",
  code: "",
  crypto_key: "",
  district: "",
  email: "",
  hacienda_password: "",
  hacienda_username: "",
  identification_number: "",
  identification_type: undefined,
  is_active: true,
  legal_name: "",
  mail_key: "",
  name: "",
  phone: "",
  provider_code: "",
  province: "",
  signature_type: "",
};

export function getBranchFormValues(branch: Branch): UpdateBranchInput {
  return {
    activity_code: branch.activity_code ?? "",
    address: branch.address ?? "",
    branch_number: branch.branch_number ?? "",
    business_name: branch.business_name ?? "",
    canton: branch.canton ?? "",
    cedula_juridica: branch.cedula_juridica ?? "",
    cert_path: branch.cert_path ?? "",
    city: branch.city ?? "",
    code: branch.code ?? "",
    crypto_key: "",
    district: branch.district ?? "",
    email: branch.email ?? "",
    hacienda_password: "",
    hacienda_username: branch.hacienda_username ?? "",
    identification_number: branch.identification_number ?? "",
    identification_type: branch.identification_type,
    is_active: branch.is_active,
    legal_name: branch.legal_name ?? "",
    mail_key: "",
    name: branch.name ?? "",
    phone: branch.phone ?? "",
    provider_code: branch.provider_code ?? "",
    province: branch.province ?? "",
    signature_type: branch.signature_type ?? "",
  };
}

export const emptyTerminalFormValues: CreateTerminalInput = {
  code: "",
  is_active: true,
  name: "",
  terminal_number: "",
};

export function getTerminalFormValues(terminal: Terminal): UpdateTerminalInput {
  return {
    code: terminal.code ?? "",
    is_active: terminal.is_active,
    name: terminal.name,
    terminal_number: terminal.terminal_number ?? "",
  };
}

export function getBranchSecretState(branch: Branch) {
  return {
    has_crypto_key: branch.has_crypto_key,
    has_hacienda_password: branch.has_hacienda_password,
    has_mail_key: branch.has_mail_key,
  };
}
