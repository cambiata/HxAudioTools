# HxAudioTools

![HxAudioTools.hx](/screenshot.png?raw=true "HxAudioTools.hx")

Attempt to create a toolbox for basic audio manipulation in Haxe.
Should work fine on Flash, Neko and Native desktop targets.
Looking forward to learn more about bitlevel numbercrunching, efficient data structures, platform practices etc. on the road.

Note! Early development - a lot of experimenting and fiddling going on. Don't expect things to be stable and production ready!

### Implemented: 
- 16 bit 44kHz wav files only
- simple DSP: mixing, fading, reversing
- platform specific Mp3 decoding (flash relies on Sound.extract(), webAudio relies on AudioBuffer data, **neko/cpp relies on SOX utility installed!**)
- waveform display using OpenFL

### Hopes and plans:
- cool DSP features, as fading, crossfading, dynamic mainpulation, timestretching, pitchshifting
- FFT implementation for freq spectrum display
- compatibility with Web Audio API
- haxe native decoders for .mp3 and .ogg files

### Demo

[Live WebAudioApi demo](https://cdn.rawgit.com/cambiata/HxAudioTools/master/bin/index.html)