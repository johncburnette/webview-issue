import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import WebView from 'react-native-webview';
import { useAssets } from 'expo-asset';
import { readAsStringAsync } from 'expo-file-system';

import { isEqual } from './utils';
import useInterval from './hooks/useInterval';

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
  relativePosition: {
    x: null,
    y: null
  }
};

const RevcontentNativeView = forwardRef(
  ({ widgetId, pubId, siteUrl, insets = {} }, ref) => {
    if (!widgetId) throw new TypeError('You must supply a valid widget ID');
    if (!pubId) throw new TypeError('You must supply a valid publisher ID');
    if (!siteUrl) throw new TypeError('You must supply a valid site URL');
    if (!ref)
      throw new TypeError(
        'RevcontentNativeView requires a ref to dispatch scroll position'
      );
    const [index] = useAssets(require('./assets/widget.html'));
    const { width, height } = useWindowDimensions();

    const viewRef = useRef(null);
    const webViewRef = useRef(null);
    const [html, setHtml] = useState('');
    const [viewHeight, setViewHeight] = useState(0);

    const [screenSize] = useState({ width, height });

    const [viewSize, setViewSize] = useState({
      width: null,
      height: null
    });

    const [relativePosition, setRelativePosition] = useState({
      x: null,
      y: null
    });

    const [screenDimensions, setScreenDimensions] = useState({
      x: null,
      y: null,
      width: null,
      height: null
    });

    const [isWidgetIntersecting, setIsWidgetIntersecting] = useState(false);

    if (index)
      readAsStringAsync(index[0].localUri).then(data => {
        data = data.replace(
          'data-widget-id="0"',
          `data-widget-id="${widgetId}"`
        );
        data = data.replace('data-pub-id="0"', `data-pub-id="${pubId}"`);
        setHtml(data);
      });

    const onMessage = ({ nativeEvent }) => {
      console.log(nativeEvent);
      const data = JSON.parse(nativeEvent.data);
      if (data.height) setViewHeight(data.height);
    };

    const measureDimensions = () => {
      viewRef.current.measureInWindow((x, y, width, height) => {
        if (!isEqual(screenObservations.relativePosition, { x, y }))
          screenObservations.relativePosition = {
            x,
            y
          };
      });

      viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        if (
          !isEqual(screenObservations.viewSize, {
            width,
            height,
            x,
            y,
            pageX,
            pageY
          })
        )
          screenObservations.viewSize = { width, height, x, y, pageX, pageY };
      });
    };

    const onScroll = async data => {
      //measure the relative position to state
      await measureDimensions();

      // We need to calculate the content position with the offest to determine where the
      // top position of the widget is so we can try to then figure out what should be considered
      // in view
      const contentOffsetWithLayout =
        data.contentOffset.y + data.layoutMeasurement.height;

      webViewRef.current.injectJavaScript(
        getInjectedMessage({
          widgetOffset: relativePosition.y,
          contentOffset: contentOffsetWithLayout,
          isWidgetIntersecting,
          screenDimensions: {
            width: screenDimensions.width,
            height: screenDimensions.height
          }
        })
      );
    };

    useImperativeHandle(ref, () => ({
      onScroll: onScroll
    }));

    useInterval(() => {
      measureDimensions();
      // Check if the screenObservations object is equal to the state version. If it's not
      // update it so that it can be dispatched to web view

      if (!isEqual(screenObservations.relativePosition, relativePosition))
        setRelativePosition(screenObservations.relativePosition);
      if (!isEqual(screenObservations.viewSize, viewSize))
        setViewSize(screenObservations.viewSize);
    }, 100);

    useEffect(() => {
      if (relativePosition.y !== null && relativePosition.y <= height) {
        setIsWidgetIntersecting(true);
      } else {
        setIsWidgetIntersecting(false);
      }
    }, [screenSize, viewSize, relativePosition]);

    useEffect(() => {
      console.log({ isWidgetIntersecting });
    }, [isWidgetIntersecting]);

    return (
      <View
        ref={viewRef}
        collapsable={false}
        style={{
          flex: 1,
          height: viewHeight
        }}>
        <View
          style={{
            backgroundColor: 'white',
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            zIndex: 123546
          }}>
          <Text>{isWidgetIntersecting.toString()}</Text>
          <Text>{JSON.stringify(relativePosition)}</Text>
          <Text>{JSON.stringify(viewSize)}</Text>
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
  }
);

export default RevcontentNativeView;
