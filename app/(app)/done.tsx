import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontSizes } from '@/constants/typography';

export default function DoneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Done — à venir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
  },
});
