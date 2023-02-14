import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';

export function useReload() {
  const [state, setState] = useState(0);
  return [state, () => setState(state => state + 1)];
}
