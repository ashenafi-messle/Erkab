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
  },
  PARTNERSHIPS: {
    SUBMIT: '/api/v1/web/partnerships',
  },
  DONATIONS: {
    CAMPAIGNS: '/api/v1/web/donation-campaigns',
    CAMPAIGN_DETAIL: (slug: string) => `/api/v1/web/donation-campaigns/${slug}`,
    CREATE: '/api/v1/web/donations',
    PAYMENT: (reference: string) => `/api/v1/web/donations/payments/${reference}`,
  },
  NEWS: {
    LIST: '/api/v1/web/news',
    DETAIL: (slug: string) => `/api/v1/web/news/${slug}`,
  },
  ANNOUNCEMENTS: {
    LIST: '/api/v1/web/news',
    DETAIL: (slug: string) => `/api/v1/web/news/${slug}`,
  },
  CONTACT: {
    SEND: '/api/v1/web/contact',
  },
  ADMIN: {
    PARTNERSHIPS: {
      LIST: '/api/v1/admin/partnerships',
      DETAIL: (id: string) => `/api/v1/admin/partnerships/${id}`,
      REVIEW: (id: string) => `/api/v1/admin/partnerships/${id}/review`,
      DOCUMENT_URL: (docId: string) => `/api/v1/admin/partnerships/documents/${docId}/access-url`,
    },
    DONATIONS: {
      LIST: '/api/v1/admin/donations',
    },
    NEWS: {
      LIST: '/api/v1/admin/news',
      CREATE: '/api/v1/admin/news',
      DETAIL: (id: string) => `/api/v1/admin/news/${id}`,
      UPDATE: (id: string) => `/api/v1/admin/news/${id}`,
      DELETE: (id: string) => `/api/v1/admin/news/${id}`,
    },
  },
} as const;

