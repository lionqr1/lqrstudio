import { spawn } from "child_process";

export function startFFmpegMultiOutput({ inputUrl }) {
  const {
    FACEBOOK_RTMP,
    FACEBOOK_KEY,
    YOUTUBE_RTMP,
    YOUTUBE_KEY,
    TWITCH_RTMP,
    TWITCH_KEY,
    CUSTOM_RTMP,
    CUSTOM_KEY
  } = process.env;

  const outputs = [];

  if (FACEBOOK_RTMP && FACEBOOK_KEY) {
    outputs.push(`${FACEBOOK_RTMP}/${FACEBOOK_KEY}`);
  }
  if (YOUTUBE_RTMP && YOUTUBE_KEY) {
    outputs.push(`${YOUTUBE_RTMP}/${YOUTUBE_KEY}`);
  }
  if (TWITCH_RTMP && TWITCH_KEY) {
    outputs.push(`${TWITCH_RTMP}/${TWITCH_KEY}`);
  }
  if (CUSTOM_RTMP && CUSTOM_KEY) {
    outputs.push(`${CUSTOM_RTMP}/${CUSTOM_KEY}`);
  }

  if (outputs.length === 0) {
    console.log("No RTMP outputs configured.");
    return null;
  }

  const args = [
    "-re",
    "-i", inputUrl,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-b:v", "4500k",
    "-maxrate", "5000k",
    "-bufsize", "10000k",
    "-s", "1280x720",
    "-r", "60",
    "-c:a", "aac",
    "-b:a", "160k",
    "-ar", "44100",
    "-ac", "2"
  ];

  outputs.forEach((out) => {
    args.push("-f", "flv", out);
  });

  console.log("Starting FFmpeg with outputs:", outputs);

  const ffmpeg = spawn("ffmpeg", args);

  ffmpeg.stdout.on("data", (data) => {
    console.log("[FFmpeg stdout]", data.toString());
  });

  ffmpeg.stderr.on("data", (data) => {
    console.log("[FFmpeg stderr]", data.toString());
  });

  ffmpeg.on("close", (code) => {
    console.log("FFmpeg exited with code", code);
  });

  return ffmpeg;
}
