/**
 * Integrações no Nest (substitui Edge Functions onde aplicável).
 */

import api, { ApiRequestError } from "@/services/api";

export type ValidateCnpjCompany = {
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  situacao_cadastral: string | null;
  municipio: string | null;
  uf: string | null;
  telefone: string | null;
  atividade_principal: string | null;
};

export type ValidateCnpjResponse =
  | { valid: false; error: string }
  | { valid: true; company?: ValidateCnpjCompany };

export async function validateCnpj(
  cnpjDigitsOrMasked: string,
): Promise<ValidateCnpjResponse> {
  try {
    return await api.post<ValidateCnpjResponse>(
      "/api/integrations/validate-cnpj",
      { cnpj: cnpjDigitsOrMasked },
    );
  } catch (e) {
    if (e instanceof ApiRequestError) {
      return { valid: false, error: e.message };
    }
    throw e;
  }
}
