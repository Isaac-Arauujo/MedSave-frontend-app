export interface CardPaymentPayload {
  token: string;
  paymentMethodId: string;
  issuerId?: string;
  installments: number;
  identificationType?: string;
  identificationNumber?: string;
}

/** Dados retornados pelo Card Payment Brick no onSubmit. */
export interface MercadoPagoCardFormData {
  token: string;
  payment_method_id: string;
  issuer_id?: string;
  installments: number;
  payer?: {
    email?: string;
    identification?: {
      type?: string;
      number?: string;
    };
  };
}

export interface PaymentPublicConfig {
  publicKey: string;
  useMock: boolean;
}
