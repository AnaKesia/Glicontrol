export function calcularIntervaloPorFiltro(filtro, mesSelecionado, anoSelecionado) {
  const agora = new Date();

  switch (filtro) {
    case 'ultimos7':
      return { inicio: new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000), fim: agora };
    case 'ultimos30':
      return { inicio: new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000), fim: agora };
    case 'todos':
      return null;
    case 'mesAno':
      if (!mesSelecionado || !anoSelecionado) return null;
      const inicioMes = new Date(anoSelecionado, mesSelecionado - 1, 1, 0, 0, 0);
      const fimMes = mesSelecionado === 12
        ? new Date(anoSelecionado + 1, 0, 1, 0, 0, 0)
        : new Date(anoSelecionado, mesSelecionado, 1, 0, 0, 0);
      return { inicio: inicioMes, fim: fimMes };
    case 'ano':
      if (!anoSelecionado) return null;
      const inicioAno = new Date(anoSelecionado, 0, 1, 0, 0, 0);
      const fimAno = new Date(anoSelecionado + 1, 0, 1, 0, 0, 0);
      return { inicio: inicioAno, fim: fimAno };
    default:
      return null;
  }
}
