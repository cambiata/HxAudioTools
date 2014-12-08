# HxAudioTools

![HxAudioTools.hx](/screenshot.png?raw=true "HxAudioTools.hx")

Attempt to create a toolbox for basic audio manipulation in Haxe.
Should work fine on Flash, Neko, Native desktop targets and WebAudioApi browsers.
Looking forward to learn more about bitlevel numbercrunching, efficient data structures, platform practices etc. on the road.

Note! Early development - a lot of experimenting and fiddling going on. Don't expect things to be stable and production ready!

### Implemented: 
- 16 bit 44kHz wav files only
- Platform agnostic signal processing (DSP): mixing, fading, reversing - should work on all platforms
- platform specific Mp3 decoding (flash relies on Sound.extract(), webAudio relies on AudioBuffer data, **neko/cpp relies on SOX utility installed!**)
- waveform display using OpenFL or Html5 Canvas

### Hopes and plans:
- cool DSP features, as fading, crossfading, dynamic mainpulation, timestretching, pitchshifting
- FFT implementation for freq spectrum display
- compatibility with Web Audio API
- haxe native decoders for .mp3 and .ogg files

### Demo

This demo 
- loads two mp3-files
- decodes them to PCM sound data using WebAudioApi context decoder
- displays the waveforms on canvas
- mixes the sounddata, and reverses the result
- plays back the result using WebAudioApi context

[Live WebAudioApi demo](https://cdn.rawgit.com/cambiata/HxAudioTools/master/bin/index.html)