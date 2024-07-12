import WebView from 'react-native-webview';
import { useAssets } from 'expo-asset';
import { readAsStringAsync } from 'expo-file-system';
import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react';
import { Text, View } from 'react-native';

const getInjectedMessage = message => {
  return `
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
        data: ${JSON.stringify(message)}
      }));
    })();
  `;
};

const RevcontentNativeView = forwardRef(({ widgetId, pubId, siteUrl }, ref) => {
  if (!widgetId) throw new TypeError('You must supply a valid widget ID');
  if (!pubId) throw new TypeError('You must supply a valid publisher ID');
  if (!siteUrl) throw new TypeError('You must supply a valid site URL');
  if (!ref)
    throw new TypeError(
      'RevcontentNativeView requires a ref to dispatch scroll position'
    );
  const [index] = useAssets(require('./assets/widget.html'));
  const viewRef = useRef(null);
  const webViewRef = useRef(null);
  const [html, setHtml] = useState('');
  const [viewHeight, setViewHeight] = useState(0);
  const [screenDimensions, setScreenDimensions] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [scrollDimensions, setScrollDimensions] = useState({
    contentInset: { bottom: 0, left: 0, right: 0, top: 0 },
    contentOffset: { x: 0, y: 0 },
    contentSize: { height: 0, width: 0 },
    layoutMeasurement: { height: 0, width: 0 },
    zoomScale: 1
  });
  const [relativeLayout, setRelativeLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  if (index)
    readAsStringAsync(index[0].localUri).then(data => {
      data = data.replace('data-widget-id="0"', `data-widget-id="${widgetId}"`);
      data = data.replace('data-pub-id="0"', `data-pub-id="${pubId}"`);
      setHtml(data);
    });

  const onMessage = ({ nativeEvent }) => {
    const data = JSON.parse(nativeEvent.data);
    if (data.height) setViewHeight(data.height);
  };

  useImperativeHandle(ref, () => ({
    onScroll: data => {
      //save scroll values to state
      setScrollDimensions(data);

      //measure the relative position to state
      viewRef.current.measure((x, y, width, height) =>
        setRelativeLayout({
          x,
          y,
          width,
          height
        })
      );
      // We need to calculate the content position with the offest to determine where the
      // top position of the widget is so we can try to then figure out what should be considered
      // in view
      const contentOffsetWithLayout =
        data.contentOffset.y + data.layoutMeasurement.height;
      const isWidgetIntersecting = contentOffsetWithLayout >= relativeLayout.y;

      webViewRef.current.injectJavaScript(
        getInjectedMessage({
          action: 'scroll',
          payload: data
        })
      );
    }
  }));

  useEffect(() => {
    viewRef.current?.measureInWindow((x, y, width, height) => {
      // limit state update to only when any dimension doesn't match what's current in state
      if (
        x !== screenDimensions.x ||
        y !== screenDimensions.y ||
        width !== screenDimensions.width ||
        height !== screenDimensions.height
      ) {
        setScreenDimensions({ x, y, width, height });
      }
    });
  });

  useEffect(() => {
    //send back screen dimensions
    webViewRef.current.injectJavaScript(
      getInjectedMessage({
        action: 'screen',
        payload: screenDimensions
      })
    );
  }, [screenDimensions]);

  return (
    <View
      ref={viewRef}
      style={{
        flex: 1,
        height: viewHeight
      }}>
      <View
        style={{
          position: 'relative',
          top: 0,
          right: 0,
          left: 0,
          zIndex: 123234,
          backgroundColor: '#e7e7e7',
          padding: 15
        }}>
        <Text>{JSON.stringify(screenDimensions)}</Text>
        <Text>{JSON.stringify(scrollDimensions)}</Text>
      </View>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        scrollEnabled={false}
        onMessage={onMessage}
        style={{ flex: 1, height: viewHeight }}
        source={{ html }}></WebView>
    </View>
  );
});

export default RevcontentNativeView;
