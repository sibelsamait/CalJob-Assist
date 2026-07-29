import { useContext, useMemo } from 'react';
import { AuthContext } from '@/lib/AuthContext';
import { usePermissions } from '@/lib/hooks/usePermissions';

export function useFeatureFlags() {
  const { profile } = useContext(AuthContext);
  const permissions = usePermissions();

  return useMemo(() => {
    if (permissions.isStaff || permissions.isPlanOwner) {
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
    }

    if (permissions.isTeamMember && profile?.license_metadata?.feature_flags) {
      return {
        calculadoras: Boolean(profile.license_metadata.feature_flags.calculadoras),
        tramites: Boolean(profile.license_metadata.feature_flags.tramites),
        mediaciones: Boolean(profile.license_metadata.feature_flags.mediaciones),
        biblioteca: Boolean(profile.license_metadata.feature_flags.biblioteca),
        sii_guides: Boolean(profile.license_metadata.feature_flags.sii_guides),
        calendario: Boolean(profile.license_metadata.feature_flags.calendario),
        documentos: Boolean(profile.license_metadata.feature_flags.documentos),
        export_pdf: Boolean(profile.license_metadata.feature_flags.export_pdf),
      };
    }

    return {
      calculadoras: true,
      tramites: false,
      mediaciones: false,
      biblioteca: false,
      sii_guides: true,
      calendario: true,
      documentos: false,
      export_pdf: false,
    };
  }, [permissions.isPlanOwner, permissions.isStaff, permissions.isTeamMember, profile]);
}
