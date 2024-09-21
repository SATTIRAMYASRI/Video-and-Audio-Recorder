const mediaSelector = document.getElementById("media");
const vidRecorderSelector = document.getElementById("vid-recorder");
const audRecorderSelector = document.getElementById("aud-recorder");
const webCamContainerSelector = document.getElementById("web-cam-container");
const startVidRecordingSelector = document.getElementById("start-vid-recording");
const stopVidRecordingSelector = document.getElementById("stop-vid-recording");
const startAudRecordingSelector = document.getElementById("start-aud-recording");
const stopAudRecordingSelector = document.getElementById("stop-aud-recording");
const vidRecordStatusSelector = document.getElementById("vid-record-status");
const audRecordStatusSelector = document.getElementById("aud-record-status");
const pauseAudRecording = document.getElementById("pause-aud-recording");
const resumeAudRecording = document.getElementById("resume-aud-recording");
const pauseVidRecording = document.getElementById("pause-vid-recording");
const resumeVidRecording = document.getElementById("resume-vid-recording");

let selectedMedia = "aud";
let chunks = []; 

const audConstraints = { audio: true, video: false };
const vidConstraints = { audio: true, video: true };

mediaSelector.addEventListener("change", (e) => {
    selectedMedia = e.target.value;
    updateMediaDisplay();
    console.log(`${selectedMedia}`);
});

startVidRecordingSelector.addEventListener("click", StartRecording);
startAudRecordingSelector.addEventListener("click", StartRecording);

stopVidRecordingSelector.addEventListener("click", StopRecording);
stopAudRecordingSelector.addEventListener("click", StopRecording);

pauseVidRecording.addEventListener("click", pauseRecording);
pauseAudRecording.addEventListener("click", pauseRecording);

resumeVidRecording.addEventListener("click", ResumeRecording);
resumeAudRecording.addEventListener("click", ResumeRecording);

function updateMediaDisplay() {
    if (selectedMedia === "vid") {
        vidRecorderSelector.style.display = "block";
        audRecorderSelector.style.display = "none";
    } else {
        vidRecorderSelector.style.display = "none";
        audRecorderSelector.style.display = "block";
    }
}

function StartRecording() {
    const selectedConstraint = selectedMedia === "vid" ? vidConstraints : audConstraints;
    const selectedRecorder = selectedMedia === "vid" ? vidRecorderSelector : audRecorderSelector;
    const selectedRecordStatus = selectedMedia === "vid" ? vidRecordStatusSelector : audRecordStatusSelector;
    const selectedMediaType = selectedMedia === "vid" ? "video/mp4" : "audio/mpeg";
    clearExistingMedia(selectedRecorder);

    navigator.mediaDevices.getUserMedia(selectedConstraint)
        .then(mediaStream => {
            const mediaRecorder = new MediaRecorder(mediaStream);
            
            window.mediaStream = mediaStream;
            window.mediaRecorder = mediaRecorder;
            mediaRecorder.start();

            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                handleMediaStop(selectedRecorder, selectedMediaType);
            };

            if (selectedMedia === "vid") {
                webCamContainerSelector.srcObject = mediaStream;
                webCamContainerSelector.muted = true
            }

            selectedRecordStatus.innerText = "Recording";
            updateButtonDisplayOnStart(selectedRecorder);
        })
        .catch(err => console.error("Error accessing media devices.", err));
}

function clearExistingMedia(selectedRecorder) {
    const existingMedia = selectedRecorder.querySelector("video:not(#web-cam-container), audio");
    const existingDownloadButton = selectedRecorder.querySelector(".download-btn");

    if (existingMedia || existingDownloadButton) {
        const userConfirmed = confirm("You have a previous recording. Do you want to clear it and start a new recording?");
        if (userConfirmed) {
            if (existingMedia) selectedRecorder.removeChild(existingMedia);
            if (existingDownloadButton) selectedRecorder.removeChild(existingDownloadButton);
        } else {
            return; // Exit if user cancels
        }
    }
    webCamContainerSelector.style.display = "block";
}

function handleMediaStop(selectedRecorder, selectedMediaType) {
    const blob = new Blob(chunks, { type: selectedMediaType });
    chunks = [];
    const recordedMedia = document.createElement(selectedMedia === "vid" ? "video" : "audio");
    recordedMedia.controls = true;
    const recordedMediaURL = URL.createObjectURL(blob);
    recordedMedia.src = recordedMediaURL;

    const downloadButton = document.createElement("a");
    downloadButton.classList.add("download-btn");
    downloadButton.download = "Recorded-Media";
    downloadButton.href = recordedMediaURL;
    downloadButton.innerText = "Download it!";
    downloadButton.onclick = () => URL.revokeObjectURL(recordedMedia);

    selectedRecorder.append(recordedMedia, downloadButton);
}

function StopRecording() {
    window.mediaRecorder.stop();
    window.mediaStream.getTracks().forEach(track => track.stop());
    const selectedRecordStatus = selectedMedia === "vid" ? vidRecordStatusSelector : audRecordStatusSelector;
    selectedRecordStatus.innerText = "Recording Done!!";
    updateButtonDisplayOnStop();
}

function updateButtonDisplayOnStart(selectedRecorder) {
    mediaSelector.disabled = true; 
    startVidRecordingSelector.style.display = "none";
    startAudRecordingSelector.style.display = "none";
    stopVidRecordingSelector.style.display = "block";
    stopAudRecordingSelector.style.display = "block";
    pauseVidRecording.style.display = "block";
    pauseAudRecording.style.display = "block";
    resumeVidRecording.style.display = "none";
    resumeAudRecording.style.display = "none";
}

function updateButtonDisplayOnStop() {
    mediaSelector.disabled = false; 
    startVidRecordingSelector.style.display = "block";
    startAudRecordingSelector.style.display = "block";
    stopVidRecordingSelector.style.display = "none";
    stopAudRecordingSelector.style.display = "none";
    pauseVidRecording.style.display = "none";
    pauseAudRecording.style.display = "none";
    resumeVidRecording.style.display = "none";
    resumeAudRecording.style.display = "none";
    webCamContainerSelector.style.display = "none"; 
}

function pauseRecording() {
    window.mediaRecorder.pause();
    const selectedRecordStatus = selectedMedia === "vid" ? vidRecordStatusSelector : audRecordStatusSelector;
    selectedRecordStatus.innerText = "Recording paused";
    pauseVidRecording.style.display = "none";
    pauseAudRecording.style.display = "none";
    resumeVidRecording.style.display = "block";
    resumeAudRecording.style.display = "block";
}

function ResumeRecording() {
    window.mediaRecorder.resume();
    const selectedRecordStatus = selectedMedia === "vid" ? vidRecordStatusSelector : audRecordStatusSelector;
    selectedRecordStatus.innerText = "Recording";
    pauseVidRecording.style.display = "block";
    pauseAudRecording.style.display = "block";
    resumeVidRecording.style.display = "none";
    resumeAudRecording.style.display = "none";
}
