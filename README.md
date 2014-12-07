# HxAudioTools

![HxAudioTools.hx](/screenshot.png?raw=true "HxAudioTools.hx")

Attempt to create a toolbox for audio manipulation in Haxe.
Should work fine on Flash, Neko and Native desktop targets.

### Implemented this far: 
- 16 bit 44kHz wav files only
- simple mixing DSP
- waveform display using OpenFL

### Hopes and plans:
- more DSP features, as fading, crossfading, dynamic mainpulation, timestretching and pitchshifting
- fft implementation for freq spectrum display
- compatibility with Web Audio API
- native decoders for .mp3 and .ogg files

## Usage

Neko mix wavefiles demo:
`haxe -lib format -cp src -neko bin/NekoMixWav.n -main NekoMixWav`
	
OpenFL mix and display Wavefiles demo:
`haxelib run openfl test OpenFLMixWav.xml flash|neko|mac|windows|linux`
