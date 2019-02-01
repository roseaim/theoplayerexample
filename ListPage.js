import React from "react";
import { SafeAreaView, Text, TouchableOpacity } from "react-native";

const ListPage = ({ navigation }) => (
  <SafeAreaView>
    <TouchableOpacity onPress={() => navigation.navigate("ItemPage")}>
      <Text>GO DEEPER</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

export default ListPage;
