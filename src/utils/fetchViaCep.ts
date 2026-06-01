export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const fetchViaCep = async (zipCode: string): Promise<ViaCepResponse | null> => {
  const digits = zipCode.replace(/\D/g, '');

  if (digits.length !== 8) {
    return null;
  }

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro) {
    return null;
  }

  return data;
};
