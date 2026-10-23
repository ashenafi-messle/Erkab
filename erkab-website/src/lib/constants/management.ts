export interface ManagementMember {
  id: string;
  name: string;
  nameAm?: string;
  roles: string[];
  rolesAm?: string[];
  photoUrl?: string;
  initials: string;
}

export const MANAGEMENT_MEMBERS: ManagementMember[] = [
  {
    id: 'sintayehu-negash',
    name: 'Mr. Sintayehu Negash',
    nameAm: 'አቶ ስንታየሁ ነጋሽ',
    roles: [
      'Gondar City Administration Education Department Director',
      'Erkab Board Director',
    ],
    rolesAm: [
      'የጎንደር ከተማ አስተዳደር ትምህርት መምሪያ ኃላፊ',
      'የእርካብ የቦርድ ዳይሬክተር',
    ],
    photoUrl: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792743247/5967632259663728779.jpg',
    initials: 'SN',
  },
  {
    id: 'habibu-takele',
    name: 'Mr. Habibu Takele',
    nameAm: 'አቶ ሀቢቡ ታከለ',
    roles: [
      'Erkab Co-Founder',
      'Global Representative — USA resident',
    ],
    rolesAm: [
      'የእርካብ ተባባሪ መስራች',
      'ዓለም አቀፍ ተወካይ — የዩናይትድ ስቴትስ ነዋሪ',
    ],
    photoUrl: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792743248/5967632259663728778.jpg',
    initials: 'HT',
  },
  {
    id: 'ambelu-endakew',
    name: 'Eng. Ambelu Endakew',
    nameAm: 'ኢንጅነር አምበሉ እንዳከው',
    roles: [
      'Erkab Executive Director',
    ],
    rolesAm: [
      'የእርካብ ዋና ስራ አስፈፃሚ',
    ],
    photoUrl: 'https://res.cloudinary.com/oydsg6yc/image/upload/v1792743248/5967632259663728780.jpg',
    initials: 'AE',
  },
  {
    id: 'ashenafi-messele',
    name: 'Ashenafi Messele',
    nameAm: 'አሸናፊ መሰለ',
    roles: [
      'Erkab System Admin',
    ],
    rolesAm: [
      'የእርካብ ሲስተም አድሚን',
    ],
    initials: 'AM',
  },
  {
    id: 'yenus-abdu',
    name: 'Mr. Yenus Abdu',
    nameAm: 'አቶ የኑስ አብዱ',
    roles: [
      'Erkab Finance Administration Head',
    ],
    rolesAm: [
      'የእርካብ የፋይናንስ አስተዳደር ኃላፊ',
    ],
    initials: 'YA',
  },
  {
    id: 'firehiwot',
    name: 'Firehiwot',
    nameAm: 'ፍሬሕይወት',
    roles: [
      'Erkab Property and Secretary',
    ],
    rolesAm: [
      'የእርካብ የንብረት እና ፀሐፊ',
    ],
    initials: 'F',
  },
  {
    id: 'ayshet',
    name: 'Ayshet',
    nameAm: 'አይሸት',
    roles: [
      'Accountant',
    ],
    rolesAm: [
      'አካውንታንት',
    ],
    initials: 'A',
  },
];
