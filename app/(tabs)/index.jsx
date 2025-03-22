import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";

export default function Home() {
  const { token } = useAuthStore();
  const [bookTitle, setBookTitle] = useState("book");

  const BOOKI = async () => {
    const response = await fetch(
      `https://react-native-bookies-backend.onrender.com/api/books/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    
    const titles = data.books.map(book => `- ${book.title} (${book.rating}): ${book.caption}`).join("\n\n");
    setBookTitle(titles);
  };

  useEffect(() => {
    BOOKI();
  }, []);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text>Home</Text>
      <Text>{bookTitle}</Text>

      <TouchableOpacity onPress={BOOKI}>
        <Text style={{fontSize:20}}>Refresh</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
