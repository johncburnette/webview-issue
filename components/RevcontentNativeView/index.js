import WebView from 'react-native-webview';
import { useAssets } from 'expo-asset';
import { readAsStringAsync } from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';

const getInjectedMessage = message => {
  return `
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
        data: ${JSON.stringify(message)}
      }));
    })();
  `;
};

const RevcontentNativeView = ({ widgetId, pubId, siteUrl, scrollPosition }) => {
  if (!widgetId) throw new TypeError('You must supply a valid widget ID');
  if (!pubId) throw new TypeError('You must supply a valid publisher ID');
  if (!siteUrl) throw new TypeError('You must supply a valid site URL');

  const [html, setHtml] = useState('');
  const [viewHeight, setViewHeight] = useState(0);
  const webViewRef = useRef(null);
  const [index] = useAssets(require('./assets/widget.html'));

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

  useEffect(() => {
    webViewRef.current.injectJavaScript(getInjectedMessage(scrollPosition));
  }, [scrollPosition]);

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      scrollEnabled={false}
      onMessage={onMessage}
      style={{ flex: 1, height: viewHeight }}
      source={{ html }}></WebView>
  );
};

export default RevcontentNativeView;
