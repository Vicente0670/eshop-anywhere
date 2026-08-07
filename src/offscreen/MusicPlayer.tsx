export default function MusicPlayer() {
  console.log("This is the music tsx file speaking");
  return (
    <>
      <p>Yo, you're not supposed to see this!</p>
      <audio src="/test.mp3" autoPlay loop muted={false} preload="" />
    </>
  );
}