import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import RevcontentItem from './RevcontentItem';
import { IntersectionObserver } from 'rn-intersection-observer';

export const onRevcontentVisibilityChange = () => {
  IntersectionObserver?.emitEvent('RevcontentScope');
};

const RevcontentWidget = ({ widgetId, pubId }) => {
  if (!widgetId || !pubId)
    throw new Error(
      'You must supply a valid widget and pub id. Please verify your parameters.'
    );

  const scrollRef = useRef(null);
  const nodeRef = useRef(null);

  const [settings, setSettings] = useState({});
  const [items, setItems] = useState([]);
  const [impressionUuid, setImpressionUuid] = useState(null);

  useEffect(() => {
    const getSettings = async () => {
      const settings = await fetch(
        `https://trends.revcontent.com/binotto/${pubId}/${widgetId}`,
        {
          credentials: 'include'
        }
      );
      const data = await settings.json();
      setSettings(data.widget.layout);
    };

    getSettings();
  }, []);

  useEffect(() => {
    const getContent = async () => {
      const response = await fetch(
        `https://trends.revcontent.com/api/sbinnala/?w=${widgetId}&content=SSSSSS`,
        {
          credentials: 'include'
        }
      );
      const items = await response.json();

      setItems(items.content);
      setImpressionUuid(items.imp_uuid);
    };

    getContent();
  }, [settings]);

  // useEffect(() => {
  //   if (scrollRef.current) nodeRef.current = findNodeHandle(scrollRef.current);
  // }, [scrollRef.current]);

  return (
    <View>
      {items.map((item, index) => (
        <RevcontentItem
          key={index}
          item={item}
        />
      ))}
    </View>
  );
};

export default RevcontentWidget;
