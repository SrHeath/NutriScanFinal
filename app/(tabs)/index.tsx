import { Image, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ProductDetailCard } from '@/components/ProductDetailCard';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alimento } from '@/lib/supabase';
import { foodDB } from '@/lib/supabase';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

export default function TabOneScreen() {
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [scannedAlimento, setScannedAlimento] = useState<Alimento | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<Alimento[]>([]);
  const [searchResults, setSearchResults] = useState<Alimento[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAlimento, setSelectedAlimento] = useState<Alimento | null>(null);
  const [favorites, setFavorites] = useState<Alimento[]>([]);

  // Cargar datos guardados cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
      loadFavorites();
    }, [])
  );

  const loadRecentSearches = useCallback(async () => {
    try {
      console.log('Cargando búsquedas recientes...');
      const searches = await AsyncStorage.getItem('recent_searches');
      console.log('Búsquedas encontradas en AsyncStorage:', searches);
      
      if (searches) {
        const parsedSearches = JSON.parse(searches);
        console.log('Búsquedas parseadas:', parsedSearches);
        
        // Ordenar por fecha más reciente y asegurarse de que timestamp existe
        const validSearches = parsedSearches
          .filter((search: Alimento & { timestamp: number }) => {
            const isValid = search && search.timestamp && search.id && search.nombre;
            if (!isValid) {
              console.log('Búsqueda inválida encontrada:', search);
            }
            return isValid;
          })
          .sort((a: Alimento & { timestamp: number }, b: Alimento & { timestamp: number }) => b.timestamp - a.timestamp);
        
        console.log('Búsquedas válidas ordenadas:', validSearches);
        setRecentSearches(validSearches);
      } else {
        console.log('No se encontraron búsquedas recientes');
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
      Alert.alert('Error', 'No se pudieron cargar las búsquedas recientes');
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem('favorites');
      if (favoritesJson) {
        setFavorites(JSON.parse(favoritesJson));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  const addToRecentSearches = async (alimento: Alimento) => {
    try {
      console.log('Agregando nueva búsqueda:', alimento);
      
      if (!alimento || !alimento.id || !alimento.nombre) {
        console.error('Alimento inválido:', alimento);
        return;
      }

      const newSearches = [
        { ...alimento, timestamp: Date.now() },
        ...recentSearches.filter(s => s.id !== alimento.id)
      ].slice(0, 10);
      
      console.log('Nuevas búsquedas a guardar:', newSearches);
      
      setRecentSearches(newSearches);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(newSearches));
      console.log('Búsquedas guardadas exitosamente');
      
      // Verificar que se guardó correctamente
      const savedSearches = await AsyncStorage.getItem('recent_searches');
      console.log('Verificación de búsquedas guardadas:', savedSearches);
    } catch (error) {
      console.error('Error saving recent search:', error);
      Alert.alert('Error', 'No se pudo guardar la búsqueda reciente');
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recent_searches');
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const toggleFavorite = async (alimento: Alimento) => {
    try {
      const isFavorite = favorites.some(fav => fav.id === alimento.id);
      let newFavorites;
      
      if (isFavorite) {
        newFavorites = favorites.filter(fav => fav.id !== alimento.id);
      } else {
        newFavorites = [...favorites, alimento];
      }
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (alimento: Alimento) => {
    return favorites.some(fav => fav.id === alimento.id);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    if (query.trim().length < 2) return;

    setIsSearching(true);
    try {
      const results = await foodDB.searchFoods(query);
      setSearchResults(results);
      if (results.length > 0) {
        addToRecentSearches(results[0]);
      }
    } catch (error) {
      console.error('Error searching foods:', error);
      Alert.alert('Error', 'No se pudieron cargar los resultados');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleBarcodeScan = async (alimento: Alimento | null, barcode: string) => {
    try {
      setIsScannerVisible(false);
      
      if (alimento) {
        setSearchResults([alimento]);
        await addToRecentSearches(alimento);
      } else {
        // Producto no encontrado, preguntar si desea registrarlo
        Alert.alert(
          'Producto no encontrado',
          '¿Deseas registrar este producto?',
          [
            {
              text: 'No',
              style: 'cancel'
            },
            {
              text: 'Sí',
              onPress: () => {
                router.push({
                  pathname: '/agregar-alimento',
                  params: { barcode }
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error al escanear:', error);
      Alert.alert('Error', 'Hubo un problema al procesar el código de barras. Por favor, intenta de nuevo.');
    }
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#4CAF50', dark: '#1B5E20' }}
        headerImage={
          <View style={styles.headerImageContainer}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.headerGradient}
            >
              <View style={styles.headerOverlay}>
                <ThemedText type="title" style={styles.headerTitle}>NutriScan</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                  Escanea y descubre la información nutricional
                </ThemedText>
              </View>
            </LinearGradient>
          </View>
        }
      >
        <View style={styles.content}>
          {/* Barra de búsqueda */}
          <ThemedView style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar alimentos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={() => setIsScannerVisible(true)}
            >
              <Ionicons name="barcode-outline" size={24} color="#666" />
            </TouchableOpacity>
          </ThemedView>

          {/* Búsquedas recientes */}
          {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
            <ThemedView style={styles.recentContainer}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Búsquedas recientes</ThemedText>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <ThemedText style={styles.clearButton}>Limpiar</ThemedText>
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.recentSearches}
              >
                {recentSearches.map((item, index) => {
                  if (!item || !item.nombre) return null;
                  return (
                    <TouchableOpacity 
                      key={item.id || index} 
                      style={styles.recentItem}
                      onPress={() => handleSearch(item.nombre)}
                    >
                      <ThemedText style={styles.recentItemText}>
                        {typeof item.nombre === 'string' ? item.nombre : 'Alimento'}
                      </ThemedText>
                      {item.timestamp && (
                        <ThemedText style={styles.recentItemTime}>
                          {new Date(item.timestamp).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </ThemedView>
          )}

          {/* Resultados de búsqueda */}
          {isSearching ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </ThemedView>
          ) : searchResults.length > 0 ? (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Resultados</ThemedText>
              <ScrollView style={styles.searchResults}>
                {searchResults.map((item) => (
                  <ProductDetailCard
                    key={item.id}
                    alimento={item}
                    isFavorite={isFavorite(item)}
                    onToggleFavorite={() => toggleFavorite(item)}
                    expanded={selectedAlimento?.id === item.id}
                    onPress={() => setSelectedAlimento(selectedAlimento?.id === item.id ? null : item)}
                  />
                ))}
              </ScrollView>
            </ThemedView>
          ) : searchQuery.trim().length > 0 && (
            <ThemedView style={[styles.section, styles.noResults]}>
              <Ionicons name="search" size={48} color="#666" />
              <ThemedText style={styles.noResultsText}>
                No se encontraron resultados
              </ThemedText>
            </ThemedView>
          )}
        </View>
      </ParallaxScrollView>

      {/* Modal del scanner */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isScannerVisible}
        onRequestClose={() => setIsScannerVisible(false)}
      >
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setIsScannerVisible(false)}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  scanButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    color: '#666',
    fontSize: 14,
  },
  recentContainer: {
    marginVertical: 16,
  },
  recentSearches: {
    flexGrow: 0,
    paddingLeft: 16,
  },
  recentItem: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 120,
    maxWidth: 200,
  },
  recentItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentItemTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchResults: {
    marginTop: 8,
  },
  searchResultItem: {
    marginBottom: 8,
  },
  searchResultContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  searchResultMain: {
    flex: 1,
    paddingRight: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  nutritionText: {
    fontSize: 12,
    opacity: 0.8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noResults: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
