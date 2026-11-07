import { createContext } from 'react';
// A failed font load must still leave every screen readable and usable.
export const FontReadyContext = createContext(true);
