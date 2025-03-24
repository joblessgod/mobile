import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";

import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { formatPublishDate } from "../../libs/utils";
import { sleep } from "../../libs/sleep";
import Loader from "../../components/Loader";

export default function Profile() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletedBookId, setDeletedBookId] = useState(null);

  const { token, logout } = useAuthStore();

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/books/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message) || "Failed to fetch user books";
      }
      setBooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderRatingPicker = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const handleDeleteBook = async (bookId) => {
    try {
      setDeletedBookId(bookId);
      const response = await fetch(`${API_URL}/books/book/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete book");
      }

      setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));
      Alert.alert("Success", "Book deleted successfully");
    } catch (error) {
      console.error("Error while deleting book", error);
      Alert.alert("Error", error.message || "Failed to delete book");
    } finally {
      setDeletedBookId(null);
    }
  };

  const confirmDelete = (bookId) =>
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteBook(bookId),
      },
    ]);
  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={item.image} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingPicker(item.rating)}
        </View>
        <Text style={styles.bookCaption}>{item.caption}</Text>
        <Text style={styles.bookDate}>{formatPublishDate(item.createdAt)}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item._id)}
      >
        {deletedBookId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) return <Loader />;
  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      {/* YOUR RECOMMENDATIONS */}
      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Recommendations 📚</Text>
        <Text style={styles.booksCount}>
          {books.length > 0 ? <>{books.length} books</> : <>No books</>}
        </Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await sleep(500);
              fetchData();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={50}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No books found</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>Add Your First Book</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
