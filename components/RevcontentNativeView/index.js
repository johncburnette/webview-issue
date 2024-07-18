import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, useWindowDimensions } from 'react-native';
import WebView from 'react-native-webview';
import { useAssets } from 'expo-asset';
import { readAsStringAsync } from 'expo-file-system';

const getInjectedMessage = message => {
  return `
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
        data: ${JSON.stringify(message)}
      }));
    })();
  `;
};

const screenObservations = {
  viewSize: {
    width: null,
    height: null
  },
  isWidgetIntersecting: false
};

const RevcontentNativeView = forwardRef(({ widgetId, pubId, siteUrl }, ref) => {
  /**
   * These are required params that must be passed to this component. If any of these
   * values contain no value, the component is not usable and should throw a type error
   * to raise the issue to the end user
   */
  if (!widgetId) throw new TypeError('You must supply a valid widget ID');
  if (!pubId) throw new TypeError('You must supply a valid publisher ID');
  if (!siteUrl) throw new TypeError('You must supply a valid site URL');
  if (!ref)
    throw new TypeError(
      'RevcontentNativeView requires a ref to dispatch scroll position'
    );
  const [index, error] = useAssets(require('./assets/widget.html'));
  const { width, height } = useWindowDimensions();

  const viewRef = useRef(null);
  const webViewRef = useRef(null);
  const [html, setHtml] = useState('');
  const [viewHeight, setViewHeight] = useState(800);

  /**
   * These values are initialized with a null value for initial state interrogation
   * If the value is null, we know that it has not been set. This defends against cases
   * where a true value could be received but is 0
   */
  const [viewSize, setViewSize] = useState({
    x: null,
    y: null,
    width: null,
    height: null
  });

  const [isWidgetIntersecting, setIsWidgetIntersecting] = useState(false);

  if (index)
    readAsStringAsync(index[0].localUri).then(data => {
      data = data.replaceAll('{WIDGET_ID}', widgetId);
      data = data.replaceAll('{PUBLISHER_ID}', pubId);
      console.log(data);
      setHtml(data);
    });

  const onMessage = ({ nativeEvent }) => {
    /**
     * Message consumption from webview. Any time a message is sent from the webview into
     * the component, it is consumed here. Currently, the only message being sent is the
     * observed height of the widget in the adcode itself. It is then sent to the component
     * so that a height style can be applied to the view/webview here
     */
    const data = JSON.parse(nativeEvent.data);
    if (data.height) setViewHeight(data.height);
  };

  const onLayout = ({ nativeEvent }) => {
    console.log('onLayout called', nativeEvent.layout);
    const { layout } = nativeEvent;

    setViewSize({
      x: layout.x,
      y: layout.y,
      width: Math.round(layout.width),
      height: Math.round(layout.height)
    });
  };

  const onError = ({ nativeEvent }) => console.log(nativeEvent);

  useImperativeHandle(ref, () => ({
    onScroll: data => {
      /**
       * Derive a value of the current content offset y position with the height to
       * calculate where the current scroll position is so that we can determine if
       * the view is starting tobecome visible. Consider these values:
       *
       * data.contentOffset: {"x": 0, "y": 103.66666666666667}
       * data.layoutMeasurement: {"height": 839, "width": 430}
       * viewSize: {"height": 1285.9999999999998, "width": 430, "x": 0, "y": 1490}
       *
       * The value of contentOffset.y is combined with height to calculate a derived y
       * position. This provides an equality check between the viewSize.y position when
       * the first pixel of the view housing the webview becomes visible. If this
       * condition is true, then isWidgetIntersecting is set to true. The values are
       * then finally posted to the webview
       */

      const contentOffsetWithLayout =
        data.contentOffset.y + data.layoutMeasurement.height;

      if (contentOffsetWithLayout >= viewSize.y) {
        screenObservations.isWidgetIntersecting = true;
      } else {
        screenObservations.isWidgetIntersecting = false;
      }

      if (contentOffsetWithLayout >= viewSize.y) {
        setIsWidgetIntersecting(true);
      } else if (isWidgetIntersecting !== false) {
        setIsWidgetIntersecting(false);
      }

      webViewRef.current.injectJavaScript(
        getInjectedMessage({
          contentOffset: Math.round(contentOffsetWithLayout),
          rawOffset: Math.round(data.contentOffset.y),
          isWidgetIntersecting,
          viewSize,
          screenDimensions: {
            width,
            height
          }
        })
      );
    }
  }));

  /**
   * Measuring dimensions via an interval is probably more reliable, but the x/y
   * position is always 0 on android. Workarounds mentioned on github issues for
   * this don't remedy the values in this use case. Using onLayout to get the values
   * seems ok and it also appears to respond to scenarios where a deferred component is
   * loaded as it was observed that onLayout was called again with the component loaded with
   * updated values. Another possible workaround is to pass a parent ref via a property
   * and then use measureLayout to get the initial y pos but this also doesn't feel ideal
   * See issue here: https://github.com/facebook/react-native/issues/4753
   */

  // useInterval(() => {
  //   measureDimensions();
  //   /**
  //    * We use isEqual to deeply check the values of the screenObservations because we
  //    * should only update the state that provides reactivity if there's differences in
  //    * the values being watched. If it determines that a value has changed, update the
  //    * state
  //    */
  //   // if (!isEqual(screenObservations.relativePosition, relativePosition))
  //   //   setRelativePosition(screenObservations.relativePosition);
  //   if (!isEqual(screenObservations.viewSize, viewSize))
  //     setViewSize(screenObservations.viewSize);
  // }, 100);

  // This is needed in order to determine visibility without scroll interaction
  // useEffect(() => {
  //   setIsWidgetIntersecting(screenObservations.isWidgetIntersecting);
  // }, [screenSize, viewSize, relativePosition]);

  return (
    <View
      ref={viewRef}
      collapsable={false}
      onLayout={onLayout}
      removeClippedSubviews={false}
      style={{
        flex: 1,
        height: viewHeight
      }}>
      <WebView
        ref={webViewRef}
        onMessage={onMessage}
        onError={onError}
        originWhitelist={['*']}
        scrollEnabled="false"
        cacheEnabled={false}
        startInLoadingState
        javaScriptEnabled
        style={{ flex: 1, height: viewHeight }}
        source={{
          html,
          baseUrl: siteUrl
        }}></WebView>
    </View>
  );
});

export default RevcontentNativeView;
