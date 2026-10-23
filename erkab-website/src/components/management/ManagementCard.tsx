'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User, Shield } from 'lucide-react';
import { ManagementMember } from '@/lib/constants/management';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ManagementCardProps {
  member: ManagementMember;
  priority?: boolean;
}

export function ManagementCard({ member, priority = false }: ManagementCardProps) {
  const { locale, t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const isAm = locale === 'am';
  const displayName = isAm && member.nameAm ? member.nameAm : member.name;
  const roles = isAm && member.rolesAm ? member.rolesAm : member.roles;
  const hasPhoto = Boolean(member.photoUrl) && !imageError;

  return (
    <article
      className="management-card"
      aria-label={`${displayName} - ${roles.join(', ')}`}
    >
      <div className="management-card-media">
        {hasPhoto && member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={`${t.managementPage.photoOf} ${displayName}`}
            fill
            sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw"
            priority={priority}
            className="management-card-img"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="management-avatar-placeholder"
            role="img"
            aria-label={`${t.managementPage.profileInitialsFor} ${displayName}`}
          >
            <div className="management-avatar-glow" aria-hidden="true" />
            <span className="management-avatar-initials">{member.initials}</span>
            <div className="management-avatar-icon" aria-hidden="true">
              <User size={28} />
            </div>
          </div>
        )}
      </div>

      <div className="management-card-body">
        <h2 className="management-card-name">{displayName}</h2>
        <div className="management-card-divider" aria-hidden="true" />

        <div className="management-card-roles" aria-label={t.managementPage.rolesHeading}>
          {roles.map((role, idx) => (
            <div key={idx} className="management-role-badge">
              <Shield size={14} className="flex-shrink-0 mt-1 text-primary" aria-hidden="true" />
              <span>{role}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
