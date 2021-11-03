import { api } from "../../src/services/api";
import { createContext, ReactNode, useState } from "react";
import { useEffect } from "react";

type AuthResponse = {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  };
};

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
};

type AuthContextData = {
  user: User | null;
  singInUrl: string;
  signOut: (() => void) | null;
};
export const AuthContext = createContext({} as AuthContextData);

type AuthProvider = {
  children: ReactNode;
};

export function AuthProvider(props: AuthProvider) {
  const [user, setUser] = useState<User | null>(null);

  const singInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=3df8cb6fd9b7b3edcb5f`; //&redirect_uri=http://localhost:3000`;

  async function signIn(githubCode: string) {
    const response = await api.post<AuthResponse>("authenticate", {
      code: githubCode,
    });
    const { token, user } = response.data;
    localStorage.setItem("@dowhile:token", token);
    setUser(user);
  }
  function signOut() {
    setUser(null);
    localStorage.removeItem("@dowhile:token");
  }

  useEffect(() => {
    const token = localStorage.getItem("@dowhile:token");
    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;
      api.get<User>("profile").then((response) => {
        setUser(response.data);
      });
    }
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split("?code=");

      window.history.pushState({}, "", urlWithoutCode);
      signIn(githubCode);
    }
  }, []);
  return (
    <AuthContext.Provider value={{ singInUrl, user, signOut }}>
      {props.children}
    </AuthContext.Provider>
  );
}
