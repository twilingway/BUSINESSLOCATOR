import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { getRandomBytesAsync } from "expo-crypto";
import React, { useCallback, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

// Redirect URI для OAuth
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "ru.beeline.location",
  path: "callback",
});

const OAUTH_CONFIG = {
  authorizationEndpoint: "https://idphydra-int.beeline.ru/oauth2/auth",
  clientId: "48c9343a-729a-46c4-accb-699eccce27e8",
  scopes: ["openid", "offline"],
  extraParams: {
    max_age: "0",
  },
};

// Генерация случайного state для защиты от CSRF-атак
const generateState = async (): Promise<string> => {
  const array = await getRandomBytesAsync(16);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
};

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState<string>("");

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: OAUTH_CONFIG.clientId,
      scopes: OAUTH_CONFIG.scopes,
      redirectUri: REDIRECT_URI,
      extraParams: {
        ...OAUTH_CONFIG.extraParams,
        state: authState,
      },
    },
    {
      authorizationEndpoint: OAUTH_CONFIG.authorizationEndpoint,
    }
  );

  const handleLogin = useCallback(async () => {
    setLoading(true);

    try {
      // Генерируем state для защиты от CSRF-атак
      const state = await generateState();
      console.log("Generated state:", state);

      // Устанавливаем state в authState для useAuthRequest
      setAuthState(state);

      // Небольшая задержка чтобы authState обновился перед promptAsync
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Формируем полный URL авторизации для логирования
      const authUrl = new URL(OAUTH_CONFIG.authorizationEndpoint);
      authUrl.searchParams.append("client_id", OAUTH_CONFIG.clientId);
      authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("scope", OAUTH_CONFIG.scopes.join(" "));
      authUrl.searchParams.append("max_age", OAUTH_CONFIG.extraParams.max_age);
      authUrl.searchParams.append("state", state);

      console.log("=== FULL AUTH URL ===");
      console.log(authUrl.toString());
      console.log("=== STATE PARAM ===");
      console.log(state);

      // Открываем браузер для авторизации
      await promptAsync();
    } catch (error) {
      setLoading(false);
      console.error("=== AUTH ERROR ===");
      console.error(error);
    }
  }, [promptAsync]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OAuth 2.0 Авторизация</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Войти через OAuth"
          onPress={handleLogin}
          disabled={loading}
        />
      </View>

      {loading && <Text style={styles.loading}>Запрос авторизации...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  loading: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});
