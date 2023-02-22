o = Server.default.options;
o.inDevice_("ASIO : Focusrite USB ASIO");
o.outDevice_("ASIO : Focusrite USB ASIO");

s.boot;


(
f = { |msg, time, addr|
	if(msg[0] == '/chord', {
		msg.do({arg item, i; if (i > 0) {
			Synth(\test1, [\freq_arg, msg[i]]);
		}});
	}, {
		if (msg[0] == '/note') {
			Synth(\test2, [\freq_arg, msg[1]]);
		}
	})
};
thisProcess.addOSCRecvFunc(f);
);
thisProcess.removeOSCRecvFunc(f);


SynthDef(\test1, { |freq_arg|
	var env, freq;
	// Scale freq between 200 and 1000
	freq = (freq_arg).midicps;
	// Generate envelope from "on"
	env = EnvGen.kr(Env([0, 0.5, 0.5, 0], [0.1, 2, 0.5]), doneAction: Done.freeSelf);
	// Output
	Out.ar(0, Pan2.ar((SinOsc.ar(freq, 0, 0.1)) * env));
}).add;


SynthDef(\test2, { |freq_arg|
	var env, freq;
	// Scale freq between 200 and 1000
	freq = (freq_arg).midicps;
	// Generate envelope from "on"
	env = EnvGen.kr(Env([0, 0.5, 0.5, 0], [0.1, 2, 0.5]), doneAction: Done.freeSelf);
	// Output
	Out.ar(0, Pan2.ar((SinOsc.ar(freq, 0, 0.1) + PinkNoise.ar(0.01)) * env));
}).add;