import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { decodeData, emptyData, migrateData, SerializedWriter, STORAGE_KEY } from '../services/repository';
import type { AppData } from '../types/cozy';

type SaveStatus = 'saved' | 'saving' | 'error';
interface Store {
  data: AppData; ready: boolean; loadError?: string; saveStatus: SaveStatus;
  change: (update: (data: AppData) => AppData) => void;
  retrySave: () => void; reload: () => void;
}
const Context = createContext<Store | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(emptyData);
  const current = useRef(data);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const revision = useRef(0);
  const loadGeneration = useRef(0);
  const writer = useRef(new SerializedWriter(raw => AsyncStorage.setItem(STORAGE_KEY, raw)));
  const reload = useCallback(() => {
    const generation = ++loadGeneration.current;

    AsyncStorage.getItem(STORAGE_KEY).then(async raw => {
      if (generation !== loadGeneration.current) return;
      const decoded = decodeData(raw);
      const loaded = migrateData(decoded);
      if (raw !== null && JSON.stringify(decoded) !== JSON.stringify(loaded)) {
        const backupKey = `${STORAGE_KEY}:before-redesign`;
        if (await AsyncStorage.getItem(backupKey) === null) await AsyncStorage.setItem(backupKey, raw);
      }
      if (generation !== loadGeneration.current) return;
      current.current = loaded; setData(loaded); setLoadError(undefined); setReady(true);
    }).catch(() => { if (generation === loadGeneration.current) setLoadError('We could not load your local data. It has not been overwritten. Try loading again.'); });
  }, []);
  useEffect(reload, [reload]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') void writer.current.flush().catch(() => {});
    });
    return () => subscription.remove();
  }, []);
  const persist = useCallback((next: AppData) => {
    const version = ++revision.current;
    setSaveStatus('saving');
    void writer.current.enqueue(next).then(() => {
      if (version === revision.current) setSaveStatus('saved');
    }).catch(() => { if (version === revision.current) setSaveStatus('error'); });
  }, []);
  const change = useCallback((update: (data: AppData) => AppData) => {
    if (!ready || loadError) return;
    // Ref advances synchronously, so rapid taps never calculate from a stale render.
    const next = update(current.current);
    if (next === current.current) return;
    current.current = next; setData(next); persist(next);
  }, [ready, loadError, persist]);
  return <Context.Provider value={{ data, ready, loadError, saveStatus, change, reload,
    retrySave: () => { if (ready) persist(current.current); } }}>{children}</Context.Provider>;
}
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
}
