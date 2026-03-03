import { createComponents } from './create-components';
import { createPalette } from './create-palette';
import { createShadows } from './create-shadows';

export const createOptions = (config) => {
  const { colorPreset, contrast } = config;
  const palette = createPalette({ colorPreset, contrast });
  const components = createComponents({ palette });
  const shadows = createShadows({ palette });

  return {
    components,
    palette,
    shadows
  };
};
