import { Injectable, Logger } from '@nestjs/common';

const BRASIL_API_CNPJ = 'https://brasilapi.com.br/api/cnpj/v1';

export type CnpjCompanyPayload = {
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  situacao_cadastral: string | null;
  data_situacao_cadastral: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  atividade_principal: string | null;
  porte: string | null;
  natureza_juridica: string | null;
};

export type ValidateCnpjResponse =
  | { valid: false; error: string }
  | { valid: true; company?: CnpjCompanyPayload };

/**
 * Validação de dígitos verificadores + consulta BrasilAPI (mesma lógica da Edge `validate-cnpj`).
 */
@Injectable()
export class CnpjService {
  private readonly logger = new Logger(CnpjService.name);

  validateCnpj(raw: string): ValidateCnpjResponse {
    const cleanCNPJ = raw.replace(/\D/g, '');

    if (!cleanCNPJ) {
      return { valid: false, error: 'CNPJ é obrigatório' };
    }

    if (!this.validateCNPJFormat(cleanCNPJ)) {
      return { valid: false, error: 'CNPJ inválido' };
    }

    return { valid: true };
  }

  async lookupReceita(cleanCNPJ: string): Promise<ValidateCnpjResponse> {
    const formatCheck = this.validateCnpj(cleanCNPJ);
    if (!formatCheck.valid) {
      return formatCheck;
    }

    this.logger.debug(`BrasilAPI lookup CNPJ ${cleanCNPJ}`);

    let response: Response;
    try {
      response = await fetch(`${BRASIL_API_CNPJ}/${cleanCNPJ}`, {
        headers: { Accept: 'application/json' },
      });
    } catch (e) {
      this.logger.warn(`BrasilAPI fetch failed: ${e}`);
      return {
        valid: false,
        error: 'Erro ao validar CNPJ. Tente novamente.',
      };
    }

    if (!response.ok) {
      if (response.status === 404) {
        return { valid: true };
      }
      this.logger.warn(`BrasilAPI status ${response.status}`);
      return {
        valid: false,
        error: 'Erro ao consultar CNPJ. Tente novamente.',
      };
    }

    const data = (await response.json()) as Record<string, unknown>;

    return {
      valid: true,
      company: {
        razao_social: String(data.razao_social ?? ''),
        nome_fantasia: data.nome_fantasia != null ? String(data.nome_fantasia) : null,
        cnpj: String(data.cnpj ?? cleanCNPJ),
        situacao_cadastral:
          data.descricao_situacao_cadastral != null
            ? String(data.descricao_situacao_cadastral)
            : null,
        data_situacao_cadastral:
          data.data_situacao_cadastral != null
            ? String(data.data_situacao_cadastral)
            : null,
        logradouro: data.logradouro != null ? String(data.logradouro) : null,
        numero: data.numero != null ? String(data.numero) : null,
        complemento:
          data.complemento != null ? String(data.complemento) : null,
        bairro: data.bairro != null ? String(data.bairro) : null,
        municipio: data.municipio != null ? String(data.municipio) : null,
        uf: data.uf != null ? String(data.uf) : null,
        cep: data.cep != null ? String(data.cep) : null,
        telefone:
          data.ddd_telefone_1 != null ? String(data.ddd_telefone_1) : null,
        email: data.email != null ? String(data.email) : null,
        atividade_principal:
          data.cnae_fiscal_descricao != null
            ? String(data.cnae_fiscal_descricao)
            : null,
        porte: data.porte != null ? String(data.porte) : null,
        natureza_juridica:
          data.natureza_juridica != null
            ? String(data.natureza_juridica)
            : null,
      },
    };
  }

  private validateCNPJFormat(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, '');

    if (cleanCNPJ.length !== 14) return false;

    if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

    let size = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, size);
    const digits = cleanCNPJ.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i), 10) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0), 10)) return false;

    size = size + 1;
    numbers = cleanCNPJ.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i), 10) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1), 10)) return false;

    return true;
  }
}
