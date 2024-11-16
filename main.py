import mido
from datetime import datetime
from matplotlib.animation import FuncAnimation
import matplotlib.pyplot as plt
import numpy as np
import os

def generate_media(start_date, end_date, bpm):
    # Generate MIDI file
    midi_file = "output.mid"
    mid = mido.MidiFile()
    track = mido.MidiTrack()
    mid.tracks.append(track)
    track.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(bpm)))
    for i in range(10):
        track.append(mido.Message('note_on', note=60 + i, velocity=64, time=480))
        track.append(mido.Message('note_off', note=60 + i, velocity=64, time=480))
    mid.save(midi_file)

    # Generate videos
    def create_video(output_file, seed):
        np.random.seed(seed)
        fig, ax = plt.subplots()
        x, y = np.random.rand(2, 100)

        def update(frame):
            ax.clear()
            ax.scatter(x + frame * 0.01, y + frame * 0.01)

        anim = FuncAnimation(fig, update, frames=100)
        anim.save(output_file, writer='ffmpeg')
        plt.close(fig)

    video1 = "video1.mp4"
    video2 = "video2.mp4"
    create_video(video1, seed=42)
    create_video(video2, seed=84)

    return midi_file, video1, video2
