import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, ScrollView } from "react-native";

export default function CallbackScreen() {
  const [url, setUrl] = useState<string>("");
  const [code, setCode] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log("=== CALLBACK DEEP LINK ===");
      console.log("Full URL:", event.url);

      setUrl(event.url);

      try {
        const urlObj = new URL(event.url);
        const codeParam = urlObj.searchParams.get("code");
        const stateParam = urlObj.searchParams.get("state");
        const errorParam = urlObj.searchParams.get("error");
        const errorDescriptionParam = urlObj.searchParams.get("error_description");

        console.log("Parsed code:", codeParam);
        console.log("Parsed state:", stateParam);
        console.log("Parsed error:", errorParam);

        setCode(codeParam);
        setState(stateParam);
        setError(errorParam);
        setErrorDescription(errorDescriptionParam);
      } catch (err) {
        console.error("Error parsing URL:", err);
      }
    };

    // Подписка на deep links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Проверка URL при запуске
    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        console.log("=== CALLBACK INITIAL URL ===");
        console.log("URL:", initialUrl);
        handleDeepLink({ url: initialUrl });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleGoBack = () => {
    // Навигация назад к экрану авторизации
    Linking.openURL("ru.beeline.location://auth");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>OAuth Callback</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Полный URL:</Text>
        <Text style={styles.urlText}>{url || "Нет данных"}</Text>
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
