export type ErrorCode = number;

export interface ErrorDetail {
  code: ErrorCode;
  message: string;
  userMessage: string;
  action: string;
}

export const ERROR_CODES: Record<ErrorCode, ErrorDetail> = {
  301: {
    code: 301,
    message: 'Unauthorized',
    userMessage: 'You are not authorized to perform this action. Only the company owner can do this.',
    action: 'retry'
  },
  302: {
    code: 302,
    message: 'Company Already Exists',
    userMessage: 'A company with this ID already exists on the blockchain.',
    action: 'retry'
  },
  303: {
    code: 303,
    message: 'Company Not Found',
    userMessage: 'The specified company could not be found on-chain.',
    action: 'retry'
  },
  304: {
    code: 304,
    message: 'Employee Not Found',
    userMessage: 'The employee record was not found for this company.',
    action: 'retry'
  },
  305: {
    code: 305,
    message: 'Insufficient Funds',
    userMessage: 'The company vault has insufficient balance for this payment.',
    action: 'add_funds'
  },
  306: {
    code: 306,
    message: 'Invalid Amount',
    userMessage: 'The amount specified is invalid.',
    action: 'retry'
  },
  307: {
    code: 307,
    message: 'Employee Already Exists',
    userMessage: 'This employee is already registered under this company.',
    action: 'retry'
  },
  401: {
    code: 401,
    message: 'Not Authorized',
    userMessage: 'You do not have permission to access this resource.',
    action: 'retry'
  },
  999: {
    code: 999,
    message: 'Unknown Error',
    userMessage: 'An unexpected blockchain error occurred. Please try again.',
    action: 'retry'
  }
};
