import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import type { Alimento } from '../../lib/supabase';
import { foodDB } from '../../lib/supabase';
import { useState } from 'react';

export default function FoodComparison() {
  const [selectedFoods, setSelectedFoods] = useState<Alimento[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Alimento[]>([]);

  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const results = await foodDB.searchFoods(query);
    setSearchResults(results);
  };

  const addFoodToComparison = (food: Alimento) => {
    if (selectedFoods.length >= 3) {
      return;
    }
    if (selectedFoods.some((item) => item.id === food.id)) {
      return;
    }
    setSelectedFoods([...selectedFoods, food]);
  };

  const removeFoodFromComparison = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter((food) => food.id !== foodId));
  };

  const renderNutrientRow = (label: string, key: keyof Alimento) => {
    return (
      <View style={styles.row} key={key}>
        <View style={styles.labelCell}>
          <ThemedText>{label}</ThemedText>
        </View>
        {selectedFoods.map((food, index) => (
          <View key={index} style={styles.valueCell}>
            <ThemedText>
              {food[key] !== undefined ? `${food[key]}` : '-'}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar alimentos..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
          />
        </View>

        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.searchResultItem}
                onPress={() => addFoodToComparison(food)}
              >
                <ThemedText>{food.nombre}</ThemedText>
                <ThemedText>{food.calorias} kcal</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedFoods.length > 0 && (
          <View style={styles.comparisonTable}>
            <View style={styles.headerRow}>
              <View style={styles.labelCell}>
                <ThemedText style={styles.headerText}>Nutriente</ThemedText>
              </View>
              {selectedFoods.map((food, index) => (
                <View key={index} style={styles.headerCell}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFoodFromComparison(food.id)}
                  >
                    <ThemedText style={styles.removeButtonText}>X</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.headerText} numberOfLines={2}>
                    {food.nombre}
                  </ThemedText>
                </View>
              ))}
            </View>

            {renderNutrientRow('Calorías (kcal)', 'calorias')}
            {renderNutrientRow('Proteínas (g)', 'proteinas')}
            {renderNutrientRow('Grasas (g)', 'grasas')}
            {renderNutrientRow('Grasas sat. (g)', 'grasas_saturadas')}
            {renderNutrientRow('Azúcares (g)', 'azucares')}
            {renderNutrientRow('Sodio (mg)', 'sodio')}
            {renderNutrientRow('Fibra (g)', 'fibra')}
            {renderNutrientRow('Vitamina A (UI)', 'vitamina_a')}
            {renderNutrientRow('Vitamina C (mg)', 'vitamina_c')}
            {renderNutrientRow('Calcio (mg)', 'calcio')}
            {renderNutrientRow('Hierro (mg)', 'hierro')}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchResults: {
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  comparisonTable: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  labelCell: {
    flex: 2,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  valueCell: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    alignItems: 'center',
  },
  headerCell: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
