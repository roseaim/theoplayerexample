//
//  appBridge.m
//  app
//
//  Created by Jacob Parker on 14/05/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTView.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#import <THEOplayerSDK/THEOplayerSDK-Swift.h>
#import "TheoPlayerTest-Bridging-Header.h"

@implementation RCTConvert (THEOplayer)
RCT_ENUM_CONVERTER(THEOplayerUIStyle, (@{
                                         @"default": @(THEOplayerUIStyleDefault),
                                         @"unstyled": @(THEOplayerUIStyleUnstyled),
                                         @"chromeless": @(THEOplayerUIStyleChromeless),
                                         }), THEOplayerUIStyleDefault, integerValue)
@end

@interface RCT_EXTERN_MODULE(RCTTHEOplayer, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(onUserEvent, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(defaultUIStyle, THEOplayerUIStyle)
RCT_EXPORT_VIEW_PROPERTY(defaultJsPaths, NSArray<NSString *>)
RCT_EXPORT_VIEW_PROPERTY(defaultCssPaths, NSArray<NSString *>)
RCT_EXPORT_VIEW_PROPERTY(source, SourceDescription)
RCT_EXPORT_VIEW_PROPERTY(autoPlay, BOOL)
RCT_EXPORT_VIEW_PROPERTY(fullscreenOrientationCoupling, BOOL)
RCT_EXTERN_METHOD(pause:(nonnull NSNumber *)reactTag)
@end

@interface RCT_EXTERN_MODULE(RCTThumbnailPreview, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(uri, NSURL)
RCT_REMAP_VIEW_PROPERTY(resizeMode, contentMode, UIViewContentMode)
@end

