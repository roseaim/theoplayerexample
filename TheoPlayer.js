import React from "react";
import { StyleSheet, UIManager, findNodeHandle } from "react-native";
import { requireNativeComponent } from "react-native";

const RCTTHEOplayer = requireNativeComponent("RCTTHEOplayer", TheoPlayer, {
  nativeOnly: { onUserEvent: true }
});

export default class TheoPlayer extends React.Component {
  video = React.createRef();

  play() {
    UIManager.dispatchViewManagerCommand(
      findNodeHandle(this.video.current),
      UIManager.RCTTHEOplayer.Commands.play,
      null
    );
  }

  pause() {
    UIManager.dispatchViewManagerCommand(
      findNodeHandle(this.video.current),
      UIManager.RCTTHEOplayer.Commands.pause,
      null
    );
  }

  stop() {
    UIManager.dispatchViewManagerCommand(
      findNodeHandle(this.video.current),
      UIManager.RCTTHEOplayer.Commands.stop,
      null
    );
  }

  render() {
    return (
      <RCTTHEOplayer
        ref={this.video}
        isEmbeddable={true}
        defaultUIStyle="default"
        autoPlay={false}
        fullscreenOrientationCoupling={true}
        // defaultJsPaths={["https://dev1.otro.com/THEOCustom.js"]}
        // defaultCssPaths={[
        //   "https://dev1.otro.com/THEOPlayer/ui.css",
        //   "https://dev1.otro.com/THEOCustomSkin.css",
        //   "https://dev1.otro.com/THEOSkinNative.css"
        // ]}
        style={{
          ...StyleSheet.absoluteFillObject,
          height: 300,
          backgroundColor: "black",
          aspectRatio: 1.7
        }}
        source={{
          sources: [
            {
              src:
                "https://cdn.theoplayer.com/video/elephants-dream/playlist.m3u8",
              // "http://amssamples.streaming.mediaservices.windows.net/7ceb010f-d9a3-467a-915e-5728acced7e3/ElephantsDreamMultiAudio.ism/manifest(format=mpd-time-csf)",

              type: "application/x-mpegURL"
            }
          ],

          poster: "http://cdn.theoplayer.com/video/big_buck_bunny/poster.jpg"
        }}
        onError={e => console.error(e)}

      // textTracks={this.setSubtitleLabels(textTracks)}
      // style={style}
      // onUserEvent={this.onUserEvent}
      />
    );
  }
}
