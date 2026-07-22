import { Audio } from "expo-av";

export const playCoinSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/coin-dropping.mp3")
    );
    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log("Erro ao reproduzir som de moedas:", error);
  }
};
