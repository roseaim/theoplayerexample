import Foundation
import UIKit
import THEOplayerSDK

@objc(RCTTHEOplayerView)
class RCTTHEOplayerView: UIView {
    var player: THEOplayer? = nil
    
    public var onUserEvent: RCTDirectEventBlock? = nil
    
    var defaultUIStyle: THEOplayerUIStyle = .default
    var defaultCssPaths: [String]? = nil
    var defaultJsPaths: [String]? = nil
    
    /*
     We delay player creation on mount so the props get set before. This means we can
     use the {Css,Js} paths for player creation. Props can also get set after player
     mounting. We need to handle both cases
     */
    var source: SourceDescription? { didSet { player?.source = source } }
    var autoPlay: Bool = true { didSet { player?.autoplay = autoPlay } }
    var fullscreenOrientationCoupling: Bool = true { didSet {
        player?.fullscreenOrientationCoupling = fullscreenOrientationCoupling
        if !fullscreenOrientationCoupling {
            player?.presentationMode = .inline
        }
        } }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    //  deinit {
    //    player?.destroy()
    //    player = nil
    //  }
    
    override func willMove(toSuperview newSuperview: UIView?) {
        super.willMove(toSuperview: newSuperview)
        if newSuperview == nil {
            player?.destroy()
            player = nil
        }
    }
    
    override func didSetProps(_ changedProps: [String]!) {
        super.didSetProps(changedProps)
        
        if player == nil, let source = source {
            let configuration: THEOplayerConfiguration = {
                switch defaultUIStyle {
                case .default, .unstyled:
                    return THEOplayerConfiguration(
                        defaultCSS: defaultUIStyle != .unstyled,
                        cssPaths: defaultCssPaths ?? [],
                        jsPaths: defaultJsPaths ?? []
                    )
                case .chromeless:
                    return THEOplayerConfiguration(
                        chromeless: true,
                        cssPaths: defaultCssPaths ?? [],
                        jsPaths: defaultJsPaths ?? []
                    )
                }
            }()
            player = THEOplayer(configuration: configuration)
            player?.frame = bounds
            player?.addAsSubview(of: self)
            player?.source = source
            player?.autoplay = autoPlay
            player?.fullscreenOrientationCoupling = fullscreenOrientationCoupling
            player?.addJavascriptMessageListener(name: "userEvent") {
                if let data = $0["data"] {
                    self.onUserEvent?(["data": data])
                }
            }
        }
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        player?.frame = self.bounds
        player?.autoresizingMask = [.flexibleBottomMargin, .flexibleHeight, .flexibleLeftMargin, .flexibleRightMargin, .flexibleTopMargin, .flexibleWidth]
    }
    
    func play() {
        player?.play()
    }
    
    func pause() {
        player?.pause()
    }
    
    func stop() {
        player?.stop()
    }
}
