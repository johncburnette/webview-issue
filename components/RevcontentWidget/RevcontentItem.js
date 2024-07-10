import { useCallback, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { IntersectionObserverView } from 'rn-intersection-observer';
const RevcontentItem = ({ item }) => {
  const [isVisible, setIsVisible] = useState(false);

  const onVisibilityChange = event => {
    setIsVisible(event.isInsecting);
  };

  return (
    <IntersectionObserverView
      onIntersectionChange={onVisibilityChange}
      scope="RevcontentScope"
      thresholds={[0.95]}>
      <View
        style={{
          width: '100%',
          height: 'auto',
          marginBottom: 10,
          backgroundColor: isVisible ? 'green' : 'red'
        }}>
        <View>
          <Image
            style={{
              width: '100%',
              height: 200
            }}
            resizeMode="cover"
            source={{
              uri: `https:${item.image}`
            }}
          />
          <Text
            style={{
              position: 'absolute',
              backgroundColor: 'white',
              color: 'black'
            }}>
            {isVisible?.toString()}
          </Text>
        </View>
        <Text>{item.headline}</Text>
      </View>
    </IntersectionObserverView>
  );
};

export default RevcontentItem;
