export const API_CONFIG = {
  BASE_URL: 'https://coupon-backend-production-4601.up.railway.app/api', // Измените на ваш production URL
  TIMEOUT: 30000,
  ENDPOINTS: {
    // Auth
    AUTH_REGISTER: '/auth/register',
    AUTH_REGISTER_ADMIN: '/auth/register/admin',
    AUTH_LOGIN: '/auth/login',
    AUTH_ADMIN_LOGIN: '/auth/admin/login',
    AUTH_PROFILE: '/auth/profile',

    // Users
    USERS_BALANCE: '/users/balance',
    USERS_BALANCE_ADD: '/users/balance/add',
    USERS_BALANCE_SET: '/users/balance/set',
    USERS_ADMIN: '/users/admin', // Получить ID админа

    // Tours
    TOURS: '/tours',
    TOURS_BY_ID: (id: number) => `/tours/${id}`,

    // Documents
    DOCUMENTS: '/documents',
    DOCUMENTS_UPLOAD: '/documents/upload',
    DOCUMENTS_BY_ID: (id: string) => `/documents/${id}`,

    // Admin - Users
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_BY_ID: (id: number) => `/admin/users/${id}`,
    ADMIN_USER_BALANCE: (id: number) => `/admin/users/${id}/balance`,
    ADMIN_USER_ROLE: (id: number) => `/admin/users/${id}/role`,
    ADMIN_USER_DOCUMENTS: (id: number) => `/admin/users/${id}/documents`,

    // Admin - Tours
    ADMIN_TOURS: '/admin/tours',
    ADMIN_TOUR_BY_ID: (id: number) => `/admin/tours/${id}`,
    ADMIN_TOUR_TOGGLE: (id: number) => `/admin/tours/${id}/toggle`,

    // Admin - Documents
    ADMIN_DOCUMENTS: '/admin/documents',
    ADMIN_DOCUMENT_BY_ID: (id: string) => `/admin/documents/${id}`,
    ADMIN_DOCUMENT_ASSIGN: (documentId: string, userId: number) =>
      `/admin/documents/${documentId}/assign/${userId}`,

    // Messages
    MESSAGES: {
      CONVERSATIONS: '/messages/conversations',
      HISTORY: '/messages/history',
      READ: '/messages/read',
      UNREAD_COUNT: '/messages/unread/count',
      CONVERSATION: '/messages/conversation',
    },
  },
};
