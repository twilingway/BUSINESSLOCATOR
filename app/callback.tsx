import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

export default function CallbackScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [deepLinkUrl, setDeepLinkUrl] = useState<string>("");

  // Получаем параметры из роутера (expo-router)
  const code = params.code as string | null;
  const state = params.state as string | null;
  const error = params.error as string | null;
  const errorDescription = params.error_description as string | null;

  useEffect(() => {
    console.log("=== CALLBACK PAGE LOADED ===");
    console.log("Params from expo-router:", params);

    // Обработка deep link при запуске
    const handleDeepLink = (event: { url: string }) => {
      console.log("=== CALLBACK DEEP LINK ===");
      console.log("Full URL:", event.url);
      setDeepLinkUrl(event.url);
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        console.log("=== CALLBACK INITIAL URL ===");
        console.log("URL:", initialUrl);
        setDeepLinkUrl(initialUrl);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  // Формируем оригинальный URL из параметров
  const originalUrl = React.useMemo(() => {
    const url = new URL("ru.beeline.location://callback");
    if (code) url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);
    if (error) url.searchParams.set("error", error);
    if (errorDescription) url.searchParams.set("error_description", errorDescription);
    return url.toString();
  }, [code, state, error, errorDescription]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>OAuth Callback</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Оригинальный URL редиректа:</Text>
        <Text style={styles.urlText}>{originalUrl}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>URL из Deep Link:</Text>
        <Text style={styles.urlText}>{deepLinkUrl || "Нет данных"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Параметры из expo-router:</Text>
        <Text style={styles.urlText}>{JSON.stringify(params, null, 2)}</Text>
      </View>

      {code && (
        <View style={[styles.section, styles.successSection]}>
          <Text style={styles.sectionTitle}>✓ Код авторизации:</Text>
          <Text style={styles.codeText}>{code}</Text>
        </View>
      )}

      {state && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>State параметр:</Text>
          <Text style={styles.stateText}>{state}</Text>
        </View>
      )}

      {error && (
        <View style={[styles.section, styles.errorSection]}>
          <Text style={styles.sectionTitle}>✗ Ошибка:</Text>
          <Text style={styles.errorText}>{error}</Text>
          {errorDescription && (
            <Text style={styles.errorDescriptionText}>{errorDescription}</Text>
          )}
        </View>
      )}

      {!code && !error && !state && (
        <View style={styles.section}>
          <Text style={styles.emptyText}>Ожидание данных авторизации...</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Вернуться к авторизации" onPress={handleGoBack} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  successSection: {
    backgroundColor: "#e8f5e9",
    borderColor: "#4caf50",
  },
  errorSection: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  urlText: {
    fontSize: 12,
    fontFamily: "monospace",
    lineHeight: 18,
    color: "#333",
  },
  codeText: {
    fontSize: 14,
    fontFamily: "monospace",
    lineHeight: 20,
    color: "#2e7d32",
  },
  stateText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#1976d2",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c62828",
  },
  errorDescriptionText: {
    fontSize: 14,
    color: "#c62828",
    marginTop: 5,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});
