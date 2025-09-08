import { format } from 'date-fns';
import firestore from '@react-native-firebase/firestore';

function formatarData(timestamp) {
  try {
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(data, 'dd/MM/yyyy HH:mm');
  } catch {
    return String(timestamp);
  }
}

async function buscarSintomasPorUsuario(userId, dias = null) {
  let query = firestore().collection('sintomas').where('usuarioId', '==', userId);
  if (dias !== null) {
    const limite = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
    query = query.where('timestamp', '>=', limite);
  }
  const snapshot = await query.orderBy('timestamp', 'asc').get();
  const sintomas = [];
  snapshot.forEach(doc => {
    sintomas.push({ id: doc.id, ...doc.data() });
  });
  return sintomas;
}

async function buscarMedicaoPorId(medicaoId) {
  if (!medicaoId) return null;
  const docSnap = await firestore().collection('medicoes').doc(medicaoId).get();
  if (docSnap.exists) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function prepararRegistrosParaAnalise(userId, dias = null) {
  const sintomas = await buscarSintomasPorUsuario(userId, dias);
  const registros = await Promise.all(
    sintomas.map(async (s) => {
      const medicao = await buscarMedicaoPorId(s.glicemiaId);
      return {
        id: s.id,
        sintomas: Array.isArray(s.sintoma) ? s.sintoma : [],
        valor: medicao?.valor ?? null,
        timestamp: s.timestamp ?? medicao?.timestamp ?? new Date(),
      };
    })
  );

  return registros;
}

export function analisarGlicemia(registros, dias = 3) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return ['Nenhum registro de glicemia para analisar.'];
  }

  registros.sort((a, b) => {
    const dataA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const dataB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return dataA - dataB;
  });

  const alertas = [];
  const agora = new Date();

  let registrosParaAnalisar;
  if (dias == null) {
    registrosParaAnalisar = registros;
  } else {
    const limite = new Date(agora.getTime() - dias * 24 * 60 * 60 * 1000);
    registrosParaAnalisar = registros.filter(r => {
      const dataRegistro = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      return dataRegistro >= limite && dataRegistro <= agora;
    });
  }

  if (registrosParaAnalisar.length === 0) {
    return [`Nenhum registro${dias ? ` recente (últimos ${dias} dias)` : ''} para analisar.`];
  }

  // Hipoglicemia matinal recorrente
  const matinais = registrosParaAnalisar.filter(r => {
    const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
    const hora = data.getHours();
    return hora >= 6 && hora <= 9 && Number(r.valor) < 70;
  });
  if (matinais.length >= 3) {
    alertas.push('⚠️ Possível hipoglicemia recorrente pela manhã (valores abaixo de 70 mg/dL entre 6h e 9h).');
  }

  // Variação brusca
  for (let i = 1; i < registrosParaAnalisar.length; i++) {
    const atual = registrosParaAnalisar[i];
    const anterior = registrosParaAnalisar[i - 1];

    const valorAtual = Number(atual.valor);
    const valorAnterior = Number(anterior.valor);

    const dataAtual = atual.timestamp.toDate ? atual.timestamp.toDate() : new Date(atual.timestamp);
    const dataAnterior = anterior.timestamp.toDate ? anterior.timestamp.toDate() : new Date(anterior.timestamp);

    const diffMinutos = Math.abs(dataAtual - dataAnterior) / 60000;

    if (!isNaN(valorAtual) && !isNaN(valorAnterior) && Math.abs(valorAtual - valorAnterior) >= 50 && diffMinutos <= 120) {
      alertas.push(`⚠️ Variação brusca detectada entre ${formatarData(anterior.timestamp)} e ${formatarData(atual.timestamp)}.`);
    }
  }

  // Queda progressiva
  for (let i = 2; i < registrosParaAnalisar.length; i++) {
    const v1 = Number(registrosParaAnalisar[i - 2].valor);
    const v2 = Number(registrosParaAnalisar[i - 1].valor);
    const v3 = Number(registrosParaAnalisar[i].valor);
    if (!isNaN(v1) && !isNaN(v2) && !isNaN(v3)) {
      if (v1 > v2 && v2 > v3) {
        alertas.push(`⚠️ Queda progressiva detectada entre ${formatarData(registrosParaAnalisar[i - 2].timestamp)}, ${formatarData(registrosParaAnalisar[i - 1].timestamp)} e ${formatarData(registrosParaAnalisar[i].timestamp)}.`);
        break;
      }
    }
  }

  // Muitas medições em 1 hora
  for (let i = 0; i < registrosParaAnalisar.length; i++) {
    const inicio = registrosParaAnalisar[i].timestamp.toDate ? registrosParaAnalisar[i].timestamp.toDate() : new Date(registrosParaAnalisar[i].timestamp);
    let contagem = 1;
    for (let j = i + 1; j < registrosParaAnalisar.length; j++) {
      const atual = registrosParaAnalisar[j].timestamp.toDate ? registrosParaAnalisar[j].timestamp.toDate() : new Date(registrosParaAnalisar[j].timestamp);
      const diffMin = (atual - inicio) / 60000;
      if (diffMin <= 60) contagem++;
      else break;
    }
    if (contagem > 5) {
      alertas.push('⚠️ Muitas medições em curto intervalo (mais de 5 medições em 1 hora).');
      break;
    }
  }

  // Valores extremos
  registrosParaAnalisar.forEach(r => {
    const val = Number(r.valor);
    if (!isNaN(val)) {
      if (val > 400) {
        alertas.push(`⚠️ Valor extremamente alto detectado: ${val} mg/dL em ${formatarData(r.timestamp)}.`);
      } else if (val < 40) {
        alertas.push(`⚠️ Valor extremamente baixo detectado: ${val} mg/dL em ${formatarData(r.timestamp)}.`);
      }
    }
  });

  return alertas.length > 0 ? alertas : ['Nenhum alerta significativo encontrado nos últimos dias.'];
}

export function associarSintomas(registros, dias = 3) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return ['Nenhum registro de glicemia com sintomas para analisar.'];
  }

  const agora = new Date();

  let registrosParaAnalisar;
  if (dias == null) {
    registrosParaAnalisar = registros;
  } else {
    const limite = new Date(agora.getTime() - dias * 24 * 60 * 60 * 1000);
    registrosParaAnalisar = registros.filter(r => {
      const data = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
      return data >= limite && data <= agora;
    });
  }

  if (registrosParaAnalisar.length === 0) {
    return ['Nenhum registro com sintomas nos últimos dias.'];
  }

  const sintomasPorTipo = {};

  registrosParaAnalisar.forEach(r => {
    if (Array.isArray(r.sintomas)) {
      r.sintomas.forEach(s => {
        if (!sintomasPorTipo[s]) sintomasPorTipo[s] = [];
        sintomasPorTipo[s].push(Number(r.valor));
      });
    }
  });

  const analises = [];

  for (const sintoma in sintomasPorTipo) {
    const valores = sintomasPorTipo[sintoma].filter(v => !isNaN(v));
    if (valores.length > 0) {
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;

      let avaliacao = 'normal';
      if (media < 70) {
        avaliacao = 'baixos';
      } else if (media > 180) {
        avaliacao = 'altos';
      }

      analises.push(`🔍 Sintoma "${sintoma}" esteve associado a valores ${avaliacao} de glicemia (média de ${media.toFixed(1)} mg/dL${dias ? ` nos últimos ${dias} dias` : ''}).`);
    }
  }

  return analises.length > 0 ? analises : ['Nenhuma associação significativa entre sintomas e glicemia nos últimos dias.'];
}
