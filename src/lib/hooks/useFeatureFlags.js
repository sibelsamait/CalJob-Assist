import { useContext, useMemo } from 'react';
import { AuthContext } from '@/lib/AuthContext';

export function useFeatureFlags() {
  const { profile } = useContext(AuthContext);

  return useMemo(() => {
    return {
      calculadoras: true,
      tramites: true,
      mediaciones: true,
      biblioteca: true,
      sii_guides: true,
      calendario: true,
      documentos: true,
      export_pdf: true,
    };
  }, [profile]);
}
