import { launchImageLibrary } from 'react-native-image-picker';
import { analisarImagemRefeicao } from './analiseImagemIA';

export const analisarImagem = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    includeBase64: true,
  });

  if (!result.assets || result.assets.length === 0) return null;

  const asset = result.assets[0];
  if (!asset.base64) throw new Error('Não foi possível obter a imagem em base64.');

  const texto = await analisarImagemRefeicao(asset.base64, asset.type);
  return texto;
};
