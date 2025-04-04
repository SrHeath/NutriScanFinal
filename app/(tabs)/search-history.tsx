import { StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ThemedText } from "../../components/ThemedText"
import { ThemedView } from "../../components/ThemedView"
import { useState, useEffect, useCallback } from "react"
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { FoodCard } from "../../components/FoodCard"
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/Colors';

const STORAGE_KEY = "recent_searches"
const MAX_RECENT_SEARCHES = 10

interface SearchItem {
  nombre: string;
  calorias: number;
  proteinas?: number;
  grasas?: number;
  carbohidratos?: number;
  fibra?: number;
  sodio?: number;
  azucares?: number;
  imageUrl?: string;
  timestamp: number;
}

export default function SearchHistory({ onSelectSearch }: { onSelectSearch: (query: string) => void }) {
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([])
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const loadSearchHistory = useCallback(async () => {
    try {
      const savedSearches = await AsyncStorage.getItem(STORAGE_KEY)
      if (savedSearches) {
        const parsedSearches = JSON.parse(savedSearches);
        // Ordenar por fecha más reciente y asegurarse de que timestamp existe
        const validSearches = parsedSearches
          .filter((search: SearchItem) => search && search.timestamp)
          .sort((a: SearchItem, b: SearchItem) => b.timestamp - a.timestamp);
        setRecentSearches(validSearches);
      }
    } catch (error) {
      console.error("Error loading search history:", error)
    }
  }, [])

  // Cargar historial al montar el componente
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Actualizar cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      loadSearchHistory();
    }, [loadSearchHistory])
  );

  const clearSearchHistory = async () => {
    Alert.alert(
      "Borrar historial",
      "¿Estás seguro que deseas borrar todo el historial de búsquedas?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY)
            setRecentSearches([])
          }
        }
      ]
    )
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const removeFromHistory = async (food: SearchItem) => {
    try {
      const updatedHistory = recentSearches.filter(item => item.nombre !== food.nombre);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      setRecentSearches(updatedHistory);
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={[styles.title, { color: colors.text }]}>Historial de Búsquedas</ThemedText>
        {recentSearches.length > 0 && (
          <TouchableOpacity onPress={clearSearchHistory}>
            <Ionicons name="trash-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </ThemedView>
      
      <ScrollView style={styles.scrollView}>
        {recentSearches.length > 0 ? (
          recentSearches.map((item, index) => (
            <ThemedView key={index} style={styles.searchItem}>
              <ThemedText style={[styles.timestamp, { color: colors.text }]}>
                {formatDate(item.timestamp)}
              </ThemedText>
              <FoodCard
                key={index}
                {...item}
                showDetails={true}
                onDelete={() => removeFromHistory(item)}
                showDeleteButton={true}
                style={{ backgroundColor: colors.background }}
                textColor={colors.text}
              />
            </ThemedView>
          ))
        ) : (
          <ThemedText style={[styles.emptyText, { color: colors.text }]}>
            No hay búsquedas recientes
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  searchItem: {
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
