import Foundation
import UIKit

@objc(RCTThumbnailPreview)
class RCTThumbnailPreviewManager: RCTViewManager {
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  override func view() -> UIView! {
    return RCTThumbnailPreviewView()
  }
}
