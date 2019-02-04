//
//  Util.swift
//  app
//
//  Created by Jacob Parker on 13/06/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation

func isVideo(url: URL) -> Bool {
  switch url.pathExtension.lowercased() {
  case "3gp", "avi", "mov", "mp4", "mts", "m2ts", "mxf", "m4v":
    return true
  default:
    return false
  }
}
