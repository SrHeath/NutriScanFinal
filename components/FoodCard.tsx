import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface FoodCardProps {
  nombre: string;
  calorias: number;
  proteinas?: number;
  grasas?: number;
  carbohidratos?: number;
  fibra?: number;
  sodio?: number;
  azucares?: number;
  imageUrl?: string;
  showDetails?: boolean;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  style?: ViewStyle;
  textColor?: string;
}

export function FoodCard({
  nombre,
  calorias,
  proteinas,
  grasas,
  carbohidratos,
  fibra,
  sodio,
  azucares,
  showDetails = false,
  onDelete,
  showDeleteButton = false,
  style,
  textColor = '#000',
}: FoodCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {nombre}
        </ThemedText>
        {showDeleteButton && onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="close-circle" size={24} color="#ff4444" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.nutrientRow}>
          <ThemedText style={[styles.nutrientLabel, { color: textColor }]}>Calorías:</ThemedText>
          <ThemedText style={[styles.nutrientValue, { color: textColor }]}>{calorias} kcal</ThemedText>
        </View>

        {showDetails && (
          <>
            {proteinas !== undefined && (
              <View style={styles.nutrientRow}>
                <ThemedText style={[styles.nutrientLabel, { color: textColor }]}>Proteínas:</ThemedText>
                <ThemedText style={[styles.nutrientValue, { color: textColor }]}>{proteinas}g</ThemedText>
              </View>
            )}
            {grasas !== undefined && (
              <View style={styles.nutrientRow}>
                <ThemedText style={[styles.nutrientLabel, { color: textColor }]}>Grasas:</ThemedText>
                <ThemedText style={[styles.nutrientValue, { color: textColor }]}>{grasas}g</ThemedText>
              </View>
            )}
            {carbohidratos !== undefined && (
              <View style={styles.nutrientRow}>
                <ThemedText style={[styles.nutrientLabel, { color: textColor }]}>Carbohidratos:</ThemedText>
                <ThemedText style={[styles.nutrientValue, { color: textColor }]}>{carbohidratos}g</ThemedText>
              </View>
            )}
            {fibra !== undefined && (
              <View style={styles.nutrientRow}>
                <ThemedText style={[styles.nutrientLabel, { color: textColor }]}>Fibra:</ThemedText>
                <ThemedText style={[styles.nutrientValue, { color: textColor }]}>{fibra}g</ThemedText>
              </View>
            )}
            {sodio !== undefined && (
              <View style={styles.nutrientRow}>
                <ThemedText style={[styles.nutrientLabel, { color: textColor }]}>Sodio:</ThemedText>
                <ThemedText style={[styles.nutrientValue, { color: textColor }]}>{sodio}mg</ThemedText>
              </View>
            )}
            {azucares !== undefined && (
              <View style={styles.nutrientRow}>
                <ThemedText style={[styles.nutrientLabel, { color: textColor }]}>Azúcares:</ThemedText>
                <ThemedText style={[styles.nutrientValue, { color: textColor }]}>{azucares}g</ThemedText>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  content: {
    gap: 8,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientLabel: {
    fontSize: 14,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
