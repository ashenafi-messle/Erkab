export const API_ENDPOINTS = {
  PROGRAMS: {
    LIST: '/api/v1/web/programs',
    DETAIL: (slug: string) => `/api/v1/web/programs/${slug}`,
  },
  APPLICATIONS: {
    STUDENT: '/api/v1/web/applications/students',
    TRAINER: '/api/v1/web/applications/trainers',
    TUTOR: '/api/v1/web/applications/tutors',
    STATUS: (reference: string) => `/api/v1/web/applications/status/${reference}`,
  },
  TUTORING: {
    REQUEST: '/api/v1/web/tutoring/requests',
    PAYMENT: (reference: string) => `/api/v1/web/tutoring/payments/${reference}`,
    CONFIRM_DEMO: (reference: string) => `/api/v1/web/tutoring/payments/${reference}/confirm-demo`,
  },
  PARTNERSHIPS: {
    INQUIRY: '/api/v1/partnerships/inquiry',
  },
  DONATIONS: {
    PLEDGE: '/api/v1/donations/pledge',
  },
  ANNOUNCEMENTS: {
    LIST: '/api/v1/announcements',
    DETAIL: (id: string) => `/api/v1/announcements/${id}`,
  },
  CONTACT: {
    SEND: '/api/v1/contact',
  },
} as const;

