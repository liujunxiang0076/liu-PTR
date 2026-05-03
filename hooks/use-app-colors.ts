import { SemanticColors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

/** 统一应用颜色 hook，消除各组件中重复的颜色获取代码 */
export function useAppColors() {
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor(
    { light: SemanticColors.muted.light, dark: SemanticColors.muted.dark },
    'icon'
  );
  const border = useThemeColor(
    { light: SemanticColors.border.light, dark: SemanticColors.border.dark },
    'icon'
  );
  const inputBg = useThemeColor(
    { light: SemanticColors.inputBg.light, dark: SemanticColors.inputBg.dark },
    'background'
  );
  const panelBg = useThemeColor(
    { light: SemanticColors.panelBg.light, dark: SemanticColors.panelBg.dark },
    'background'
  );
  const danger = useThemeColor(
    { light: SemanticColors.danger, dark: SemanticColors.dangerDark },
    'tint'
  );

  return { tint, text, muted, border, inputBg, panelBg, danger };
}
