import React from 'react';
import {
  createStackNavigator,
  createAppContainer,
  createBottomTabNavigator
} from "react-navigation";
import VideoPage from "./VideoPage";
import ListPage from "./ListPage";
import ItemPage from "./ItemPage";

const CrashStack = createStackNavigator(
  {
    ListPage: {
      screen: ListPage
    },
    ItemPage: {
      screen: ItemPage
    }
  },
  {
    headerMode: "none"
  }
);

const TabNavigator = createBottomTabNavigator(
  {
    VideoPage: {
      screen: VideoPage,
      navigationOptions: {
        title: "Video"
      }
    },
    CrashStack: {
      screen: CrashStack,
      navigationOptions: {
        title: "Press here for android unmounting bug"
      }
    }
  },
  {
    tabBarPosition: "bottom",
    swipeEnabled: true,
    animationEnabled: false,
    lazy: true,
    tabBarOptions: {
      showIcon: false,
      showLabel: true,
      upperCaseLabel: false,
      activeTintColor: "lime",
      inactiveTintColor: "white",
      style: {
        backgroundColor: "red"
      }
    },
    initialRouteName: "VideoPage"
  }
);

const Navigator = createAppContainer(
  createStackNavigator(
    {
      Tabs: {
        screen: TabNavigator
      }
    },
    {
      initialRouteName: "Tabs",
      mode: "modal",
      // headerMode: "none",
      transparentCard: true
    }
  )
);

export default Navigator;
