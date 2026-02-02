import Share from 'react-native-share';
import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { formatarData } from '../utils/formatarData';

export async function compartilharRelatorio({ registros, registrosPressao, registrosPeso, atividadesFisicas, registrosAgua, alertas, sintomasTexto }) {
  try {
    const opcoes = ['📘 JSON', '🧾 CSV', '📝 TXT', 'Cancelar'];

    Alert.alert(
      'Compartilhar relatório',
      'Escolha o formato de compartilhamento:',
      opcoes.slice(0, 3).map((opcao) => ({
        text: opcao,
        onPress: () => compartilharComo(opcao, { registros, registrosPressao, registrosPeso, atividadesFisicas, registrosAgua, alertas, sintomasTexto }),
      })),
      { cancelable: true }
    );
  } catch (erro) {
    console.error('Erro ao exibir opções de compartilhamento:', erro);
  }
}

async function compartilharComo(formato, { registros, registrosPressao, registrosPeso, atividadesFisicas, registrosAgua, alertas, sintomasTexto }) {
  const conteudoTexto = [
    '📊 Relatório de Glicemia',
    '',
    '🔔 Alertas:',
    ...alertas,
    '',
    'Conclusões sobre sintomas:',
    ...sintomasTexto,
    '',
    '📋 Registros de Glicemia:',
    ...registros.map(r => {
      const dataFormatada = formatarData(r.timestamp);
      const sintomasTxt = (r.sintomas && r.sintomas.length > 0) ? ` com sintomas: ${r.sintomas.join(', ')}` : '';
      return `• ${r.valor ?? '---'} mg/dL em ${dataFormatada}${sintomasTxt}`;
    }),
    '',
    '📋 Registros de Pressão:',
    ...registrosPressao.map(p => {
      const dataFormatada = formatarData(p.timestamp);
      return `• ${p.sistolica ?? '---'}/${p.diastolica ?? '---'} mmHg em ${dataFormatada} (${p.classificacao ?? '---'})${p.observacao ? ` | Obs: ${p.observacao}` : ''}`;
    }),
    '',
    '🏋️‍♂️ Atividades Físicas:',
    ...atividadesFisicas.map(a => `• ${a.minutos ?? 0} minutos de ${a.tipo ?? 'atividade'} em ${formatarData(a.timestamp)}`),
    '',
    '💧 Consumo de Água:',
    ...registrosAgua.map(a => `• ${a.quantidade ?? 0} ml em ${formatarData(a.timestamp)}`),
    '',
    '⚖️ Registros de Peso:',
    ...registrosPeso.map(p => `• ${p.peso ?? '---'} kg em ${formatarData(p.timestamp)}`),
  ].join('\n');

  const pasta = RNFS.TemporaryDirectoryPath;
  let caminhoArquivo = '';
  let mimeType = '';

  try {
    if (formato.includes('JSON')) {
      const conteudoJSON = {
        alertas,
        sintomas: sintomasTexto,
        glicemia: registros.map(r => ({
          valor: r.valor ?? null,
          data: formatarData(r.timestamp),
          sintomas: r.sintomas ?? []
        })),
        pressao: registrosPressao.map(p => ({
          sistolica: p.sistolica ?? null,
          diastolica: p.diastolica ?? null,
          data: formatarData(p.timestamp),
          classificacao: p.classificacao ?? '',
          observacao: p.observacao ?? ''
        })),
        atividadesFisicas: atividadesFisicas.map(a => ({
          tipo: a.tipo ?? '',
          minutos: a.minutos ?? 0,
          data: formatarData(a.timestamp)
        })),
        agua: registrosAgua.map(a => ({
          quantidade: a.quantidade ?? 0,
          data: formatarData(a.timestamp)
        })),
        peso: registrosPeso.map(p => ({
          peso: p.peso ?? null,
          data: formatarData(p.timestamp)
        })),
        geradoEm: new Date().toISOString()
      };

      const jsonString = JSON.stringify(conteudoJSON, null, 2);
      caminhoArquivo = `${pasta}/relatorio_completo.json`;
      await RNFS.writeFile(caminhoArquivo, jsonString, 'utf8');
      mimeType = 'application/json';

    } else if (formato.includes('CSV')) {
      const csvPath = `${pasta}/relatorio_completo.csv`;
      let csvConteudo = 'Tipo,Data,Valor/Sistólica,Diastólica,Sintomas,Classificação,Observação\n';

      registros.forEach(r => {
        const data = formatarData(r.timestamp);
        const sintomas = (r.sintomas || []).join('; ');
        csvConteudo += `"Glicemia","${data}","${r.valor ?? ''}","","${sintomas}","",""\n`;
      });

      registrosPressao.forEach(p => {
        const data = formatarData(p.timestamp);
        csvConteudo += `"Pressão","${data}","${p.sistolica ?? ''}","${p.diastolica ?? ''}","","${p.classificacao ?? ''}","${p.observacao ?? ''}"\n`;
      });

      atividadesFisicas.forEach(a => {
        const data = formatarData(a.timestamp);
        csvConteudo += `"Atividade Física","${data}","${a.minutos ?? 0}","","","${a.tipo ?? ''}",""\n`;
      });

      registrosAgua.forEach(a => {
        const data = formatarData(a.timestamp);
        csvConteudo += `"Água","${data}","${a.quantidade ?? 0}","","","",""\n`;
      });

      registrosPeso.forEach(p => {
        const data = formatarData(p.timestamp);
        csvConteudo += `"Peso","${data}","${p.peso ?? 0}","","","",""\n`;
      });

      await RNFS.writeFile(csvPath, '\uFEFF' + csvConteudo, 'utf8');
      caminhoArquivo = csvPath;
      mimeType = 'text/csv';

    } else if (formato.includes('TXT')) {
      const txtPath = `${pasta}/relatorio_completo.txt`;
      await RNFS.writeFile(txtPath, '\uFEFF' + conteudoTexto, 'utf8');
      caminhoArquivo = txtPath;
      mimeType = 'text/plain';
    }

    await Share.open({
      title: 'Compartilhar Relatório',
      url: `file://${caminhoArquivo}`,
      type: mimeType
    });

  } catch (erro) {
    console.error('Erro ao compartilhar arquivo:', erro);
    Alert.alert('Erro', 'Não foi possível gerar o arquivo.');
  }
}
