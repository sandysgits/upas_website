async function initPyodide() {
    let pyodide = await loadPyodide();
    await pyodide.loadPackage(["numpy", "matplotlib"]);
    return pyodide;
}

const pyodideReady = initPyodide();

document.getElementById("start-button").addEventListener("click", async () => {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const bpm = document.getElementById("bpm").value;

    if (!startDate || !endDate || !bpm) {
        alert("Please fill all the fields!");
        return;
    }

    const pyodide = await pyodideReady;

    // Pass the inputs to the Python script
    pyodide.runPython(`
        from js import console
        from pyodide.ffi import to_js
        import main

        # Generate MIDI, video, and sync
        midi_file, video1, video2 = main.generate_media("${startDate}", "${endDate}", int(${bpm}))

        # Return as base64-encoded blobs
        def get_base64(file_path):
            with open(file_path, "rb") as file:
                return file.read().hex()

        midi_blob = get_base64(midi_file)
        video1_blob = get_base64(video1)
        video2_blob = get_base64(video2)

        console.log(to_js({"midi": midi_blob, "video1": video1_blob, "video2": video2_blob}))
    `);

    // Handle blobs and attach to the respective media elements
    const { midi, video1, video2 } = pyodide.globals.console.log;

    const audioBlob = new Blob([Uint8Array.from(Buffer.from(midi, "hex"))], { type: "audio/midi" });
    document.getElementById("audio").src = URL.createObjectURL(audioBlob);

    const video1Blob = new Blob([Uint8Array.from(Buffer.from(video1, "hex"))], { type: "video/mp4" });
    document.getElementById("video1").src = URL.createObjectURL(video1Blob);

    const video2Blob = new Blob([Uint8Array.from(Buffer.from(video2, "hex"))], { type: "video/mp4" });
    document.getElementById("video2").src = URL.createObjectURL(video2Blob);
});
