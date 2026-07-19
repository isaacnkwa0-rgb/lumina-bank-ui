import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from "axios";
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — silent token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Normalize backend error shape: { error: { message } } → { message }
    // so every catch block's err.response.data.message works without changes
    const body = error.response?.data as Record<string, unknown> | undefined;
    if (body && typeof body.error === "object" && body.error !== null) {
      const inner = body.error as Record<string, unknown>;
      if (typeof inner.message === "string" && typeof body.message !== "string") {
        body.message = inner.message;
      }
    }

    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isRefreshEndpoint = original?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !original?._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        removeToken();
        if (typeof window !== "undefined") window.location.href = "/login?reason=session_expired";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );
        const newAccess = data.data.accessToken;
        const newRefresh = data.data.refreshToken;
        setToken(newAccess);
        setRefreshToken(newRefresh);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError);
        removeToken();
        if (typeof window !== "undefined") window.location.href = "/login?reason=session_expired";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Typed API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// API helper functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: unknown }>>("/auth/login", { email, password }),
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
    gender?: string;
    dateOfBirth?: string;
    nationality?: string;
    countryOfResidence?: string;
    taxResidency?: string;
    accountType?: string;
    ssn?: string;
  }) => api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: unknown }>>("/auth/register", data),
  sendPhoneOtp: () =>
    api.post<ApiResponse<{ message: string }>>("/auth/send-phone-otp", {}),
  verifyPhoneOtp: (code: string) =>
    api.post<ApiResponse<{ message: string }>>("/auth/verify-phone-otp", { code }),
  onboardingStatus: () =>
    api.get<ApiResponse<{ onboardingStep: number; kycStatus: string }>>("/auth/onboarding-status"),
  me: () => api.get<ApiResponse<unknown>>("/auth/me"),
  verifyEmail: (code: string) =>
    api.post<ApiResponse<{ message: string }>>("/auth/verify-email", { code }),
  resendVerification: () =>
    api.post<ApiResponse<{ message: string }>>("/auth/resend-verification"),
  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ message: string }>>("/auth/forgot-password", { email }),
  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    api.post<ApiResponse<{ message: string }>>("/auth/reset-password", data),
  setup2FA: () =>
    api.post<ApiResponse<{ qrCode: string; secret: string }>>("/auth/2fa/setup"),
  enable2FA: (token: string) =>
    api.post<ApiResponse<{ message: string; recoveryCodes?: string[] }>>("/auth/2fa/enable", { token }),
  regenerateRecoveryCodes: () =>
    api.post<ApiResponse<{ recoveryCodes: string[] }>>("/auth/2fa/regenerate-recovery-codes"),
  disable2FA: (token: string) =>
    api.post<ApiResponse<{ message: string }>>("/auth/2fa/disable", { token }),
  verify2FA: (token: string) =>
    api.post<ApiResponse<{ accessToken: string }>>("/auth/2fa/verify", { token }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<ApiResponse<{ message: string }>>("/auth/change-password", { currentPassword, newPassword }),
  verifyPassword: (password: string) =>
    api.post<ApiResponse<{ verified: boolean }>>("/auth/verify-password", { password }),
};

export const accountsApi = {
  list: () => api.get<ApiResponse<Account[]>>("/accounts"),
  get: (id: string) => api.get<ApiResponse<Account>>(`/accounts/${id}`),
  create: (data: { type: string; currency?: string }) =>
    api.post<ApiResponse<Account>>("/accounts", data),
};

export const transactionsApi = {
  list: (params?: {
    limit?: number;
    offset?: number;
    accountId?: string;
    category?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get<ApiResponse<Transaction[]>>("/transactions", { params }),
  get: (id: string) => api.get<ApiResponse<Transaction>>(`/transactions/${id}`),
  export: (params?: { accountId?: string; dateFrom?: string; dateTo?: string }) =>
    api.get<string>("/transactions/export", { params, responseType: "text" }),
};

export const transfersApi = {
  internal: (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description: string;
  }) => api.post<ApiResponse<Transfer>>("/transfers/internal", data),
  domestic: (data: {
    fromAccountId: string;
    toAccountNumber: string;
    toBankCode: string;
    toAccountName: string;
    amount: number;
    description: string;
    saveBeneficiary?: boolean;
  }) => api.post<ApiResponse<Transfer>>("/transfers/domestic", data),
  international: (data: {
    fromAccountId: string;
    toIban: string;
    swiftCode: string;
    toBankName: string;
    toAccountName: string;
    toCountry: string;
    toCurrency: string;
    amount: number;
    description: string;
  }) => api.post<ApiResponse<Transfer>>("/transfers/international", data),
  quote: (params: { fromCurrency: string; toCurrency: string; amount: number }) =>
    api.get<ApiResponse<FxQuote>>("/transfers/quote", { params }),
  getScheduled: () => api.get<ApiResponse<Transfer[]>>("/transfers/scheduled"),
  cancelScheduled: (id: string) => api.delete<ApiResponse<null>>(`/transfers/${id}/cancel`),
  schedule: (data: {
    fromAccountId: string;
    toAccountNumber: string;
    toBankCode: string;
    toAccountName: string;
    amount: number;
    description: string;
    scheduledAt: string;
  }) => api.post<ApiResponse<Transfer>>("/transfers/schedule", data),
};

export const cardsApi = {
  list: () => api.get<ApiResponse<Card[]>>("/cards"),
  get: (id: string) => api.get<ApiResponse<Card>>(`/cards/${id}`),
  freeze: (id: string) => api.post<ApiResponse<Card>>(`/cards/${id}/freeze`),
  unfreeze: (id: string) => api.post<ApiResponse<Card>>(`/cards/${id}/unfreeze`),
  updateLimits: (id: string, limits: Partial<CardLimits>) =>
    api.patch<ApiResponse<Card>>(`/cards/${id}/limits`, limits),
  updateControls: (id: string, controls: Partial<CardControls>) =>
    api.patch<ApiResponse<Card>>(`/cards/${id}/controls`, controls),
  reportLost: (id: string) => api.post<ApiResponse<Card>>(`/cards/${id}/report-lost`),
  replace: (id: string) => api.post<ApiResponse<Card>>(`/cards/${id}/replace`),
  getTransactions: (
    id: string,
    params?: { page?: number; limit?: number; dateFrom?: string; dateTo?: string }
  ) => api.get<ApiResponse<Transaction[]>>(`/cards/${id}/transactions`, { params }),
};

export const loansApi = {
  list: () => api.get<ApiResponse<Loan[]>>("/loans"),
  get: (id: string) => api.get<ApiResponse<Loan>>(`/loans/${id}`),
  eligibility: () => api.get<ApiResponse<LoanEligibility>>("/loans/eligibility"),
  apply: (data: { type: string; amount: number; termMonths: number; accountId?: string }) =>
    api.post<ApiResponse<Loan>>("/loans/apply", data),
  schedule: (id: string) =>
    api.get<ApiResponse<{ loan: Loan; schedule: AmortizationEntry[] }>>(`/loans/${id}/schedule`),
  repay: (id: string, amount: number) =>
    api.post<ApiResponse<{ loanId: string; amountPaid: number; remainingBalance: number }>>(`/loans/${id}/repay`, { amount }),
};

export const usersApi = {
  getProfile: () => api.get<ApiResponse<User>>("/users/profile"),
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: { street?: string; city?: string; state?: string; postalCode?: string; country?: string };
    occupation?: string;
    employer?: string;
    annualIncome?: number;
    preferredCurrency?: string;
    preferredLanguage?: string;
    // Onboarding fields
    onboardingStep?: number;
    termsAcceptedAt?: string;
    marketingConsent?: boolean;
    electronicStatementsConsent?: boolean;
    dataProcessingConsent?: boolean;
    employmentStatus?: string;
    industry?: string;
    sourceOfFunds?: string[];
    annualIncomeRange?: string;
    expectedMonthlyVolume?: string;
    countryOfResidence?: string;
    taxResidency?: string;
    accountType?: string;
  }) => api.patch<ApiResponse<User>>("/users/profile", data),
  getDevices: () => api.get<ApiResponse<Device[]>>("/users/devices"),
  removeDevice: (id: string) => api.delete<ApiResponse<null>>(`/users/devices/${id}`),
  getNotifPrefs: () => api.get<ApiResponse<Record<string, boolean>>>("/users/notifications/preferences"),
  updateNotifPrefs: (prefs: Record<string, boolean>) =>
    api.patch<ApiResponse<Record<string, boolean>>>("/users/notifications/preferences", prefs),
};

export const standingOrdersApi = {
  list: () => api.get<ApiResponse<StandingOrder[]>>("/standing-orders"),
  create: (data: {
    fromAccountId: string;
    toAccountNumber: string;
    toBankCode: string;
    toAccountName: string;
    amount: number;
    description: string;
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY";
    startDate: string;
    endDate?: string;
  }) => api.post<ApiResponse<StandingOrder>>("/standing-orders", data),
  cancel: (id: string) => api.patch<ApiResponse<StandingOrder>>(`/standing-orders/${id}/cancel`),
  pause: (id: string) => api.patch<ApiResponse<StandingOrder>>(`/standing-orders/${id}/pause`),
  resume: (id: string) => api.patch<ApiResponse<StandingOrder>>(`/standing-orders/${id}/resume`),
};

export const investmentsApi = {
  portfolio: () => api.get<ApiResponse<Portfolio>>("/investments/portfolio"),
  holdings: () => api.get<ApiResponse<Holding[]>>("/investments/holdings"),
  watchlist: () => api.get<ApiResponse<WatchlistItem[]>>("/investments/watchlist"),
  addToWatchlist: (data: { ticker: string; assetName: string; assetType: string }) =>
    api.post<ApiResponse<WatchlistItem>>("/investments/watchlist", data),
  removeFromWatchlist: (ticker: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/investments/watchlist/${ticker}`),
  quote: (ticker: string) =>
    api.get<ApiResponse<MarketQuote>>("/investments/market/quote", { params: { ticker } }),
  search: (q: string) =>
    api.get<ApiResponse<SearchResult[]>>("/investments/market/search", { params: { q } }),
  performance: (period?: "1W" | "1M" | "3M" | "6M" | "1Y") =>
    api.get<ApiResponse<PerformancePoint[]>>("/investments/performance", { params: { period } }),
  buy: (data: { ticker: string; assetType: string; assetName: string; quantity?: number; amount?: number }) =>
    api.post<ApiResponse<{ ticker: string; quantity: number; price: number; total: number }>>("/investments/buy", data),
  sell: (data: { ticker: string; quantity: number }) =>
    api.post<ApiResponse<{ ticker: string; quantity: number; price: number; proceeds: number }>>("/investments/sell", data),
};

export const goalsApi = {
  list: () => api.get<ApiResponse<Goal[]>>("/goals"),
  create: (data: { name: string; targetAmount: number; emoji?: string; targetDate?: string }) =>
    api.post<ApiResponse<Goal>>("/goals", data),
  contribute: (id: string, amount: number, fromAccountId: string) =>
    api.post<ApiResponse<{ goal: Goal; contributed: number; achieved: boolean }>>(`/goals/${id}/contribute`, { amount, fromAccountId }),
};

export const analyticsApi = {
  spending: () => api.get<ApiResponse<SpendingCategory[]>>("/analytics/spending"),
  cashflow: () => api.get<ApiResponse<CashflowData[]>>("/analytics/cashflow"),
  insights: () => api.get<ApiResponse<Insight[]>>("/analytics/insights"),
  topMerchants: () => api.get<ApiResponse<Merchant[]>>("/analytics/top-merchants"),
};

export const notificationsApi = {
  list: () => api.get<ApiResponse<Notification[]>>("/notifications"),
  unreadCount: () => api.get<ApiResponse<{ unreadCount: number }>>("/notifications/unread-count"),
  markRead: (id: string) => api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),
  markAllRead: () => api.post<ApiResponse<null>>("/notifications/read-all"),
};

export const adminApi = {
  stats: () => api.get<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    totalAccounts: number;
    totalTransactions: number;
    totalTransactionVolume: number;
    totalTransfers: number;
  }>>("/admin/stats"),
  users: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<ApiResponse<{ users: AdminUser[]; meta: unknown }>>("/admin/users", { params }),
  getUser: (id: string) =>
    api.get<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`),
  suspendUser: (id: string) =>
    api.patch<ApiResponse<{ id: string; status: string }>>(`/admin/users/${id}/suspend`),
  activateUser: (id: string) =>
    api.patch<ApiResponse<{ id: string; status: string }>>(`/admin/users/${id}/activate`),
  deleteUser: (id: string) =>
    api.delete<ApiResponse<{ id: string; deleted: boolean }>>(`/admin/users/${id}`),
  changeUserTier: (id: string, tier: string) =>
    api.patch<ApiResponse<{ id: string; tier: string }>>(`/admin/users/${id}/tier`, { tier }),
  resetLockout: (id: string) =>
    api.patch<ApiResponse<{ id: string; unlocked: boolean }>>(`/admin/users/${id}/reset-lockout`),
  verifyUserEmail: (id: string) =>
    api.patch<ApiResponse<{ id: string; isEmailVerified: boolean }>>(`/admin/users/${id}/verify-email`),
  getUserAccounts: (userId: string) =>
    api.get<ApiResponse<AdminAccount[]>>(`/admin/users/${userId}/accounts`),
  freezeAccount: (accountId: string) =>
    api.patch<ApiResponse<AdminAccount>>(`/admin/accounts/${accountId}/freeze`),
  unfreezeAccount: (accountId: string) =>
    api.patch<ApiResponse<AdminAccount>>(`/admin/accounts/${accountId}/unfreeze`),
  closeAccount: (accountId: string) =>
    api.patch<ApiResponse<AdminAccount>>(`/admin/accounts/${accountId}/close`),
  approveKyc: (userId: string) =>
    api.patch<ApiResponse<{ userId: string; kycStatus: string }>>(`/admin/kyc/${userId}/verify`),
  rejectKyc: (userId: string, reason: string) =>
    api.patch<ApiResponse<{ userId: string; kycStatus: string }>>(`/admin/kyc/${userId}/reject`, { reason }),
  transfers: (params?: { status?: string; type?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<AdminTransfer[]>>("/admin/transfers", { params }),
  approveTransfer: (id: string) =>
    api.patch<ApiResponse<Transfer>>(`/admin/transfers/${id}/approve`),
  rejectTransfer: (id: string, reason?: string) =>
    api.patch<ApiResponse<Transfer>>(`/admin/transfers/${id}/reject`, { reason }),
  loans: (status?: string) =>
    api.get<ApiResponse<AdminLoan[]>>("/admin/loans", { params: status ? { status } : undefined }),
  approveLoan: (id: string) =>
    api.patch<ApiResponse<Loan>>(`/admin/loans/${id}/approve`),
  rejectLoan: (id: string, reason?: string) =>
    api.patch<ApiResponse<{ id: string; status: string }>>(`/admin/loans/${id}/reject`, { reason }),
  disputes: (status?: string) =>
    api.get<ApiResponse<AdminDispute[]>>("/admin/disputes", { params: status ? { status } : undefined }),
  reviewDispute: (id: string) =>
    api.patch<ApiResponse<{ id: string; status: string }>>(`/admin/disputes/${id}/review`),
  resolveDispute: (id: string, resolution: string) =>
    api.patch<ApiResponse<{ id: string; status: string }>>(`/admin/disputes/${id}/resolve`, { resolution }),
  rejectDispute: (id: string, reason: string) =>
    api.patch<ApiResponse<{ id: string; status: string }>>(`/admin/disputes/${id}/reject`, { reason }),
  auditLogs: (params?: { page?: number; limit?: number; userId?: string; action?: string }) =>
    api.get<ApiResponse<AuditLog[]>>("/admin/audit-logs", { params }),
  // Insurance
  insuranceQuotes: (status?: string) =>
    api.get<ApiResponse<AdminInsuranceQuote[]>>("/admin/insurance", { params: status ? { status } : undefined }),
  processInsurance: (id: string, data: { status: string; premium?: number; notes?: string }) =>
    api.patch<ApiResponse<AdminInsuranceQuote>>(`/admin/insurance/${id}/process`, data),
  // Cards
  adminCards: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<AdminCard[]>>("/admin/cards", { params }),
  blockCard: (id: string) => api.patch<ApiResponse<AdminCard>>(`/admin/cards/${id}/block`),
  unblockCard: (id: string) => api.patch<ApiResponse<AdminCard>>(`/admin/cards/${id}/unblock`),
  // Transactions
  allTransactions: (params?: { page?: number; limit?: number; status?: string; type?: string }) =>
    api.get<ApiResponse<AdminTransaction[]>>("/admin/transactions", { params }),
  // Rates
  adminRates: () => api.get<ApiResponse<AdminExchangeRate[]>>("/admin/rates"),
  refreshRates: () => api.post<ApiResponse<AdminExchangeRate[]>>("/admin/rates/refresh"),
  // Investments
  adminInvestments: () => api.get<ApiResponse<AdminPortfolio[]>>("/admin/investments"),
  // Goals
  adminGoals: (status?: string) =>
    api.get<ApiResponse<AdminGoal[]>>("/admin/goals", { params: status ? { status } : undefined }),
  // Crypto orders
  adminCryptoOrders: (status?: string) =>
    api.get<ApiResponse<AdminCryptoOrder[]>>("/admin/crypto/orders", { params: status ? { status } : undefined }),
  approveCryptoOrder: (id: string, notes?: string) =>
    api.patch<ApiResponse<AdminCryptoOrder>>(`/admin/crypto/orders/${id}/approve`, { notes }),
  rejectCryptoOrder: (id: string, reason: string) =>
    api.patch<ApiResponse<{ id: string; status: string }>>(`/admin/crypto/orders/${id}/reject`, { reason }),
};

export const disputesApi = {
  list: () => api.get<ApiResponse<Dispute[]>>("/disputes"),
  get: (id: string) => api.get<ApiResponse<Dispute>>(`/disputes/${id}`),
  create: (data: { subject: string; description: string; transactionId?: string }) =>
    api.post<ApiResponse<Dispute>>("/disputes", data),
  close: (id: string) => api.patch<ApiResponse<Dispute>>(`/disputes/${id}/close`),
};

export const insuranceApi = {
  requestQuote: (data: { type: string; details: Record<string, unknown>; notes?: string }) =>
    api.post<ApiResponse<InsuranceQuote>>("/insurance/quotes", data),
  getQuotes: () => api.get<ApiResponse<InsuranceQuote[]>>("/insurance/quotes"),
  getQuote: (id: string) => api.get<ApiResponse<InsuranceQuote>>(`/insurance/quotes/${id}`),
  acceptQuote: (id: string) => api.patch<ApiResponse<InsuranceQuote>>(`/insurance/quotes/${id}/accept`),
  cancelQuote: (id: string) => api.patch<ApiResponse<InsuranceQuote>>(`/insurance/quotes/${id}/cancel`),
};

export const cryptoApi = {
  createOrder: (data: {
    accountId: string;
    coin: string;
    coinId: string;
    network: string;
    walletAddress: string;
    amountGbp: number;
    priceGbp: number;
  }) => api.post<ApiResponse<CryptoOrder>>("/crypto/orders", data),
  listOrders: () => api.get<ApiResponse<CryptoOrder[]>>("/crypto/orders"),
  getOrder: (id: string) => api.get<ApiResponse<CryptoOrder>>(`/crypto/orders/${id}`),
};

export const ratesApi = {
  list: () => api.get<ApiResponse<Rate[]>>("/rates"),
  convert: (params: { from: string; to: string; amount: number }) =>
    api.get<ApiResponse<ConversionResult>>("/rates/convert", { params }),
};

export const beneficiariesApi = {
  list: () => api.get<ApiResponse<Beneficiary[]>>("/beneficiaries"),
  get: (id: string) => api.get<ApiResponse<Beneficiary>>(`/beneficiaries/${id}`),
  create: (data: {
    nickname: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    iban?: string;
    swiftCode?: string;
    country?: string;
    currency?: string;
    isFavorite?: boolean;
  }) => api.post<ApiResponse<Beneficiary>>("/beneficiaries", data),
  update: (id: string, data: { nickname?: string; isFavorite?: boolean }) =>
    api.patch<ApiResponse<Beneficiary>>(`/beneficiaries/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/beneficiaries/${id}`),
  verify: (data: { accountNumber: string; bankCode: string }) =>
    api.post<ApiResponse<{ accountName: string; accountNumber: string; bankName: string; bankCode: string }>>(
      "/beneficiaries/verify",
      data
    ),
};

export const directDebitsApi = {
  list: () => api.get<ApiResponse<DirectDebit[]>>("/direct-debits"),
  create: (data: {
    accountId: string;
    originatorName: string;
    originatorRef: string;
    userRef: string;
    amount?: number;
    currency?: string;
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY";
    startDate: string;
  }) => api.post<ApiResponse<DirectDebit>>("/direct-debits", data),
  cancel: (id: string) => api.patch<ApiResponse<DirectDebit>>(`/direct-debits/${id}/cancel`),
  suspend: (id: string) => api.patch<ApiResponse<DirectDebit>>(`/direct-debits/${id}/suspend`),
  resume: (id: string) => api.patch<ApiResponse<DirectDebit>>(`/direct-debits/${id}/resume`),
};

export const kycApi = {
  status: () => api.get<ApiResponse<{ status: string; documents: Record<string, string> | null }>>("/kyc/status"),
  submit: (formData: FormData) =>
    api.post<ApiResponse<{ status: string; message: string }>>("/kyc/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getDocuments: () =>
    api.get<ApiResponse<{ status: string; documents: Record<string, string> | null }>>("/kyc/documents"),
};

// Shared types
export interface Account {
  id: string;
  type: string;
  accountNumber: string;
  iban: string;
  sortCode: string;
  balance: string;
  availableBalance: string;
  currency: string;
  status: string;
  isDefault: boolean;
  interestRate?: string | null;
}

export interface Transaction {
  id: string;
  reference: string;
  accountId: string;
  type: "CREDIT" | "DEBIT";
  category: string;
  amount: string;
  currency: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  merchantName?: string | null;
  merchantCategory?: string | null;
  counterpartyName?: string | null;
  counterpartyAccountNumber?: string | null;
  counterpartyBank?: string | null;
  status: string;
  failureReason?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  valueDate: string;
}

export interface Card {
  id: string;
  accountId: string;
  type: "DEBIT" | "CREDIT" | "VIRTUAL" | "PREPAID";
  tier: string;
  maskedPan: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  currency: string;
  status: "ACTIVE" | "FROZEN" | "BLOCKED";
  isFrozen: boolean;
  isVirtual: boolean;
  spendingLimits: CardLimits;
  controls: CardControls;
}

export interface CardControls {
  online: boolean;
  contactless: boolean;
  international: boolean;
  atm: boolean;
}

export interface CardLimits {
  daily: number;
  monthly: number;
  perTransaction: number;
}

export interface Loan {
  id: string;
  type: string;
  principalAmount: string;
  outstandingBalance: string;
  interestRate: string;
  termMonths: number;
  monthlyPayment: string;
  nextPaymentDate: string;
  nextPaymentAmount: string;
  status: string;
  disbursedAt?: string;
  payments?: LoanPayment[];
}

export interface LoanPayment {
  id: string;
  loanId?: string;
  amount: string;
  principalPortion?: string;
  interestPortion?: string;
  paymentDate: string;
  status: string;
}

export interface LoanEligibility {
  tier: string;
  eligibility: Record<string, number>;
  annualRates: Record<string, number>;
}

export interface Portfolio {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  allocationByType: Record<string, { value: number; percent: number }>;
  holdings: Holding[];
}

export interface Holding {
  id: string;
  ticker: string;
  assetName: string;
  assetType: string;
  quantity: string;
  averageCostBasis: string;
  currency: string;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
}

export interface SearchResult {
  ticker: string;
  name: string;
  assetType: string;
  price: number;
}

export interface PerformancePoint {
  date: string;
  value: number;
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: string;
  currentAmount: string;
  targetDate?: string | null;
  status: string;
}

export interface SpendingCategory {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface CashflowData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface Insight {
  type: string;
  title: string;
  body: string;
  severity: "warning" | "success" | "info";
}

export interface Merchant {
  merchantName: string;
  total: number;
  count: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: { street?: string; city?: string; state?: string; postalCode?: string; country?: string } | null;
  tier: string;
  role: string;
  status: string;
  kycStatus: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  profile?: {
    occupation?: string;
    employer?: string;
    annualIncome?: string;
    preferredCurrency: string;
    preferredLanguage?: string;
  } | null;
}

export interface Device {
  id: string;
  deviceName: string;
  deviceType: string;
  os?: string;
  browser?: string;
  ipAddress?: string;
  isTrusted: boolean;
  lastSeenAt: string;
  createdAt: string;
}

export interface StandingOrder {
  id: string;
  fromAccountId: string;
  toAccountNumber: string;
  toBankCode: string;
  toAccountName: string;
  amount: string;
  currency: string;
  description: string;
  frequency: string;
  nextExecutionDate: string;
  endDate?: string;
  status: string;
  lastExecutedAt?: string;
  createdAt: string;
  fromAccount?: { id: string; accountNumber: string; type: string; currency: string };
}

export interface AmortizationEntry {
  paymentNumber: number;
  dueDate: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface Notification {
  id: string;
  type: "TRANSACTION" | "TRANSFER" | "SECURITY" | "SYSTEM" | "LOAN" | "MARKETING";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface Rate {
  from: string;
  to: string;
  rate: number;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  converted: number;
  rate: number;
}

export interface Beneficiary {
  id: string;
  userId: string;
  nickname: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  iban?: string;
  swiftCode?: string;
  country: string;
  currency: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DirectDebit {
  id: string;
  userId: string;
  accountId: string;
  originatorName: string;
  originatorRef: string;
  userRef: string;
  amount: string | null;
  currency: string;
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY";
  nextCollectionDate: string;
  lastCollectedAt: string | null;
  status: "ACTIVE" | "SUSPENDED" | "CANCELLED";
  createdAt: string;
  account?: { accountNumber: string; type: string; currency: string };
}

export interface KycStatus {
  status: "PENDING" | "VERIFIED" | "REJECTED";
  submittedAt?: string;
}

export interface Transfer {
  id: string;
  type: 'INTERNAL' | 'DOMESTIC' | 'INTERNATIONAL' | 'SCHEDULED';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: string;
  currency: string;
  description: string;
  toAccountNumber?: string | null;
  toBank?: string | null;
  transferFee?: string | null;
  fxFee?: string | null;
  fxRate?: string | null;
  createdAt: string;
  executedAt?: string | null;
}

export interface AdminTransfer extends Transfer {
  fromAccount: {
    id: string;
    accountNumber: string;
    type: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface FxQuote {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  convertedAmount: number;
  fee: number;
}

export interface Dispute {
  id: string;
  userId: string;
  transactionId?: string | null;
  subject: string;
  description: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
  resolution?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface AdminDispute extends Dispute {
  user: { id: string; firstName: string; lastName: string; email: string };
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: string;
  tier: string;
  kycStatus: string;
  createdAt: string;
  _count: { accounts: number };
}

export interface AdminUserDetail extends AdminUser {
  accounts: { id: string; accountNumber: string; type: string; balance: string; currency: string; isDefault: boolean }[];
  profile: Record<string, unknown> | null;
  _count: { accounts: number; transactions: number };
}

export interface AdminLoan {
  id: string;
  userId: string;
  type: string;
  principalAmount: string;
  outstandingBalance: string;
  interestRate: string;
  termMonths: number;
  monthlyPayment: string;
  status: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

export interface InsuranceQuote {
  id: string;
  userId: string;
  type: "LIFE" | "HOME" | "CAR" | "TRAVEL" | "HEALTH" | "BUSINESS";
  status: "REQUESTED" | "QUOTED" | "ACCEPTED" | "DECLINED";
  details: Record<string, unknown>;
  premium?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  resource?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; email: string } | null;
}

export interface AdminAccount {
  id: string;
  accountNumber: string;
  type: string;
  status: string;
  currency: string;
  balance: string;
  availableBalance: string;
  isFrozen: boolean;
}

export interface AdminInsuranceQuote extends InsuranceQuote {
  user: { id: string; firstName: string; lastName: string; email: string };
}

export interface AdminCard {
  id: string;
  userId: string;
  type: string;
  tier: string;
  maskedPan: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  currency: string;
  status: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  account: { accountNumber: string; type: string; currency: string };
}

export interface AdminTransaction {
  id: string;
  reference: string;
  type: string;
  category: string;
  amount: string;
  currency: string;
  description: string;
  status: string;
  createdAt: string;
  account: {
    id: string;
    accountNumber: string;
    user: { id: string; firstName: string; lastName: string; email: string };
  };
}

export interface AdminExchangeRate {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: string;
  fetchedAt: string;
}

export interface AdminInvestment {
  id: string;
  ticker: string;
  name: string;
  assetType: string;
  quantity: string;
  avgCostBasis: string;
  currentPrice: string;
  createdAt: string;
}

export interface AdminPortfolio {
  id: string;
  userId: string;
  name: string;
  currency: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  investments: AdminInvestment[];
}

export interface AdminGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate?: string | null;
  status: string;
  emoji?: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

export interface CryptoOrder {
  id: string;
  userId: string;
  accountId: string;
  coin: string;
  coinId: string;
  network: string;
  walletAddress: string;
  amountGbp: string;
  fee: string;
  priceGbp: string;
  quantity: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  reference: string;
  adminNotes?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export interface AdminCryptoOrder extends CryptoOrder {
  user: { id: string; firstName: string; lastName: string; email: string };
}
