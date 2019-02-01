import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
// import TheoPlayer from "./TheoPlayer";

export default class App extends React.Component {
  render() {
    return (
      <SafeAreaView style={styles.container}>
        {/* <TheoPlayer /> */}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
