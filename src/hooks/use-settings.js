import { useContext } from 'react';
import { SettingsContext } from '../contexts/settings-context';

export const useSettings = () => useContext(SettingsContext);
