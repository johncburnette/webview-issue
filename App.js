import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAssets } from 'expo-asset';
import { readAsStringAsync } from 'expo-file-system';

export default function App() {
  const onMessage = ({ nativeEvent }) => {
    const data = JSON.parse(nativeEvent.data);
    console.log(data);
  };

  const [index, indexLoadingError] = useAssets(
    require('./assets/observer.html')
  );

  const [html, setHtml] = useState('');

  if (index) readAsStringAsync(index[0].localUri).then(data => setHtml(data));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <Text style={styles.p}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ullamcorper velit sed ullamcorper morbi tincidunt ornare massa eget
          egestas. Tempus egestas sed sed risus pretium quam. Pellentesque id
          nibh tortor id aliquet. Sapien faucibus et molestie ac feugiat.
          Elementum curabitur vitae nunc sed velit dignissim sodales ut eu. Ut
          faucibus pulvinar elementum integer enim neque volutpat. Sapien
          pellentesque habitant morbi tristique. Proin libero nunc consequat
          interdum varius sit amet mattis vulputate. Sed blandit libero volutpat
          sed cras ornare arcu dui vivamus.
        </Text>
        <Text style={styles.p}>
          Neque laoreet suspendisse interdum consectetur. Volutpat odio
          facilisis mauris sit amet. Maecenas sed enim ut sem viverra aliquet.
          Elit ut aliquam purus sit. Fermentum et sollicitudin ac orci
          phasellus. Turpis egestas integer eget aliquet. Viverra suspendisse
          potenti nullam ac tortor. Non nisi est sit amet facilisis magna. Nec
          feugiat in fermentum posuere urna nec tincidunt. Venenatis lectus
          magna fringilla urna porttitor rhoncus dolor purus non.
        </Text>
        <Text style={styles.p}>
          Augue interdum velit euismod in pellentesque massa placerat. Pulvinar
          elementum integer enim neque volutpat ac tincidunt vitae. At volutpat
          diam ut venenatis tellus. Pulvinar etiam non quam lacus suspendisse
          faucibus interdum posuere. Tellus integer feugiat scelerisque varius.
          Convallis a cras semper auctor neque vitae. Enim ut sem viverra
          aliquet eget sit amet tellus cras. Vitae sapien pellentesque habitant
          morbi tristique. Proin sagittis nisl rhoncus mattis. Porta lorem
          mollis aliquam ut porttitor leo. Enim nec dui nunc mattis enim. Nulla
          pellentesque dignissim enim sit amet venenatis urna.
        </Text>
        <Text style={styles.p}>
          Platea dictumst vestibulum rhoncus est pellentesque elit. Id leo in
          vitae turpis massa. Eu scelerisque felis imperdiet proin fermentum leo
          vel orci. Quam lacus suspendisse faucibus interdum posuere lorem
          ipsum. Condimentum mattis pellentesque id nibh tortor. Libero enim sed
          faucibus turpis. Hac habitasse platea dictumst vestibulum rhoncus est
          pellentesque. Dignissim enim sit amet venenatis urna. Sit amet mauris
          commodo quis imperdiet. Tellus integer feugiat scelerisque varius.
        </Text>
        <Text style={styles.p}>
          Etiam tempor orci eu lobortis. Eget egestas purus viverra accumsan in
          nisl. Gravida in fermentum et sollicitudin ac orci. Diam phasellus
          vestibulum lorem sed risus ultricies. Praesent semper feugiat nibh sed
          pulvinar proin. Vitae nunc sed velit dignissim sodales ut eu. Nec dui
          nunc mattis enim ut tellus elementum sagittis vitae. Suspendisse
          faucibus interdum posuere lorem ipsum dolor sit amet. Quam elementum
          pulvinar etiam non quam lacus suspendisse. Rhoncus dolor purus non
          enim praesent. Elementum curabitur vitae nunc sed velit. Sed
          ullamcorper morbi tincidunt ornare massa eget egestas purus. Habitasse
          platea dictumst vestibulum rhoncus est. Elit ullamcorper dignissim
          cras tincidunt lobortis feugiat vivamus at. Lacus sed viverra tellus
          in hac habitasse platea. Mauris cursus mattis molestie a iaculis at
          erat pellentesque adipiscing. Sit amet dictum sit amet justo donec
          enim diam. Mauris vitae ultricies leo integer malesuada. Suspendisse
          sed nisi lacus sed viverra tellus in.
        </Text>
        <WebView
          originWhitelist={['*']}
          scrollEnabled={false}
          style={{
            flex: 1,
            height: 150
          }}
          onMessage={onMessage}
          source={{ html }}></WebView>
      </ScrollView>
      {/* <WebView
        originWhitelist={['*']}
        style={{
          flex: 1
        }}
        onMessage={onMessage}
        source={{
          html
        }}></WebView> */}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? 25 : 0
  },
  p: {
    padding: 5,
    fontSize: 18
  }
});
