export function validarMedicao(valor: string, categoria: string): string | null {
  if (!valor || isNaN(Number(valor))) return 'Valor inválido';
  if (!categoria) return 'Categoria é obrigatória';
  return null;
}

export function validarRefeicao(tipo: string, calorias: string): string | null {
  if (!tipo) return 'Tipo de refeição é obrigatório';
  if (!calorias || isNaN(Number(calorias))) return 'Calorias inválidas';
  return null;
}
