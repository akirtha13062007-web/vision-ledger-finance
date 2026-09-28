import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  location?: string | null;
  occupation?: string | null;
};

type AuthLoginPayload = {
  token?: string;
  user?: AuthUser;
  email?: string;
  rememberMe?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: AuthLoginPayload) => void;
  logout: () => void;
  updateUser: (nextUser: AuthUser) => void;
};

const AUTH_TOKEN_KEY = "visionLedgerToken";
const AUTH_USER_KEY = "visionLedgerUser";

function parseStoredUser(rawValue: string | null): AuthUser | null {
  if (!rawValue || !rawValue.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<AuthUser>;
    if (
      parsed &&
      typeof parsed.email === "string" &&
      parsed.email.trim() &&
      typeof parsed.id === "string"
    ) {
      return {
        id: parsed.id,
        email: parsed.email,
        name: typeof parsed.name === "string" ? parsed.name : null,
        location: typeof parsed.location === "string" ? parsed.location : null,
        occupation: typeof parsed.occupation === "string" ? parsed.occupation : null,
      };
    }
  } catch {
    // Legacy email-only value is intentionally ignored for JWT auth validation.
  }

  if (rawValue.includes("@")) {
    const email = rawValue.trim();
    return {
      id: email,
      email,
      name: email.split("@")[0] || null,
      location: null,
      occupation: null,
    };
  }

  return null;
}

function decodeJwtPayload(token: string): { exp?: number; userId?: string; email?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }

    const base64Payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      "="
    );

    const decoded = window.atob(paddedPayload);
    const payload = JSON.parse(decoded) as {
      exp?: number;
      userId?: string;
      sub?: string;
      email?: string;
    };

    if (!payload || typeof payload !== "object") {
      return null;
    }

    return {
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
      userId: typeof payload.userId === "string" ? payload.userId : payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
    };
  } catch {
    return null;
  }
}

function readStoredSession(): { user: AuthUser; token: string } | null {
  const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const sessionToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
  const token = localToken ?? sessionToken;

  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  const now = Math.floor(Date.now() / 1000);

  if (!payload || (typeof payload.exp === "number" && payload.exp <= now)) {
    return null;
  }

  const storedUser =
    parseStoredUser(localStorage.getItem(AUTH_USER_KEY)) ??
    parseStoredUser(sessionStorage.getItem(AUTH_USER_KEY));

  if (!storedUser) {
    const email = payload.email?.trim();
    if (!email) {
      return null;
    }

    return {
      token,
      user: {
        id: payload.userId ?? email,
        email,
        name: email.split("@")[0] || null,
        location: null,
        occupation: null,
      },
    };
  }

  return {
    token,
    user: storedUser,
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSession = readStoredSession();
      if (storedSession) {
        setUser(storedSession.user);
        setToken(storedSession.token);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((payload: AuthLoginPayload) => {
    if (payload.token && payload.user) {
      const nextUser: AuthUser = {
        id: payload.user.id,
        email: payload.user.email,
        name: payload.user.name,
        location: payload.user.location ?? null,
        occupation: payload.user.occupation ?? null,
      };

      const targetStorage = payload.rememberMe ? localStorage : sessionStorage;
      const otherStorage = payload.rememberMe ? sessionStorage : localStorage;

      targetStorage.setItem(AUTH_TOKEN_KEY, payload.token);
      targetStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
      otherStorage.removeItem(AUTH_TOKEN_KEY);
      otherStorage.removeItem(AUTH_USER_KEY);

      setToken(payload.token);
      setUser(nextUser);
      return;
    }

    const email = payload.email?.trim();
    if (!email) {
      return;
    }

    const legacyUser: AuthUser = {
      id: email,
      email,
      name: email.split("@")[0] || null,
      location: null,
      occupation: null,
    };

    if (payload.rememberMe) {
      localStorage.setItem(AUTH_USER_KEY, email);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } else {
      sessionStorage.setItem(AUTH_USER_KEY, email);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }

    setToken(null);
    setUser(legacyUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => {
    setUser((currentUser) => {
      const mergedUser = currentUser ? { ...currentUser, ...nextUser } : nextUser;
      const serializedUser = JSON.stringify(mergedUser);

      localStorage.setItem(AUTH_USER_KEY, serializedUser);
      sessionStorage.setItem(AUTH_USER_KEY, serializedUser);

      return mergedUser;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      logout,
      updateUser,
    }),
    [loading, login, logout, token, updateUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
