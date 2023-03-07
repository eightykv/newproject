o = Server.default.options;
o.inDevice_("ASIO : Focusrite USB ASIO");
o.outDevice_("ASIO : Focusrite USB ASIO");

s.boot;


(
f = { |msg, time, addr|
	if (msg[0] == '/note') {
		Synth(\test2, [\freq_arg, msg[1], \len_arg, msg[2], \accent, msg[3]]);
	}
};
thisProcess.addOSCRecvFunc(f);
);
thisProcess.removeOSCRecvFunc(f);


(
SynthDef(\test1, { |freq_arg, len_arg|
	var env, freq;
	// Scale freq between 200 and 1000
	freq = (freq_arg).midicps;
	// Generate envelope from "on"
	env = EnvGen.kr(Env([0, 0.5, 0.5, 0], [0.1, len_arg * 0.45, len_arg * 0.45]), doneAction: Done.freeSelf);
	// Output
	Out.ar(0, Pan2.ar((SinOsc.ar(freq, 0, 0.1)) * env) * 0);
}).add;
)
(
SynthDef(\test2, { |freq_arg, len_arg, accent|
	var env, freq, sig1, sig2;
	// Scale freq between 200 and 1000
	freq = (freq_arg).midicps;
	// Generate envelope from "on"
  sig1 = RLPF.ar(BrownNoise.ar, freq, 0.2, 0.5);
  sig2 = /*(sig1 * (0.2)) + */(CrossoverDistortion.ar(SinOsc.ar(freq, 0, 0.1), 0.8, 0.25) * 0.1 * 0.5).softclip;
	env = EnvGen.kr(Env([0, 0.5, 0.5, 0], [0.1, len_arg * 0.65, len_arg * 0.25]), doneAction: Done.freeSelf);
	// Output
	Out.ar(0, Pan2.ar(sig2 + SinOsc.ar(freq, 0, 0.1) /*+ PinkNoise.ar(0.3)*/) * env * accent);
}).add;
)