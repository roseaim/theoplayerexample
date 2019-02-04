import Foundation
import UIKit
import AVFoundation
import Photos

fileprivate extension UIImage {
  static func videoThumbnail(for url: URL) -> UIImage? {
    let asset = AVURLAsset(url: url)
    let generator = AVAssetImageGenerator(asset: asset)
    generator.appliesPreferredTrackTransform = true
    let timestamp = CMTime(seconds: asset.duration.seconds / 2.0, preferredTimescale: 60)
    if let imageRef = try? generator.copyCGImage(at: timestamp, actualTime: nil) {
      return UIImage(cgImage: imageRef)
    } else {
      return nil
    }
  }

  static func photoThumbnail(for url: URL) -> UIImage? {
    let fixMeSize = 200
    guard let asset = PHAsset.fetchAssets(withALAssetURLs: [url], options: nil).firstObject else {
      return nil
    }
    let manager = PHImageManager.default()
    let option = PHImageRequestOptions()
    var thumbnail: UIImage? = nil
    option.isSynchronous = true
    manager.requestImage(for: asset, targetSize: CGSize(width: fixMeSize, height: fixMeSize), contentMode: .aspectFit, options: option, resultHandler: { (result, info) in
      thumbnail = result
    })
    return thumbnail
  }

  static func thumbnail(for url: URL) -> UIImage? {
    if isVideo(url: url) {
      return UIImage.videoThumbnail(for: url)
    } else {
      return UIImage.photoThumbnail(for: url)
    }
  }

}

@objc(RCTThumbnailPreviewView)
class RCTThumbnailPreviewView: UIImageView {

  var uri: URL? = nil { didSet { setImage() } }

  init() {
    super.init(image: nil)
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
  }

  required init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  fileprivate func setImage() {
    if PHPhotoLibrary.authorizationStatus() == .authorized {
      self.image = uri.flatMap { UIImage.thumbnail(for: $0) }
    } else {
      requestImageAuth()
    }
  }

  fileprivate func requestImageAuth() {
    PHPhotoLibrary.requestAuthorization {
      switch $0 {
      case .authorized: self.setImage()
      default: self.image = nil
      }
    }
  }

}
