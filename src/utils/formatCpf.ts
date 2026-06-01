export const formatCpf = (cpf: string): string => {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) {
    return cpf;
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};
