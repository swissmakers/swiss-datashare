// Global toast functions - these will be set by the ToastProvider
let globalToast: {
  success: (_message: string, _duration?: number) => string;
  error: (_message: string, _duration?: number) => string;
  warning: (_message: string, _duration?: number) => string;
  info: (_message: string, _duration?: number) => string;
} | null = null;

export const setGlobalToast = (toast: typeof globalToast) => {
  globalToast = toast;
};

const error = (message: string) => {
  if (globalToast) {
    globalToast.error(message);
  } else {
    console.error(message);
  }
};

const axiosError = (axiosError: any) => {
  const message = axiosError?.response?.data?.message ?? "An unknown error occurred";
  error(message);
};

const success = (message: string) => {
  if (globalToast) {
    globalToast.success(message);
  } else {
    console.log(message);
  }
};

const toast = {
  error,
  success,
  axiosError,
};

export default toast;
