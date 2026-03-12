import {
  DiscoveryDocument,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = makeRedirectUri({
  scheme: "ru.beeline.location",
  path: "callback",
});

const DISCOVERY: DiscoveryDocument = {
  authorizationEndpoint: "https://idphydra-int.beeline.ru/oauth2/auth",
};

const OAUTH_CONFIG = {
  clientId: "48c9343a-729a-46c4-accb-699eccce27e8",
  redirectUri: REDIRECT_URI,
  scopes: ["openid", "offline"],
  extraParams: {
    max_age: "0",
  },
};

export default function AuthScreen() {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [request, result, promptAsync] = useAuthRequest(
    OAUTH_CONFIG,
    DISCOVERY,
  );

  useEffect(() => {
    console.log("=== AUTH SCREEN ===");
    console.log("Request:", request);
    console.log("Result:", result);

    if (result) {
      setLoading(false);
      console.log("=== AUTH RESULT ===");
      console.log("Result type:", result.type);

      // Проверяем, есть ли params (только для success/error)
      if ("params" in result) {
        console.log("Result params:", JSON.stringify(result.params, null, 2));
        console.log("Result code:", result.params?.code);
        console.log("Result state:", result.params?.state);
        console.log("Result error:", result.params?.error);

        if (result.type === "success") {
          const responseString = `Тип: ${result.type}\n\nКод авторизации:\n${result.params?.code || "N/A"}\n\nState:\n${result.params?.state || "N/A"}`;
          setResponse(responseString);
        } else if (result.type === "error") {
          setResponse(
            `Ошибка:\n${result.params?.error || "Неизвестная ошибка"}\n\n${result.params?.error_description || ""}`,
          );
        }
      } else {
        setResponse(`Тип: ${result.type}\n\nОтмена авторизации`);
      }
    }
  }, [result]);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    setResponse("");
    console.log("=== STARTING AUTH ===");
    console.log("Redirect URI:", REDIRECT_URI);
    console.log("Auth Endpoint:", DISCOVERY.authorizationEndpoint);
    console.log("Client ID:", OAUTH_CONFIG.clientId);
    console.log("Scopes:", OAUTH_CONFIG.scopes.join(" "));
    console.log("Extra Params:", OAUTH_CONFIG.extraParams);
    
    // Формируем полный URL авторизации для логирования
    if (request?.url) {
      console.log("=== FULL AUTH URL ===");
      console.log(request.url);
    }
    
    try {
      const authResult = await promptAsync();
      console.log("=== PROMPT RESULT ===");
      console.log("Auth result:", JSON.stringify(authResult, null, 2));
    } catch (error) {
      setLoading(false);
      console.error("=== AUTH ERROR ===");
      console.error(error);
      setResponse(
        `Ошибка: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [promptAsync, request]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OAuth 2.0 Авторизация</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Войти через OAuth"
          onPress={handleLogin}
          // disabled={!request || loading}
        />
      </View>

      {loading && <ActivityIndicator size="large" style={styles.loader} />}

      {response ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Ответ:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
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
  loader: {
    marginVertical: 20,
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  responseText: {
    fontSize: 14,
    fontFamily: "monospace",
    lineHeight: 20,
  },
});
