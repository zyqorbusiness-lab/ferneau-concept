import { ImageSourcePropType } from 'react-native';
const IMG: Record<string, ImageSourcePropType> = {
  p01: require('../assets/products/p01.webp'), p02: require('../assets/products/p02.webp'),
  p03: require('../assets/products/p03.webp'), p04: require('../assets/products/p04.webp'),
  p05: require('../assets/products/p05.webp'), p06: require('../assets/products/p06.webp'),
  p07: require('../assets/products/p07.webp'), p08: require('../assets/products/p08.webp'),
  p09: require('../assets/products/p09.webp'), p10: require('../assets/products/p10.webp'),
};
export const productImage = (id: string): ImageSourcePropType => IMG[id] || IMG.p01;
