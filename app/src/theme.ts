import { Platform } from 'react-native';
export const C = {
  paper: '#F4F1E8', fern: '#234A3A', ink: '#1F3A2F', sage: '#CFE1D3', mist: '#E7EFE8', terra: '#D9764A',
  card: '#FBF9F3', muted: '#5F7468', faint: '#8A9B91', line: 'rgba(35,74,58,0.12)', danger: '#B4533A', fernSoft: '#3E6B57',
};
export const F = {
  display: 'Fraunces_600SemiBold', displayBold: 'Fraunces_700Bold', italic: 'Fraunces_400Regular_Italic',
  body: 'DMSans_400Regular', medium: 'DMSans_500Medium', semi: 'DMSans_600SemiBold', bold: 'DMSans_700Bold',
};
export const R = { sm: 12, md: 16, lg: 20, xl: 28, pill: 999 };
export const shadow = { boxShadow: '0px 6px 20px rgba(35, 74, 58, 0.09)' } as const;
export const shadowLg = { boxShadow: '0px 14px 34px rgba(35, 74, 58, 0.14)' } as const;
export const isWeb = Platform.OS === 'web';
export const MAXW = 480;
export const ND = Platform.OS !== 'web'; // native driver only where the native module exists
