import AsyncStorage from '@react-native-async-storage/async-storage';
import UUIDGenerator from 'react-native-uuid-generator';


const handleGenerateUUID = async () => {
  try {
    const userUUID = await AsyncStorage.getItem('userUUID');
    if (!userUUID) {
      const newUUID = await UUIDGenerator.getRandomUUID();
      await AsyncStorage.setItem('userUUID', newUUID);
      console.log('Generated and stored new UUID:', newUUID);
    } else {
      console.log('UUID already exists:', userUUID);
    }
  } catch (error) {
    console.error('Error checking first installation:', error);
  }
};

const getUUID = async () => {
  try {
    const userUUID = await AsyncStorage.getItem('userUUID');
    if (userUUID) {
      return userUUID;
    } else {
      throw new Error('UUID not found');
    }
  } catch (error) {
    console.error('Error retrieving UUID:', error);
    return null;
  }
};

export { handleGenerateUUID, getUUID };
