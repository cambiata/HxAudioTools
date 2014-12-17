# HxAudioTools

![HxAudioTools.hx](/screenshot.png?raw=true "HxAudioTools.hx")

Attempt to create a toolbox for basic audio manipulation in Haxe.
Should work fine on Flash, Neko, Native desktop targets and WebAudioApi browsers.
Looking forward to learn more about bitlevel numbercrunching, efficient data structures, platform practices etc. on the road.

Note! Early development - a lot of experimenting and fiddling going on. Don't expect things to be stable and production ready!

### Implemented: 
- 16 bit 44.1kHz wav files, mono and stereo
- uses haxe.ds.Vector<Int> for internal PCM reperesentation (might be changed!)
- mp3 decoding per platform (flash relies on Sound.extract(), webAudio relies on AudioBuffer data, **neko/cpp relies on SOX utility installed!**)
- basic signal processing (DSP): mixing, fading, reversing - should work on all platforms
- waveform display using OpenFL or html5/canvas

### Hopes and plans:
- cool DSP features, as fading, crossfading, dynamic mainpulation, timestretching, pitchshifting
- FFT implementation for freq spectrum display
- pitch recognition implementations
- haxe native decoders for .mp3 and .ogg files

### Demos

![webaudio](/webaudio.png?raw=true "webaudio")

[Live WebAudioApi demo](https://cdn.rawgit.com/cambiata/HxAudioTools/master/bin/decode/index.html)
- loads two mp3-files
- decodes them to PCM sound data using WebAudioApi context decoder
- displays the waveforms on canvas
- mixes the sounddata, and reverses the result
- plays back the result using WebAudioApi context

![flash](/flash.png?raw=true "flash")

[Live Flash demo](https://cdn.rawgit.com/cambiata/HxAudioTools/master/bin/decode/Mp3DecodeFlash.swf)
- loads two mp3-files
- decodes them to PCM sound data using flash.media.Sound.extract()
- displays the waveforms on flash.display.Sprite
- mixes the sounddata, and reverses the result
- builds a sound object swf to avoid Sound.loadPCMfromByteArray() quirks
- plays back the result
	
