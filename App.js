import React from "react";

import VideoPage from "./VideoPage";
import Navigator from "./Navigator";

// if VideoPage is rendered directly here it will play, if it is rendered inside react-navigation it will not.

export default class App extends React.Component {
  render() {
    return <Navigator />;
  }
}
