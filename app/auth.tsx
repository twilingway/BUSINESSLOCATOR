import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
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

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: OAUTH_CONFIG.clientId,
      scopes: OAUTH_CONFIG.scopes,
      redirectUri: REDIRECT_URI,
      extraParams: {
        ...OAUTH_CONFIG.extraParams,
      },
    },
    {
      authorizationEndpoint: OAUTH_CONFIG.authorizationEndpoint,
    }
  );

  // Логирование запроса и результата
  React.useEffect(() => {
    if (request) {
      console.log("=== AUTH REQUEST ===");
      console.log("Request state (auto-generated):", request.state);
      console.log("Full request:", JSON.stringify(request, null, 2));
    }
  }, [request]);

  // Логирование результата авторизации
  React.useEffect(() => {
    if (result && result.type === "success") {
      console.log("=== AUTH RESULT (on auth page) ===");
      console.log("Result type:", result.type);
      console.log("Result URL:", result.url);
      console.log("Result params:", (result as any).params);
      console.log("Result state from params:", (result as any).params?.state);
      console.log("Full result:", JSON.stringify(result, null, 2));
    } else if (result) {
      console.log("=== AUTH RESULT (non-success) ===");
      console.log("Result type:", result.type);
      console.log("Full result:", JSON.stringify(result, null, 2));
    }
  }, [result]);

  const handleLogin = useCallback(async () => {
    setLoading(true);

    try {
      // Используем state который сгенерировал expo-auth-session
      const state = request?.state;
      console.log("=== STATE FROM EXPO-AUTH-SESSION ===");
      console.log("State:", state);

      // Формируем полный URL авторизации для логирования
      const authUrl = request?.url as string;

      console.log("=== FULL AUTH URL ===");
      console.log(authUrl);
      console.log("=== STATE SENT ===");
      console.log(state);

      // Открываем браузер для авторизации
      await promptAsync();
    } catch (error) {
      setLoading(false);
      console.error("=== AUTH ERROR ===");
      console.error(error);
    }
  }, [promptAsync, request]);

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
