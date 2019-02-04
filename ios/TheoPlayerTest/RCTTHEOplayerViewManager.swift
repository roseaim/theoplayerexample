import Foundation
import THEOplayerSDK
import UIKit

@objc(RCTTHEOplayer)
class RCTTHEOplayerViewManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    override func view() -> UIView! {
        return RCTTHEOplayerView()
    }
    
    @objc func play(_ reactTag: NSNumber) {
        self.execute(reactTag) { $0.play() }
    }
    
    @objc func pause(_ reactTag: NSNumber) {
        self.execute(reactTag) { $0.pause() }
    }
    
    @objc func stop(_ reactTag: NSNumber) {
        self.execute(reactTag) { $0.stop() }
    }
    
    fileprivate func execute(_ reactTag: NSNumber, block: @escaping (_ player: RCTTHEOplayerView) -> Void) {
        bridge.uiManager.addUIBlock { (uiManager: RCTUIManager!, viewRegistry: [NSNumber:UIView]!) in
            block(viewRegistry[reactTag] as! RCTTHEOplayerView)
        }
    }
}
