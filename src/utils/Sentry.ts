import * as Sentry from '@sentry/react';

export enum SENTRY_ERROR_TYPES {
  API_ERROR = 'API_ERROR',
  APP_ERROR = 'APP_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

//Helper for capturing errors
export const captureSentryError = (
  error: Error | string,
  context?: Record<string, any>,
) => {
  if (typeof error === 'string') {
    Sentry.captureException(new Error(error), {
      contexts: {
        custom: context || {},
      },
      tags: {
        errorType: SENTRY_ERROR_TYPES.APP_ERROR,
      },
    });
  } else {
    Sentry.captureException(error, {
      contexts: {
        custom: context || {},
      },
      tags: {
        errorType: SENTRY_ERROR_TYPES.APP_ERROR,
      },
    });
  }
};

//Helper for capturing messages
export const captureSentryMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>,
) => {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context || {},
    },
  });
};

export const setUserContext = (user: {
  id?: string;
  email?: string;
  username?: string;
}) => {
  Sentry.setUser(user);
};

// Helper for API errors
export const captureSentryApiError = (error: any) => {
  Sentry.captureException(error, {
    contexts: {
      api: {
        method: error?.config?.method,
        endpoint: error?.config?.url,
        requestData: error?.config?.data,
        status: error?.response?.status,
        responseData: error?.response?.data,
      },
    },
    tags: {
      errorType: SENTRY_ERROR_TYPES.API_ERROR,
      endpoint: error?.config?.url || 'unknown',
    },
  });
};
